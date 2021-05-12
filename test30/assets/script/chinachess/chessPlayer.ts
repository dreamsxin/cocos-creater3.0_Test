import { ChessType } from "./chessEnum";

export class ChessPlayer {
    private static _instance: ChessPlayer = null as unknown as ChessPlayer;
    public static get Inst(): ChessPlayer {
        if (!ChessPlayer._instance) {
            ChessPlayer._instance = new ChessPlayer();
        }
        return ChessPlayer._instance;
    }

    /* 红/黑方 */
    public type: ChessType = ChessType.red;

    public roomId: number = -1;

    init() {
        this.roomId = -1;
    }
}