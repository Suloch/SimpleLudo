
export type Color = "RED" | "GREEN" | "BLUE" | "YELLOW";

export interface Vector2 {
    x: number;
    y: number;
}

export interface PieceModel {
    id: string;
    color: Color;
    pathPosition: number; // -1 to -4 are home, 0-56 are path
    homeIndex: number; // The specific home slot (-1 to -4)
}

export interface DiceModel {
    value: number;
    isRolling: boolean;
    rollStartTime: number; // For animation timing
    enabled: boolean;
}

export interface PlayerModel {
    id: string;
    name: string;
    color: Color;
    pieces: PieceModel[];
    dice: DiceModel;
    hasWon: boolean;
}

export interface GameState {
    players: PlayerModel[];
    currentPlayerIndex: number;
    waitingForRoll: boolean;
    waitingForMove: boolean;
    currentDiceValue: number;
    // Map of player ID to PlayerModel for quick access
    playerMap: Map<string, PlayerModel>;
}
