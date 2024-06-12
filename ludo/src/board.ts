import { Transform } from "./transform"
import { Piece } from "./player";
import { highlightAnimation } from "./animator";

class Cell{
    ctx: CanvasRenderingContext2D
    transform: Transform
    home: boolean
    star: boolean
    pieces: Array<Piece> = [];
    blueTurn: boolean
    redTurn: boolean
    greenTurn: boolean
    yellowTurn: boolean


    constructor(ctx: CanvasRenderingContext2D, x: number, y: number){
        this.transform = new Transform(x, y, 1, 40, 40);
        this.home = false;
        this.star = false;
        this.blueTurn = false;
        this.redTurn = false;
        this.greenTurn = false;
        this.yellowTurn = false;
        this.ctx = ctx;
    }

    render (dt: number){
        highlightAnimation.render(this.ctx, dt, this.transform);
    }

    putPiece(p: Piece){
        this.pieces.push(p);
        p.transform.x = this.transform.x;
        p.transform.y = this.transform.y;
    }

    isempty(){
        return this.pieces.length == 0;
    }
}


class Board{
    redJailCells: Array<Cell> = []
    redHomeCell: Cell
    path: Map<number, Cell> = new Map();

    transform: Transform;
    ctx: CanvasRenderingContext2D

    redJail: Map<number, Cell> = new Map();

    highlighted: Array<Cell> = []

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

        this.redJail.set(100, new Cell(ctx, 0.765*w, 0.125*h));
        this.redJail.set(101, new Cell(ctx, 0.765*w, 0.25*h));
        this.redJail.set(102, new Cell(ctx, 0.70*w, 0.19*h));
        this.redJail.set(103, new Cell(ctx, 0.83*w, 0.19*h));

        this.highlighted.push(this.redJail.get(100));
        
    }

    move(piece: Piece, steps: number){
        
    }

    jail(piece: Piece, color: string){
        let start = 100;
        let jail = this.redJail;

        switch(color){
            case 'blue': start = 200; jail = this.redJail;
        }

        for(let i=start; i<start+4; i++){
            if(jail.get(i)?.isempty()){
                jail.get(i).putPiece(piece);
                break;
            }
        }
    }


    render(dt: number){
        for(let [id, cell] of this.path){
            // cell.render();
        }

        for(let [id, cell] of this.redJail){
            // cell.render();
        }
        for(let cell of this.highlighted){
            cell.render(dt);
        }
    }
}


export {Board};
