import './style.css'
import { Transform } from './transform';
import { Input } from './input';
import { Piece, Player, TurnStage } from './player';
import { Board } from './board';

class Background{
    ctx: CanvasRenderingContext2D;
    sprite: HTMLImageElement;
    transform: Transform;

    constructor(ctx: CanvasRenderingContext2D, imagePath: string, height: number, width: number){
        this.transform = new Transform(0, 0, 1, height, width);
        this.ctx = ctx;
        this.sprite = document.createElement('img');
        this.sprite.src = imagePath;
    }

    render(){
        this.ctx.drawImage(this.sprite, this.transform.x, this.transform.y, this.transform.w, this.transform.h);
    }
}


class LudoGame{
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    input: Input;
    windowHeight: number;
    windowWidth: number;
    background: Background;
    player: Player;
    board: Board;

    constructor(){
        this.windowWidth = 0.9 * Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        this.windowHeight = 0.9 * Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'main-canvas';
        if(this.windowHeight < this.windowWidth){
            this.canvas.height =  this.windowHeight;
            this.canvas.width = this.windowHeight;
        }else{
            this.canvas.height = this.windowWidth;
            this.canvas.width = this.windowWidth; 
        }

        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d')
        this.background = new Background(this.ctx, 'ludo_bg.png', this.canvas.height, this.canvas.width);

        
        this.input = new Input(this.canvas, this.ctx);

        this.board = new Board(this.ctx, this.canvas.height, this.canvas.width);

        this.player = new Player(this.ctx, this.canvas.height, this.canvas.width, false, true, this.input, this.board);

        for(let i=0; i<4; i++){
            this.board.jail(this.player.pieces[i], this.player.color);
        }
        this.startGameLoop();
    }

    startGameLoop(){
        let prevTime = 0;
        let animate = (timestamp: number) => {
            let dt = timestamp - prevTime; 

            if(dt > 20 || prevTime == 0){
                this.render(dt);
                this.update(20);
                prevTime = timestamp;
            }
            requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);

    }

    render(dt: number){
        this.background.render();
        this.player.render();
        this.input.render();
        this.board.render(dt);
    }

    update(dt: number){

        if(this.player.playing){
            if(!this.player._dice.rolled){
                //play dice highlight animation
            }else{
                let flag = false;
                //get available moves and highlight
                if(this.player.stage == TurnStage.FindingMoves){
                    for(let piece of this.player.pieces){
                        if(piece.validMove(this.player._dice.rnumber+1)){
                            piece.canMove = true;
                            flag = true;
                            this.board.highlighted.push(piece.cellId);
                        }
                    }
                    this.player.stage = TurnStage.Moving;
                }

                if(!flag){
                    this.player._dice.rolled = false;
                    this.player.stage = TurnStage.FindingMoves;
                    console.log("reseting turn")
                }
            }
        }
    }

}


new LudoGame();
