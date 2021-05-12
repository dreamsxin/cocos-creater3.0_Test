import Room from "./chessRoom";

/* 客户端 socket 连接管理 */
export default class RoomtManager {
    private static _instance: RoomtManager;
    private _index: number = 1000;
    public static get Instance(): RoomtManager {
        if (!RoomtManager._instance) {
            RoomtManager._instance = new RoomtManager();
        }
        return RoomtManager._instance;
    }
    /* 房间列表 */
    public roomList: Room[] = [];
    constructor() {

    }


    /**
     * 根据房间ID获取玩家所在房间
     * @param roomId 
     * @returns 
     */
    getRoomById(roomId: number): Room {
        for (let i = 0; i < this.roomList.length; i++) {
            if (this.roomList[i].roomId == roomId) {
                return this.roomList[i];
            }
        }
        return new Room();
    }
}