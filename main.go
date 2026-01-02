package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/Suloch/go-ludo/game"
	"github.com/nats-io/nats.go"
)

// Global game store
var games = make(map[string]*game.GameManager)
var nc *nats.Conn

// --- Helper to broadcast state ---
func broadcastState(gm *game.GameManager) {
	data, err := json.Marshal(gm.State)
	if err != nil {
		fmt.Println("Error marshalling state:", err)
		return
	}
	nc.Publish("ludo."+gm.State.ID, data)
}

// --- Handlers ---

func createGameHandler(m *nats.Msg) {
	// Simple ID generation
	gameID := fmt.Sprintf("game-%d", len(games)+1)

	gm := game.NewGame(gameID)
	// Add creator as Red player? Or wait for Join?
	// User prompt implied "NewGameState(nplayers, user)".
	// Let's assume the Creator joins immediately.
	// Message body might have user info?

	// For simplicity, we just create the room.
	games[gameID] = gm

	fmt.Printf("Created game: %s\n", gameID)
	m.Respond([]byte(gameID))
}

func joinGameHandler(m *nats.Msg) {
	var req struct {
		GameID string    `json:"game_id"`
		UserID string    `json:"user_id"`
		Name   string    `json:"name"`
		Color  game.Color `json:"color"` // Optional?
	}
	if err := json.Unmarshal(m.Data, &req); err != nil {
		fmt.Println("Join error:", err)
		return
	}

	gm, ok := games[req.GameID]
	if !ok {
		m.Respond([]byte("Game not found"))
		return
	}

	// Auto-assign color if missing
	if req.Color == "" {
		colors := []game.Color{game.Red, game.Green, game.Blue, game.Yellow}
		if len(gm.State.Players) < 4 {
			req.Color = colors[len(gm.State.Players)]
		}
	}

	gm.AddPlayer(req.UserID, req.Name, req.Color)
	fmt.Printf("Player %s joined %s as %s\n", req.Name, req.GameID, req.Color)

	// If 2 players, maybe auto start? Or wait for "Start" command?
	// For demo, auto-start if 2 players
	if len(gm.State.Players) == 2 {
		gm.StartGame()
	}

	broadcastState(gm)
	m.Respond([]byte("Joined"))
}

func rollDiceHandler(m *nats.Msg) {
	var req struct {
		GameID string `json:"game_id"`
		UserID string `json:"user_id"`
	}
	json.Unmarshal(m.Data, &req)

	gm, ok := games[req.GameID]
	if !ok {
		return
	}

	val, err := gm.RollDice(req.UserID)
	if err != nil {
		fmt.Println("Roll error:", err)
		m.Respond([]byte(err.Error()))
		return
	}

	fmt.Printf("User %s rolled %d\n", req.UserID, val)
	broadcastState(gm)
	m.Respond([]byte(fmt.Sprintf("%d", val)))
}

func moveHandler(m *nats.Msg) {
	var req struct {
		GameID  string `json:"game_id"`
		UserID  string `json:"user_id"`
		PieceID string `json:"piece_id"` // Using Piece ID instead of index
	}
	json.Unmarshal(m.Data, &req)

	gm, ok := games[req.GameID]
	if !ok {
		return
	}

	err := gm.MovePiece(req.UserID, req.PieceID)
	if err != nil {
		fmt.Println("Move error:", err)
		m.Respond([]byte(err.Error()))
		return
	}

	broadcastState(gm)
	m.Respond([]byte("Moved"))
}

func main() {
	var err error
	// Connect to NATS (User local default)
	nc, err = nats.Connect(nats.DefaultURL)
	if err != nil {
		fmt.Printf("NATS Connect Error: %v\n", err)
		// For demo, we might exit, but let's try to keep running just in case
		// os.Exit(1)
	} else {
		fmt.Println("Connected to NATS")
		defer nc.Close()
	}

	// Subscribe
	nc.Subscribe("ludo.create", createGameHandler)
	nc.Subscribe("ludo.join", joinGameHandler)
	nc.Subscribe("ludo.roll", rollDiceHandler)
	nc.Subscribe("ludo.move", moveHandler)

	fmt.Println("Ludo Server Listening...")

	// Wait for interrupt
	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
	<-sigs
}
