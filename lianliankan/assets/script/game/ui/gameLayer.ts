
import { _decorator, Component, Node } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { Constant } from '../../framework/constant';
const { ccclass, property } = _decorator;


 
@ccclass('GameLayer')
export class GameLayer extends Component {

    handleButtonClick(evt:any,info:string){
        if(info == '0'){
            //重新开始
        }
        else if(info == '1'){
            //提示
            clientEvent.dispatchEvent(Constant.EVENT_TYPE.GetTips, true);
        }
    }
}


