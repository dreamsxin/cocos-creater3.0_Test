
import { _decorator, Component, Node, director } from 'cc';
import EventManager from './shooting/eventManager';
const { ccclass, property } = _decorator;

@ccclass('Transfer')
export class Transfer extends Component {

    start() {
        EventManager.Inst.removeEvent(EventManager.EVT_recycle);
        EventManager.Inst.removeEvent(EventManager.EVT_shooted);
    }
    public gotoScene(event: any, scenename: string) {
        director.preloadScene(scenename, () => {
            director.loadScene(scenename);
        });
    }
}

