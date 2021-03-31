
import { _decorator, Component, Node, Collider, ITriggerEvent } from 'cc';
import EventManager from '../shooting/eventManager';
const { ccclass, property } = _decorator;

@ccclass('JugeCollider')
export class JugeCollider extends Component {
    start() {
        let collider: Collider = this.node.getComponent(Collider) as Collider;
        collider.on("onTriggerEnter", this.onTriggerEnter, this);
    }

    private onTriggerEnter(event: ITriggerEvent) {
        let name = event.otherCollider.node.name;
        console.log(name);
        if (name == "sphereBall") {
            EventManager.Inst.dispatchEvent(EventManager.EVT_closeDoor);
        }
    }
}

