
import { _decorator, Component, Node } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { Constant } from '../../framework/constant';
const { ccclass, property } = _decorator;

@ccclass('ElementLayer')
export class ElementLayer extends Component {
    onLoad() {
        clientEvent.on(Constant.EVENT_TYPE.AddElement, this._evtAddElement, this);
    }

    /**
     * 添加元素到当前界面
     * @param element 
     */
    private _evtAddElement(element: Node) {
        this.node.addChild(element);
    }

}


