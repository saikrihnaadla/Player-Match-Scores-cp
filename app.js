const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running");
    });
  } catch (e) {
    console.log(`db Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// api 1 /players/

app.get("/players/", async (request, response) => {
  const playersQuery = `
        SELECT 
        player_id AS playerId,
        player_name AS playerName
        FROM player_details
    `;
  const playerArray = await db.all(playersQuery);
  response.send(playerArray);
});

// api 2

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playersQuery = `
        SELECT 
            player_id AS playerId,
            player_name AS playerName
        FROM player_details
        where player_id= '${playerId}'
    `;
  const playerArray = await db.get(playersQuery);
  response.send(playerArray);
});

// api 3 put

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const playersQuery = `
        UPDATE 
            player_details
        set 
            player_name = '${playerName}'
        where 
            player_id= '${playerId}'
    `;
  await db.run(playersQuery);
  response.send("Player Details Updated");
});

// api 4

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const playersQuery = `
        SELECT 
            match_id as matchId,
            match,
            year

        FROM match_details
        where match_id= '${matchId}'
    `;
  const matchArray = await db.get(playersQuery);
  response.send(matchArray);
});

// api 5

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const playersQuery = `
        SELECT 
            match_details.match_id as matchId, 
            match_details.match, 
            match_details.year
        FROM match_details
            left join player_match_score ON
             player_match_score.match_id = match_details.match_id
        where player_id= '${playerId}'
    `;
  const playerArray = await db.all(playersQuery);
  response.send(playerArray);
});

// api 6 /matches/:matchId/players

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const playersQuery = `
        SELECT 
            player_details.player_id as playerId,
            player_details.player_name AS playerName 
            
        FROM player_details
            NATURAL JOIN    player_match_score
        where match_id= '${matchId}'
    `;
  const playerArray = await db.all(playersQuery);
  response.send(playerArray);
});

//{
//   playerId: 1,
//   playerName: "Ram"
//   totalScore: 3453,
//   totalFours: 342,
//   totalSixes: 98
// }

//api 7 Path: /players/:playerId/playerScores

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;

  const playersQuery = `
        SELECT 
        player_details.player_id as playerId,
        player_details.player_name AS playerName,
        sum(score) AS totalScore,
        sum(fours) AS totalFours,
        sum(sixes) As totalSixes
            
        FROM player_details
            NATURAL JOIN   player_match_score
            

        where player_match_score.player_id= '${playerId}'
    `;
  const playerArray = await db.get(playersQuery);
  response.send(playerArray);
});

module.exports = app;
