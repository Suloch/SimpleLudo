import { Transform } from "./transform"
import { Piece } from "./player";

class Cell{
    ctx: CanvasRenderingContext2D
    transform: Transform
    home: boolean
    jail: boolean
    star: boolean
    pieces: Array<Piece> = [];
    blueTurn: boolean
    redTurn: boolean
    greenTurn: boolean
    yellowTurn: boolean

    constructor(ctx: CanvasRenderingContext2D, x: number, y: number){
        this.transform = new Transform(x, y, 1, 40, 40);
        this.home = false;
        this.jail = false;
        this.star = false;
        this.blueTurn = false;
        this.redTurn = false;
        this.greenTurn = false;
        this.yellowTurn = false;
        this.ctx = ctx;
    }

    render (){
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(this.transform.x, this.transform.y, this.transform.w, this.transform.h);
    }

    putPiece(p: Piece){
        this.pieces.push(p);
    }
}


class Board{
    redJailCells: Array<Cell> = []
    redHomeCell: Cell
    path: Map<number, Cell> = new Map();

    transform: Transform;
    ctx: CanvasRenderingContext2D

    constructor(ctx: CanvasRenderingContext2D, h: number, w: number){
        this.ctx = ctx;
        this.transform = new Transform(0, 0, 1, w, h);

        this.redHomeCell = new Cell(ctx, 100, 100);

        let diff = 0.064;
        let ystart = 0.028;
        let xstart = 0.54;

        for(let i=0; i<6; i++){
            //red area
            this.path.set(i+1, new Cell(ctx, xstart*w, (ystart + i*diff)*h));
            this.path.set(i+61, new Cell(ctx, (xstart - diff)*w, (ystart + i*diff)*h));
            this.path.set(i+67, new Cell(ctx, (xstart - diff * 2)*w, (ystart + i*diff)*h));
            
            this.path.get(i+61).redTurn = true;

            //blue area
            this.path.set(i+7, new Cell(ctx, (xstart + diff * (i+1))*w, (ystart + 6*diff)*h));
            this.path.set(i+13, new Cell(ctx, (xstart + diff * (i+1))*w, (ystart + 7*diff)*h));
            this.path.set(i+19, new Cell(ctx, (xstart + diff * (i+1))*w, (ystart + 8*diff)*h));

            this.path.get(i+13).blueTurn = true;

            //yellow area
            this.path.set(i+25, new Cell(ctx, (xstart)*w, (ystart + (9+i)*diff)*h));
            this.path.set(i+31, new Cell(ctx, (xstart - diff)*w, (ystart + (9+i)*diff)*h));
            this.path.set(i+37, new Cell(ctx, (xstart - diff * 2)*w, (ystart + (9+i)*diff)*h));

            this.path.get(i+31).yellowTurn = true;

            //green area
            this.path.set(i+43, new Cell(ctx, (xstart - diff * (i+3))*w, (ystart + 6*diff)*h));
            this.path.set(i+49, new Cell(ctx, (xstart - diff * (i+3))*w, (ystart + 7*diff)*h));
            this.path.set(i+55, new Cell(ctx, (xstart - diff * (i+3))*w, (ystart + 8*diff)*h));

            this.path.get(i+49).greenTurn = true;

        }
        
    }

    move(piece: Piece, steps: number){
        
    }

    render(){
        for(let [id, cell] of this.path){
            cell.render();
        }
    }
}


export {Board};
