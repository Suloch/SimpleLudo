
import type { GameObject, Vector2 } from "./gameobject";
import { assetReader } from "./assets";
import { addEventListener, addEvent, dispatchEvent } from "./events";

const diceValues = ["1", "2", "3", "4", "5", "6"] as const;
type DiceVal = typeof diceValues[number]


class Dice implements GameObject{
    context: CanvasRenderingContext2D;
    name: string;
    position: Vector2;
    val: DiceVal = "1";
    diceImage: HTMLImageElement;
    diceMap: Map<DiceVal, Vector2>;
    rolling: boolean = false;
    rollTotalTime: number = 2000; //ms  for rolling animation
    rollCurrTime: number = 0;

    constructor(
        context: CanvasRenderingContext2D,
        name: string,
        position: Vector2
    ){
        this.context = context;
        this.name = name;
        this.position = position;
        this.diceImage = assetReader('dice');

        let sx = this.diceImage.width / 3;
        let sy = this.diceImage.height / 2;
        
        this.diceMap = new Map();
        this.diceMap.set("1", {x: 0, y: 0});
        this.diceMap.set("2", {x: sx, y: 0});
        this.diceMap.set("3", {x: 2*sx, y: 0});
        this.diceMap.set("4", {x: 0, y: sy});
        this.diceMap.set("5", {x: sx, y: sy});
        this.diceMap.set("6", {x: 2*sx, y: sy});
        
        
        addEvent("DICE_CLICKED"+this.name);
        addEventListener("CANVAS_CLICKED", "dice_event"+name, (data: any) =>{
            if(this.checkDiceBounds(data.x, data.y))
               dispatchEvent("DICE_CLICKED"+this.name, {});
        });

        addEventListener("DICE_CLICKED"+this.name, "dice_clicked"+name, (_: any) => {
            this.onDiceClick();
        })


    }
    
    onDiceClick(){
        console.log("dice was clicked: "+this.name);
        this.rolling = true;
        this.rollCurrTime = 0;
    }

    checkDiceBounds(x: number, y: number){
        return x < this.position.x + 50 && x > this.position.x && y < this.position.y + 50 && y > this.position.y;
    }

    setVal(value: DiceVal){
        this.val = value
    }

    onUpdate(dt: number): void {
        dt;
    }

    render(dt: number): void {
        
        if(this.rolling){
            this.val = diceValues[Math.floor(Math.random()*6)]
            this.rollCurrTime = this.rollCurrTime + dt;
            if(this.rollCurrTime > this.rollTotalTime)
                this.rolling = false;
        }

        this.context.drawImage(
            this.diceImage,
            this.diceMap.get(this.val)!.x,
            this.diceMap.get(this.val)!.y,
            this.diceImage.width/3,
            this.diceImage.height/2,
            this.position.x,
            this.position.y,
            50,
            50
        )

    }
}

export {Dice};
