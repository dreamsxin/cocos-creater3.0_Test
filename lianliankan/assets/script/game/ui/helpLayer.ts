
import { _decorator, Component, Node } from 'cc';
import { UiBase } from './uiBase';
const { ccclass, property } = _decorator;

@ccclass('HelpLayer')
export class HelpLayer extends UiBase {
    private _isOnload: boolean = false;
    onLoad() {
        this.node.on(Node.EventType.TOUCH_END, this._touchEnd, this);
        this._isOnload = true;
        this.openAnim();
    }
    onEnable() {
        if (this._isOnload) {
            this._isOnload = false;
            return;
        }
        this.openAnim();
    }
    handleClose() {
        this._touchEnd();
    }

    private _touchEnd() {
        this.closeAction(() => {
            this.node.active = false;
        });
    }
}

