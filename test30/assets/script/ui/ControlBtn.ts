
import { _decorator, Component, Node, SkeletalAnimationComponent, Prefab, instantiate, Vec3 } from 'cc';
import { Role } from '../Role';
import { Bullet } from './bullet';
const { ccclass, property } = _decorator;

@ccclass('ControlBtn')
export class ControlBtn extends Component {
    @property({ type: Prefab })
    bullet: Prefab = null;

    @property({ type: Node })
    role: Node = null;

    @property({ type: SkeletalAnimationComponent })
    CocosAnim: SkeletalAnimationComponent = new SkeletalAnimationComponent();

    btncallback(event: any, order: string) {
        switch (order) {
            case "0":
                this.CocosAnim.play("cocos_anim_shoot");
                this._shoot();
                break;

            case "1":
                this.CocosAnim.play("cocos_anim_attack");
                break;

            case "2":
                this.CocosAnim.play("cocos_anim_squat");
                break;

            case "3":
                this.CocosAnim.play("cocos_anim_down");
                break;
        }
    }

    _shoot() {
        let bt = instantiate(this.bullet);
        bt.parent = this.role.parent;
        let rPos: Vec3 = this.role.getWorldPosition();
        let rs = this.role.getComponent(Role);
        let offsetX: number = Math.cos(rs.radian) * 0.5;
        let offsetZ: number = Math.sin(rs.radian) * 0.5;
        let pos: Vec3 = new Vec3(rPos.x - offsetX, 2, rPos.z + offsetZ);
        bt.setPosition(pos);
        bt.getComponent(Bullet)?.shoot(rs?.radian);
    }
}
