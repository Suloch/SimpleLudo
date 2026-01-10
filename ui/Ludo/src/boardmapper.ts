import type{ Vector2 } from "./gameobject/gameobject";
import type { Color } from "./gameobject/player";


export class BoardMapper{
    //maps the grid position of the pieces to actual board
    //color orientation starting from top left in clockwise direction
    //assumes the board is square and symmetrical
    orientation: Array<Color> = ["RED", "GREEN", "YELLOW", "BLUE"];
    gridSize: number = 1/15;
    gridCenter: number = 1/30;
    homeOfsset: number = 1/7.45;
    homePieceOffset: number = 2 / 15;
    size: number;
    redPath: Array<Vector2> = [ 
        {x: 1, y: 6}, {x: 2, y: 6}, {x: 3, y: 6}, {x: 4, y: 6}, {x: 5, y: 6},
        {x: 6, y: 5}, {x: 6, y: 4}, {x: 6, y: 3}, {x: 6, y: 2}, {x: 6, y: 1}, {x: 6, y: 0},
        {x: 7, y: 0}, {x: 8, y: 0}, {x: 8, y: 1}, {x: 8, y: 2}, {x: 8, y: 3}, {x: 8, y: 4}, {x: 8, y: 5},
        {x: 9, y: 6}, {x: 10, y: 6}, {x: 11, y: 6}, {x: 12, y: 6}, {x: 13, y: 6}, {x: 14, y: 6},
        {x: 14, y: 7}, {x: 14, y: 8}, {x: 13, y: 8}, {x: 12, y: 8}, {x: 11, y: 8}, {x: 10, y: 8}, {x: 9, y: 8},
        {x: 8, y: 9}, {x: 8, y: 10}, {x: 8, y: 11}, {x: 8, y: 12}, {x: 8, y: 13}, {x: 8, y: 14},
        {x: 7, y: 14},
        {x: 6, y: 14}, {x: 6, y: 13}, {x: 6, y: 12}, {x: 6, y: 11}, {x: 6, y: 10}, {x: 6, y: 9},
        {x: 5, y: 8}, {x: 4, y: 8}, {x: 3, y: 8}, {x: 2, y: 8}, {x: 1, y: 8}, {x: 0, y: 8},
        {x: 0, y: 7}, {x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 4, y: 7}, {x: 5, y: 7},
    ];

    constructor(size: number, scale: number){
        this.size = size * scale;
    }

    getHomePosition(index: number): Vector2{
        const basex = this.size*this.homeOfsset;
        const basey = basex;

        const pieceDiff = this.size * this.homePieceOffset;

        switch(index){
            case -1:
                return {
                    x: basex,
                    y: basey
                };
            case -2:
                return {
                    x: basex + pieceDiff,
                    y: basey
                }
            case -3:
                return {
                    x: basex, 
                    y: basey + pieceDiff
                }
            case -4:
                return {
                    x: basex + pieceDiff, 
                    y: basey + pieceDiff
                }
        }
        return {x:0, y:0};
    }
    
    getPosition(position: number): Vector2{
        if(position < 0){
            return this.getHomePosition(position);
        }
        return {
            x: this.redPath[position].x * this.gridSize * this.size + this.gridCenter * this.size,  
            y: this.redPath[position].y * this.gridSize * this.size + this.gridCenter * this.size,
        }
    }

    getDicePosition(color: Color){
        return {x: 0, y: 0};
    }
}




