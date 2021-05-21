import { ChessType } from "./chessEnum";

export class ChessPlayer {
    private static _instance: ChessPlayer = null as unknown as ChessPlayer;
    public static get Inst(): ChessPlayer {
        if (!ChessPlayer._instance) {
            ChessPlayer._instance = new ChessPlayer();
        }
        return ChessPlayer._instance;
    }

    public offsetY: number = -9.123;

    /* 红/黑方 */
    public type: ChessType = ChessType.black;
    public roomId: number = -1;
    public playerId: number = -1;
    public isCanPlay: boolean = false;

    init() {
        this.roomId = -1;
        this.type = -1;
    }
}