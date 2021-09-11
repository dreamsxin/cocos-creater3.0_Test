
import { _decorator, Component, Node, Enum, BoxColliderComponent, ICollisionEvent, Vec3, find, tween } from 'cc';
import { clientEvent } from '../framwork/clientEvent';
import { Constant } from '../framwork/constant';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = ArcheryMonster
 * DateTime = Sat Sep 11 2021 13:56:19 GMT+0700 (印度尼西亚西部时间)
 * Author = zfs533
 * FileBasename = archeryMonster.ts
 * FileBasenameNoExtension = archeryMonster
 * URL = db://assets/script/joystickarchery/archeryMonster.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */
const MonsterType = Enum({
    aula: 0,
    boomDragon: 1,
    dragon: 2,
    hellFire: 3,
    magician: 4,
});

@ccclass('ArcheryMonster')
export class ArcheryMonster extends Component {
    @property({ type: MonsterType })
    type = MonsterType.boomDragon;
    onLoad() {
        clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddMonsterToPlayerCheck, this.node);
        const collider = this.node?.getComponent(BoxColliderComponent);
        if (collider) {
            collider?.on("onCollisionEnter", this._onCollisionEnter, this);
        }
    }

    /**
    * 碰撞检测
    * @param event 
    */
    _onCollisionEnter(event: ICollisionEvent) {
        const otherCollider = event.otherCollider;
        let name = otherCollider.node.name;
        let pos1: Vec3 = this.node.worldPosition;
        let node = find("archery") as unknown as Node;
        let pos2: Vec3 = node.worldPosition;
        if (name == "archeryArrow") {
            let radius = Math.atan2(pos1.x - pos2.x, pos1.z - pos2.z);
            let angle = radius * 180 / Math.PI;
            let euler = this.node.eulerAngles;
            let yy = angle - 180;
            //转到同正负,播放转向动画好看一点
            if (yy * euler.y < 0) {
                if (euler.y > 0) {
                    yy += 360;
                }
                else {
                    yy -= 360;
                }
            }
            let v3 = new Vec3(euler.x, yy, euler.z);
            tween(this.node).to(0.5, { eulerAngles: v3 }).start();
        }
    }
}