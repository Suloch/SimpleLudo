
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const globalImageAssets : Map<string, HTMLImageElement> = new Map()

function assetCounter(totalAssets: number, markAssetsLoaded: Function){
    let loadedAssets = 0; 
    return {
        increment: () => {
            loadedAssets++;
            if(loadedAssets === totalAssets){
               markAssetsLoaded() 
            }
        }
    };  
}

function loadImage(src: string, assetCounter: any){
    const img = new Image();
    img.src = src;
    img.onload = () => {
        assetCounter.increment();
    };
    return img;
}

async function loadAssets(assetsURL: Map<string, string>){
    let assetsLoaded = false;

    const assetTracker = assetCounter(assetsURL.size, () => {assetsLoaded = true}) 
    for(let name of assetsURL.keys()){
        globalImageAssets.set(name, loadImage(assetsURL.get(name)!, assetTracker))
    }
    while(!assetsLoaded){
        await sleep(0.1)
    }
}

const assetReader: (assetName: string) => HTMLImageElement = (assetName: string): HTMLImageElement => {
    if(globalImageAssets.has(assetName)){
        return globalImageAssets.get(assetName)!
    }
    throw new Error("Asset not found:"+assetName)
}

export{loadAssets, assetReader}
