
import { _decorator, Component, Node } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { Constant } from '../../framework/constant';
const { ccclass, property } = _decorator;

@ccclass('UiLayer')
export class UiLayer extends Component {

    /**
     * 提示
     */
    handleTips() {
        clientEvent.dispatchEvent(Constant.EVENT_TYPE.GetTips);
    }
}
