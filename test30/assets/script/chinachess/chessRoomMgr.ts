import Room from "./chessRoom";
import { createRoomRes } from "./net/globalUtils";

/* 客户端 socket 连接管理 */
export default class RoomtManager {
    private static _instance: RoomtManager;
    private _index: number = 1000;
    public roomInfoList: createRoomRes[] = [];
    public static get Instance(): RoomtManager {
        if (!RoomtManager._instance) {
            RoomtManager._instance = new RoomtManager();
        }
        return RoomtManager._instance;
    }

    /* 房间列表 */
    public roomList: Room[] = [];

    /**
     * 初始化并更新房间信息
     * @param data 
     */
    initRoomListData(data: createRoomRes[]) {
        this.roomInfoList = data;
        if (this.roomList.length > 0) {
            this.updateRoomList();
        }
    }

    /**
     * 刷新房间列表数据
     */
    updateRoomList() {
        let data = this.roomInfoList;
        for (let i = 0; i < data.length; i++) {
            let rm: Room = this.getRoomById(data[i].roomId);
            if (rm) {
                rm.init(data[i].roomId, data[i].count);
            }
        }
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
        return null as unknown as Room;
    }
}