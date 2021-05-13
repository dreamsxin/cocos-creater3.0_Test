import ClientManager from "../common/clientManager";
import { createRoomRes, eatChessReq, Head, ModelAny, playChessReq, restartReq } from "../utils/globalUtils";
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
    public serverType: number = 0;
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
        // setInterval(() => {
        //     let str = "文字尺寸不会根据 Bounding Box 的大小进行缩放，Wrap Text 关闭的情况下，按照正常文字排列，超出 Bounding Box 的部分将不会显示。Wrap Text 开启的情况下，会试图将本行超出范围的文字换行到下一行。如果纵向空间也不够时，也会隐藏无法完整显示的文字。"
        //     let info = str.substring(0, Math.random() * str.length);
        //     this.sendMsg(this.id, 1, 0, { info: info })
        // }, 500);
    }

    /**
     * 接收消息
     * @param message 
     */
    private _resaveMassage(message: any): void {
        Logger.info(message);
        this.dataType = typeof (message);
        if (this.dataType == 'string') {
            // this.socket.send("333");
        }
        else {
            let buf = new Uint8Array(message).buffer;
            let dtView = new DataView(buf);
            let head: Head = DataViewUtils.getHeadData(dtView);
            let body = DataViewUtils.decoding(dtView, buf.byteLength);
            // Logger.info(head);
            // Logger.info(body);
            // this.sendMsg(this.id, 1, 0, body);
            this.serverType = head.serverType;
            this._handleClientData(head.router, body);
        }
    }

    /**
     * 发送消息
     * @param {JSON} data 
     */
    public sendMsg(router: string, body: any): void {
        Logger.info("-----------------sendMsg-----------------");
        Logger.info(router, body);
        let id = this.id;
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
        Logger.info("client_close" + client);
        this.isLogined = false;
        EventManager.Instance.dispatchEvent(EventManager.EvtRemoveClientSocket, this);
    }

    private async _handleClientData(router: string, data: any): Promise<any> {
        Logger.info("-----------------resaveMsg-----------------");
        Logger.info(router, data);
        switch (router) {
            case Router.rut_createRoom:
                this.handleCreateJoinRoom(data);
                break;

            case Router.rut_playChess:
                this.handlePlayChess(data);
                break;

            case Router.rut_eatChess:
                this.handleEatChess(data);
                break;

            case Router.rut_restart:
                this.handleRestart(data);
                break;

            default: break;
        }
    }

    /**
     * 创建/加入房间
     * @param data 
     */
    private async handleCreateJoinRoom(data: any) {
        if (this.roomId > 0) {
            Logger.info("已在房间");
            return;
        }
        let reData: ModelAny = { code: ErrEnum.OK };
        let rm: Room = ClientManager.Instance.createJoinRoom(this);
        let roomData: createRoomRes = { roomId: rm.id, count: rm.count };
        reData.msg = roomData;
        rm.createJoinRoom(reData);
    }

    /**
     * 走棋/落子
     * @param data 
     */
    private async handlePlayChess(data: playChessReq) {
        let room: Room = ClientManager.Instance.getRoomById(data.roomId);
        room.playChess(this, data);
    }

    /**
     * 吃棋
     */
    private async handleEatChess(data: eatChessReq) {
        let room: Room = ClientManager.Instance.getRoomById(data.roomId);
        room.eatChess(this, data);
    }

    /**
     * 重新开始,清理房间和房间Id
     */
    private async handleRestart(data: restartReq) {
        ClientManager.Instance.removeFromRoom(this);
    }
}

