
import { _decorator, Component, Node } from 'cc';
import { DataManager } from '../../data/dataManager';
import { SignItem } from './signItem';
const { ccclass, property } = _decorator;

@ccclass('SignLayer')
export class SignLayer extends Component {
    onLoad() {
        this.node.on(Node.EventType.TOUCH_END, this._touchEnd, this);
    }

    start() {
        let content = this.node.getChildByName('content');
        for (let i = 1; i < 8; i++) {
            let item = content.getChildByName(`signItem${i}`);
            let script: SignItem = item.getComponent(SignItem);
            let dt = DataManager.getSignDataById(i);
            script.init(dt);
        }
    }

    private _touchEnd() {
        this.node.active = false;
    }

    handleClose() {
        this._touchEnd();
    }
}
