
type Vector2={
    x: number;
    y: number;
}
export const VECTOR2_0: Vector2 = {x: 0, y: 0};
export const VECTOR2_1: Vector2 = {x: 1, y: 1};

const GLOBAL_GAME_OBJECTS = [];

export type PropertyType = "transform" | "clickable" | "renderable";

interface GameObjectProperty{
    id: string; 
    type: PropertyType;
    parent: GameObject;
}

export class Transform implements GameObjectProperty{
    id: string = crypto.randomUUID(); 
    type: PropertyType = "transform";
    parent: GameObject;
    position: Vector2 = VECTOR2_0;
    size: Vector2 = VECTOR2_0;
    scale: Vector2 = VECTOR2_1;

    constructor(parent: GameObject){
        this.parent = parent
    }
}

interface Updatable extends GameObjectProperty{
    update(dt: number): void;
}

export class GameObject{

    id: string = crypto.randomUUID(); //unique id    
    
    parent: GameObject | null = null;
     
    properties: Map<string, GameObjectProperty> = new Map();
    children: Map<string, GameObject> = new Map();

    addProperty(prop: GameObjectProperty): void{
        this.properties.set(prop.id, prop);
    }

    addChildren(child: GameObject){
        this.children.set(child.id, child);
    }

    constructor(parent: GameObject | null){
        this.parent = parent
        GLOBAL_GAME_OBJECTS.push(this);
    }
    
    getProperty(type: PropertyType): GameObjectProperty | null{
        for(let property of this.properties.values()){
            if(property.type == type)
                return property;
        }
        return null;
    }
}

export class GameObjectWithTransform extends GameObject{
    constructor(parent: GameObject|null){
        super(parent);
        const newTransformProperty = new Transform(this);
        this.addProperty(newTransformProperty);

    }
}



export type {Updatable, Vector2, GameObjectProperty};
