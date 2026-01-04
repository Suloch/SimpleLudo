import { GameObject } from "./gameobject/gameobject";
import { Player, type Color } from "./gameobject/player";



export class GameManger extends GameObject{
    playersRef: Array<Player> = [];
    currentPlayerIndex: number = 0;

    constructor(){
        super(null);
    }

    addPlayer(name: string): boolean{
        //check if the color is available 
        //
        const colors: Array<Color> = ["RED", "BLUE", "GREEN", "YELLOW"];
        let colorIndex = 0;
        for(let player of this.playersRef){
            if(player.color == colors[colorIndex]){
                colorIndex++;
                continue;
            }
        }
        if(colorIndex > 3){
            return false;
        }
        const player = new Player(this, name, colors[colorIndex]);
        this.addChildren(player);
        this.playersRef.push(player);
        return true
    }

    startTurn(){
        const player = this.playersRef[this.currentPlayerIndex];
        player.state = "ROLLING";
    }

}

