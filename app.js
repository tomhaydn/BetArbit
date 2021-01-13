// Standard Imports -------------------------------- //
import yargs from "yargs";
import axios from "axios";
import boxen from "boxen";
import chalk from "chalk";
import { hideBin } from "yargs/helpers";
import fs from "fs";

// Global Variables -------------------------------- //
const API_KEY = process.env.THEODDSAPIKEYY;

// System gv --------------------------------------- //
const log = console.log;
const error = chalk.bold.red;
const warning = chalk.yellow;
const success = chalk.bold.green;

// Main -------------------------------------------- //
const findArbBets = async () => {

    log(boxen('BetArbit v1.0.0', { padding: 1, margin: 1, backgroundColor: "cyan", borderStyle: 'double', borderColor: "cyan" }));
    log(warning('Arbitrage gambling has a variety of factors that can negatively affect profit. Do not use this cli to place real-world bets.'));
    log("Starting...");

    let { demo = false, demo_file = "./test_data.json", bet = 100, sport = "upcoming", region = "au", verbose = false } = yargs(hideBin(process.argv)).argv;

    if (demo) {
        if (!demo_file) {
            log(error(`!! When in demo mode please provide a demoFile using --demoFile or do not provide the argument to use the default.`));
            exit(true);
        }
    }

    const [DEMO, DEMO_FILE, BET, SPORT, REGION, VERBOSE] = [demo, demo_file, bet, sport, region, verbose];

    if (VERBOSE) log(`
        ${chalk.green("Arguments")}
        demo: ${chalk.green(DEMO)}
        demoFile: ${chalk.green(DEMO_FILE)}
        bet: ${chalk.green(BET)}
        sport: ${chalk.green(SPORT)}
        region: ${chalk.green(REGION)}
    `);

    if (VERBOSE) log("Collecting Input Data");

    let data;

    if (DEMO) {

        if (VERBOSE) log("     L_____ Demo mode enabled");
        let file;
        try {
            file = await fs.promises.readFile(DEMO_FILE);
            data = JSON.parse(file);
        } catch (err) {
            log(err);
            exit(true);
        }

        data = data.data;

        if (data === undefined) {
            log(error(`!! Failed to collect data: Could not get demoFile: ${DEMO_FILE}`));
            exit(true);
        };

    } else {

        if (VERBOSE) log("     L_____ Production mode enabled");
        try {
            data = await axios.get(`https://api.the-odds-api.com/v3/odds/?apiKey=${API_KEY}&sport=${SPORT}&region=${REGION}&mkt=h2h`);
        } catch (err) {
            let reqError;
            if (!err) {
                reqError = "Could not reach server."
            } else {
                reqError = err;
            }
            log(error(`!! Failed to collect data: ${reqError}`));
            exit(true);
        }
        data = data.data.data;

    }

    if (!data) {
        log(error(`!! An unknown error occured while collecting data`));
        exit(true);
    }

    if (VERBOSE) log(success("Successfully retrieved data object"));
    if (VERBOSE) log("Processing data");

    let counts = {
        inProfit: 0,
        totalProfit: 0
    }

    for (let i = 0; i < data.length; i++) {

        let match = data[i];

        log(`Checking for arbitrage on ${match.sport_key}, ${match.teams.toString()}`);

        let oddsMatrix = [];
        for (let j = 0; j < match.sites.length; j++) {

            let site = match.sites[j];
            for (let k = 0; k < site.odds.h2h.length; k++) {
                if (!oddsMatrix[k]) oddsMatrix[k] = [];
                oddsMatrix[k].push({ site: site.site_key, odd: site.odds.h2h[k] });
            }
        }

        if (VERBOSE) log(`     L_____ Successfully organized odds`);

        let highestOdds = [];

        for (let j = 0; j < oddsMatrix.length; j++) {
            let odds = oddsMatrix[j];
            let sorted = odds.sort((a, b) => (a.odd < b.odd) ? 1 : -1);
            highestOdds.push(sorted[0]);
        }

        if (VERBOSE) log(`     L_____ Found Highest odds across all sites`);

        let arbitrage = 0;

        for (let j = 0; j < highestOdds.length; j++) {
            arbitrage += (1 / highestOdds[j].odd);
        }

        if (VERBOSE) log(`     L_____ Calculating arbitrage values`);

        arbitrage = arbitrage * 100;

        if (arbitrage < 100) {

            counts.inProfit += 1;

            log(success(`     L__________ Profitable arbitrage found at ${Math.floor(arbitrage)}, calculating ideal wagers`));

            let wagers = [];

            for (let j = 0; j < highestOdds.length; j++) {
                let bet = 1;
                for (let k = 0; k < highestOdds.length; k++) {
                    if (k != j) {
                        let odd = highestOdds[k].odd;
                        let oddForOutcome = highestOdds[j].odd / odd;
                        bet += oddForOutcome;
                    }
                }
                let wager = (BET / bet);
                let profit = (wager * highestOdds[j].odd) - BET;
                wagers.push({ site: highestOdds[j].site, wager: wager.toFixed(2), odd: highestOdds[j].odd, profit: profit.toFixed(2) });
            }

            log(success(`     L_______________ Found ideal wagers`));

            for (let j = 0; j < wagers.length; j++) {
                log(success(`     L_______________ Selection ${j}(${wagers[j].odd}) on ${wagers[j].site} with $${wagers[j].wager}`));
            }

            log(success(`     L_______________________ Profit if win: $${wagers[0].profit}`));

            counts.totalProfit += parseFloat(wagers[0].profit);

        } else {
            log(error(`     L__________ No profitable arbitrage found.\n`));
        }
    }

    if (counts.inProfit > 0) {
        log(`Successfully found a total of ${success(counts.inProfit)} possible arbitrage bets with a total potential profit of ${success(counts.totalProfit)}`);
    } else {
        log(error(`Could not find any arbitrage bets for the given data.`));
    }

    exit();
}

const exit = (error = false) => {
    error && log(chalk.green("better luck next time!"))
    process.exit(1)
}

findArbBets();