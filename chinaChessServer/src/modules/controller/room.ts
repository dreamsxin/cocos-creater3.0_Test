import ClientSocket from "../net/clientSocket";
import { ErrEnum } from "../utils/err";
import { eatChessReq, ModelAny, playChessReq, restartReq } from "../utils/globalUtils";
import { Router } from "./routers";

export default class Room {
    public id: number = -1;
    /* 房间人数 */
    public count: number = 0;
    /* 客户端 */
    public clients: ClientSocket[] = [];

    init(id: number) {
        this.id = id;
    }

    updateInfo(client: ClientSocket) {
        client.roomId = this.id;
        this.clients.push(client);
        this.count = this.clients.length;
    }

    createJoinRoom(reData: ModelAny) {
        for (let i = 0; i < this.clients.length; i++) {
            this.clients[i].sendMsg(Router.rut_createRoom, reData);
        }
    }

    /**
     * 走棋/落子
     * @param client 
     */
    playChess(client: ClientSocket, data: playChessReq) {
        let cs: ClientSocket = client.id == this.clients[0].id ? this.clients[1] : this.clients[0];
        let reData: ModelAny = { code: ErrEnum.OK };
        reData.msg = data;
        cs.sendMsg(Router.rut_playChess, reData);
    }

    /**
     * 吃子
     * @param client 
     * @param data 
     */
    eatChess(client: ClientSocket, data: eatChessReq) {
        // let cs: ClientSocket = client.id == this.clients[0].id ? this.clients[1] : this.clients[0];
        let reData: ModelAny = { code: ErrEnum.OK };
        reData.msg = data;
        this.clients[0].sendMsg(Router.rut_eatChess, reData);
        this.clients[1].sendMsg(Router.rut_eatChess, reData);
    }

    /**
     * 玩家离开房间,并返回房间是否空出
     * @param cl 
     */
    removeClient(cl: ClientSocket, req?: restartReq) {
        let reData: ModelAny = { code: ErrEnum.OK };
        reData.msg = {};
        if (req) {
            reData.msg = { type: req.type };
            cl.sendMsg(Router.rut_restart, reData);
        }
        if (this.clients.length > 1 && req) {
            let cs: ClientSocket = cl.id == this.clients[0].id ? this.clients[1] : this.clients[0];
            cs.sendMsg(Router.rut_restart, reData);
        }

        reData = { code: ErrEnum.OK };
        reData.msg = { id: cl.id }
        cl.sendMsg(Router.rut_leaveRoom, reData);
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