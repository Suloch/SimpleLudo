import { Transform } from "./transform";

class Input{
    
    clickables = new Map<Transform, Function>;
    hoverboxes = new Map<Transform, boolean>;
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D){
        this.ctx = ctx;
        this.canvas = canvas;
        canvas.addEventListener('click', this.handleClickEvent);

        canvas.onmousemove = this.highlight;
    }

    addClickable(transform: Transform, onclick: Function){
        this.clickables.set(transform, onclick);
        this.hoverboxes.set(transform, false);
    }
    
    highlight = (event) => {
        let r = this.canvas.getBoundingClientRect(), x = event.clientX - r.left, y = event.clientY - r.top;
        
        for(let transform of this.hoverboxes.keys()){
            this.hoverboxes.set(transform, false);
        }

        for(let transform  of this.hoverboxes.keys()){
            if(x >= transform.x && x <= transform.x + transform.w &&
           y >= transform.y && y <= transform.y + transform.h){
                this.hoverboxes.set(transform, true);
                break;
            }
        }

    } 

    handleClickEvent = (event) => {
        
        let r = this.canvas.getBoundingClientRect(), x = event.clientX - r.left, y = event.clientY - r.top;

        for(let [transform, onclick] of this.clickables){
            if(x >= transform.x && x <= transform.x + transform.w &&
           y >= transform.y && y <= transform.y + transform.h){
                onclick();
                break;
            }
        }
    }

    render(){
        this.ctx.fillStyle = "#ff000080";

        for(let [transform, hover] of this.hoverboxes){
            if(hover){
                this.ctx.fillRect(transform.x, transform.y, transform.w, transform.h);
            }
        }
    }
}

export {Input};
