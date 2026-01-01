import { loadAssets, assetReader } from "./assets";
import { Player, BoardBackground } from "./board";
import type { GameObject, } from "./gameobject";
import { dispatchEvent, addEvent } from "./events";

const fps = 60;


function initCanvas(){

    const canvas = document.getElementById('ludoCanvas') as HTMLCanvasElement;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;

    canvas.style.position = 'absolute';
    canvas.style.left = '50%'
    canvas.style.top = '50%';
    canvas.style.transform = 'translate(-50%, -50%)';


    context.fillStyle = 'lightblue';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    addEvent("CANVAS_CLICKED");

    canvas.addEventListener('click', (event) => {
        const pos = getClickPosition(event, canvas);
        dispatchEvent('CANVAS_CLICKED', {x:pos.x, y:pos.y});
        console.log(`Clicked at x: ${pos.x}, y: ${pos.y}`);
    });
    return {canvas, context};
}






function startRenderingLoop(gameObjects: Array<GameObject>){
    let lastTimestamp = 0;
    let start = 0;
    let dt = 0;
    
    function renderFrame(timestamp: number){
        requestAnimationFrame(renderFrame);
        if(start === 0){
            start = timestamp;
        }

        dt = timestamp - lastTimestamp


        if(dt >= 1000 / fps){
            
            for(let gameObject of gameObjects){
                gameObject.render(dt);
            }
            lastTimestamp = timestamp;
        }
    }
    renderFrame(0);
}

const getClickPosition = (event: MouseEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return {x, y};
}


const main = async () => {
    const assetsURL : Map<string, string> = new Map<string, string>([
        ["board", "ludo.jpg"],
        ["piece", "redpiece.png"],
        ["dice", "dice.png"]
    ])

    await loadAssets(assetsURL);
    const {canvas, context} = initCanvas();
    
    const gameObjects = []
    
    gameObjects.push(
        new BoardBackground(
            context,
            "Background",
            {x: 0, y: 0},
            assetReader("board")
        )
    )

    const redPlayer = new Player(
        context,
        "Red Player",
        "RED"
    )
    
    redPlayer.playing = true;

    gameObjects.push(redPlayer)

    gameObjects.push(new Player(
        context,
        "Green Player",
        "GREEN"
    ))
    

    startRenderingLoop(gameObjects);

    
}
    


main()
