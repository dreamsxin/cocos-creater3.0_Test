
import { _decorator, Component, Node } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { Constant } from '../../framework/constant';
import { ElementManager } from '../element/elementManager';
const { ccclass, property } = _decorator;



@ccclass('GameLayer')
export class GameLayer extends Component {

    private _isOnload: boolean = false;

    onLoad() {
        this._isOnload = true;
        ElementManager.Inst.startLayout();
    }

    onEnable() {
        if (this._isOnload) {
            this._isOnload = false;
            return;
        }
        ElementManager.Inst.startLayout();
    }

    onDisable() {
        ElementManager.Inst.clearList();
    }

    handleButtonClick(evt: any, info: string) {
        if (info == '0') {
            //重新开始
            ElementManager.Inst.relayoutElement();
        }
        else if (info == '1') {
            //提示
            clientEvent.dispatchEvent(Constant.EVENT_TYPE.GetTips, true);
        }
    }
}


