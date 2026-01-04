import { GameObject, GameObjectWithTransform } from "./gameobject";
import { Clickable } from "./gameobject";

export type Color = "RED" | "GREEN" | "BLUE" | "YELLOW"
export type PlayerState = "ROLLING" | "MOVING" | "WAITING"

class Dice extends GameObjectWithTransform{
    value: number = 1;
    enabled: boolean = false;
    

    constructor(parent: GameObject, onclick: ()=>void){
        super(parent);
        this.addProperty(new Clickable(this, onclick));
    }
}

export class Piece extends GameObjectWithTransform{
    
    gridPosition: number;
    enabled: boolean = false;

    constructor(parent: GameObject, p: number, onclick: ()=>void){
        super(parent);
        this.gridPosition = p;
        this.addProperty(new Clickable(this, onclick));
    }

}

export class Player extends GameObject{
    color: Color;
    name: string;
    state: PlayerState = "WAITING";

    constructor(parent: GameObject|null, name: string, color: Color){
        super(parent);
        this.color = color;
        this.name = name;
        for(let i=0; i<4; i++){
            this.addChildren(new Piece(this, i - 4, this.onPieceClick));
        }
        this.addChildren(new Dice(this, this.onDiceClick));
    }

    onDiceClick(){
        console.log("Player dice clicked: "+ this.name);
    }

    onPieceClick(){
        console.log("Player piece clicked: "+ this.name);
    }
}
