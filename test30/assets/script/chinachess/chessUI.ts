
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
    roomNode: Node = null as unknown as Node;

    @property(Node)
    gameNode: Node = null as unknown as Node;

    @property(Node)
    switchBtn: Node = null as unknown as Node;

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
        EventManager.Inst.registerEevent(Router.rut_restart, this.handleServerRestart.bind(this), this);
        EventManager.Inst.registerEevent(Router.rut_roomList, this.handleServerRoomList.bind(this), this);
    }

    start() {
        ChessPlayer.Inst.init();
        this.roomNode.active = false;
        this.gameNode.active = false;
        this.startTag.active = true;
        this.background.active = true;
        this.gameOverNode.active = false;
        this.matchLable.node.active = false;
        this.switchBtn.active = false;
        if (!Net.isConnected) {
            Net.init();
        }
    }

    handleGameStart() {
        if (Net.isConnected) {
            this.startGame();
        }
        else {
            console.log("服务器未连接");
        }
    }

    /**
     * 游戏结束,离开房间
     */
    handleRestart() {
        let dt = { type: ChessPlayer.Inst.type };
        Net.sendMsg(dt, Router.rut_restart);
    }

    /**
     * 切换视角
     */
    handleSwitchPerspective() {
        this.ccm.chessGd.switchPerspective();
    }

    /**
     * 离开房间,重新选房间
     * @param data 
     */
    handleServerRestart(data: ModelAny) {
        let dt: restartReq = data.msg;
        if (dt.type == ChessPlayer.Inst.type) {
            this.gameOverNode.active = false;
            this.background.active = false;
            this.startTag.active = false;
            this.gameNode.active = false;
            this.roomNode.active = true;
            this.ccm.chessGd.clearningAll();
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

    startGame() {
        this.matchLable.node.active = false;
        this.background.active = false;
        this.startTag.active = false;
        this.roomNode.active = true;
        this.gameNode.active = false;
    }

    /* 接收到服务器其他玩家消息 */
    /**
     * 初始化/更新房间列表
     * @param data 
     */
    handleServerRoomList(data: ModelAny) {
        let rmList: createRoomRes[] = data.msg;
        RoomtManager.Instance.initRoomListData(rmList);
    }


}
