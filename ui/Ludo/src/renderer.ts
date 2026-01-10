import type { Vector2, GameObjectProperty, GameObject, PropertyType } from "./gameobject/gameobject";
import { Transform, Constants } from "./gameobject/gameobject";
import { assetReader } from "./assets";

const GLOBAL_RENDERABLES: Array<Renderable> = [];
const GLOBAL_CLICKABLES: Map<string, Clickable> = new Map();
let startColor: number = 0;

function drawCircle(ctx: CanvasRenderingContext2D, center: Vector2, radius: number, color: string): void{
       ctx.beginPath();
       ctx.arc(
           center.x,
           center.y,
           radius,
           0,
           Math.PI*2
       );
       ctx.fillStyle = color;
       ctx.strokeStyle = "#000000";
       ctx.stroke();
       ctx.fill();
}

export abstract class Clickable implements GameObjectProperty{

    id: string = crypto.randomUUID(); 
    type: PropertyType = "clickable";
    parent: GameObject;
    color: string;
    pt: Transform;

    onclick: (parent: GameObject) => void;

    constructor(parent: GameObject, onclick: (parent: GameObject)=>void){
        this.onclick = onclick;
        this.parent = parent;
        const transform = parent.getProperty("transform") as Transform;
        this.pt = transform;
        this.color = "#4F"+startColor.toString(16).padStart(4,'0');
        startColor++;
        GLOBAL_CLICKABLES.set(this.color, this);
    }
    
    abstract render(ctx: CanvasRenderingContext2D): void;
}

export class BoxClickable extends Clickable{
    position: Vector2 = Constants.VECTOR2_0;
    size: Vector2 = Constants.VECTOR2_1;
    constructor(parent: GameObject, size: Vector2, onclick: (parent: GameObject)=>void){
        super(parent, onclick);
        this.size = size;
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.color; 
        const t = this.pt.position;
        const p = this.position;
        const s = this.size;

        ctx.fillRect(
            t.x+p.x,
            t.y+p.y,
            s.x,
            s.y
        );
    }
}

export class CircleClickable extends Clickable{
    position: Vector2 = Constants.VECTOR2_0;
    radius: number = 1;
    
    constructor(parent: GameObject, radius: number, onclick: (parent: GameObject)=>void){
        super(parent, onclick);
        this.radius = radius;
    }

    render(ctx: CanvasRenderingContext2D): void {
       drawCircle(ctx, this.pt.position, this.radius, this.color); 
    }
}

abstract class Renderable implements GameObjectProperty{
    id: string = crypto.randomUUID(); 
    type: PropertyType = "renderable";
    parent: GameObject;
    pt: Transform; //parent transform

    constructor(parent: GameObject){
        this.parent = parent;
        let pt = parent.getProperty("transform");
        if(!pt){
            throw new Error("Cannot find transform of :"+this.parent.id);
        }

        this.pt = pt as Transform;
        GLOBAL_RENDERABLES.push(this);
    }

    abstract render(ctx: CanvasRenderingContext2D, dt:number): void;
}

export class Sprite {

    image: HTMLImageElement;
    size: Vector2 = Constants.VECTOR2_1;
    offset: Vector2 = Constants.VECTOR2_0;

    constructor(assetKey: string, size?: Vector2, offset?: Vector2){
        this.image = assetReader(assetKey);    
        if(!size){
            this.size.x = this.image.width;
            this.size.y = this.image.height;
        }else{
            this.size = size;
        }
        if(!offset)
            this.offset = Constants.VECTOR2_0;
        else
            this.offset = offset

    }
}

export class SpriteSheet{
    spriteMap: Map<string, Sprite> = new Map();
    assetKey: string;
    image: HTMLImageElement;

    constructor(assetKey: string){
        this.assetKey = assetKey;
        this.image = assetReader(assetKey);
    }

    addSprite(name: string, offset: Vector2, gridSize: Vector2){
        this.spriteMap.set(name, new Sprite(this.assetKey, gridSize, offset));
    }

    getSprite(name: string): Sprite{
        if(!this.spriteMap.has(name))
            throw new Error("Sprite not found");

        return this.spriteMap.get(name)!;
    }

