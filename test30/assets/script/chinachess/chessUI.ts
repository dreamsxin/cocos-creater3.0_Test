
import { _decorator, Component, Node, tween, Vec3, Label } from 'cc';
import { PoolManager } from '../infinitymap/poolManager';
import EventManager from '../shooting/eventManager';
import { ChessType } from './chessEnum';
import { ChessPiece } from './chessPiece';
import { ChessPlayer } from './chessPlayer';
import Room from './chessRoom';
import RoomtManager from './chessRoomMgr';
import { ChessRoomNode } from './chessRoomNode';
import { ChessTip } from './chessTip';
import { ChinaChessMain } from './chinaChessMain';
import { createRoomRes, ModelAny, restartReq, upLineReq } from './net/globalUtils';
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
    chessTip: Node = null as unknown as Node;

    @property(Node)
    roomNode: Node = null as unknown as Node;

    @property(Node)
    backToMain: Node = null as unknown as Node;

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
        EventManager.Inst.registerEevent(EventManager.EVT_chessTip, this.handleChessTip.bind(this), this)
        EventManager.Inst.registerEevent(Router.rut_restart, this.handleServerRestart.bind(this), this);
        EventManager.Inst.registerEevent(Router.rut_roomList, this.handleServerRoomList.bind(this), this);
        EventManager.Inst.registerEevent(Router.rut_upLine, this.handleServeUpLine.bind(this), this);
        RoomtManager.Instance.init();
        ChessPlayer.Inst.init();
    }

    start() {
        this.chessTip.active = false;
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
    onDisable() {
        console.log("111onDisable1111");
        Net.breakConnect();
        RoomtManager.Instance.clearRoomList();
        ChessPlayer.Inst.playerId = -1;

    }

    handleGameStart() {
        if (Net.isConnected) {
            this.startGame();
        }
        else {
            EventManager.Inst.dispatchEvent(EventManager.EVT_chessTip, "??????????????????");
        }
    }

    /**
     * ????????????,????????????
     */
    handleRestart() {
        let dt = { type: ChessPlayer.Inst.type };
        Net.sendMsg(dt, Router.rut_restart);
    }

    /**
     * ????????????
     */
    handleSwitchPerspective() {
        this.ccm.chessGd.switchPerspective();
    }

    /**
     * ????????????,???????????????
     * @param data 
     */
    handleServerRestart(data: ModelAny) {
        let dt: restartReq = data.msg;
        if (dt.type == ChessPlayer.Inst.type) {
            this.ccm.chessGd.clearningAll();
            this.gameOverNode.active = false;
            this.background.active = false;
            this.startTag.active = false;
            this.gameNode.active = false;
            this.roomNode.active = true;
            this.backToMain.active = true;
            EventManager.Inst.dispatchEvent(EventManager.EVT_chessRestart, data);
        }
        else {
            EventManager.Inst.dispatchEvent(EventManager.EVT_chessTip, "????????????");
        }
        ChessPlayer.Inst.isCanPlay = true;
    }


    gameOver(cp: ChessPiece) {
        this.gameOverNode.active = true;
        this.winLable.string = "?????????";
        if (cp.type == ChessType.red) {
            this.winLable.string = "?????????";
        }
    }

    startGame() {
        this.matchLable.node.active = false;
        this.background.active = false;
        this.startTag.active = false;
        this.roomNode.active = true;
        this.gameNode.active = false;
        this.backToMain.active = true;
    }

    /* ???????????????????????????????????? */
    /**
     * ?????????/??????????????????
     * @param data 
     */
    handleServerRoomList(data: ModelAny) {
        let rmList: createRoomRes[] = data.msg;
        RoomtManager.Instance.initRoomListData(rmList);
    }

    /**
     * ????????????
     * @param data 
     */
    handleServeUpLine(data: ModelAny) {
        let dt: upLineReq = data.msg;
        RoomtManager.Instance.addToPlayerList(dt.id);
        if (ChessPlayer.Inst.playerId < 0) {
            ChessPlayer.Inst.playerId = dt.id;
        }
        else {
            console.log(`${dt.id} ???????????? selfID= ${ChessPlayer.Inst.playerId}`);
        }
        EventManager.Inst.dispatchEvent(EventManager.EVT_chessUpLine, data)
    }

    /**
     * ??????
     * @param info 
     */
    handleChessTip(info: string) {
        this.chessTip.active = true;
        (this.chessTip.getComponent(ChessTip) as ChessTip).showInfo(info);
    }
}
