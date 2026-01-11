import { loadAssets } from "./assets";
import { BoardMapper } from "./boardmapper";
import { GameManger } from "./gamemanager";
import { GameObjectWithTransform } from "./gameobject/gameobject";
import { initRenderer, Sprite, SpriteRenderer, SpriteSheet } from "./renderer";


class BackgroundObject extends GameObjectWithTransform{

    constructor(bgSprite: Sprite){
        super(null);
        this.addProperty(new SpriteRenderer(this, bgSprite));
        this.transform.scale = {x: 0.7, y: 0.7};
    }
}

const main = async () => {
    const assetsURL : Map<string, string> = new Map<string, string>([
        ["board", "ludo.jpg"],
        ["piece", "redpiece.png"],
        ["dice", "dice.png"]
    ])

    await loadAssets(assetsURL);
    const bgSprite = new Sprite('board'); 
    new BackgroundObject(bgSprite); 
    
    const diceSpriteSheet = new SpriteSheet('dice');
    diceSpriteSheet.createUniformGrid({x: 2, y: 3});

    const gameManager =  new GameManger();
    const boardMapper = new BoardMapper(bgSprite.image.height, 0.7);
    gameManager.addPlayer("sumit", boardMapper);
    gameManager.addPlayer("suloch", boardMapper);
    gameManager.startTurn();
    initRenderer({x: 800, y: 650});
    

    
}
    


main()
