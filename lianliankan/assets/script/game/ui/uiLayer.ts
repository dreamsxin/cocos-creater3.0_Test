
import { _decorator, Component, Node, tween } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { Constant } from '../../framework/constant';
import { ElementManager } from '../element/elementManager';
import { PlayerData } from '../player/playerData';
const { ccclass, property } = _decorator;

@ccclass('UiLayer')
export class UiLayer extends Component {
    @property(Node)
    startLayer: Node = undefined;

    @property(Node)
    levelLayer: Node = undefined;

    @property(Node)
    topLayer: Node = undefined;

    @property(Node)
    gameLayer: Node = undefined;

    onLoad() {
        this.startLayer.active = true;
        this.levelLayer.active = false;
        this.topLayer.active = false;
        this.gameLayer.active = false;
        clientEvent.on(Constant.EVENT_TYPE.LevelLayerBack, this._evtLevelLayerBack, this);
        clientEvent.on(Constant.EVENT_TYPE.StartBtnEvent, this._evtStartBtnEvent, this);
        clientEvent.on(Constant.EVENT_TYPE.StartGame, this._evtStartGame, this);
    }

    start() {
        // this.schedule(this._tipsCounts, 1);
    }

    /**
     * 关卡界面返回开始界面 
     */
    private _evtLevelLayerBack() {
        this.levelLayer.active = false;
        this.topLayer.active = false;
        this.startLayer.active = true;
    }

    /**
     * 开始界面到关卡界面
     */
    private _evtStartBtnEvent() {
        this.levelLayer.active = true;
        this.topLayer.active = true;
        this.startLayer.active = false;
        this.gameLayer.active = false;
    }

    /**
     * 关卡界面到开始游戏
     */
    private _evtStartGame() {
        this.levelLayer.active = false;
        this.topLayer.active = true;
        this.gameLayer.active = true;
    }

    /**
     * 无操作(消除)计时
     */
    private _tipsCounts() {
        if (!Constant.startGame) return;
        ElementManager.Inst.tipsCount++;
        if (ElementManager.Inst.tipsCount >= Constant.tipsTime) {
            this._handleTips();
        }
    }

    /**
     * 提示
     */
    _handleTips() {
        clientEvent.dispatchEvent(Constant.EVENT_TYPE.GetTips, true);
    }
}
