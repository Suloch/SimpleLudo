
import type { GameObject, Vector2 } from "./gameobject";
import {getRedPath, type Path} from "./red";
import {getGreenPath} from "./green";
import { Dice } from "./dice";
import { addEvent, addEventListener, dispatchEvent } from "./events";

type Color = "RED" | "BLUE" | "GREEN" | "YELLOW";

const drawCircle = (context: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) => {
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fillStyle = color;
    context.fill();
    context.lineWidth = 4;
    context.strokeStyle = "black"
    context.stroke();
}


class Piece implements GameObject{
    context: CanvasRenderingContext2D;
    name: string;
    position: Vector2;
    color: Color;
    radius: number = 20;
    pathPosition: number = -1; // -1..-4 are home positions

    constructor(
        context: CanvasRenderingContext2D,
        name: string,
        position: Vector2,
        color: Color
    ){
        this.context = context;
        this.name = name;
        this.position = position;
        this.color = color;

        addEvent("PIECE_CLICKED"+this.name);
        addEventListener("CANVAS_CLICKED", "piece_event"+name, (data: any) => {
            if(this.checkBounds(data.x, data.y)){
                dispatchEvent("PIECE_CLICKED"+this.name, this);
            }
        });
    }

    checkBounds(x: number, y: number): boolean {
        const dist = Math.sqrt(Math.pow(x - this.position.x, 2) + Math.pow(y - this.position.y, 2));
        return dist <= this.radius;
    }

    onUpdate(dt: number): void {
        dt
    }

    render(dt: number): void {
        drawCircle(this.context, this.position.x, this.position.y, this.radius, this.color);
        dt
    }

    // Abstract-ish methods to be overridden or implemented by subclasses
    updatePosition(_newPathPosition: number): void {}
    resetToHome(): void {}

}

class RedPiece extends Piece{
    path: Path

    constructor(
        context: CanvasRenderingContext2D,
        name: string,
        pathPosition: number
    ){
        super(context, name, {x: 0, y: 0}, "RED");
        this.path = getRedPath(this.context.canvas.height, this.context.canvas.width)
        this.pathPosition = pathPosition;
        this.updatePosition(pathPosition);
    }

    updatePosition(newPathPosition: number): void {
        this.pathPosition = newPathPosition;
        if(this.pathPosition < 0){
            this.position = this.path.homePositions[4+this.pathPosition]
        }else{
            if (this.pathPosition < this.path.path.length) {
                this.position = this.path.path[this.pathPosition];
            }
        }
    }

    resetToHome(): void {
         // Reset to original negative index.
         // Since we don't store the original index, we might need to.
         // However, in constructor we passed 'pathPosition' which was i-4.
         // We can infer home index from name or just find first empty home slot?
         // Simpler: Just put it back to -1 for now, but that might overlap.
         // Let's store homeIndex.
         // Wait, the constructor gets `pathPosition` which IS the home index (-4, -3, -2, -1).
         // I should store `initialHomeIndex`.
    }
}

// Redefining to handle home index
class RedPieceWithHome extends RedPiece {
    initialHomeIndex: number;
    constructor(context: CanvasRenderingContext2D, name: string, pathPosition: number) {
        super(context, name, pathPosition);
        this.initialHomeIndex = pathPosition;
    }
    resetToHome(): void {
        this.updatePosition(this.initialHomeIndex);
    }
}


class GreenPiece extends Piece{
    path: Path

    constructor(
        context: CanvasRenderingContext2D,
        name: string,
        pathPosition: number
    ){
        super(context, name, {x: 0, y: 0}, "GREEN")
        this.path = getGreenPath(this.context.canvas.height, this.context.canvas.width)
        this.pathPosition = pathPosition
        this.updatePosition(pathPosition);
    }

    updatePosition(newPathPosition: number): void {
        this.pathPosition = newPathPosition;
        if(this.pathPosition < 0){
            this.position = this.path.homePositions[4+this.pathPosition]
        }else{
             if (this.pathPosition < this.path.path.length) {
                this.position = this.path.path[this.pathPosition];
            }
        }
    }

