import { GameObject, GameObjectWithTransform, type Vector2 } from "./gameobject";
import { BoxClickable, CircleClickable, SpriteRenderer, SpriteSheet } from "../renderer";
import { DiscRenderer } from "../renderer";
import type { BoardMapper } from "../boardmapper";

export type Color = "RED" | "GREEN" | "BLUE" | "YELLOW"
export type PlayerState = "ROLLING" | "MOVING" | "WAITING"

class Dice extends GameObjectWithTransform{
    value: number = 1;
    enabled: boolean = false;
     
    constructor(parent: GameObject, position: Vector2, onclick: (p: GameObject)=>void){
        super(parent);
        const boxClickable = new BoxClickable(this, {x:50, y: 50}, onclick);
        this.addProperty(boxClickable);
        const spriteSheet: SpriteSheet = new SpriteSheet('dice');
        this.transform.position = position;
        this.transform.scale = {x: 0.1, y: 0.1};
        spriteSheet.createUniformGrid({x: 2, y: 3});
        this.addProperty(new SpriteRenderer(this, spriteSheet.getSprite("0"), spriteSheet));

    }
}

export class Piece extends GameObjectWithTransform{
    
    gridPosition: number;
    enabled: boolean = false;

    constructor(parent: GameObject, p: number, onclick: (p: GameObject)=>void, boardMapper: BoardMapper){
        super(parent);
        this.gridPosition = p;
        this.addProperty(new CircleClickable(this, 20, onclick));
        const player = this.parent as Player;
        this.addProperty(new DiscRenderer(this, 10, player.color));
        this.transform.position = boardMapper.getPosition(p);
    }

}

export class Player extends GameObject{
    color: Color;
    name: string;
    state: PlayerState = "WAITING";

    onDiceClick: (p: GameObject)=>void = (p: GameObject): void => {
        console.log("Player dice clicked: "+ this.name);
        console.log(p);
    }

    onPieceClick: (p: GameObject)=>void = (p: GameObject): void => {
        console.log("Player piece clicked: "+ this.name);
        console.log(p);
    }

    constructor(parent: GameObject|null, name: string, color: Color, boardMapper: BoardMapper){
        super(parent);
        this.color = color;
        this.name = name;
        for(let i=0; i<4; i++){
            this.addChildren(new Piece(this, i - 4, this.onPieceClick, boardMapper));
        }
        this.addChildren(new Dice(this, boardMapper.getDicePosition(color), this.onDiceClick));
    }

}
