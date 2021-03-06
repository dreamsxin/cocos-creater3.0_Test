
import { _decorator, Component, Node, CameraComponent, ModelComponent, geometry, systemEvent, SystemEventType, PhysicsSystem, EventTouch, Vec3 } from 'cc';
import { Role } from '../Role';
const { ccclass, property } = _decorator;

@ccclass('ILand')
export class ILand extends Component {

    @property(Node)
    role: Node = null as unknown as Node;

    @property({ type: CameraComponent })
    readonly cameraCom: CameraComponent = null as unknown as CameraComponent;

    @property({ type: ModelComponent })
    readonly modelCom: ModelComponent = null as unknown as ModelComponent;

    private _ray: geometry.ray = new geometry.ray();

    private _isMoving: boolean = false;
    private _clickPoint: Vec3 = new Vec3();
    private _radian: number = 0;

    onEnable() {
        /* 注册射线碰撞检测 */
        systemEvent.on(SystemEventType.TOUCH_START, this.onTouchStart, this);
    }

    onDisable() {
        /* 注销射线碰撞检测 */
        systemEvent.off(SystemEventType.TOUCH_START, this.onTouchStart, this);
    }

    /**
     * 射线碰撞检测
     * @param touch 
     * @param event 
     */
    onTouchStart(touch: any) {
        this.cameraCom.screenPointToRay(touch._point.x, touch._point.y, this._ray);

        PhysicsSystem.instance.raycast(this._ray);
        let temp = PhysicsSystem.instance.raycastResults;
        if (temp.length > 0) {
            let point = temp[0];
            let name: string = point.collider.name;
            if (name.substr(0, 7) == "plane01") {
                // this._calculate(point.hitPoint);
                this._acrossAstar(point.hitPoint);
            }
        }
    }

    private _acrossAstar(v3: Vec3) {
        let role: Role = this.role.getComponent(Role) as Role;
        role.startfindWay(v3);
    }

    _calculate(v3: Vec3) {
        this._clickPoint = v3;
        let pos = v3;
        let radian = Math.atan2(pos.x - this.role.getWorldPosition().x, pos.z - this.role.getWorldPosition().z);

        radian = radian - Math.PI / 2;
        this._radian = radian;
        this._isMoving = true;

        let role: Role = this.role.getComponent(Role) as Role;
        role.handleStart();
    }

    update() {
        if (this._isMoving) {
            let out: Vec3 = new Vec3();
            Vec3.subtract(out, this._clickPoint, this.role.getWorldPosition());
            let distance = out.length();
            let role: Role = this.role.getComponent(Role) as Role;
            role.handleMove(this._radian);
            if (distance < 0.3 || !role.getMoveState()) {
                this._isMoving = false;
                role.handleStop();
            }
        }
    }

    public setMoving(bool: boolean) {
        this._isMoving = bool;
    }



}
