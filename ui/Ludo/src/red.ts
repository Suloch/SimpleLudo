import type {Vector2} from "./model"

type Path = {
    homePositions: Array<Vector2>;
    path: Array<Vector2>;
}

function getRedPath(height: number, width: number): Path{
    const path: Array<{x: number, y: number}> = [
        {x: 1, y: 6},
        {x: 2, y: 6},
        {x: 3, y: 6},
        {x: 4, y: 6},
        {x: 5, y: 6},
        {x: 6, y: 5},
        {x: 6, y: 4},
        {x: 6, y: 3},
        {x: 6, y: 2},
        {x: 6, y: 1},
        {x: 6, y: 0},
        {x: 7, y: 0},
        {x: 8, y: 0},
        {x: 8, y: 1},
        {x: 8, y: 2},
        {x: 8, y: 3},
        {x: 8, y: 4},
        {x: 8, y: 5},
        {x: 9, y: 6},
        {x: 10, y: 6},
        {x: 11, y: 6},
        {x: 12, y: 6},
        {x: 13, y: 6},
        {x: 14, y: 6},
        {x: 14, y: 7},
        {x: 14, y: 8},
        {x: 13, y: 8},
        {x: 12, y: 8},
        {x: 11, y: 8},
        {x: 10, y: 8},
        {x: 9, y: 8},
        {x: 8, y: 9},
        {x: 8, y: 10},
        {x: 8, y: 11},
        {x: 8, y: 12},
        {x: 8, y: 13},
        {x: 8, y: 14},
        {x: 7, y: 14},
        {x: 6, y: 14},
        {x: 6, y: 13},
        {x: 6, y: 12},
        {x: 6, y: 11},
        {x: 6, y: 10},
        {x: 6, y: 9},
        {x: 5, y: 8},
        {x: 4, y: 8},
        {x: 3, y: 8},
        {x: 2, y: 8},
        {x: 1, y: 8},
        {x: 0, y: 8},
        {x: 0, y: 7},
        {x: 1, y: 7},
        {x: 2, y: 7},
        {x: 3, y: 7},
        {x: 4, y: 7},
        {x: 5, y: 7},
    ];
    const homePositions: Array<{x: number, y: number}> = [];
    const cellSize = height / 15;
    const homeCellSzie = 15;
    const offsetX = (width - height) / 2;
    const homePositionFactor = 6.3;
    const homeXDifference = height / 7.5;
    const homeYDifference = height / 7.5;

    const homePosition1 = {x: offsetX + height / homePositionFactor - homeCellSzie, y: height / homePositionFactor - homeCellSzie}
    const homePosition2 = {x: homePosition1.x + homeXDifference, y: homePosition1.y}
    const homePosition3 = {x: homePosition1.x , y: homePosition1.y + homeYDifference}
    const homePosition4 = {x: homePosition1.x + homeXDifference, y: homePosition1.y + homeYDifference}
    
    homePositions.push(homePosition1);
    homePositions.push(homePosition2)
    homePositions.push(homePosition3)
    homePositions.push(homePosition4)

    for(let pathPosition of path){
        pathPosition.x = pathPosition.x * cellSize + offsetX + cellSize/2;
        pathPosition.y = pathPosition.y * cellSize + cellSize/2;
    }

    const redPath: Path = {
        homePositions: homePositions,
        path: path
    }

    return redPath

}

export {getRedPath, type Path};
