
import type { GameState, PlayerModel, PieceModel, Color } from "./model";
import type { DiceService, PieceFactory } from "./services";

export class GameManager {
    state: GameState;
    diceService: DiceService;
    pieceFactory: PieceFactory;

    constructor(diceService: DiceService, pieceFactory: PieceFactory) {
        this.diceService = diceService;
        this.pieceFactory = pieceFactory;
        this.state = {
            players: [],
            playerMap: new Map(),
            currentPlayerIndex: 0,
            waitingForRoll: false,
            waitingForMove: false,
            currentDiceValue: 0
        };
    }

    addPlayer(id: string, name: string, color: Color) {
        const pieces = this.pieceFactory.createPieces(id, color);

        const player: PlayerModel = {
            id,
            name,
            color,
            pieces,
            dice: {
                value: 1,
                isRolling: false,
                rollStartTime: 0,
                enabled: false
            },
            hasWon: false
        };

        this.state.players.push(player);
        this.state.playerMap.set(id, player);
    }

    startGame() {
        if (this.state.players.length === 0) return;
        this.state.currentPlayerIndex = 0;
        this.startTurn();
    }

    startTurn() {
        const player = this.state.players[this.state.currentPlayerIndex];
        console.log(`Turn: ${player.name} (${player.color})`);

        this.state.waitingForRoll = true;
        this.state.waitingForMove = false;

        // Enable dice
        player.dice.enabled = true;
    }

    switchTurn() {
        this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;
        this.startTurn();
    }

    async handleDiceClick(playerId: string) {
        const player = this.state.playerMap.get(playerId);
        if (!player) return;

        // Validate it's their turn and dice is enabled
        if (this.state.players[this.state.currentPlayerIndex].id !== playerId) return;
        if (!player.dice.enabled) return;

        // Start Roll
        player.dice.enabled = false;
        player.dice.isRolling = true;
        player.dice.rollStartTime = Date.now();

        // Use Injected Dice Service
        const val = await this.diceService.roll();

        // Update State
        player.dice.isRolling = false;
        player.dice.value = val;
        this.handleDiceRollFinished(val);
    }

    handleDiceRollFinished(val: number) {
        console.log("Rolled: " + val);
        this.state.currentDiceValue = val;
        this.state.waitingForRoll = false;

        const player = this.state.players[this.state.currentPlayerIndex];

        // Check moves
        if (!this.hasPossibleMoves(player, val)) {
            console.log("No moves possible.");
            setTimeout(() => this.switchTurn(), 1000);
            return;
        }

        this.state.waitingForMove = true;
        console.log("Waiting for move...");
    }

    handlePieceClick(piece: PieceModel) {
        if (!this.state.waitingForMove) return;

        const player = this.state.players[this.state.currentPlayerIndex];

        // Ensure piece belongs to current player
        if (piece.color !== player.color) return;

        if (this.isValidMove(piece, this.state.currentDiceValue)) {
            this.movePiece(piece, this.state.currentDiceValue, player);

            // Check win
            if (this.checkWin(player)) {
                console.log(player.name + " WINS!");
                alert(player.name + " WINS!");
                player.hasWon = true;
                return; // Game Over
            }

            // Next turn or repeat
            if (this.state.currentDiceValue === 6) {
                console.log("Rolled 6! Roll again.");
                this.startTurn(); // Same player
            } else {
                this.switchTurn();
            }
        } else {
            console.log("Invalid move for this piece.");
        }
    }

    movePiece(piece: PieceModel, steps: number, currentPlayer: PlayerModel) {
        if (piece.pathPosition < 0) {
            // Move to start
            piece.pathPosition = 0;
        } else {
            piece.pathPosition += steps;
        }

        // Check Captures
        this.checkCaptures(piece, currentPlayer);
    }

    checkCaptures(_movedPiece: PieceModel, _currentPlayer: PlayerModel) {
        // Capture logic placeholder (requires path mapping)
    }

    // ... helper functions
    hasPossibleMoves(player: PlayerModel, diceVal: number): boolean {
        for (const piece of player.pieces) {
            if (this.isValidMove(piece, diceVal)) return true;
        }
        return false;
    }

    isValidMove(piece: PieceModel, diceVal: number): boolean {
        if (piece.pathPosition < 0) {
            return diceVal === 6;
        }
        const maxIndex = 56;
        if (piece.pathPosition + diceVal > maxIndex) return false;
        return true;
    }

    checkWin(player: PlayerModel): boolean {
        const maxIndex = 56;
        return player.pieces.every(p => p.pathPosition === maxIndex);
    }
}
