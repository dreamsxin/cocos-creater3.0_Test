
import { _decorator, Component, Node, tween, Vec3, Label } from 'cc';
import EventManager from '../shooting/eventManager';
import { ChessType } from './chessEnum';
import { ChessPiece } from './chessPiece';
import { ChinaChessMain } from './chinaChessMain';
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

    onLoad() {
        EventManager.Inst.registerEevent(EventManager.EVT_chessGameOver, this.gameOver.bind(this), this)
    }

    start() {
        this.showStartTag();
        this.showBackground();
        this.gameOverNode.active = false;
    }

    handleGameStart() {
        this.hideBackgroud();
        this.hideStartTag();
    }

    handleRestart() {
        this.gameOverNode.active = false;
        this.showBackground();
        this.showStartTag();
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
}
