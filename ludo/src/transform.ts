
class Transform{
    x: number = 0;
    y: number = 0;
    
    h: number = 1;
    w: number = 1;

    s: number = 1;
    
    constructor(x: number, y: number, s: number, w: number, h: number){
        this.x = x;
        this.y = y;
        this.s = s;

        this.h = h;
        this.w = w;
    }
}

export {Transform};

