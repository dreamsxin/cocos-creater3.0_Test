
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
        EventManager.Inst.removeEvent(EventManager.EVT_chessDownLine);
        EventManager.Inst.removeEvent(EventManager.EVT_chessGameOver);
        EventManager.Inst.removeEvent(Router.rut_createRoom);
        EventManager.Inst.removeEvent(Router.rut_playChess);
        EventManager.Inst.removeEvent(Router.rut_roomList);
        EventManager.Inst.removeEvent(Router.rut_restart);
        EventManager.Inst.removeEvent(Router.rut_eatChess);
        EventManager.Inst.removeEvent(Router.rut_leaveRoom);
        EventManager.Inst.removeEvent(Router.rut_move);
        EventManager.Inst.removeEvent(Router.rut_upLine);
        EventManager.Inst.removeEvent(Router.rut_downLine);
        EventManager.Inst.removeEvent(Router.rut_playerInfo);
        EventManager.Inst.removeEvent(Router.rut_joinRoom);
    }
    public gotoScene(event: any, scenename: string) {
        director.preloadScene(scenename, () => {
            director.loadScene(scenename);
        });
    }
}