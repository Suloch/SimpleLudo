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
    player1: Player;
    player2: Player;
    player3: Player;
    player4: Player;
    
    currPlayer: Player;
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

        this.player1 = new Player(this.ctx, this.canvas.height, this.canvas.width, true, true, this.input, this.board, "red");
        this.player2 = new Player(this.ctx, this.canvas.height, this.canvas.width, true, false, this.input, this.board, "blue");
        this.player3 = new Player(this.ctx, this.canvas.height, this.canvas.width, false, false, this.input, this.board, "yellow");
        this.player4 = new Player(this.ctx, this.canvas.height, this.canvas.width, false, true, this.input, this.board, "green");

        this.player1.nextPlayer = this.player2;
        this.player2.nextPlayer = this.player3;
        this.player3.nextPlayer = this.player4;
        this.player4.nextPlayer = this.player1;

        this.currPlayer = this.player1;
        this.currPlayer.playing = true;

        for(let i=0; i<4; i++){
            this.board.jail(this.player1.pieces[i], this.player1.color);
            this.board.jail(this.player2.pieces[i], this.player2.color);
            this.board.jail(this.player3.pieces[i], this.player3.color);
            this.board.jail(this.player4.pieces[i], this.player4.color);
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
        this.player1.render();
        this.player2.render();
        this.player3.render();
        this.player4.render();
        this.input.render();
        this.board.render(dt);
    }

    update(dt: number){
        if(!this.player1.playing && !this.player2.playing && !this.player3.playing && !this.player4.playing){
            this.currPlayer = this.currPlayer.nextPlayer;
            this.currPlayer.playing = true;
        }

        this.player1.update(dt);
        this.player2.update(dt);
        this.player3.update(dt);
        this.player4.update(dt);
    }

}


new LudoGame();
