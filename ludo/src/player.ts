import { Transform } from "./transform";
import { Input } from "./input";

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
            this.rnumber = Math.floor(Math.random() * 6);
            console.log('Dice Clicked!');
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
    transform: Transform
    cellId = -1;
    jailed = true;
    
    constructor(ctx: CanvasRenderingContext2D, color: string){
        this.ctx = ctx;
        this.transform = new Transform(200, 200, 1, 25, 25);
        this.color = color;
    }

    render(){
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.transform.x, this.transform.y, this.transform.w, this.transform.h);
    }
}

class Player{
    
    ctx: CanvasRenderingContext2D;
    
    playing : boolean
    
    transform: Transform

    _dice: Dice;

    pieces: Array<Piece> = [];

    color: string = "red";

    constructor(ctx: CanvasRenderingContext2D, height: number, width: number, flipped: boolean, top: boolean, input: Input){
        this.ctx = ctx;
        this.transform = new Transform(10, 10, 1, 0.25 * width, 0.1 * height);

        if(flipped){
            this.transform.x = width - this.transform.w - 10;    
        }

        if(!top){
            this.transform.y = height - this.transform.h - 10;
        }
        this._dice = new Dice(this.ctx, this.transform.x, this.transform.y, input);

        for(let i=0; i<4; i++)
            this.pieces.push(new Piece(this.ctx, this.color));

        this.playing = true;
        
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
            
        }
}

export {Player, Piece};
