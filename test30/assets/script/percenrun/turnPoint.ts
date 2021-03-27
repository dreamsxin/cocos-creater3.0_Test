
import { _decorator, Component, Node, Vec3, Collider, ICollisionEvent } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TurnPoint')
export class TurnPoint extends Component {

    @property(Node)
    leftLine: Node = null as unknown as Node;

    @property(Node)
    rightLine: Node = null as unknown as Node;

    @property(Node)
    centerLeft: Node = null as unknown as Node;

    @property(Node)
    centerRight: Node = null as unknown as Node;

    public direction: number = 0;
    onEnable() {
        this.setDirection(Math.random() > 0.5 ? 1 : 0);
    }
    setDirection(direction: number) {
        this.direction = direction;
        //0:left,1:right
        this.leftLine.active = false;
        this.rightLine.active = false;
        if (direction == 0) {
            this.leftLine.active = true;
        }
        else {
            this.rightLine.active = true;
        }
    }

    public getCenterLeftPos(): Vec3 {
        return this.centerLeft.getWorldPosition();
    }

    public getCenterRightPos(): Vec3 {
        return this.centerRight.getWorldPosition();
    }


}
