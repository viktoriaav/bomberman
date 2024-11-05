# Bomberman

A real-time multiplayer version of the classic Bomberman game using our own JavaScript-based framework.

## Table of Contents
- [Game Overview](#game-overview)
- [Game Mechanics](#game-mechanics)
  - [Players](#players)
  - [Map](#map)
  - [Power-Ups](#power-ups)
- [Getting Started](#getting-started)
- [Running the Game](#running-the-game)
- [WebSocket Chat](#websocket-chat)
- [Game Start Conditions](#game-start-conditions)
- [Contributors](#contributors)
- [Links](#links)

## Game Overview

Bomberman-Dom brings the classic Bomberman experience to the web with multiplayer capabilities, allowing 2–4 players to compete in a last-player-standing format. Each player starts in one of the map's four corners and battles to be the last one alive.

**Framework:** This game is built using a custom JavaScript-based framework created during the mini-framework project, without the use of HTML5 canvas, Web-GL, or external libraries.

## Game Mechanics

### Players

- **Number of players:** 2-4
- **Lives:** Each player has 3 lives. When lives reach zero, they are eliminated from the game.
- **Starting positions:** Players begin in separate corners of the map.

### Map

- **Fixed layout:** The map is visible to all players at all times.
- **Block types:** 
  - **Walls:** Indestructible and remain in fixed positions.
  - **Blocks:** Destructible and generated randomly.
- **Starting positions:** Each corner allows players to avoid bomb blasts when placed.

### Power-Ups

Power-ups may appear after blocks are destroyed, providing random abilities:
- **Bombs:** Allows player to place an additional bomb.
- **Flames:** Increases bomb explosion radius by 1 block in four directions.
- **Speed:** Increases player movement speed.

## Getting Started

1. **Clone the repository:**
   ```sh
   git clone [repository_url]
   cd bomberman-dom
   ```
2. Install dependencies: (If any are required)
   ```sh
    Copy code
    npm install
    ```
3. Running the Game
To run the game, execute the following command:

    ```sh
    Copy code
    go run .
    ```

After running, open the provided localhost URL in a browser to play the game.

## WebSocket Chat
Bomberman-Dom includes a basic chat feature using WebSockets. Players can send messages to each other during gameplay. This feature helps familiarize players with real-time multiplayer functionality.

## Game Start Conditions
- **Nickname Selection:** When the game starts, each player must enter a unique nickname.
- **Waiting Room:**
    - A player counter updates as players join.
    - The game can start with 2-4 players.
    - If 20 seconds pass with fewer than 4 players, a 10-second countdown initiates to start the game.
    - If 4 players join before 20 seconds, the 10-second countdown starts immediately.

## Contributors

- [Olha Priadkina](https://01.kood.tech/git/Olha_Priadkina)
- [Viktoriia Avstanchykova](https://01.kood.tech/git/vavstanc)
- [Joosep Rannu](https://01.kood.tech/git/JoosepRa)
- [Erik Mänd](https://01.kood.tech/git/e.mand)
- [Hannes Lige](https://01.kood.tech/git/Hannes878)