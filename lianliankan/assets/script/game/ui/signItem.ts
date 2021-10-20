
import { _decorator, Component, Node, Label } from 'cc';
import { signData } from '../../net/globalUtils';
const { ccclass, property } = _decorator;


 
@ccclass('SignItem')
export class SignItem extends Component {
    @property(Label)
    titleLb:Label = undefined;

    @property(Label)
    goldLb:Label = undefined;

    @property(Node)
    signTag:Node = undefined;

    private _data:signData = null;
    init(dt:signData){
        this._data = dt;
    }

    start(){
        this.signTag.active = false;
        if(this._data){
            this._setInfo();
        }
    }

    private _setInfo(){
        this.titleLb.string = `第${this._getDay(this._data.day)}天`;
        this.goldLb.string = `金币X${this._data.gold}`;
    }

    handleClickEvent(){
        console.log("click");
    }

    private _getDay(num:number){
        switch(num){
            case 1:return "一"
            case 2:return "二"
            case 3:return "三"
            case 4:return "四"
            case 5:return "五"
            case 6:return "六"
            case 7:return "七"
        }
    }
}

