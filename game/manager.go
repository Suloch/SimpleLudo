package game

import (
	"errors"
	"fmt"
	"math/rand"
	"time"
)

type GameManager struct {
	State *GameState
}

func NewGame(id string) *GameManager {
	return &GameManager{
		State: &GameState{
			ID:             id,
			Players:        make([]*Player, 0),
			PlayerMap:      make(map[string]*Player),
			WaitingForRoll: false,
			WaitingForMove: false,
		},
	}
}

func (gm *GameManager) AddPlayer(userID, name string, color Color) {
	pieces := make([]Piece, 4)
	for i := 0; i < 4; i++ {
		pieces[i] = Piece{
			ID:           fmt.Sprintf("%s-piece-%d", userID, i+1),
			Color:        color,
			PathPosition: -1 - i, // -1, -2, -3, -4 (Home)
		}
	}

	player := &Player{
		User:   User{ID: userID, Name: name},
		Color:  color,
		Pieces: pieces,
		Dice: Dice{
			Value:   1,
			Enabled: false,
		},
	}

	gm.State.Players = append(gm.State.Players, player)
	gm.State.PlayerMap[userID] = player
}

func (gm *GameManager) StartGame() error {
	if len(gm.State.Players) < 2 {
		return errors.New("need at least 2 players")
	}
	gm.State.CurrentPlayerIdx = 0
	gm.startTurn()
	return nil
}

func (gm *GameManager) startTurn() {
	player := gm.State.Players[gm.State.CurrentPlayerIdx]
	fmt.Printf("Turn: %s (%s)\n", player.User.Name, player.Color)

	gm.State.WaitingForRoll = true
	gm.State.WaitingForMove = false
	player.Dice.Enabled = true
	player.IsTurn = true

	// Reset others
	for _, p := range gm.State.Players {
		if p.User.ID != player.User.ID {
			p.IsTurn = false
			p.Dice.Enabled = false
		}
	}
}

func (gm *GameManager) SwitchTurn() {
	gm.State.CurrentPlayerIdx = (gm.State.CurrentPlayerIdx + 1) % len(gm.State.Players)
	gm.startTurn()
}

func (gm *GameManager) RollDice(userID string) (int, error) {
	player, ok := gm.State.PlayerMap[userID]
	if !ok {
		return 0, errors.New("player not found")
	}

	currentTurnPlayer := gm.State.Players[gm.State.CurrentPlayerIdx]
	if currentTurnPlayer.User.ID != userID {
		return 0, errors.New("not your turn")
	}

	if !gm.State.WaitingForRoll {
		return 0, errors.New("already rolled")
	}

	// Random logic
	rand.Seed(time.Now().UnixNano())
	val := rand.Intn(6) + 1
	// Deterministic override for debug if needed? No, use random.

	gm.State.CurrentDiceVal = val
	player.Dice.Value = val
	player.Dice.Enabled = false
	gm.State.WaitingForRoll = false

	if !gm.HasPossibleMoves(player, val) {
		gm.State.WaitingForMove = false
		// Auto switch turn after short delay (caller handles delay or we just switch state)
		gm.SwitchTurn()
		return val, nil
	}

	gm.State.WaitingForMove = true
	return val, nil
}

func (gm *GameManager) MovePiece(userID string, pieceID string) error {
	if !gm.State.WaitingForMove {
		return errors.New("not waiting for move")
	}

	player, ok := gm.State.PlayerMap[userID]
	if !ok {
		return errors.New("player not found")
	}

	currentTurnPlayer := gm.State.Players[gm.State.CurrentPlayerIdx]
	if currentTurnPlayer.User.ID != userID {
		return errors.New("not your turn")
	}

	// Find piece
	var piece *Piece
	for i := range player.Pieces {
		if player.Pieces[i].ID == pieceID {
			piece = &player.Pieces[i]
			break
		}
	}
	if piece == nil {
		return errors.New("piece not found")
	}

	if !gm.isValidMove(piece, gm.State.CurrentDiceVal) {
		return errors.New("invalid move")
	}

	// Execute Move
	if piece.PathPosition < 0 {
		piece.PathPosition = 0 // Start
	} else {
		piece.PathPosition += gm.State.CurrentDiceVal
	}

	// Captures
	gm.checkCaptures(piece, player)

	// Win Check
	if gm.checkWin(player) {
		player.HasWon = true
		gm.State.Gameover = true
		return nil
	}

	// Retry rule (6)
	if gm.State.CurrentDiceVal == 6 {
		gm.startTurn() // Same player
	} else {
		gm.SwitchTurn()
	}

	return nil
}

func (gm *GameManager) isValidMove(piece *Piece, diceVal int) bool {
	if piece.PathPosition < 0 {
		return diceVal == 6
	}
	// Check bounds
	// Max index is 56 (Game finishes at 56 or 57?)
	// Frontend logic: maxIndex = 56.
	if piece.PathPosition+diceVal > MaxPosition {
		return false
	}
	return true
}

func (gm *GameManager) HasPossibleMoves(player *Player, diceVal int) bool {
	for i := range player.Pieces {
		if gm.isValidMove(&player.Pieces[i], diceVal) {
			return true
		}
	}
	return false
}

func (gm *GameManager) checkWin(player *Player) bool {
	for _, p := range player.Pieces {
		if p.PathPosition != MaxPosition {
			return false
		}
	}
	return true
}

func (gm *GameManager) checkCaptures(movedPiece *Piece, currentPlayer *Player) {
	// Need mapping logic.
	// Red Offset = 0
	// Green Offset = 13
	// Blue Offset = 26
	// Yellow Offset = 39

	movedGlobal := gm.getGlobalIndex(movedPiece.Color, movedPiece.PathPosition)
	if movedGlobal == -1 {
		return // Safe zone
	}

	for _, otherPlayer := range gm.State.Players {
		if otherPlayer.User.ID == currentPlayer.User.ID {
			continue
		}
		for i := range otherPlayer.Pieces {
			otherPiece := &otherPlayer.Pieces[i]
			otherGlobal := gm.getGlobalIndex(otherPiece.Color, otherPiece.PathPosition)
			if otherGlobal != -1 && otherGlobal == movedGlobal {
				// Capture!
				fmt.Printf("Captured %s!\n", otherPiece.ID)
				// Reset to Home (-1, -2, -3, -4)
				// We need original home index. Go logic simplifies this:
				// Just set to -1. Or we should store HomeIndex in struct.
				// For now, -1 is fine, visual stack.
				otherPiece.PathPosition = -1
			}
		}
	}
}

func (gm *GameManager) getGlobalIndex(color Color, pathPos int) int {
	if pathPos < 0 || pathPos > 50 {
		return -1 // Home or Home Run (Safe)
	}

	offset := 0
	switch color {
	case Red:
		offset = 0
	case Green:
		offset = 13
	case Blue:
		offset = 26
	case Yellow:
		offset = 39
	}

	return (pathPos + offset) % 52
}
