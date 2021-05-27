import ClientManager from "../common/clientManager";
import { createRoomReq, createRoomRes, eatChessReq, Head, ModelAny, moveReq, playChessReq, playerInfoRes, restartReq, upLineReq, User } from "../utils/globalUtils";
import DataViewUtils from "../utils/dataviewUtils";
import Logger from "../utils/logger";
import { Router } from "../controller/routers";
import { ErrEnum } from "../utils/err";
import EventManager from "../common/EventManager";
import Room from "../controller/room";

/* 客户端连接socket类 */
export default class ClientSocket {
    /* socket连接对象，收发数据 */
    public socket: any;
    public id: number = 0;
    public serverType: number = 101;
    private dataType: any;
    public roomId: number = -1;
    private isLogined: boolean = false;

    constructor(socket: any) {
        this.socket = socket;
        this.id = ClientManager.Instance.getId();
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
            // this.socket.send("333");
        }
        else {
            let buf = new Uint8Array(message).buffer;
            let dtView = new DataView(buf);
            let head: Head = DataViewUtils.getHeadData(dtView);
            let body = DataViewUtils.decoding(dtView, buf.byteLength);
            this._handleClientData(head, body);
        }
    }

    /**
     * 发送消息
     * @param {JSON} data 
     */
    public sendMsg(router: string, body: any, id): void {
        Logger.info("-----------------sendMsg-----------------");
        Logger.info(router, body);
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
        Logger.info("网关断开");
        this.isLogined = false;
        EventManager.Instance.dispatchEvent(EventManager.EvtRemoveClientSocket, this);
    }

    private async _handleClientData(head: Head, data: any): Promise<any> {
        Logger.info("-----------------resaveMsg-----------------");
        let router = head.router;
        Logger.info(router, data);
        switch (router) {
            case Router.rut_roomList:
                this.initRoomListToClient(head);
                break;

            case Router.rut_createRoom:
                this.handleCreateJoinRoom(head, data);
                break;

            case Router.rut_downLine:
                this.handleDownLine(head, data);
                break;

            case Router.rut_leaveRoom:
                let reDate: ModelAny = { code: ErrEnum.OK };
                let user: User = data;
                reDate.msg = user;
                this.sendMsg(router, reDate, user.id);
                this.handleDownLine(head, data);
                break;

            case Router.rut_playChess:
                this.handlePlayChess(head, data);
                break;

            case Router.rut_eatChess:
                this.handleEatChess(head, data);
                break;

            case Router.rut_restart:
                this.handleRestart(head, data);
                break;

            default: break;
        }
    }

    /**
     * 创建/加入房间
     * @param data 
     */
    private async handleCreateJoinRoom(head: Head, data: createRoomReq) {
        let reData: ModelAny = { code: ErrEnum.OK };
        let isExist = ClientManager.Instance.checkExistInRoom(head.id);
        if (isExist) {
            reData.code = ErrEnum.isExist.code;
            reData.err = ErrEnum.isExist.dis;
            this.sendMsg(head.router, reData, head.id);
            return;
        }

        let rm: Room = ClientManager.Instance.getRoomById(data.roomId);
        if (rm.count >= 2) {
            reData.code = ErrEnum.roomFull.code;
            reData.err = ErrEnum.roomFull.dis;
            this.sendMsg(head.router, reData, head.id);
            return;
        }
        rm.updateInfo(head.id);
        let roomData: createRoomRes = { roomId: rm.id, count: rm.count, userList: rm.userList };
        reData.msg = roomData;
        this.sendMsg(head.router, reData, head.id);
        this.pushRoomListToClient(head);
    }
    /**
     * 玩家离线,更新房间数据/推送房间数据
     * @param data 
     */
    private async handleDownLine(head: Head, data: User) {
        let isExist = ClientManager.Instance.checkExistInRoom(head.id);
        if (!isExist) {
            return;
        }

        let rm: Room = ClientManager.Instance.getRoomById(data.roomId);
        rm.removeUser(data.id);
        this.pushRoomListToClient(head);
    }

    /**
     * 走棋/落子
     * @param data 
     */
    private async handlePlayChess(head: Head, data: playChessReq) {
        let room: Room = ClientManager.Instance.getRoomById(data.roomId);
        let otherUserId = room.getOtherUserId(head.id);
        let reData: ModelAny = { code: ErrEnum.OK };
        reData.msg = data;
        this.sendMsg(head.router, reData, otherUserId);
    }

    /**
     * 吃棋
     */
    private async handleEatChess(head: Head, data: eatChessReq) {
        let room: Room = ClientManager.Instance.getRoomById(data.roomId);
        data.userlist = room.userList;
        let reData: ModelAny = { code: ErrEnum.OK };
        reData.msg = data;
        this.sendMsg(head.router, reData, head.id);
    }

    /**
     * 重新开始,清理房间和房间Id
     */
    private async handleRestart(head: Head, data: restartReq) {
        let reData: ModelAny = { code: ErrEnum.OK }
        let room = ClientManager.Instance.checkExistInRoom(head.id);
        data.userList = room.userList;
        reData.msg = data;
        this.sendMsg(head.router, reData, head.id);

        /* 从房间中移除玩家,刷新房间列表 */
        room.removeUser(head.id);
        this.pushRoomListToClient(head);

        /* 推送玩家离开消息 */
        let reDate: ModelAny = { code: ErrEnum.OK };
        let user: User = { id: head.id, roomId: room.id }
        reDate.msg = user;
        this.sendMsg(Router.rut_leaveRoom, reDate, user.id);
    }

    /**
     * 玩家上线, 给玩家推送房间列表
     */
    initRoomListToClient(head: Head) {
        let reData: ModelAny = { code: ErrEnum.OK };
        let dt: createRoomRes[] = [];
        let rmList: Room[] = ClientManager.Instance.roomList;
        for (let i = 0; i < rmList.length; i++) {
            let rd: createRoomRes = { roomId: rmList[i].id, count: rmList[i].count };
            dt.push(rd);
        }
        reData.msg = dt;
        this.sendMsg(Router.rut_roomList, reData, head.id);
    }
    /**
     * 给玩家推送房间列表,玩家加入/退出房间的时候也要推送这个消息,给所有玩家推送
     */
    pushRoomListToClient(head: Head) {
        let reData: ModelAny = { code: ErrEnum.OK };
        let dt: createRoomRes[] = [];
        let rmList: Room[] = ClientManager.Instance.roomList;
        for (let i = 0; i < rmList.length; i++) {
            let rd: createRoomRes = { roomId: rmList[i].id, count: rmList[i].count };
            dt.push(rd);
        }
        reData.msg = dt;
        this.sendMsg(Router.rut_roomListPush, reData, head.id);
    }
}

