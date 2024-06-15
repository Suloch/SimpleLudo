import { Transform } from "./transform";
import { redPath } from "./paths";
import { Input } from "./input";
import { Board } from "./board";

function lerp(start: number, end:number, speed: number): number{
    return start + (end - start) * speed;
}

class Dice{
    ctx: CanvasRenderingContext2D;
    sprites: Array<HTMLImageElement>;
    rolled: boolean = false;
    onclick: Function | null = null;
    transform: Transform;
    rnumber: number = 0;

    constructor(ctx: CanvasRenderingContext2D, x: number, y: number, input: Input){
        this.ctx = ctx;
        this.sprites = [];
        
        for(let i = 0; i < 6; i++){
            this.sprites[i] = document.createElement('img');
            this.sprites[i].src = (i+1).toString() + '.png';
        }

        this.transform = new Transform(x, y, 1, 50, 50);

        this.onclick = () => {
            if(!this.rolled){
                this.rnumber = Math.floor(Math.random() * 6);
                this.rolled = true;
            }
            else
                console.log('Already rolled!');
        }

        input.addClickable(this.transform, this.onclick);
    }

    render(){
        this.ctx.drawImage(this.sprites[this.rnumber], this.transform.x, this.transform.y, this.transform.w, this.transform.h);
    }


         
}

class Piece{
    ctx: CanvasRenderingContext2D;
    color : string
    transform: Transform;
    targetTransform: Transform;
    cellId = -1;
    jailed = true;
    id = -1
    canMove = false;
    pos: number = -1;
    move : Function;
    onPieceClick : Function | null
    pathLength: number;
    speed = 0.05;

    constructor(ctx: CanvasRenderingContext2D, color: string, input: Input, id: number, move: Function){
        this.ctx = ctx;
        this.transform = new Transform(200, 200, 1, 25, 25);
        this.targetTransform = new Transform(200, 200, 1, 25, 25);
        this.color = color;
        this.id = id;
        this.move = move;
        this.onPieceClick = () => {
            if(this.canMove){
                this.move(this);
            }
        }

        switch(color){
            case "red": this.pathLength = redPath.length;
        }
        input.addClickable(this.transform, this.onPieceClick);
    }

    render(){
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.transform.x, this.transform.y, this.transform.w, this.transform.h);
    }

    validMove(n: number): boolean{
        if(this.jailed && n == 6){
            return true;
        }
        if(!this.jailed && this.pos + n < this.pathLength)
            return true;
        return false;
    }

    update(dt: number){
        this.transform.x = lerp(this.transform.x, this.targetTransform.x, this.speed);
        this.transform.y = lerp(this.transform.y, this.targetTransform.y, this.speed);
    }
}
enum TurnStage {
    FindingMoves,
    Moving,
    Ending
};

class Player{
    
    ctx: CanvasRenderingContext2D;
    
    playing : boolean
    
    transform: Transform

    _dice: Dice;

    pieces: Array<Piece> = [];

    color: string = "red";

    canMove = false;

    selectedPiece = -1;

    stage = TurnStage.FindingMoves


    
    board: Board

    constructor(ctx: CanvasRenderingContext2D, height: number, width: number, flipped: boolean, top: boolean, input: Input, board: Board){
        this.ctx = ctx;
        this.transform = new Transform(10, 10, 1, 0.25 * width, 0.1 * height);

        if(flipped){
            this.transform.x = width - this.transform.w - 10;    
        }

        if(!top){
            this.transform.y = height - this.transform.h - 10;
        }
        this._dice = new Dice(this.ctx, this.transform.x, this.transform.y, input);


        for(let i=0; i<4; i++){
            this.pieces.push(new Piece(this.ctx, this.color, input, i, this.move));
        }


        this.playing = true;
        this.board = board;
        
    }
    
    move = (piece: Piece) => {
        this.board.move(piece, this._dice.rnumber+1);
        for(let piece of this.pieces){
            piece.canMove = false;
            this.board.highlighted = []
        }
    }

    render(){
        this.ctx.fillStyle = "blue";
        this.ctx.fillRect(this.transform.x, this.transform.y, this.transform.w, this.transform.h);

        if(this.playing){
            this._dice.render()
        }

        for(let piece of this.pieces){
            piece.render();
        }
    }
    
    update(dt: number){
       for(let piece of this.pieces){
            piece.update(dt);
       } 
    }
}

export {Player, Piece, TurnStage};
