import type { Vector2 } from "./gameobject";
import type { Color } from "./gameobject/player";


export class BoardMapper{
    //maps the grid position of the pieces to actual board
    //color orientation starting from top left in clockwise direction
    //assumes the board is square and symmetrical
    orientation: Array<Color> = ["RED", "GREEN", "YELLOW", "BLUE"];
    gridSize: number = 1/15; 
    homeOfsset: number = 1/10;
    homePieceOffset: number = 2 / 15;
}
