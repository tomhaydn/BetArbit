# Introduction & Explanation

BetArbit is a simple cli-based arbitrage bet detection and return calculation algorithm. The algorithm uses free data from [The Odds API](https://the-odds-api.com/) to determine if there exists opportunities to place bets that have guaranteed return.

I do not warrant that this works as it is based purely on [theory](http://www.aussportsbetting.com/guide/sports-betting-arbitrage/) and I have not used it in practice, nor do I condone or recommend that you do either. Gambling is risky and no one should do it. This is simply a code-based demonstration of the arbitrage betting formula.

## Installation

```
1. git clone https://github.com/tomeady/BetArbit.git
```
2. Create environment variable "THEODDSAPIKEY" with your [The Odds API](https://the-odds-api.com/) Key
```
3. npm i
```

## Usage

```
1. cd BetArbit
2. node app --demo true --verbose true --bet 1000
```

## Arguments

- Datatype
- Default
- Descriptions

```
--demo 
```
- boolean
- false
- Denotes weather to use the demo data provided/your own or to use the odds api.


```
--demo_file 
```
- string 
- ./test_data.json
- Specifies the demo data file location relative to the directory. Note: Must be supplied if demo is true


```
--bet 
```
- integer
- 1000
- The total amount of money you're willing to wager


```
--sport 
```
- string
- upcoming
- The sport type to download from the odds api. Please reference their site for more inputs.


```
--region 
```
- string
- au
- The region to download from the odds api. Please reference their site for more inputs.


```
--verbose 
```
- boolean
- false
- Whether to log all program output.

## Examples

```
node app --demo true --verbose true --bet 1000
```

![Example 1](https://polarhcms.com/api/v1/media/object/478/1610528541280_Screenshot%202021-01-13%20200103.png)
![Example 2](https://polarhcms.com/api/v1/media/object/478/1610528541622_Screenshot%202021-01-13%20200121.png)
