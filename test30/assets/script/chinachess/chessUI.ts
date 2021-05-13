
import { _decorator, Component, Node, tween, Vec3, Label } from 'cc';
import EventManager from '../shooting/eventManager';
import { ChessType } from './chessEnum';
import { ChessPiece } from './chessPiece';
import { ChessPlayer } from './chessPlayer';
import Room from './chessRoom';
import RoomtManager from './chessRoomMgr';
import { ChinaChessMain } from './chinaChessMain';
import { createRoomRes, ModelAny, restartReq } from './net/globalUtils';
import { Net } from './net/net';
import { Router } from './net/routers';
const { ccclass, property } = _decorator;

@ccclass('ChessUI')
export class ChessUI extends Component {
    @property(ChinaChessMain)
    ccm: ChinaChessMain = null as unknown as ChinaChessMain;

    @property(Node)
    background: Node = null as unknown as Node;

    @property(Node)
    startTag: Node = null as unknown as Node;

    @property(Node)
    gameOverNode: Node = null as unknown as Node;

    @property(Label)
    winLable: Label = null as unknown as Label;

    @property(Label)
    matchLable: Label = null as unknown as Label;

    onLoad() {
        EventManager.Inst.registerEevent(EventManager.EVT_chessGameOver, this.gameOver.bind(this), this)
        EventManager.Inst.registerEevent(Router.rut_createRoom, this.handleServerCreateRoom.bind(this), this);
        EventManager.Inst.registerEevent(Router.rut_restart, this.handleServerRestart.bind(this), this);
    }

    start() {
        if (!Net.isConnected) {
            Net.init();
        }
        this.showStartTag();
        this.showBackground();
        this.gameOverNode.active = false;
        this.matchLable.node.active = false;
    }

    handleGameStart() {
        if (Net.isConnected) {
            // this.hideBackgroud();
            // this.hideStartTag();
            Net.sendMsg({}, Router.rut_createRoom);
        }
        else {
            console.log("服务器未连接");
        }
    }

    handleRestart() {
        Net.sendMsg({ type: ChessPlayer.Inst.type }, Router.rut_restart);
    }

    /**
     * 切换视角
     */
    handleSwitchPerspective() {
        this.ccm.chessGd.switchPerspective();
    }

    handleServerRestart(data: ModelAny) {
        let dt: restartReq = data.msg;
        if (dt.type == ChessPlayer.Inst.type) {
            this.gameOverNode.active = false;
            this.showBackground();
            this.showStartTag();
        }
        else {
            console.log("对家离开")
        }
    }


    gameOver(cp: ChessPiece) {
        this.gameOverNode.active = true;
        this.winLable.string = "红方胜";
        if (cp.type == ChessType.red) {
            this.winLable.string = "黑方胜";
        }
    }

    hideStartTag() {
        this.startTag.active = false;
        this.ccm.startGame();
    }
    showStartTag() {
        this.startTag.active = true;
    }

    hideBackgroud() {
        this.background.active = false;
    }

    showBackground() {
        this.background.active = true;
    }

    startGame() {
        this.matchLable.node.active = false;
        this.hideBackgroud();
        this.hideStartTag();
    }

    /* 接收到服务器其他玩家消息 */
    /**
     * 创建房间
     * @param data 
     */
    handleServerCreateRoom(data: ModelAny) {
        let rmData: createRoomRes = data.msg;
        let room: Room = RoomtManager.Instance.getRoomById(rmData.roomId);
        room.init(rmData.roomId, rmData.count);
        if (room.count == 1) {
            this.matchLable.node.active = true;
            this.startTag.active = false;
            ChessPlayer.Inst.type = ChessType.red;
            ChessPlayer.Inst.roomId = rmData.roomId;
        }
        else if (room.count == 2) {
            if (ChessPlayer.Inst.roomId < 0) {
                ChessPlayer.Inst.roomId = rmData.roomId;
                ChessPlayer.Inst.type = ChessType.black;
            }
        }
        if (room.count == 2) {
            this.startGame();
        }
    }
}
