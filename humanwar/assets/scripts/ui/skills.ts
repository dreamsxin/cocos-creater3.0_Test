
import { _decorator, Component, Node } from 'cc';
import EventManager from '../utils/eventManager';
const { ccclass, property } = _decorator;

@ccclass('Skills')
export class Skills extends Component {

    handleAttack() {
        EventManager.Inst.dispatchEvent(EventManager.EVT_skill_attack);
    }

    handleJump() {
        EventManager.Inst.dispatchEvent(EventManager.EVT_skill_jump);
    }
}
