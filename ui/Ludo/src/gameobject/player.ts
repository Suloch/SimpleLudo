import { GameObject, GameObjectWithTransform, type Vector2 } from "./gameobject";
import { BoxClickable, CircleClickable, SpriteRenderer, SpriteSheet } from "../renderer";
import { DiscRenderer } from "../renderer";
import type { BoardMapper } from "../boardmapper";
import type { GameManger } from "../gamemanager";

export type Color = "RED" | "GREEN" | "BLUE" | "YELLOW"
export type PlayerState = "ROLLING" | "MOVING" | "WAITING"
const randomNumberForDice = () => Math.floor(Math.random()*6 + 1);

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
        this.addProperty(new SpriteRenderer(this, spriteSheet.getSprite((this.value-1).toString()), spriteSheet));

    }

    roll(): void{
        this.value = randomNumberForDice();
        const sr = this.getProperty('renderable') as SpriteRenderer;
        sr.sprite = sr.spriteSheet!.getSprite((this.value-1).toString());
        this.enabled = false;
    }

}

export class Piece extends GameObjectWithTransform{
    
    gridPosition: number;
    enabled: boolean = false;
    boardMapper: BoardMapper;
    color: Color
    constructor(parent: GameObject, p: number, onclick: (p: GameObject)=>void, boardMapper: BoardMapper){
        super(parent);
        this.gridPosition = p;
        this.addProperty(new CircleClickable(this, 20, onclick));
        const player = this.parent as Player;
        this.color = player.color;
        this.addProperty(new DiscRenderer(this, 10, player.color));
        this.boardMapper = boardMapper;
        this.transform.position = boardMapper.getPosition(p, this.color);
    }
    
    canMove(n: number): boolean{
        if(this.gridPosition < 0)
            return n == 6;
        return true;
    }

    move(n: number): void{
        if(this.gridPosition < 0)
            this.gridPosition = 0;
        else
            this.gridPosition = this.gridPosition + n;
        this.transform.position = this.boardMapper.getPosition(this.gridPosition, this.color);
    }
}

export class Player extends GameObject{
    color: Color;
    name: string;
    state: PlayerState = "WAITING";
    
    pieces: Array<Piece> = [];
    dice: Dice;
    hasWon: boolean = false;

    onDiceClick: (p: GameObject)=>void = (p: GameObject): void => {
        const dice = p as Dice;
        if(this.state == "ROLLING" && dice.enabled){
            dice.roll();
            for(let piece of this.pieces){
                if(piece.canMove(dice.value)){
                    piece.enabled = true;
                    this.state = "MOVING";
                }
            }
        }
    }

    onPieceClick: (p: GameObject)=>void = (p: GameObject): void => {
        const piece = p as Piece;
        const gm = this.parent as GameManger;
        if(piece.enabled){
            piece.move(this.dice.value);
            if(this.dice.value == 6){
                this.state == 'ROLLING';
                this.dice.enabled = true;
            }else{
                this.state == 'WAITING';
                gm.endTurn();
            }
        }

    }
    

    constructor(parent: GameObject|null, name: string, color: Color, boardMapper: BoardMapper){
        super(parent);
        this.color = color;
        this.name = name;
        for(let i=0; i<4; i++){
            let piece = new Piece(this, i - 4, this.onPieceClick, boardMapper);
            this.pieces.push(piece);
            this.addChildren(piece);
        }
        const dice = new Dice(this, boardMapper.getDicePosition(color, 1/13), this.onDiceClick);
        this.dice = dice;
        this.addChildren(dice);
    }

}
