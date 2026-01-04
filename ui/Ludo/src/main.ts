import { loadAssets } from "./assets";
import { GameObjectWithTransform, Transform } from "./gameobject/gameobject";
import { initRenderer, Sprite, SpriteRenderer } from "./renderer";

class BackgroundSprite extends Sprite{

    constructor(){
        super('board');
    }
}

class BackgroundObject extends GameObjectWithTransform{

    constructor(){
        super(null);
        this.addProperty(new SpriteRenderer(this, new BackgroundSprite()));
        let t = this.getProperty("transform") as Transform;
        t.scale.x = 0.7;
        t.scale.y = 0.7;
    }
}

const main = async () => {
    const assetsURL : Map<string, string> = new Map<string, string>([
        ["board", "ludo.jpg"],
        ["piece", "redpiece.png"],
        ["dice", "dice.png"]
    ])

    await loadAssets(assetsURL);
    
   new BackgroundObject(); 
   
   initRenderer({x: 800, y: 650});
    

    
}
    


main()
