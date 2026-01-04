import type { Vector2, GameObjectProperty, GameObject, PropertyType} from "./gameobject/gameobject";
import { Transform, VECTOR2_0, VECTOR2_1 } from "./gameobject/gameobject";
import { assetReader } from "./assets";
import type { Transform } from "./gameobject";

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

    constructor(parent: GameObject){
        this.parent = parent;
        GLOBAL_RENDERABLES.push(this);
    }

    abstract render(ctx: CanvasRenderingContext2D, dt:number): void;
}

export class Sprite {

    image: HTMLImageElement;
    size: Vector2 = VECTOR2_1;
    offset: Vector2 = VECTOR2_0;

    constructor(assetKey: string){
        this.image = assetReader(assetKey);    
        this.size.x = this.image.width;
        this.size.y = this.image.height;
    }
}

export class SpriteRenderer extends Renderable{

    sprite: Sprite;
    pt: Transform; //parent transform
    constructor(parent: GameObject, sprite: Sprite){
        super(parent);
        this.sprite = sprite;
        let pt = parent.getProperty("transform");
        if(!pt){
            throw new Error("Cannot find transform of :"+this.parent.id);
        }

        this.pt = pt as Transform;
    }

    render(ctx: CanvasRenderingContext2D, dt: number): void {
        const i = this.sprite.image;
        const p = this.pt.position;
        const s = this.pt.scale;

        ctx.drawImage(
            i,
            p.x, 
            p.y,
            p.x + i.width * s.x,
            p.y + i.height * s.y
        );
        dt;
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
