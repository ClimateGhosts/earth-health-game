# UW CSE Gamification Capstone - Earth Health Game

## Collaborative Climate Contest

## Requirements

Requires Python 3.9 or higher

To install the project requirements, do

```shell
pip install -r requirements.txt
```

## Running the Game Locally

### Server

To start the game backend server, use

```shell
soluzion_server soluzion/earth-health-game.py --debug
```

More info about our Soluzion server package can be found [here](https://github.com/ClimateGhosts/soluzion-server)

### Client

Use the live client at https://climateghosts.github.io/earth-health-game and set the server url to http://localhost:5000

## Development

### SOLUZION Problem / Server

Make edits to `soluzion/earth-health-game.py`

### Client

Install [node package manager (npm)](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

Install dependencies

```shell
npm install
```

Run the client locally

```shell
npm run dev
```