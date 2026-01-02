import { loadAssets } from "./assets";
import { GameManager } from "./board";
import { Renderer } from "./renderer";
import { RandomDiceService, StandardPieceFactory } from "./services";
import { BoardMapper } from "./boardMapper";

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
    
    return {canvas, context};
}

function startRenderingLoop(renderer: Renderer, gameManager: GameManager){
    let lastTimestamp = 0;
    
    function renderFrame(timestamp: number){
        requestAnimationFrame(renderFrame);
        const dt = timestamp - lastTimestamp;

        if(dt >= 1000 / fps){
            renderer.render(gameManager.state, dt);
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
        ["dice", "dice.png"]
    ])

    await loadAssets(assetsURL);
    const {canvas, context} = initCanvas();
    
    // 1. Init Dependencies
    const boardMapper = new BoardMapper(canvas.width, canvas.height);
    const diceService = new RandomDiceService();
    const pieceFactory = new StandardPieceFactory();

    // 2. Init Logic
    const gameManager = new GameManager(diceService, pieceFactory, boardMapper);
    gameManager.addPlayer("red-1", "Red Player", "RED");
    gameManager.addPlayer("green-1", "Green Player", "GREEN");
    
    // 3. Init View
    const renderer = new Renderer(context, boardMapper);

    // 4. Input Handling (Controller)
    canvas.addEventListener('click', (event) => {
        const pos = getClickPosition(event, canvas);
        console.log(`Clicked at x: ${pos.x}, y: ${pos.y}`);

        // Check for Piece Click
        const clickedPiece = renderer.getPieceAtPosition(gameManager.state, pos.x, pos.y);
        if (clickedPiece) {
            console.log("Piece clicked:", clickedPiece.id);
            gameManager.handlePieceClick(clickedPiece);
            return;
        }

        // Check for Dice Click
        const clickedPlayer = renderer.getDiceAtPosition(gameManager.state, pos.x, pos.y);
        if (clickedPlayer) {
            console.log("Dice clicked for:", clickedPlayer.name);
            gameManager.handleDiceClick(clickedPlayer.id);
            return;
        }
    });

    // Start Game
    gameManager.startGame();
    startRenderingLoop(renderer, gameManager);
}

main();
