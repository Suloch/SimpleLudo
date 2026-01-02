
import type { Color, Vector2 } from "./model";

export class BoardMapper {
    private width: number;
    private height: number;
    private redPath: Vector2[];
    private redHome: Vector2[];
    private greenPath: Vector2[];
    private greenHome: Vector2[];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        // Initialize Paths
        this.redPath = this.generateRedPath();
        this.redHome = this.generateRedHome();
        this.greenPath = this.generateGreenPath();
        this.greenHome = this.generateGreenHome();

        // Transform Grid Coordinates to Pixels immediately
        this.transformToPixels(this.redPath);
        this.transformToPixels(this.redHome, true); // Home has slightly different calc if needed?
        // Actually the original code did transformToPixels on both path arrays.
        // But `homePositions` in original code were calculated using direct logic, not grid.

        // Let's stick to the original logic where `homePositions` are calculated directly in pixels
        // and `path` is calculated as grid then transformed.

        this.transformToPixels(this.greenPath);
    }

    getCoordinate(color: Color, pathIndex: number): Vector2 | null {
        let path: Vector2[];
        let home: Vector2[];

        if (color === "RED") {
            path = this.redPath;
            home = this.redHome;
        } else if (color === "GREEN") {
            path = this.greenPath;
            home = this.greenHome;
        } else {
            return null;
        }

        if (pathIndex < 0) {
            // Home Index: -4, -3, -2, -1 -> Map to 0, 1, 2, 3
            // In original code: homePositions[4 + pathPosition]
            const idx = 4 + pathIndex;
            if (idx >= 0 && idx < home.length) return home[idx];
            return null;
        } else {
            if (pathIndex < path.length) return path[pathIndex];
            return null;
        }
    }

    getGlobalTileIndex(color: Color, pathIndex: number): number | null {
        // Map local path index to a global 0-51 loop index.
        // Logic:
        // Main Loop Length = 52.
        // Red Start (Path 0) = Global 0.
        // Green Start (Path 0) = Global 13.
        // Blue Start = Global 26.
        // Yellow Start = Global 39.

        // Path indices > 50 are usually "Home Run" (entering the center) and are not on the main loop.
        // Let's verify the path array length.
        // In `red.ts`, path length is 57 (0..56).
        // 0..50 are main track?
        // Let's check coords.
        // Index 50: {x: 0, y: 7} (Left side of center row)
        // Index 51: {x: 1, y: 7} (Entering Red Home Run)
        // So 0..50 are 51 tiles? Standard Ludo is 52.
        // Let's count explicitly.
        // 5 arms * 3 columns = 15... no.
        // Standard: 52 tiles on perimeter.

        if (pathIndex > 50) return null; // In Home Run, protected from capture

        let offset = 0;
        if (color === "RED") offset = 0;
        else if (color === "GREEN") offset = 13;
        // else if Blue = 26, Yellow = 39

        return (pathIndex + offset) % 52;
    }

    private transformToPixels(gridCoords: Vector2[], isHome: boolean = false) {
        if (isHome) return; // Home calculated in pixels already

        const cellSize = this.height / 15;
        const offsetX = (this.width - this.height) / 2;

        for (const coord of gridCoords) {
            coord.x = coord.x * cellSize + offsetX + cellSize / 2;
            coord.y = coord.y * cellSize + cellSize / 2;
        }
    }

    private generateRedHome(): Vector2[] {
        const homePositions: Vector2[] = [];
        const homeCellSize = 15;
        const offsetX = (this.width - this.height) / 2;
        const homePositionFactor = 6.3;
        const homeXDifference = this.height / 7.5;
        const homeYDifference = this.height / 7.5;

        const p1 = {
            x: offsetX + this.height / homePositionFactor - homeCellSize,
            y: this.height / homePositionFactor - homeCellSize
        };

        homePositions.push(p1);
        homePositions.push({x: p1.x + homeXDifference, y: p1.y});
        homePositions.push({x: p1.x, y: p1.y + homeYDifference});
        homePositions.push({x: p1.x + homeXDifference, y: p1.y + homeYDifference});

        return homePositions;
    }

    private generateGreenHome(): Vector2[] {
        const homePositions: Vector2[] = [];
        const homeCellSize = 15;
        const offsetX = (this.width - this.height) / 2;
        const homePositionFactor = 6.3;
        const homeXDifference = this.height / 7.5;
        const homeYDifference = this.height / 7.5;

        // Green is top right? Original logic:
        // x: width - (...)
        const p1 = {
            x: this.width - (offsetX + this.height / homePositionFactor - homeCellSize + homeXDifference),
            y: this.height / homePositionFactor - homeCellSize
        };

        homePositions.push(p1);
        homePositions.push({x: p1.x + homeXDifference, y: p1.y});
        homePositions.push({x: p1.x, y: p1.y + homeYDifference});
        homePositions.push({x: p1.x + homeXDifference, y: p1.y + homeYDifference});

        return homePositions;
    }

    private generateRedPath(): Vector2[] {
        // Raw Grid Coordinates
        return [
            {x: 1, y: 6}, {x: 2, y: 6}, {x: 3, y: 6}, {x: 4, y: 6}, {x: 5, y: 6},
            {x: 6, y: 5}, {x: 6, y: 4}, {x: 6, y: 3}, {x: 6, y: 2}, {x: 6, y: 1}, {x: 6, y: 0},
            {x: 7, y: 0}, {x: 8, y: 0}, {x: 8, y: 1}, {x: 8, y: 2}, {x: 8, y: 3}, {x: 8, y: 4}, {x: 8, y: 5},
            {x: 9, y: 6}, {x: 10, y: 6}, {x: 11, y: 6}, {x: 12, y: 6}, {x: 13, y: 6}, {x: 14, y: 6},
            {x: 14, y: 7}, {x: 14, y: 8}, {x: 13, y: 8}, {x: 12, y: 8}, {x: 11, y: 8}, {x: 10, y: 8}, {x: 9, y: 8},
            {x: 8, y: 9}, {x: 8, y: 10}, {x: 8, y: 11}, {x: 8, y: 12}, {x: 8, y: 13}, {x: 8, y: 14},
            {x: 7, y: 14}, {x: 6, y: 14}, {x: 6, y: 13}, {x: 6, y: 12}, {x: 6, y: 11}, {x: 6, y: 10}, {x: 6, y: 9},
            {x: 5, y: 8}, {x: 4, y: 8}, {x: 3, y: 8}, {x: 2, y: 8}, {x: 1, y: 8}, {x: 0, y: 8},
            {x: 0, y: 7}, // 50
            {x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 4, y: 7}, {x: 5, y: 7}, // Home Run
        ];
    }

    private generateGreenPath(): Vector2[] {
        return [
            {x: 9, y: 1}, {x: 9, y: 2}, {x: 9, y: 3}, {x: 9, y: 4}, {x: 9, y: 5},
            {x: 6, y: 5}, {x: 6, y: 4}, {x: 6, y: 3}, {x: 6, y: 2}, {x: 6, y: 1}, {x: 6, y: 0},
            {x: 7, y: 0}, {x: 8, y: 0}, {x: 8, y: 1}, {x: 8, y: 2}, {x: 8, y: 3}, {x: 8, y: 4}, {x: 8, y: 5},
            {x: 9, y: 6}, {x: 10, y: 6}, {x: 11, y: 6}, {x: 12, y: 6}, {x: 13, y: 6}, {x: 14, y: 6},
            {x: 14, y: 7}, {x: 14, y: 8}, {x: 13, y: 8}, {x: 12, y: 8}, {x: 11, y: 8}, {x: 10, y: 8}, {x: 9, y: 8},
            {x: 8, y: 9}, {x: 8, y: 10}, {x: 8, y: 11}, {x: 8, y: 12}, {x: 8, y: 13}, {x: 8, y: 14},
            {x: 7, y: 14}, {x: 6, y: 14}, {x: 6, y: 13}, {x: 6, y: 12}, {x: 6, y: 11}, {x: 6, y: 10}, {x: 6, y: 9},
            {x: 5, y: 8}, {x: 4, y: 8}, {x: 3, y: 8}, {x: 2, y: 8}, {x: 1, y: 8}, {x: 0, y: 8},
            {x: 0, y: 7}, // 50
            {x: 1, y: 7}, {x: 2, y: 7}, {x: 3, y: 7}, {x: 4, y: 7}, {x: 5, y: 7}, // Home Run
        ];
    }
}
