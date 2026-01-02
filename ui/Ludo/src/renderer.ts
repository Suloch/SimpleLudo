
import type { GameState, PieceModel, PlayerModel, Color, Vector2, DiceModel } from "./model";
import { getRedPath, type Path } from "./red";
import { getGreenPath } from "./green";
import { assetReader } from "./assets";

export class Renderer {
    context: CanvasRenderingContext2D;
    redPath: Path;
    greenPath: Path;
    backgroundImage: HTMLImageElement;
    diceImage: HTMLImageElement;
    diceMap: Map<number, Vector2>;

    // View specific state: Dice positions
    // We need to know where to draw the dice for each player.
    // In the old code, it was hardcoded in Player constructor:
    // Red: {x: 50, y: 0}, Green: {x: width - 100, y: 0}
    dicePositions: Map<Color, Vector2> = new Map();

    constructor(context: CanvasRenderingContext2D) {
        this.context = context;
        this.redPath = getRedPath(context.canvas.height, context.canvas.width);
        this.greenPath = getGreenPath(context.canvas.height, context.canvas.width);
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
        const pos = this.getPieceVisualPosition(piece, color);
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
            // Animation logic: Change value every 100ms or so
            // Or just random every frame?
            // The model has `rollStartTime`.
            // We can use it to determine if we should stop rolling or what frame to show.
            // But usually logic handles "when to stop". View just animates.
            // If isRolling is true, we show random.
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

    getPieceVisualPosition(piece: PieceModel, color: Color): Vector2 | null {
        let path: Path;
        if (color === "RED") path = this.redPath;
        else if (color === "GREEN") path = this.greenPath;
        else return null; // Others not implemented

        if (piece.pathPosition < 0) {
            // Home position
            // piece.homeIndex should be -1, -2, -3, -4
            // path.homePositions is 0-indexed (0,1,2,3)
            // So index = 4 + piece.pathPosition
            // Wait, piece.pathPosition IS piece.homeIndex when in home.
            // In my previous code: position = path.homePositions[4+pathPosition]
            const idx = 4 + piece.pathPosition;
            if (idx >= 0 && idx < path.homePositions.length) {
                return path.homePositions[idx];
            }
        } else {
            // Path position
            if (piece.pathPosition < path.path.length) {
                return path.path[piece.pathPosition];
            }
        }
        return {x: 0, y: 0};
    }

    // Helper for Input Handling
    getPieceAtPosition(gameState: GameState, x: number, y: number): PieceModel | null {
        for (const player of gameState.players) {
            for (const piece of player.pieces) {
                const pos = this.getPieceVisualPosition(piece, player.color);
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
