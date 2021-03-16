import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Shake')
export class Shake extends Component {

    @property({ type: Node })
    centerNode: Node = null;

    private _centerPos: Vec3;

    private _offset: Vec3 = new Vec3();

    private _startPos: Vec3;

    private _speed: number = -0.002;
    // private _speed: number = 0.002;

    onLoad() {
        this._centerPos = this.centerNode.worldPosition;
        this._offset.set(this.node.worldPosition);
        this._startPos = this.node.worldPosition;
    }

    /**
     * 圆周运动
     * @param deltaTime 
     */
    update(deltaTime: number) {
        // this._rotateAroudX();
        this._rotateAroudY();
        // this._rotateAroudZ();
    }

    /**
     * 绕旋转中心X轴旋转
     */
    _rotateAroudX() {
        let radian = Math.atan2(this.node.worldPosition.z - this._centerPos.z, this.node.worldPosition.y - this._centerPos.y);
        let angle = radian * 180 / Math.PI;
        this.node.eulerAngles = new Vec3(0, 90, angle);
        Vec3.rotateX(this._offset, this._startPos, this._centerPos, this._speed);
        this.node.setWorldPosition(this._offset);
    }

    /**
     * 绕旋转中心Y轴旋转
     */
    _rotateAroudY() {
        let radian = Math.atan2(this.node.worldPosition.z - this._centerPos.z, this.node.worldPosition.x - this._centerPos.x);
        let angle = 90 - radian * 180 / Math.PI;
        this.node.eulerAngles = new Vec3(0, angle, 0);
        Vec3.rotateY(this._offset, this._startPos, this._centerPos, this._speed);
        this.node.setWorldPosition(this._offset);
    }

    /**
     * 绕旋转中心Z轴旋转
     */
    _rotateAroudZ() {
        let radian = Math.atan2(this.node.worldPosition.x - this._centerPos.x, this.node.worldPosition.y - this._centerPos.y);
        let angle = 360 - radian * 180 / Math.PI;
        this.node.eulerAngles = new Vec3(0, 0, angle);
        Vec3.rotateZ(this._offset, this._startPos, this._centerPos, this._speed);
        this.node.setWorldPosition(this._offset);
    }
}
