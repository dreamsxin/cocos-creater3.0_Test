
import { _decorator, Component, Node, Camera, SystemEventType, systemEvent, Vec2, geometry, PhysicsSystem, Vec3, tween, SkeletalAnimationComponent, Prefab } from 'cc';
import { PoolManager } from '../infinitymap/poolManager';
const { ccclass, property } = _decorator;

@ccclass('ChessRoomNode')
export class ChessRoomNode extends Component {
    @property(Camera)
    mainCamera: Camera = null as unknown as Camera;

    @property(Node)
    role: Node = null as unknown as Node;

    @property(Prefab)
    desk: Prefab = null as unknown as Prefab;

    private isMoving: boolean = false;
    private count: number = 0;

    start() {
        systemEvent.on(SystemEventType.TOUCH_START, this.touchStart, this);
        this.resetCameraPos();
        this.layoutDesk();
    }
    onDisable() {
        /* 注销射线碰撞检测 */
        systemEvent.off(SystemEventType.TOUCH_START, this.touchStart, this);
    }

    touchStart(event: any) {
        let pos: Vec2 = event.getLocation();
        /* 从摄像机创建一条射线 */
        let ray: geometry.Ray = this.mainCamera.screenPointToRay(pos.x, pos.y);
        /* 从摄像机发射一条射线 */
        if (PhysicsSystem.instance.raycastClosest(ray)) {
            /* 检测穿过的物体,待检测的物体必须包含物理碰撞器 */
            let result = PhysicsSystem.instance.raycastClosestResult;
            let point = result.hitPoint;
            if (result.collider.node.name == "roomList") {
                this.handleRoleMove(point);
            }
            else if (result.collider.node.name == "chessDesk") {
                let pos = this.role.getWorldPosition();
                let distance = this.getDistance(pos, point);
                console.log(distance);
            }
            console.log(result.collider.node.name);
        }
    }

    /**
     * 摄像机位置设置
     */
    resetCameraPos() {
        let rolePos = this.role.getWorldPosition();
        let cameraPos = new Vec3(rolePos.x + 22, 10, rolePos.z);
        this.mainCamera.node.eulerAngles = new Vec3(-17, 90, 0);
        this.mainCamera.node.setPosition(cameraPos);
    }

    handleRoleMove(v3: Vec3) {
        if (this.count == 0) {
            (this.role.getComponent(SkeletalAnimationComponent) as SkeletalAnimationComponent).play("cocos_anim_run");
        }
        this.count++;
        this.isMoving = true;
        let pos = v3;
        let radian = Math.atan2(pos.x - this.role.getWorldPosition().x, pos.z - this.role.getWorldPosition().z);
        this.isMoving = true;
        let angle: number = radian * 180 / Math.PI;
        this.role.eulerAngles = new Vec3(0, angle, 0);

        // let out: Vec3 = new Vec3();
        // Vec3.subtract(out, v3, this.role.getWorldPosition());
        let distance = this.getDistance(v3, this.role.getWorldPosition());
        let time = distance / 10;
        tween(this.role).to(time, { worldPosition: pos }).call(() => {
            this.count--;
            if (this.count == 0) {
                this.isMoving = false;
                (this.role.getComponent(SkeletalAnimationComponent) as SkeletalAnimationComponent).play("cocos_anim_idle")
            }
        }).start();
    }

    update() {
        if (this.isMoving) {
            this.resetCameraPos();
        }
    }

    /**
     * 获取两个三维坐标间的矢量长度
     * @param pos1 
     * @param pos2 
     * @returns 
     */
    getDistance(pos1: Vec3, pos2: Vec3): number {
        let out: Vec3 = new Vec3();
        Vec3.subtract(out, pos1, pos2);
        let distance = out.length();
        return distance;
    }

    layoutDesk() {
        let len: number = 4;
        for (let z = 0; z < len; z++) {
            for (let x = 0; x < len; x++) {
                let ds: Node = PoolManager.getNode(this.desk);
                this.node.addChild(ds);
                let pos: Vec3 = new Vec3(-(len * 15 / 2) + x * 15, 0, len * 18 / 2 - z * 18);
                ds.setWorldPosition(pos);
            }
        }
    }
}

