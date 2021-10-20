
import { _decorator, Component, Node } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { Constant } from '../../framework/constant';
const { ccclass, property } = _decorator;


@ccclass('StartLayer')
export class StartLayer extends Component {
    @property(Node)
    signLayer:Node = undefined;
    
    @property(Node)
    helpLayer:Node = undefined;

    onLoad() {
        this.signLayer.active = false;
        this.helpLayer.active = false;
    }

    handleButtonEvent(evt:any,type:string){
        console.log(type);
        switch(type){
            case '0'://音效
            
                break;

            case '1'://签到
                this.signLayer.active = true;
                break;
            
            case '2'://帮助
                this.helpLayer.active = true;
                break;

            case '3'://排行榜
            
                break;

            case '4'://开始游戏
                clientEvent.dispatchEvent(Constant.EVENT_TYPE.StartBtnEvent);
                break;
        }
    }
}


