import ClientManager from "../common/clientManager";
import { createRoomReq, createRoomRes, eatChessReq, Head, ModelAny, moveReq, playChessReq, playerInfoRes, restartReq, upLineReq, User } from "../utils/globalUtils";
import DataViewUtils from "../utils/dataviewUtils";
import Logger from "../utils/logger";
import { Router } from "../controller/routers";
import { ErrEnum } from "../utils/err";
import EventManager from "../common/EventManager";

/* 客户端连接socket类 */
export default class ClientSocket {
    private userId: number = 0;
    /* socket连接对象，收发数据 */
    public socket: any;
    public serverType: number = 102;
    private dataType: any;

    constructor(socket: any) {
        this.socket = socket;
        this._init();
    }

    private _init(): void {
        this.socket.on('message', this._resaveMassage.bind(this));
        this.socket.on('close', this._clientClose.bind(this));
    }

    /**
     * 接收消息
     * @param message 
     */
    private _resaveMassage(message: any): void {
        this.dataType = typeof (message);
        console.log("datatype: " + this.dataType);
        if (this.dataType == 'string') {
            Logger.info(message);
        }
        else {
            let buf = new Uint8Array(message).buffer;
            let dtView = new DataView(buf);
            let head: Head = DataViewUtils.getHeadData(dtView);
            let body = DataViewUtils.decoding(dtView, buf.byteLength);
            this.serverType = head.serverType;
            this._handleClientData(head, body);
        }
    }

    /**
     * 发送消息
     * @param {JSON} data 
     */
    public sendMsg(router: string, body: any, id: number): void {
        Logger.info("-----------------sendMsg-----------------");
        Logger.info(router, body, id);
        let serverType = this.serverType;
        if (this.dataType == 'string') {
            this.socket.send(JSON.stringify({ id: id, serverType: serverType, router: Number(router), body: body }));
        }
        else {
            let data = DataViewUtils.encoding(id, serverType, Number(router), body);
            this.socket.send(data);
        }
    }

    private _clientClose(client: any): void {
        console.log("网关断开")
        // Logger.info("client_close " + client + "  id= " + this.id + " roomId= " + this.roomId);
        // this.isLogined = false;
        // EventManager.Instance.dispatchEvent(EventManager.EvtRemoveUserSocket, this);
    }

    private async _handleClientData(head: Head, data: any): Promise<any> {
        Logger.info("-----------------resaveMsg-----------------");
        let router = head.router;
        Logger.info(head, data);
        switch (router) {
            case Router.rut_upLine://上线
                let user: User = { id: data.id, roomId: -1 };
                EventManager.Instance.dispatchEvent(EventManager.EvtSaveUserSocket, user);
                this.sendMsg(router, user, user.id);
                break;

            case Router.rut_downLine://下线
                let ur: User = { id: data.id };
                EventManager.Instance.dispatchEvent(EventManager.EvtRemoveUserSocket, ur);
                this.sendMsg(router, ur, ur.id);

            default: break;
        }
    }

    // /**
    //  * 创建/加入房间
    //  * @param data 
    //  */
    // private async handleCreateJoinRoom(data: createRoomReq) {
    //     if (this.roomId > 0) {
    //         Logger.info("已在房间");
    //         return;
    //     }
    //     let reData: ModelAny = { code: ErrEnum.OK };
    //     let rm: Room = ClientManager.Instance.createJoinRoom(this, data.roomId);
    //     let roomData: createRoomRes = { roomId: rm.id, count: rm.count };
    //     reData.msg = roomData;
    //     rm.createJoinRoom(reData);
    //     ClientManager.Instance.pushJoinRoomToAllClient(this.id);
    //     ClientManager.Instance.pushUpdateRoomToAllClient();
    // }

    // /**
    //  * 给玩家推送房间列表,玩家加入/退出房间的时候也要推送这个消息,给所有玩家推送
    //  */
    // pushRoomListToClient() {
    //     let reData: ModelAny = { code: ErrEnum.OK };
    //     let dt: createRoomRes[] = [];
    //     let rmList: Room[] = ClientManager.Instance.roomList;
    //     for (let i = 0; i < rmList.length; i++) {
    //         let rd: createRoomRes = { roomId: rmList[i].id, count: rmList[i].count };
    //         dt.push(rd);
    //     }
    //     reData.msg = dt;
    //     this.sendMsg(Router.rut_roomList, reData);
    // }

    // /**
    //  * 给玩家推送玩家列表
    //  */
    // pushPlayerListToClient() {
    //     let reData: ModelAny = { code: ErrEnum.OK };
    //     let dt: playerInfoRes = { id: [] };
    //     let rmList: ClientSocket[] = ClientManager.Instance.getAllClient();
    //     for (let i = 0; i < rmList.length; i++) {
    //         let id: number = rmList[i].id;
    //         dt.id.push(id);
    //     }
    //     reData.msg = dt;
    //     this.sendMsg(Router.rut_playerInfo, reData);
    // }

    // /**
    //  * 推送移动数据
    //  * @param data 
    //  */
    // pushMoveInfoToClient(data: moveReq) {
    //     let reData: ModelAny = { code: ErrEnum.OK };
    //     reData.msg = data;
    //     this.sendMsg(Router.rut_move, reData);
    // }

    // /**
    //  * 用户上线
    //  * @id:玩家id
    //  */
    // pushUplineToClient(id: number) {
    //     let reData: ModelAny = { code: ErrEnum.OK };
    //     reData.msg = { id: id };
    //     this.sendMsg(Router.rut_upLine, reData);
    // }

    // /**
    //  * 用户下线
    //  * @id:玩家id
    //  */
    // pushDownlineToClient(id: number) {
    //     let reData: ModelAny = { code: ErrEnum.OK };
    //     reData.msg = { id: id };
    //     this.sendMsg(Router.rut_downLine, reData);
    // }

    // /**
    //  * 进入房间
    //  * @id:玩家id
    //  */
    // pushJoinRoomToClient(id: number) {
    //     let reData: ModelAny = { code: ErrEnum.OK };
    //     reData.msg = { id: id };
    //     this.sendMsg(Router.rut_joinRoom, reData);
    // }

    // /**
    //  * 离开房间
    //  * @id:玩家id
    //  */
    // pushLeaveRoomToClient(id: number) {
    //     let reData: ModelAny = { code: ErrEnum.OK };
    //     reData.msg = { id: id };
    //     this.sendMsg(Router.rut_leaveRoom, reData);
    // }
}

