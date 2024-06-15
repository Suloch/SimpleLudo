import { Transform } from "./transform"
import { redPath } from "./paths";
import { Piece, TurnStage } from "./player";
import { highlightAnimation } from "./animator";

class Cell{
    ctx: CanvasRenderingContext2D
    transform: Transform
    home: boolean
    star: boolean
    pieces: Array<Number> = [];
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
        // this.ctx.font ="30px Verdana"
        // this.ctx.fillStyle = "black"
        // this.ctx.fillText(id.toString(), this.transform.x, this.transform.y+this.transform.h/2);
    }

    putPiece(p: Piece){
        this.pieces.push(p.id);
        p.targetTransform.x = this.transform.x;
        p.targetTransform.y = this.transform.y;
    }

    removePiece(p: Piece){
        this.pieces.splice(this.pieces.indexOf(p.id));
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

    highlighted: Array<number> = []

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

        this.path.set(100, new Cell(ctx, 0.765*w, 0.125*h));
        this.path.set(101, new Cell(ctx, 0.765*w, 0.25*h));
        this.path.set(102, new Cell(ctx, 0.70*w, 0.19*h));
        this.path.set(103, new Cell(ctx, 0.83*w, 0.19*h));

        this.path.set(200, new Cell(ctx, 0.765*w, 0.72*h));
        this.path.set(201, new Cell(ctx, 0.765*w, 0.845*h));
        this.path.set(202, new Cell(ctx, 0.70*w, 0.785*h));
        this.path.set(203, new Cell(ctx, 0.83*w, 0.785*h));

        this.path.set(300, new Cell(ctx, 0.19*w, 0.72*h));
        this.path.set(301, new Cell(ctx, 0.19*w, 0.845*h));
        this.path.set(302, new Cell(ctx, 0.125*w, 0.785*h));
        this.path.set(303, new Cell(ctx, 0.255*w, 0.785*h));

        this.path.set(400, new Cell(ctx, 0.19*w, 0.125*h));
        this.path.set(401, new Cell(ctx, 0.19*w, 0.25*h));
        this.path.set(402, new Cell(ctx, 0.125*w, 0.19*h));
        this.path.set(403, new Cell(ctx, 0.255*w, 0.19*h));
        
    }

    move(piece: Piece, steps: number){
        this.path.get(piece.cellId)?.removePiece(piece);
        if(piece.jailed && steps == 6){
            piece.pos = 0;
            piece.jailed = false;
            steps = 0;
        }else{
            piece.pos ++;
            steps--;
        }
        piece.cellId = piece.path[piece.pos];
        this.path.get(piece.cellId)?.putPiece(piece);

        if(steps == 0){
            console.log(this.path.get(piece.cellId)?.pieces);
            setTimeout(() => piece.player.stage = TurnStage.Ending, 1000);
        }

        if(steps != 0 && steps != 6){
            setTimeout(() => {this.move(piece, steps)}, 1000);
            return;
        }
    }

    jail(piece: Piece, color: string){
        let start = 100;
        

        switch(color){
            case 'blue': start = 200; break;
            case 'yellow': start = 300; break;
            case 'green': start = 400; break;
        }

        for(let i=start; i<start+4; i++){
            if(this.path.get(i)?.isempty()){
                this.path.get(i).putPiece(piece);
                piece.cellId = i;
                piece.jailed = true;
                break;
            }
        }
    }


    render(dt: number){
        for(let [id, cell] of this.path){
            // cell.render(dt, id);
        }

        for(let [id, cell] of this.redJail){
            // cell.render();
        }
        for(let cellId of this.highlighted){
            this.path.get(cellId).render(dt);
        }
    }
}


export {Board};
