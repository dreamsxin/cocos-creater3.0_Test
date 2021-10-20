
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
 
@ccclass('HelpLayer')
export class HelpLayer extends Component {
    onLoad(){
        this.node.on(Node.EventType.TOUCH_END,this._touchEnd,this);
    }

    handleClose(){
        this._touchEnd();
    }

    private _touchEnd(){
        this.node.active = false;
    }
}

