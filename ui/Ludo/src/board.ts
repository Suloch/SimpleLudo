
import type { GameObject, Vector2 } from "./gameobject";
import {getRedPath, type Path} from "./red";
import {getGreenPath} from "./green";
import { Dice } from "./dice";

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
    }

    onUpdate(dt: number): void {
        dt
    }

    render(dt: number): void {
        drawCircle(this.context, this.position.x, this.position.y, 20, this.color);
        dt
    }

}

class RedPiece extends Piece{
    path: Path
    pathPosition: number

    constructor(
        context: CanvasRenderingContext2D,
        name: string,
        pathPosition: number
    ){
        super(context, name, {x: 0, y: 0}, "RED");
        this.path = getRedPath(this.context.canvas.height, this.context.canvas.width)
        this.pathPosition = pathPosition;
        
        if(pathPosition < 0){
            this.position = this.path.homePositions[4+pathPosition]
        }else{
            this.position = this.path.path[pathPosition]
        }
        
    }
}

class GreenPiece extends Piece{
    path: Path
    pathPosition: number

    constructor(
        context: CanvasRenderingContext2D,
        name: string,
        pathPosition: number
    ){
        super(context, name, {x: 0, y: 0}, "GREEN")
        this.path = getGreenPath(this.context.canvas.height, this.context.canvas.width)
        this.pathPosition = pathPosition

        if(pathPosition < 0){
            this.position = this.path.homePositions[4+pathPosition]
        }else{
            this.position = this.path.path[pathPosition]
        }
    }
}

class Player implements GameObject{
    
    color: Color
    name: string
    position: Vector2;
    context: CanvasRenderingContext2D;
    pieces: Array<Piece> = []
    dice: Dice
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
                    this.pieces.push(new RedPiece(context, name+"-red-"+(i+1).toString(), i-4)); 
                    this.dice = new Dice(context, name+'dice', {x: 50, y: 0})
                    break;
                case "GREEN": 
                    this.pieces.push(new GreenPiece(context, name+"-red-"+(i+1).toString(), i-4)); 
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

    constructor(players: Array<Player>){
        for(let player of players){
            if(player.id == "")
                throw new Error("Player not connected: "+ player.color)
            this.players.set(player.id, player);
        }
    }


    
}

export {BoardBackground, Player};
