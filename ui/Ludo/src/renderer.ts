import type { Vector2, GameObjectProperty, GameObject, PropertyType} from "./gameobject/gameobject";
import { Transform, Constants } from "./gameobject/gameobject";
import { assetReader } from "./assets";

const GLOBAL_RENDERABLES: Array<Renderable> = [];
const GLOBAL_CLICKABLES: Array<Clickable> = [];

export class Clickable implements GameObjectProperty{

    id: string = crypto.randomUUID(); 
    type: PropertyType = "clickable";
    parent: GameObject;

    start: Vector2 = {x: 0, y: 0};
    end: Vector2 = {x: 0, y: 0};
    
    onclick: () => void;

    constructor(parent: GameObject, onclick: ()=>void){
        this.onclick = onclick;
        this.parent = parent;
        GLOBAL_CLICKABLES.push(this);
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
       ctx.beginPath();
       ctx.arc(
           this.pt.position.x,
           this.pt.position.y,
           this.radius,
           0,
           Math.PI*2
       );
       ctx.fillStyle = this.color;
       ctx.strokeStyle = "#000000";
       ctx.stroke();
       ctx.fill();
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


    for(let renderable of GLOBAL_RENDERABLES){
        renderable.render(renderer.output.ctx, dt);
    }

}

function initRenderer(resolution: Vector2): void{

    const renderer = {
        resolution: resolution,
        input: initCanvas("input", resolution),
        output: initCanvas("output", resolution)
    };
    
    let t1 = 0;

    function updateCanvas(t2: number){
        
        const dt = t2 - t1;

        render(renderer, dt);

        if(dt > 1000/3){
            window.requestAnimationFrame(updateCanvas);
        }
    }

    window.requestAnimationFrame(updateCanvas);
}



export { initRenderer };