    resetToHome(): void {
         // Placeholder
    }
}

class GreenPieceWithHome extends GreenPiece {
    initialHomeIndex: number;
    constructor(context: CanvasRenderingContext2D, name: string, pathPosition: number) {
        super(context, name, pathPosition);
        this.initialHomeIndex = pathPosition;
    }
    resetToHome(): void {
        this.updatePosition(this.initialHomeIndex);
    }
}


class Player implements GameObject{
    
    color: Color
    name: string
    position: Vector2;
    context: CanvasRenderingContext2D;
    pieces: Array<Piece> = []
    dice!: Dice;
    playing = false;
    id : string = "";

    constructor(
        context: CanvasRenderingContext2D,
        name: string,
        color: Color
    ){
        this.context = context;
        this.name = name;
        this.position = {x: 0, y: 0}
        this.color = color;

        for(let i = 0; i < 4; i++){
            switch(this.color){
                case "RED": 
                    this.pieces.push(new RedPieceWithHome(context, name+"-red-"+(i+1).toString(), i-4));
                    this.dice = new Dice(context, name+'dice', {x: 50, y: 0})
                    break;
                case "GREEN": 
                    this.pieces.push(new GreenPieceWithHome(context, name+"-green-"+(i+1).toString(), i-4));
                    this.dice = new Dice(context, name+'dice', {x: context.canvas.width - 100, y: 0});
                    break;
            }
        }
    }
    
    setId(id: string){
        this.id = id;
    }

    render(dt: number): void {
        for(let piece of this.pieces){
            piece.render(dt)
        }
        this.dice.render(dt);
    }

    onUpdate(dt: number): void {
        for(let piece of this.pieces){
            piece.onUpdate(dt)
        }
    }
}

class BoardBackground implements GameObject{

    context: CanvasRenderingContext2D;
    name: string;
    position: Vector2;
    image: HTMLImageElement;

    constructor(
        context: CanvasRenderingContext2D, 
        name: string, 
        position: Vector2, 
        image: HTMLImageElement
    ){
        this.context = context;
        this.name = name;
        this.position = position;
        this.image = image;
    }

    onUpdate(dt: number): void {
       dt 
    }
    
    render(dt: number): void {
        dt
        this.context.drawImage(
            this.image, 
            0, 
            0, 
            this.context.canvas.width, 
            this.context.canvas.height
        )
    }
    
}

class GameManager{

    players: Map<string, Player> = new Map();
    playerOrder: string[] = [];
    currentPlayerIndex: number = 0;

    waitingForRoll: boolean = false;
    waitingForMove: boolean = false;
    currentDiceValue: number = 0;

    constructor(players: Array<Player>){
        for(let player of players){
            if(player.id == "")
                 // Assuming IDs are set before this or we can't key them.
                 // But main.ts sets them. If not, we error.
                 // We will relax this check or ensure main.ts sets them first.
                throw new Error("Player not connected: "+ player.color)
            this.players.set(player.id, player);
            this.playerOrder.push(player.id);

            // Listen to dice events
            addEventListener("DICE_ROLL_FINISHED"+player.dice.name, "gm_dice_"+player.id, (data: any) => {
                 this.handleDiceRoll(parseInt(data.val));
            });

            // Listen to piece events
            for(let piece of player.pieces) {
                 addEventListener("PIECE_CLICKED"+piece.name, "gm_piece_"+piece.name, (data: any) => {
                     this.handlePieceClick(data); // data is the Piece object
                 });
            }
        }
    }

    startGame() {
        if (this.playerOrder.length === 0) return;
        this.currentPlayerIndex = 0;
        this.startTurn();
    }

