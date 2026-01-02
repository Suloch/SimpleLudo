package game

// Constants for game rules
const (
	MaxPosition     = 56 // 0-50 (main) + 51-56 (home run)
	MainPathLength  = 52
	HomeRunStart    = 51
	FinishedPosition = 57 // Special marker for "in goal"
)

type Color string

const (
	Red    Color = "RED"
	Green  Color = "GREEN"
	Blue   Color = "BLUE"
	Yellow Color = "YELLOW"
)

type User struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type Piece struct {
	ID           string `json:"id"`
	Color        Color  `json:"color"`
	PathPosition int    `json:"pathPosition"` // -1 = Home, 0-56 = Path
}

type Player struct {
	User    User    `json:"user"`
	Color   Color   `json:"color"`
	Pieces  []Piece `json:"pieces"`
	Dice    Dice    `json:"dice"`
	HasWon  bool    `json:"hasWon"`
	IsTurn  bool    `json:"isTurn"`
}

type Dice struct {
	Value     int  `json:"value"`
	IsRolling bool `json:"isRolling"`
	Enabled   bool `json:"enabled"`
}

type GameState struct {
	ID               string             `json:"id"`
	Players          []*Player          `json:"players"`
	CurrentPlayerIdx int                `json:"currentPlayerIndex"`
	WaitingForRoll   bool               `json:"waitingForRoll"`
	WaitingForMove   bool               `json:"waitingForMove"`
	CurrentDiceVal   int                `json:"currentDiceValue"`
	PlayerMap        map[string]*Player `json:"-"` // Internal lookup
	Gameover         bool               `json:"gameover"`
}
