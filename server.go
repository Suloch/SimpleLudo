package main

import (
	"errors"
)

type Color int

const finished_position = 1000
const home_position = -1
const max_position = 54

const (
	Red Color = iota
	Blue
	Green
	Yellow
)

type User struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type Player struct {
	User      User   `json:"user"`
	Color     Color  `json:"color"`
	Positions []int  `json:"positions"`
	Active    bool   `json:"active"`
	Won       bool   `json:"won"`
	Rank      int    `json:"rank"`
	CanMove   []bool `json:"canMove"`
}

type GameState struct {
	ID         string   `json:"id"`
	Players    []Player `json:"players"`
	Gameover   bool     `json:"gameover"`
	Turn       Player   `json:"turn"`
	Dice       byte     `json:"dice"`
	DiceRolled bool     `json:"diceRolled"`
}

func NewGameState(nplayers int, user User) *GameState {
	player1 := Player{
		User:      user,
		Color:     Red,
		Positions: make([]int, 4),
		Active:    true,
		Won:       false,
		Rank:      0,
		CanMove:   make([]bool, 4),
	}
	player2 := Player{
		User:      User{ID: "no-user", Name: "Player"},
		Color:     Blue,
		Positions: make([]int, 4),
		Active:    false,
		Won:       false,
		Rank:      0,
		CanMove:   make([]bool, 4),
	}

	player3 := Player{
		User:      User{ID: "no-user", Name: "Player"},
		Color:     Green,
		Positions: make([]int, 4),
		Active:    false,
		Won:       false,
		Rank:      0,
		CanMove:   make([]bool, 4),
	}

	player4 := Player{
		User:      User{ID: "no-user", Name: "Player"},
		Color:     Green,
		Positions: make([]int, 4),
		Active:    false,
		Won:       false,
		Rank:      0,
		CanMove:   make([]bool, 4),
	}

	gamestate := &GameState{
		ID:       "game-1",
		Players:  []Player{player1, player2, player3, player4}[:nplayers],
		Gameover: false,
		Turn:     player1,
	}

	return gamestate
}

func addUserToGame(gamestate *GameState, user User) bool {
	for i, player := range gamestate.Players {
		if player.User.ID == "no-user" {
			gamestate.Players[i].User = user
			gamestate.Players[i].Active = true
			return true
		}
	}
	return false
}

func isMoveValid(initialPosition int, diceValue byte) bool {

	if initialPosition == home_position && diceValue == 6 {
		return true
	}
	if initialPosition == finished_position {
		return false
	}
	if initialPosition+int(diceValue) > max_position {
		return false
	}
	return true
}

func rollDice(user User, gamestate *GameState) error {
	if gamestate.Turn.User.ID != user.ID {
		return errors.New("not your turn")
	}
	dice := 1 + (user.ID[0] % 6)
	gamestate.Dice = dice
	gamestate.DiceRolled = true

	for i, position := range gamestate.Turn.Positions {
		gamestate.Turn.CanMove[i] = isMoveValid(position, dice)
	}

	// Check if no moves are possible
	canMove := false
	for _, valid := range gamestate.Turn.CanMove {
		if valid {
			canMove = true
			break
		}
	}
	if !canMove {
		gamestate.Turn = getNextPlayer(gamestate)
		gamestate.DiceRolled = false
	}

	return nil
}

func getNextPlayer(gamestate *GameState) Player {
	for i, player := range gamestate.Players {
		if player.User.ID == gamestate.Turn.User.ID {
			return gamestate.Players[(i+1)%len(gamestate.Players)]
		}
	}
	return gamestate.Turn
}

func move(user User, gamestate *GameState, pieceIndex int) error {
	if gamestate.Turn.User.ID != user.ID {
		return errors.New("not your turn")
	}
	if !gamestate.Turn.CanMove[pieceIndex] {
		return errors.New("invalid move")
	}
	if gamestate.Turn.Positions[pieceIndex] == home_position && gamestate.Dice == 6 {
		gamestate.Turn.Positions[pieceIndex] = 0
	} else if gamestate.Turn.Positions[pieceIndex] != finished_position {
		gamestate.Turn.Positions[pieceIndex] += int(gamestate.Dice)
	}
	if gamestate.Turn.Positions[pieceIndex] == max_position {
		gamestate.Turn.Positions[pieceIndex] = finished_position
	}
	if gamestate.Dice != 6 {
		gamestate.Turn = getNextPlayer(gamestate)
	}
	gamestate.DiceRolled = false
	return nil
}
