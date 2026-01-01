

type EventCallBack = (data: any) => void;


const GLOBAL_EVENT_LISTENERS : Map<string, Map<string, EventCallBack>> = new Map();


function addEvent(eventName: string){
    GLOBAL_EVENT_LISTENERS.set(eventName, new Map());
}

function addEventListener(event: string, name: string, cb: EventCallBack){
    if(GLOBAL_EVENT_LISTENERS.has(event)){
        GLOBAL_EVENT_LISTENERS.get(event)!.set(name, cb);
        return;
    }

    throw new Error("Event not found: "+event);
}

function dispatchEvent(event: string, data: any){
    if(!GLOBAL_EVENT_LISTENERS.get(event))
        return;

    const callbackMap = GLOBAL_EVENT_LISTENERS.get(event)!;
    for(let cb  of callbackMap.values()){
        cb(data);
    }
}


export {addEvent, addEventListener, dispatchEvent};
