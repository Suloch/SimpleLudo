
import type { Color, PieceModel } from "./model";

export interface DiceService {
    roll(): Promise<number>;
}

export class RandomDiceService implements DiceService {
    async roll(): Promise<number> {
        // Simulate animation delay
        return new Promise<number>((resolve) => {
            setTimeout(() => {
                const val = Math.floor(Math.random() * 6) + 1;
                resolve(val);
            }, 1000);
        });
    }
}

export interface PieceFactory {
    createPieces(playerId: string, color: Color): PieceModel[];
}

export class StandardPieceFactory implements PieceFactory {
    createPieces(playerId: string, color: Color): PieceModel[] {
        const pieces: PieceModel[] = [];
        for (let i = 0; i < 4; i++) {
            pieces.push({
                id: `${playerId}-piece-${i+1}`,
                color: color,
                pathPosition: i - 4, // -4, -3, -2, -1
                homeIndex: i - 4
            });
        }
        return pieces;
    }
}