    startTurn() {
        const playerId = this.playerOrder[this.currentPlayerIndex];
        const player = this.players.get(playerId);
        if(!player) return;

        console.log(`Turn: ${player.name} (${player.color})`);

        this.waitingForRoll = true;
        this.waitingForMove = false;
        player.dice.enabled = true;
        // Visual indicator could be added here
    }

    switchTurn() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.playerOrder.length;
        this.startTurn();
    }

    handleDiceRoll(val: number) {
        if (!this.waitingForRoll) return;

        console.log("Rolled: " + val);
        this.currentDiceValue = val;
        this.waitingForRoll = false;

        const playerId = this.playerOrder[this.currentPlayerIndex];
        const player = this.players.get(playerId);
        if(!player) return;

        // Check moves
        if (!this.hasPossibleMoves(player, val)) {
            console.log("No moves possible.");
            setTimeout(() => this.switchTurn(), 1000);
            return;
        }

        this.waitingForMove = true;
        console.log("Waiting for move...");
    }

    hasPossibleMoves(player: Player, diceVal: number): boolean {
        for (let piece of player.pieces) {
            if (this.isValidMove(piece, diceVal)) return true;
        }
        return false;
    }

    isValidMove(piece: Piece, diceVal: number): boolean {
        // Rule: Need 6 to leave home
        if (piece.pathPosition < 0) {
            return diceVal === 6;
        }

        // Rule: Path bounds
        // Assuming max path index is 56 (0..56)
        // Check actual array length via casting to specific piece type if needed,
        // or just assume 57 (common Ludo track length + home run)
        // RedPath has 57 elements.
        const maxIndex = 56;
        if (piece.pathPosition + diceVal > maxIndex) return false;

        return true;
    }

    handlePieceClick(piece: Piece) {
        if (!this.waitingForMove) return;

        const playerId = this.playerOrder[this.currentPlayerIndex];
        const player = this.players.get(playerId);
        if(!player) return;

        // Ensure piece belongs to current player
        if (!player.pieces.includes(piece)) return;

        if (this.isValidMove(piece, this.currentDiceValue)) {
            this.movePiece(piece, this.currentDiceValue, player);

            // Check win
            if (this.checkWin(player)) {
                console.log(player.name + " WINS!");
                alert(player.name + " WINS!");
                return; // Game Over
            }

            // Next turn or repeat
            if (this.currentDiceValue === 6) {
                console.log("Rolled 6! Roll again.");
                this.startTurn(); // Same player
            } else {
                this.switchTurn();
            }
        } else {
            console.log("Invalid move for this piece.");
        }
    }

    movePiece(piece: Piece, steps: number, currentPlayer: Player) {
        if (piece.pathPosition < 0) {
            // Move to start
            piece.updatePosition(0);
        } else {
            piece.updatePosition(piece.pathPosition + steps);
        }

        // Check Captures
        this.checkCaptures(piece, currentPlayer);
    }

    checkCaptures(movedPiece: Piece, currentPlayer: Player) {
        // Iterate all other players
        for (let pid of this.playerOrder) {
            if (pid === currentPlayer.id) continue;
            const otherPlayer = this.players.get(pid);
            if (!otherPlayer) continue;

            for (let otherPiece of otherPlayer.pieces) {
                // Ignore pieces in home (negative index) or finished (usually safe?)
                // Assuming finished pieces are safe.
                if (otherPiece.pathPosition < 0) continue;

                // Simple collision check: distance
                const dist = Math.sqrt(
                    Math.pow(movedPiece.position.x - otherPiece.position.x, 2) +
                    Math.pow(movedPiece.position.y - otherPiece.position.y, 2)
                );

                if (dist < 10) { // Threshold
                    console.log(`Captured ${otherPiece.name}!`);
                    otherPiece.resetToHome();
                }
            }
        }
    }

    checkWin(player: Player): boolean {
        // Win if all pieces are at last index (56)
        const maxIndex = 56;
        return player.pieces.every(p => p.pathPosition === maxIndex);
    }
}

export {BoardBackground, Player, GameManager, Piece};
