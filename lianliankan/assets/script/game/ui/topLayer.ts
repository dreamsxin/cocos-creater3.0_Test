
import { _decorator, Component, Node, Label } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { Constant } from '../../framework/constant';
import { StorageManager1 } from '../../framework/storageManager';
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


    onLoad() {
        this.backNode.active = true;
        this.gameNode.active = false;
        clientEvent.on(Constant.EVENT_TYPE.StartGame, this._evtStartGame, this);
    }

    start() {
        this.goldLb.string = StorageManager1.Inst.getData(Constant.UserData.gold) + "";
        this.levelLb.string = StorageManager1.Inst.getData(Constant.UserData.level) + "";
    }

    private _evtStartGame() {
        this.backNode.active = false;
        this.gameNode.active = true;
    }

    handleBackEvent() {
        clientEvent.dispatchEvent(Constant.EVENT_TYPE.LevelLayerBack);
    }

    handleMoreEvent() {
        clientEvent.dispatchEvent(Constant.EVENT_TYPE.StartBtnEvent);
        this.backNode.active = true;
        this.gameNode.active = false;
    }
}
