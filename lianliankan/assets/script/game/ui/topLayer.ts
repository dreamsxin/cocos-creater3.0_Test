
import { _decorator, Component, Node, Label } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { Constant } from '../../framework/constant';
import { StorageManager1 } from '../../framework/storageManager';
import { ElementManager } from '../element/elementManager';
import { PlayerData } from '../player/playerData';
const { ccclass, property } = _decorator;


@ccclass('TopLayer')
export class TopLayer extends Component {
    @property(Node)
    backNode: Node = undefined;

    @property(Node)
    gameNode: Node = undefined;

    @property(Label)
    goldLb: Label = undefined;

    @property(Label)
    levelLb: Label = undefined;

    @property(Label)
    timeLb: Label = undefined;

    private _timeCount: number = 0;

    private _count: number = 0;

    private _isTimeOut: boolean = false;//是否超时

    onLoad() {
        this.backNode.active = true;
        this.gameNode.active = false;
        clientEvent.on(Constant.EVENT_TYPE.StartGame, this._evtStartGame, this);
        clientEvent.on(Constant.EVENT_TYPE.UpdateTime, this._evtUpdateTime, this);
        this.levelLb.string = PlayerData.Inst.level + "";
    }

    start() {
        this.goldLb.string = StorageManager1.Inst.getData(Constant.UserData.gold) + "";
        this.levelLb.string = StorageManager1.Inst.getData(Constant.UserData.level) + "";
    }

    /**
     * 开始游戏刷新基础信息
     */
    private _evtStartGame() {
        this.backNode.active = false;
        this.gameNode.active = true;
        this._refreshDownTime();
    }

    _evtUpdateTime() {
        this.levelLb.string = "第" + PlayerData.Inst.level + "关";
        this._refreshDownTime();
    }

    /**
     * 重置倒计时
     */
    private _refreshDownTime() {
        this._count = 0;
        this._isTimeOut = false;
        let levelData = PlayerData.Inst.getLevelData();
        this._timeCount = levelData.time;
        this.timeLb.string = this._timeCount + "";
    }

    handleBackEvent() {
        clientEvent.dispatchEvent(Constant.EVENT_TYPE.LevelLayerBack);
    }

    handleMoreEvent() {
        clientEvent.dispatchEvent(Constant.EVENT_TYPE.StartBtnEvent);
        this.backNode.active = true;
        this.gameNode.active = false;
    }

    update() {
        if (this.gameNode.active && !this._isTimeOut) {
            this._count++;
            if (this._count % 60 == 0) {
                this._timeCount--;
                this.timeLb.string = this._timeCount + "";
                if (this._timeCount <= 0) {
                    this._isTimeOut = true;
                    ElementManager.Inst.setTOut(true);
                }
            }
        }
    }
}