    createUniformGrid(gridCount: Vector2){
        const size: Vector2 = {x: this.image.width/gridCount.y, y: this.image.height/gridCount.x};

        for(let i=0; i<gridCount.x; i++){
            for(let j=0; j<gridCount.y; j++){
                this.addSprite((i*gridCount.y+j).toString(), {x: j*size.x, y: i*size.y}, size);
            }
        }
    }

}

export class SpriteRenderer extends Renderable{

    sprite: Sprite;
    spriteSheet: SpriteSheet | undefined;

    constructor(parent: GameObject, sprite: Sprite, spriteSheet?: SpriteSheet){
        super(parent);
        this.sprite = sprite;
        this.spriteSheet = spriteSheet;
    }

    render(ctx: CanvasRenderingContext2D, dt: number): void {
        const i = this.sprite.image;
        const p = this.pt.position;
        const s = this.pt.scale;
        const sz = this.sprite.size;
        const of = this.sprite.offset;
        ctx.drawImage(
            i,
            of.x,
            of.y,
            sz.x,
            sz.y,
            p.x, 
            p.y,
            sz.x * s.x,
            sz.y * s.x
        );
        dt;
    }
}

export class DiscRenderer extends Renderable{
    radius: number;
    color: string;
    constructor(parent: GameObject, radius: number, color:string){
        super(parent);
        this.radius = radius;
        this.color = color;
    }
    
    render(ctx: CanvasRenderingContext2D, dt: number): void {
       dt;
       drawCircle(ctx, this.pt.position, this.radius, this.color);
    }
}

interface CanvasInfo{
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
}

interface RendererInfo{
    resolution: Vector2;
    input: CanvasInfo;
    output: CanvasInfo;
}

function initCanvas(id: string, resolution: Vector2): CanvasInfo{

    const canvas = document.createElement("canvas");
    canvas.id =  id;
    canvas.height = resolution.y;
    canvas.width = resolution.x;

    const ctx = canvas.getContext('2d');

    if(!ctx) throw new Error("Cannot get rendering context");
    
    canvas.style.position = 'absolute';
    canvas.style.left = '50%';
    canvas.style.transform = 'translateX(-50%)';

    document.body.append(canvas);


    return { canvas, ctx }
}

function render(renderer: RendererInfo, dt: number): void{
    renderer.output.ctx.fillStyle = "#ff0088";
    renderer.output.ctx.fillRect(0, 0, renderer.output.canvas.width, renderer.output.canvas.height);
    
    renderer.input.ctx.clearRect(0, 0, renderer.input.canvas.width, renderer.input.canvas.height);

    for(let renderable of GLOBAL_RENDERABLES){
        renderable.render(renderer.output.ctx, dt);
    }

    for(let clickable of GLOBAL_CLICKABLES.values()){
        clickable.render(renderer.input.ctx);
    }

}

function rgbToHex(r: number, g: number, b: number){

  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function initRenderer(resolution: Vector2): void{

    const renderer = {
        output: initCanvas("output", resolution),
        resolution: resolution,
        input: initCanvas("input", resolution),
    };
    
    const inputRect = renderer.input.canvas.getBoundingClientRect();
    renderer.input.canvas.onclick = (event:PointerEvent) => {
        const x = event.clientX - inputRect.left;
        const y = event.clientY - inputRect.top;
    
        const data = renderer.input.ctx.getImageData(x, y, 1, 1).data;
        const colorClicked = rgbToHex(data[0], data[1], data[2]);
    
        if(GLOBAL_CLICKABLES.has(colorClicked)){
            const clickedObject = GLOBAL_CLICKABLES.get(colorClicked)!;
            clickedObject.onclick(clickedObject.parent);
        }
        
    }
    let t1 = 0;
    renderer.input.canvas.style.opacity = '0.4';
    function updateCanvas(t2: number){
        
        const dt = t2 - t1;

        render(renderer, dt);

        if(dt > 1000/30){
            window.requestAnimationFrame(updateCanvas);
        }
    }

    window.requestAnimationFrame(updateCanvas);
}



export { initRenderer };
