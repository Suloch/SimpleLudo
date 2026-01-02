
import type { GameState, PieceModel, PlayerModel, Color, Vector2, DiceModel } from "./model";
import { assetReader } from "./assets";
import { BoardMapper } from "./boardMapper";

export class Renderer {
    context: CanvasRenderingContext2D;
    boardMapper: BoardMapper;
    backgroundImage: HTMLImageElement;
    diceImage: HTMLImageElement;
    diceMap: Map<number, Vector2>;

    // View specific state: Dice positions
    dicePositions: Map<Color, Vector2> = new Map();

    constructor(context: CanvasRenderingContext2D, boardMapper: BoardMapper) {
        this.context = context;
        this.boardMapper = boardMapper;
        this.backgroundImage = assetReader("board");
        this.diceImage = assetReader("dice");

        // Precompute dice sprite map
        const sx = this.diceImage.width / 3;
        const sy = this.diceImage.height / 2;
        this.diceMap = new Map();
        this.diceMap.set(1, {x: 0, y: 0});
        this.diceMap.set(2, {x: sx, y: 0});
        this.diceMap.set(3, {x: 2*sx, y: 0});
        this.diceMap.set(4, {x: 0, y: sy});
        this.diceMap.set(5, {x: sx, y: sy});
        this.diceMap.set(6, {x: 2*sx, y: sy});

        // Setup dice positions on screen
        this.dicePositions.set("RED", {x: 50, y: 20});
        this.dicePositions.set("GREEN", {x: context.canvas.width - 100, y: 20});
    }

    render(gameState: GameState, dt: number) {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);

        // 1. Draw Background
        this.context.drawImage(this.backgroundImage, 0, 0, this.context.canvas.width, this.context.canvas.height);

        // 2. Draw Players
        for (const player of gameState.players) {
            this.drawPlayer(player, dt);
        }
    }

    drawPlayer(player: PlayerModel, dt: number) {
        // Draw Pieces
        for (const piece of player.pieces) {
            this.drawPiece(piece, player.color);
        }

        // Draw Dice
        this.drawDice(player.dice, player.color, dt);
    }

    drawPiece(piece: PieceModel, color: Color) {
        const pos = this.boardMapper.getCoordinate(color, piece.pathPosition);
        if (!pos) return;

        this.context.beginPath();
        this.context.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
        this.context.fillStyle = color;
        this.context.fill();
        this.context.lineWidth = 4;
        this.context.strokeStyle = "black";
        this.context.stroke();
    }

    drawDice(dice: DiceModel, color: Color, _dt: number) {
        const pos = this.dicePositions.get(color);
        if (!pos) return;

        let valToDraw = dice.value;
        if (dice.isRolling) {
            valToDraw = Math.floor(Math.random() * 6) + 1;
        }

        const spritePos = this.diceMap.get(valToDraw);
        if (!spritePos) return;

        this.context.drawImage(
            this.diceImage,
            spritePos.x,
            spritePos.y,
            this.diceImage.width / 3,
            this.diceImage.height / 2,
            pos.x,
            pos.y,
            50,
            50
        );

        // Visual indicator if enabled
        if (dice.enabled) {
            this.context.strokeStyle = "yellow";
            this.context.lineWidth = 3;
            this.context.strokeRect(pos.x - 2, pos.y - 2, 54, 54);
        }
    }

    // Helper for Input Handling
    getPieceAtPosition(gameState: GameState, x: number, y: number): PieceModel | null {
        for (const player of gameState.players) {
            for (const piece of player.pieces) {
                const pos = this.boardMapper.getCoordinate(player.color, piece.pathPosition);
                if (!pos) continue;
                const dist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
                if (dist <= 20) { // Radius
                    return piece;
                }
            }
        }
        return null;
    }

    // Helper for Input Handling
    getDiceAtPosition(gameState: GameState, x: number, y: number): PlayerModel | null {
        for (const player of gameState.players) {
            const pos = this.dicePositions.get(player.color);
            if (!pos) continue;
             if (x >= pos.x && x <= pos.x + 50 &&
                y >= pos.y && y <= pos.y + 50) {
                return player;
            }
        }
        return null;
    }
}
