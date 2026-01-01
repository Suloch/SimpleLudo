package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/nats-io/nats.go"
)

var games = make(map[string]*GameState)
var nc *nats.Conn

func rollDiceRequest(m *nats.Msg) {
	fmt.Println("Rolling dice...")
	var rollRequest struct {
		GameID string `json:"game_id"`
		User   User   `json:"user"`
	}
	err := json.Unmarshal(m.Data, &rollRequest)
	if err != nil {
		fmt.Println("Error unmarshalling roll request:", err)
		m.Respond([]byte("Invalid roll request"))
		return
	}
	game, ok := games[rollRequest.GameID]
	if !ok {
		fmt.Println("Game not found:", rollRequest.GameID)
		m.Respond([]byte("Game not found"))
		return
	}
	err = rollDice(rollRequest.User, game)
	if err != nil {
		fmt.Println("Error rolling dice:", err)
		m.Respond([]byte("Error rolling dice"))
		return
	}
	gameData, err := json.Marshal(game)
	if err != nil {
		fmt.Println("Error marshalling game state:", err)
		m.Respond([]byte("Error rolling dice"))
		return
	}
	nc.Publish("ludo."+game.ID, gameData)
	m.Respond([]byte("Dice rolled"))
}

func createGameRequest(m *nats.Msg) {
	fmt.Println("Creating a new game...")
	newgame := NewGameState(4, User{ID: "user1", Name: "Alice"})
	games[newgame.ID] = newgame
	gameData, err := json.Marshal(newgame)
	if err != nil {
		fmt.Println("Error marshalling game state:", err)
		return
	}

	fmt.Println("New game created:", string(gameData))
	nc.Publish("ludo."+newgame.ID, gameData)
	m.Respond([]byte(newgame.ID))
}

func joinGameRequest(m *nats.Msg) {
	fmt.Println("Joining an existing game...")
	fmt.Println("Message Data:", string(m.Data))
	//unmarshal m.Data to get game ID and user info
	var joinRequest struct {
		GameID string `json:"game_id"`
		User   User   `json:"user"`
	}
	err := json.Unmarshal(m.Data, &joinRequest)
	if err != nil {
		fmt.Println("Error unmarshalling join request:", err)
		m.Respond([]byte("Invalid join request"))
		return
	}
	game, ok := games[joinRequest.GameID]

	if !ok {
		fmt.Println("Game not found:", joinRequest.GameID)
		m.Respond([]byte("Game not found"))
		return
	}
	addUserToGame(game, joinRequest.User)
	gameData, err := json.Marshal(game)
	if err != nil {
		fmt.Println("Error marshalling game state:", err)
		m.Respond([]byte("Error joining game"))
		return
	}
	fmt.Println("User joined game:", string(gameData))
	nc.Publish("ludo."+game.ID, gameData)
	m.Respond([]byte("Joined game"))
}

func moveRequest(m *nats.Msg) {
	fmt.Println("Moving a piece...")
	var moveRequest struct {
		GameID     string `json:"game_id"`
		User       User   `json:"user"`
		PieceIndex int    `json:"piece_index"`
	}
	err := json.Unmarshal(m.Data, &moveRequest)
	if err != nil {
		fmt.Println("Error unmarshalling move request:", err)
		m.Respond([]byte("Invalid move request"))
		return
	}
	game, ok := games[moveRequest.GameID]
	if !ok {
		fmt.Println("Game not found:", moveRequest.GameID)
		m.Respond([]byte("Game not found"))
		return
	}
	err = move(moveRequest.User, game, moveRequest.PieceIndex)
	if err != nil {
		fmt.Println("Error moving piece:", err)
		m.Respond([]byte("Error moving piece"))
		return
	}
	gameData, err := json.Marshal(game)
	if err != nil {
		fmt.Println("Error marshalling game state:", err)
		m.Respond([]byte("Error moving piece"))
		return
	}
	nc.Publish("ludo."+game.ID, gameData)
	m.Respond([]byte("Piece moved"))
}

func ludoStateRequest(m *nats.Msg) {
	fmt.Println("Ludo state request received...")
	var stateRequest struct {
		GameID string `json:"game_id"`
	}
	err := json.Unmarshal(m.Data, &stateRequest)
	if err != nil {
		fmt.Println("Error unmarshalling state request:", err)
		m.Respond([]byte("Invalid state request"))
		return
	}
	game, ok := games[stateRequest.GameID]
	if !ok {
		fmt.Println("Game not found:", stateRequest.GameID)
		m.Respond([]byte("Game not found"))
		return
	}
	gameData, err := json.Marshal(game)
	if err != nil {
		fmt.Println("Error marshalling game state:", err)
		m.Respond([]byte("Error retrieving game state"))
		return
	}
	fmt.Println("Publishing game state on ludo." + game.ID)
	err = nc.Publish("ludo."+game.ID, gameData)
	if err != nil {
		fmt.Println("Error publishing game state:", err)
		m.Respond([]byte("Error retrieving game state"))
		return
	}
	m.Respond([]byte("Game state sent"))
}

func main() {

	nc, _ = nats.Connect("nats://localhost:4222")

	nc.Publish("ludo.game-1", []byte("game is up"))
	nc.Subscribe("ludo.create", createGameRequest)
	nc.Subscribe("ludo.join", joinGameRequest)
	nc.Subscribe("ludo.roll", rollDiceRequest)
	nc.Subscribe("ludo.move", moveRequest)
	nc.Subscribe("ludo.state", ludoStateRequest)

	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)

	for {
		<-sigs
		break
	}
	nc.Drain()
	nc.Close()
}
