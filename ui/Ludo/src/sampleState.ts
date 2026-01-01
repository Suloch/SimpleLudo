export const sampleState = {
    "id": "game-1",
    "players": [
        {
            "user": {
                "id": "user1",
                "name": "Alice"
            },
            "color": 0,
            "positions": [-1, -1, -1, -1],
            "active": true, 
            "won": false, 
            "rank": 0, 
            "canMove": [false, false, false, false]
        }, 
        { 
            "user": {
                "id": "no-user", 
                "name": "Player" 
            }, 
            "color": 1, 
            "positions": 
            [-1, -1, -1, -1], 
            "active": false, 
            "won": false, 
            "rank": 0, 
            "canMove": [false, false, false, false] 
        }, 
        { 
            "user": {
                "id": "no-user", 
                "name": "Player" 
            }, 
            "color": 2, 
            "positions": [-1, -1, -1, -1], 
            "active": false, 
            "won": false, 
            "rank": 0, 
            "canMove": [false, false, false, false] 
        }, 
        { 
            "user": { 
                "id": "no-user", 
                "name": "Player" 
            }, 
            "color": 2, 
            "positions": [-1, -1, -1, -1], 
            "active": false, 
            "won": false, 
            "rank": 0, 
            "canMove": [false, false, false, false] 
        }
    ], 
    "gameover": false, 
    "turn": { 
        "user": { 
            "id": "usererr 3", 
            "name": "Alice" 
        }, 
        "color": 0, 
        "positions": [-1, -1, -1, -1], 
        "active": true, 
        "won": false, 
        "rank": 0, 
        "canMove": [false, false, false, false] 
    }, 
    "dice": 0, 
    "diceRolled": false
};
