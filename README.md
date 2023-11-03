<br />
<div align="center">
  <a>
    <img src="images/logo.jpg" alt="Logo" width = 300>
  </a>
  <p align="center">
    <a href="https://github.com/NDTungHCMUS">Nguyen Dinh Tung</a>
    </br>
    <a href="https://github.com/ginganotnigg">Pham Cong Bang</a>
    </br>
    <a href="https://github.com/tuongkhtn">Huynh Thanh Tuong</a>
    </br>
    <a href="https://github.com/thainhatminh2005">Thai Nhat Minh</a>
    </br>
  </p>
</div>

## About the project
- Treasure Conquer is an interactive multiplayer game. This game is inspired by the traditional Werewolf game. This is a strategy, hidden identity game, which is built on the web platform. Players will take turns making their decisions within a set timeframe. Apply the wisest strategies to achieve victory!

## Gameplay
- In the game, each player will be assigned one of four roles (pirate, captain, blacksmith, killer). The Killer is the adversary to the other roles. Each player will win alongside their faction. The Killer's mission is to eliminate the Captain (the leader of the pirate crew). Conversely, the Killer is the target that the pirate crew needs to eliminate. 
- The game will consist of 4-7 rounds, each round comprising two phases: Hunting and Gathering. In the Hunting phase, players will choose treasures on the island's map. When a player selects a chest, they'll be moved to the cave containing the chosen treasure. In the Gathering phase, players must uncover the Killer's identity to throw them off the ship. These two phases will alternate until the the end of the game or the winning team appears.

## Setup 
1. Install NodeJS (`https://nodejs.org/en`)
2. Run this command in your terminal: 
```
npm install -g yarn
```
3. Then change direction to your project's directory.
4. Create new project with **package.json** file:
```
yarn init -y
```
5. Build ExpressJS and Socket.io libraries:
```
yarn add express socket.io
```
6. (Optional) Build **Nodemon** to manage code and debug more easily
```
yarn add --dev nodemon
```

## Usage
### Initial Screen
<div align="center">
    <img src="images/initialScreen.png" width = 600>
</div>

- Players can create new rooms or join existing rooms.

### Instruction and Context
<div align="center" style = "margin-bottom: 20px">
    <img src="images/rule1.png" width = 500 style = "margin-right: 20px">
    <img src="images/rule2.png" width = 500>
</div>
<div align="center" style = "margin-bottom: 20px">
    <img src="images/rule3.png" width = 500 style = "margin-right: 20px">
    <img src="images/rule4.png" width = 500>
</div>
<div align="center">
    <img src="images/rule5.png" width = 500 style = "margin-right: 20px">
    <img src="images/rule6.png" width = 500>
</div>

- Players should read all the information here to understand the game's rules clearly.
- They can get access to these rules everytime during this game.

### RestRoom Screen
<div align="center">
    <img src="images/restRoom(admin).png" width = 700 style = "margin-bottom: 10px">
    <img src="images/restRoom(guest).png" width = 700>
</div>

- Players can see all opponents in this game. They can also change the color for their characters. They can still leave room in this duration.
- Admin can customize some properties(number of killers, number of turns, vote duration, treasure choosing duration) for this game.
- Admin press start button to begin new game.

### GamePlay Screen
<div align="center">
    <img src="images/role.png" width = 700 style = "margin-bottom: 10px">
    <img src="images/map.png" width = 700 style = "margin-bottom: 10px">
    <img src="images/cave.png" width = 700>
</div>

- Each player is assigned a role (BlackSmith, Killer, Pirate, Captain).
- Each player can choose a treasure chest to jump in each day.
- In the cave, each player will see the number of players who have chosen the same cave as them.
- After treasure choosing duration, the screen will be changed to vote screen.

### Vote Screen
<div align="center">
    <img src="images/voteScreen.png" width = 700 style = "margin-bottom: 10px">
    <img src="images/voteWithChat.png" width = 700 style = "margin-bottom: 10px">
    <img src="images/voteWithDead.png" width = 700>
</div>

- Each player can vote for at most one other player they want to eliminate from the game.
- The player with the most votes will be eliminated from the game.
- All players can chat together to choose the one who they want to vote.

### Victory and Defeat State
<div align="center">
    <img src="images/victory.png" width = 700 style = "margin-bottom: 10px">
    <img src="images/defeat.png" width = 700>
</div>

## Technologies used
- HTML/CSS/JS for Game UI. 
- Socket.io(an open-source Javascript library).
- Jquery (an open-source Javascript library).
- NodeJS and ExpressJS (a framework of NodeJS).