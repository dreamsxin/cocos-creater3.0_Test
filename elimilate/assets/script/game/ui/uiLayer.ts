
import { _decorator, Component, Node, tween } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { Constant } from '../../framework/constant';
import { ElementManager } from '../element/elementManager';
const { ccclass, property } = _decorator;

@ccclass('UiLayer')
export class UiLayer extends Component {
    start() {
        this.schedule(this._tipsCounts, 1);
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
