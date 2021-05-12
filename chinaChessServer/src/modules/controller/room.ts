import ClientSocket from "../net/clientSocket";
import { ErrEnum } from "../utils/err";
import { ModelAny, playChessReq } from "../utils/globalUtils";
import { Router } from "./routers";

export default class Room {
    public id: number = -1;
    /* 房间人数 */
    public count: number = -1;
    /* 客户端 */
    public clients: ClientSocket[] = [];

    init(id: number, client: ClientSocket) {
        if (this.count < 2) {
            client.roomId = id;
            this.id = id;
            this.clients.push(client);
            this.count = this.clients.length;
        }
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
        console.log(`client_id=> ${cs.id}`)
        let reData: ModelAny = { code: ErrEnum.OK };
        reData.msg = data;
        cs.sendMsg(Router.rut_playChess, reData);
        // this.clients[0].sendMsg(Router.rut_playChess, reData);
        // this.clients[1].sendMsg(Router.rut_playChess, reData);
    }

    /**
     * 玩家离开房间,并返回房间是否空出
     * @param cl 
     */
    removeClient(cl: ClientSocket) {
        for (let i = 0; i < this.clients.length; i++) {
            if (this.clients[i].id == cl.id) {
                this.count--;
                this.clients.splice(i, 1);
                break;
            }
        }
    }

}