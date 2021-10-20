
import { _decorator, Component, Node } from 'cc';
import { SignItem } from './signItem';
const { ccclass, property } = _decorator;
 
@ccclass('SignLayer')
export class SignLayer extends Component {
    onLoad(){
        this.node.on(Node.EventType.TOUCH_END,this._touchEnd,this);
    }

    start(){
        let content = this.node.getChildByName('content');
        for(let i = 1;i<8;i++){
            let item = content.getChildByName(`signItem${i}`);
            let script:SignItem = item.getComponent(SignItem);
            // script.init()
        }
    }

    private _touchEnd(){
        this.node.active = false;
    }

    handleClose(){
        this._touchEnd();
    }
}
