"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const clientManager_1 = require("../common/clientManager");
const dataviewUtils_1 = require("../utils/dataviewUtils");
const logger_1 = require("../utils/logger");
const routers_1 = require("../controller/routers");
const err_1 = require("../utils/err");
const EventManager_1 = require("../common/EventManager");
/* 客户端连接socket类 */
class ClientSocket {
    constructor(socket) {
        this.id = 0;
        this.serverType = 0;
        this.roomId = -1;
        this.isLogined = false;
        this.socket = socket;
        this.id = clientManager_1.default.Instance.getId();
        this._init();
    }
    _init() {
        this.socket.on('message', this._resaveMassage.bind(this));
        this.socket.on('close', this._clientClose.bind(this));
        this.pushRoomListToClient();
    }
    /**
     * 接收消息
     * @param message
     */
    _resaveMassage(message) {
        logger_1.default.info(message);
        this.dataType = typeof (message);
        if (this.dataType == 'string') {
            // this.socket.send("333");
        }
        else {
            let buf = new Uint8Array(message).buffer;
            let dtView = new DataView(buf);
            let head = dataviewUtils_1.default.getHeadData(dtView);
            let body = dataviewUtils_1.default.decoding(dtView, buf.byteLength);
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
    sendMsg(router, body) {
        logger_1.default.info("-----------------sendMsg-----------------");
        logger_1.default.info(router, body);
        let id = this.id;
        let serverType = this.serverType;
        if (this.dataType == 'string') {
            this.socket.send(JSON.stringify({ id: id, serverType: serverType, router: Number(router), body: body }));
        }
        else {
            let data = dataviewUtils_1.default.encoding(id, serverType, Number(router), body);
            this.socket.send(data);
        }
    }
    _clientClose(client) {
        logger_1.default.info("client_close " + client + "  id= " + this.id + " roomId= " + this.roomId);
        this.isLogined = false;
        EventManager_1.default.Instance.dispatchEvent(EventManager_1.default.EvtRemoveClientSocket, this);
    }
    _handleClientData(router, data) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info("-----------------resaveMsg-----------------");
            logger_1.default.info(router, data);
            switch (router) {
                case routers_1.Router.rut_createRoom:
                    this.handleCreateJoinRoom(data);
                    break;
                case routers_1.Router.rut_playChess:
                    this.handlePlayChess(data);
                    break;
                case routers_1.Router.rut_eatChess:
                    this.handleEatChess(data);
                    break;
                case routers_1.Router.rut_restart:
                    this.handleRestart(data);
                    break;
                case routers_1.Router.rut_leaveRoom:
                    this.handleLeaveRoom(data);
                    break;
                default: break;
            }
        });
    }
    /**
     * 创建/加入房间
     * @param data
     */
    handleCreateJoinRoom(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.roomId > 0) {
                logger_1.default.info("已在房间");
                return;
            }
            let reData = { code: err_1.ErrEnum.OK };
            let rm = clientManager_1.default.Instance.createJoinRoom(this, data.roomId);
            let roomData = { roomId: rm.id, count: rm.count };
            reData.msg = roomData;
            rm.createJoinRoom(reData);
            clientManager_1.default.Instance.pushUpdateRoomToAllClient();
        });
    }
    /**
     * 走棋/落子
     * @param data
     */
    handlePlayChess(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let room = clientManager_1.default.Instance.getRoomById(data.roomId);
            room.playChess(this, data);
        });
    }
    /**
     * 吃棋
     */
    handleEatChess(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let room = clientManager_1.default.Instance.getRoomById(data.roomId);
            room.eatChess(this, data);
        });
    }
    /**
     * 重新开始,清理房间和房间Id
     */
    handleRestart(data) {
        return __awaiter(this, void 0, void 0, function* () {
            clientManager_1.default.Instance.removeFromRoom(this, data);
            clientManager_1.default.Instance.pushUpdateRoomToAllClient();
        });
    }
    /**
     * 离开房间
     */
    handleLeaveRoom(data) {
        return __awaiter(this, void 0, void 0, function* () {
            clientManager_1.default.Instance.removeFromRoom(this);
            clientManager_1.default.Instance.pushUpdateRoomToAllClient();
        });
    }
    /**
     * 给玩家推送房间列表,玩家加入/退出房间的时候也要推送这个消息,给所有玩家推送
     */
    pushRoomListToClient() {
        let reData = { code: err_1.ErrEnum.OK };
        let dt = [];
        let rmList = clientManager_1.default.Instance.roomList;
        for (let i = 0; i < rmList.length; i++) {
            let rd = { roomId: rmList[i].id, count: rmList[i].count };
            dt.push(rd);
        }
        reData.msg = dt;
        this.sendMsg(routers_1.Router.rut_roomList, reData);
    }
}
exports.default = ClientSocket;
