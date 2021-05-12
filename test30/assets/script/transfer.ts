
import { _decorator, Component, Node, director } from 'cc';
import { Router } from './chinachess/net/routers';
import EventManager from './shooting/eventManager';
const { ccclass, property } = _decorator;

@ccclass('Transfer')
export class Transfer extends Component {

    start() {
        EventManager.Inst.removeEvent(EventManager.EVT_recycle);
        EventManager.Inst.removeEvent(EventManager.EVT_shooted);
        EventManager.Inst.removeEvent(EventManager.EVT_openDoor);
        EventManager.Inst.removeEvent(EventManager.EVT_closeDoor);
        EventManager.Inst.removeEvent(Router.rut_createRoom);
        EventManager.Inst.removeEvent(Router.rut_playChess);
    }
    public gotoScene(event: any, scenename: string) {
        director.preloadScene(scenename, () => {
            director.loadScene(scenename);
        });
    }
}