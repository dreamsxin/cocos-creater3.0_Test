
import { _decorator, Component, Node, Collider, ITriggerEvent, ICollisionEvent, RigidBody, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ColliderTest')
export class ColliderTest extends Component {

    start() {
        /* 触发事件 */
        let collider = this.getComponent(Collider);//开启isTrigger生效
        collider?.on('onTriggerEnter', this._onTriggerEnter, this);//onTriggerEnter、onTriggerStay、onTriggerExit
        /* 碰撞事件 */
        collider?.on('onCollisionEnter', this._onCollisionEnter, this);//onCollisionEnter、onCollisionStay、onCollisionExit
        collider?.on('onCollisionExit', this._onCollisionExit, this);//onCollisionEnter、onCollisionStay、onCollisionExit


        this.getComponent(RigidBody)?.applyForce(v3(1000, 0, 0))//方向力

    }

    _onTriggerEnter(event: ITriggerEvent) {
        // console.log(event.type, event);
    }

    _onCollisionEnter(event: ICollisionEvent) {
        // console.log(event.type, event);
        // console.log(event.selfCollider.node.name);
        console.log(event.otherCollider.node.name);
    }

    _onCollisionExit(event: ICollisionEvent) {
        // console.log(event.type, event);
    }
}
