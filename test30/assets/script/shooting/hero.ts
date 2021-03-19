
import { _decorator, Component, Node, Vec2, Vec3, BoxColliderComponent, ICollisionEvent } from 'cc';
import EventManager from './eventManager';
import { ShootCfg } from './shootCfg';
const { ccclass, property } = _decorator;

@ccclass('Hero')
export class Hero extends Component {
    private offsetX: number = 0;
    /* 加速度 */
    private add: number = 0;
    start() {
        let body = this.node.getChildByName("Body");
        const collider = body?.getComponent(BoxColliderComponent);
        collider?.on("onCollisionEnter", this._onCollisionEnter, this);
    }
    update() {
        if (ShootCfg.movePause) return;
        let zz: number = this.node.getWorldPosition().z + Number(-ShootCfg.speed) - Number(this.add);
        let xx: number = this.offsetX + this.node.getWorldPosition().x;
        if (xx > 4) {
            xx = 4;
        }
        else if (xx < -2.8) {
            xx = -2.8;
        }
        this.node.setWorldPosition(new Vec3(xx, 0.5, zz));
    }

    changeOffsetX(value: number) {
        this.offsetX = value;
    }
    setAddValue(add: number) {
        this.add = add;
    }

    /**
     * 碰撞检测
     * @param event 
     */
    _onCollisionEnter(event: ICollisionEvent) {
        const otherCollider = event.otherCollider;
        if (otherCollider.node.name == "bomb") {
            EventManager.Inst.dispatchEvent(EventManager.EVT_shooted, 1);
        }
    }
}
