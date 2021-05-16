
import { _decorator, Component, Node, Camera, SystemEventType, systemEvent, Vec2, geometry, PhysicsSystem, Vec3, tween, SkeletalAnimationComponent, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Room')
export default class Room extends Component {
    @property(Node)
    blackRole: Node = null as unknown as Node;

    @property(Node)
    redRole: Node = null as unknown as Node;

    public roomId: number = -1;
    /* 房间人数 */
    public count: number = -1;

    init(id: number, count: number) {
        this.roomId = id;
        this.count = count;
        if (count == 0) {
            this.blackRole.active = false;
            this.redRole.active = false;
        }
        else if (count == 1) {
            this.blackRole.active = false;
            this.redRole.active = true;
        }
        else if (count == 2) {
            this.blackRole.active = true;
            this.redRole.active = true;
        }
    }

    checkCount() {
        if (this.count == 2) {

        }
    }
}