
import { _decorator, Component, Node, Button, Label } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { Constant } from '../../framework/constant';
const { ccclass, property } = _decorator;

@ccclass('LevelPageItem')
export class LevelPageItem extends Component {
    private _idx: number = 0;
    start() {
        for (let i = 1; i < 10; i++) {
            let item = this.node.getChildByName(`item${i}`);
            let levelLb = item.getChildByName('levelLb').getComponent(Label);
            levelLb.string = (this._idx * 9 + i) + "";
            let fruits = item.getChildByName('fruits');
            for (let j = 0; j < 9; j++) {
                fruits.getChildByName(j + "").active = false;
            }
            fruits.getChildByName(this._idx + "").active = true;
        }
    }
    setInfo(idx: number) {
        this._idx = idx;
    }


    handleLevelClick(evt: any/*TouchEvent*/) {
        let name = evt.target.name;
        let idx = name.substring(name.length - 1, name.length);
        let level = this._idx * 9 + Number(idx);
        console.log(`select level== ${level}`);
        clientEvent.dispatchEvent(Constant.EVENT_TYPE.StartGame)
    }

}
