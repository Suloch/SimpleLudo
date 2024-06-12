
import { Transform } from "./transform";



class HighlightAnimation{

    
    minWidth = 30;
    maxWidth = 50;
    speed = 0.03;
    size = 40;

    constructor(){
    }

    render(ctx:  CanvasRenderingContext2D, dt: number, transform: Transform){
        if(this.size > this.maxWidth || this.size < this.minWidth){
            this.speed = -this.speed;
        }
        this.size = this.size + dt * this.speed;
        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.strokeStyle = "green";
        ctx.rect(transform.x-(this.size-40)/2, transform.y-(this.size-40)/2, this.size, this.size);
        ctx.stroke();
    }

}

class Animator{
    animations: Map<String, Animation> = new Map();
    currentAnimation: Animation;
    ctx: CanvasRenderingContext2D

    constructor(ctx: CanvasRenderingContext2D){

    }

}

class CellAnimator extends Animator{}

class DiceAnimator extends Animator{}
const highlightAnimation = new HighlightAnimation();

export {highlightAnimation, DiceAnimator};
