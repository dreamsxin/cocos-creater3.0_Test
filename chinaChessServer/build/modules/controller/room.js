"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const err_1 = require("../utils/err");
const routers_1 = require("./routers");
class Room {
    constructor() {
        this.id = -1;
        /* 房间人数 */
        this.count = 0;
        /* 客户端 */
        this.clients = [];
    }
    init(id) {
        this.id = id;
    }
    updateInfo(client) {
        client.roomId = this.id;
        this.clients.push(client);
        this.count = this.clients.length;
    }
    createJoinRoom(reData) {
        for (let i = 0; i < this.clients.length; i++) {
            this.clients[i].sendMsg(routers_1.Router.rut_createRoom, reData);
        }
    }
    /**
     * 走棋/落子
     * @param client
     */
    playChess(client, data) {
        let cs = client.id == this.clients[0].id ? this.clients[1] : this.clients[0];
        let reData = { code: err_1.ErrEnum.OK };
        reData.msg = data;
        cs.sendMsg(routers_1.Router.rut_playChess, reData);
    }
    /**
     * 吃子
     * @param client
     * @param data
     */
    eatChess(client, data) {
        // let cs: ClientSocket = client.id == this.clients[0].id ? this.clients[1] : this.clients[0];
        let reData = { code: err_1.ErrEnum.OK };
        reData.msg = data;
        this.clients[0].sendMsg(routers_1.Router.rut_eatChess, reData);
        this.clients[1].sendMsg(routers_1.Router.rut_eatChess, reData);
    }
    /**
     * 玩家离开房间,并返回房间是否空出
     * @param cl
     */
    removeClient(cl, req) {
        let reData = { code: err_1.ErrEnum.OK };
        reData.msg = {};
        if (req) {
            reData.msg = { type: req.type };
            cl.sendMsg(routers_1.Router.rut_restart, reData);
        }
        if (this.clients.length > 1 && req) {
            let cs = cl.id == this.clients[0].id ? this.clients[1] : this.clients[0];
            cs.sendMsg(routers_1.Router.rut_restart, reData);
        }
        for (let i = 0; i < this.clients.length; i++) {
            if (this.clients[i].id == cl.id) {
                this.count--;
                this.clients[i].roomId = -1;
                this.clients.splice(i, 1);
                break;
            }
        }
    }
}
exports.default = Room;
