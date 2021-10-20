
import { _decorator, Component, Node } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { Constant } from '../../framework/constant';
const { ccclass, property } = _decorator;

 
@ccclass('TopLayer')
export class TopLayer extends Component {
    @property(Node)
    backNode:Node = undefined;

    @property(Node)
    gameNode:Node = undefined;

    onLoad(){
        this.backNode.active = true;
        this.gameNode.active = false;
    }

    handleBackEvent(){
        clientEvent.dispatchEvent(Constant.EVENT_TYPE.LevelLayerBack);
    }
}
