
import { _decorator, Component, Node, Vec3, Vec2, UITransform } from 'cc';
import { Role } from '../player/Role';
// import { Role } from '../Role';
// import { ILand } from './iLand';
const { ccclass, property } = _decorator;

@ccclass('Handle')
export class Handle extends Component {
    @property({ type: Node })
    center: Node = null as unknown as Node;

    @property({ type: Node, visible: () => { return true } })
    iland: Node = null as unknown as Node;

    @property(Node)
    bg: Node = null as unknown as Node;

    @property(Node)
    role: Node = null as unknown as Node;

    private circleR: number = 90;
    private radian: number = 0;
    private speed: number = 3;
    private isMoving: boolean = false;

    onLoad() {
        this.bg.on(Node.EventType.TOUCH_START, this.touchStart.bind(this));
        this.bg.on(Node.EventType.TOUCH_MOVE, this.touchMove.bind(this));
        this.bg.on(Node.EventType.TOUCH_END, this.touchEnd.bind(this));
        this.bg.on(Node.EventType.TOUCH_CANCEL, this.touchEnd.bind(this));
    }

    touchStart(event: Touch) {
        let pos = event.getLocation();
        let poss: Vec3 = new Vec3(pos.x - this.node.getWorldPosition().x, pos.y - this.node.getWorldPosition().y, 0);
        this.center.setPosition(poss);
        this.role.getComponent(Role)?.handleRun();
        // this.iland.getComponent(ILand)?.setMoving(false);
    }

    touchMove(event: Touch) {
        this.isMoving = true;
        let pos = event.getLocation();
        let poss: Vec3 = new Vec3(pos.x - this.node.getWorldPosition().x, pos.y - this.node.getWorldPosition().y, 0);
        this.center.setPosition(poss);
        let radian = Math.atan2(this.center.getPosition().y, this.center.getPosition().x);
        let distance = Vec3.len(this.center.getPosition());
        if (distance >= this.circleR) {
            poss = new Vec3(Math.cos(radian) * this.circleR, Math.sin(radian) * this.circleR, 0);
            this.center.setPosition(poss);
        }
        this.radian = radian;
    }

    touchEnd() {
        this.isMoving = false;
        this.center.setPosition(new Vec3(0, 0, 0));
        this.role.getComponent(Role)?.handleStop();
    }

    update() {
        if (this.isMoving) {
            let role: Role = this.role.getComponent(Role) as Role;
            role.handleMove(this.radian);
        }
    }
}