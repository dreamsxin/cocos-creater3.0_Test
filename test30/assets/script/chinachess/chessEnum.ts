export enum ChessRole {
    boss = 0,
    si,
    xiang,
    ma,
    ju,
    pao,
    bing,
}

export enum ChessType {
    red = 0,
    black,
}

export default class ChessUtil {
    private static _instance: ChessUtil = null as unknown as ChessUtil;
    public static get Inst(): ChessUtil {
        if (!this._instance) {
            this._instance = new ChessUtil();
        }
        return this._instance;
    }

    public static chessMoveTime: number = 10;
}