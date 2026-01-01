
type Vector2={
    x: number;
    y: number;
}

interface GameObject{
    context:    CanvasRenderingContext2D;
    name:       string;
    position:    Vector2;

    onUpdate(dt: number): void;
    render(dt: number): void;
}


export type {GameObject, Vector2};
