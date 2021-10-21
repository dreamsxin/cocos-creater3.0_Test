
import { _decorator, Component, Node } from 'cc';
import { DataManager } from '../../data/dataManager';
import { SignItem } from './signItem';
import { UiBase } from './uiBase';
const { ccclass, property } = _decorator;

@ccclass('SignLayer')
export class SignLayer extends UiBase {
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

    start() {
        let content = this.node.getChildByName('content');
        for (let i = 1; i < 8; i++) {
            // let item = content.getChildByName(`signItem${i}`);
            // let script: SignItem = item.getComponent(SignItem);
            // let dt = DataManager.getSignDataById(i);
            // script.init(dt);
        }
    }

    private _touchEnd() {
        this.closeAction(() => {
            this.node.active = false;
        });
    }

    handleClose() {
        this._touchEnd();
    }
}
