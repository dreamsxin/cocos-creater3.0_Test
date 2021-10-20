
import { _decorator, Component, Node, Button } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { Constant } from '../../framework/constant';
const { ccclass, property } = _decorator;

@ccclass('LevelPageItem')
export class LevelPageItem extends Component {

    start() {
        for (let i = 1; i < 10; i++) {
            let item = this.node.getChildByName(`item${i}`);
        }
    }

    handleLevelClick(evt: TouchEvent) {
        let name = evt.target.name;
        let idx = name.substring(name.length - 1, name.length);
        console.log(`select level== ${idx}`);
        clientEvent.dispatchEvent(Constant.EVENT_TYPE.StartGame)
    }

}
