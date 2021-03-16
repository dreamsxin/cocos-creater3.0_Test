import { _decorator, Component, Node, SkeletalAnimationComponent, Vec3, systemEvent, SystemEvent, EventKeyboard, Quat, math, sp, tween, Vec2 } from 'cc';
import pitem from './astar/pitem';
import Ppath from './astar/ppath';
const { ccclass, property, type } = _decorator;


const tempVec3_a = new Vec3();
@ccclass('Role')
export class Role extends Component {

    @property({ type: SkeletalAnimationComponent })
    CocosAnim: SkeletalAnimationComponent = new SkeletalAnimationComponent();

    @type(Node)//控制摄像机上下
    verticalViewNode: Node | null = null;

    @type(Node)
    mainCamera: Node = null;

    private _curPos: Vec3 = new Vec3(0, 0, 0);

    private keycodes: number[] = [65, 83, 68, 87];

    private isRight: boolean = false;
    private isLeft: boolean = false;
    private isDown: boolean = false;
    private isUp: boolean = false;
    private isMoving: boolean = false;
    private curOrder: number = 0;
    private tempOrder: number = 0;
    private _rotHorizontalSpeed: number = 0.005;
    private _rotVerticalSpeed: number = 0.002;
    public viewDownAngle: number = -60;
    public viewUpAngle: number = 60;
    public radian: number = 0;

    onLoad() {
        this._curPos = this.node.getPosition();
        //键盘监听
        // systemEvent.on(SystemEvent.EventType.KEY_DOWN, this._onKeyDown, this);
        // systemEvent.on(SystemEvent.EventType.KEY_UP, this._onKeyUp, this);

        //触摸监听
        systemEvent.on(SystemEvent.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this._init();
        this.testFind();
    }

    private R: number = 0;
    _init() {
        let ang: number = this.node.eulerAngles.y;
        let radian: number = ang / 180 * Math.PI + 90;
        this.radian = radian;
        //初始化摄像机位置
        this.resetCameraPos();
    }

    setRValue() {
        //R:摄像机绕角色旋转半径
        let p1: Vec3 = this.node.getWorldPosition();
        let p2: Vec3 = this.mainCamera.getWorldPosition();
        let out: Vec3 = new Vec3();
        out = Vec3.subtract(out, p1, p2);
        this.R = Vec3.len(out);
    }

    /**
     * 摄像机位置设置
     */
    resetCameraPos() {
        let rolePos = this.node.getWorldPosition();
        let cameraPos = new Vec3(rolePos.x, 10, rolePos.z - 14);
        this.mainCamera.setPosition(cameraPos);
        this.setRValue();
    }

    private i: number = 0;
    /**
     * 设置摄像机绕着人物转
     * @param value 
     */
    setRotateByControl(value: number) {
        this.i += 0.05 * (value);
        //绕着某个点做圆周运动
        let R: number = this.R;//14
        console.log(R);
        let xx = Math.cos(this.i) * R + this.node.getPosition().x;
        let zz = Math.sin(this.i) * R + this.node.getPosition().z;
        this.mainCamera.setPosition(new Vec3(xx, this.mainCamera.getPosition().y, zz));

        let p1: Vec3 = this.node.getWorldPosition();
        let p2: Vec3 = this.mainCamera.getWorldPosition();
        let radian: number = Math.atan2(p2.x - p1.x, p2.z - p1.z);
        let angle: number = radian * 180 / Math.PI;
        this.mainCamera.eulerAngles = new Vec3(this.mainCamera.eulerAngles.x, angle, this.mainCamera.eulerAngles.z);


    }

    /**
     * 通过触摸事件控制摄像机旋转
     * @param event 
     */
    _onTouchMove(event: any) {
        // if (event.getDelta().x != 0) {
        //     const horizontalRot = this.node.getRotation();
        //     Quat.rotateAround(horizontalRot, horizontalRot, Vec3.UNIT_Y, -event.getDelta().x * this._rotHorizontalSpeed);
        //     this.node.setRotation(horizontalRot);
        // }
        // if (event.getDelta().y != 0) {
        //     const verticalRot = this.verticalViewNode.getRotation();
        //     Quat.rotateAround(verticalRot, verticalRot, Vec3.UNIT_X, event.getDelta().y * this._rotVerticalSpeed);
        //     verticalRot.getEulerAngles(tempVec3_a);
        //     if (tempVec3_a.x > this.viewDownAngle && tempVec3_a.x < this.viewUpAngle) {
        //         this.verticalViewNode.setRotation(verticalRot);
        //     }
        // }
    }

    _onKeyDown(event: any) {
        this.curOrder = event.keyCode;
        switch (event.keyCode) {
            case 65://a
                this.setRotateByControl(-1);
                // this.isLeft = true;
                // this.isMoving = true;
                break;
            case 83://s
                this.isDown = true;
                this.isMoving = true;
                break;
            case 68://d
                this.setRotateByControl(1);
                // this.isRight = true;
                // this.isMoving = true;
                break;
            case 87://w
                this.isUp = true;
                this.isMoving = true;
                break;
            case 32://jump
                this.CocosAnim.play("cocos_anim_jump");
                break;
            default:
                break;
        }
    }

    _onKeyUp(event: any) {
        switch (event.keyCode) {
            case 65://a
                this.isLeft = false;
                break;
            case 83://s
                this.isDown = false;
                break;
            case 68://d
                this.isRight = false;
                break;
            case 87://w
                this.isUp = false;
                break;
            case 32:
                return;

            default:
                console.log(event.keyCode);
                break;
        }
        if (!this.isLeft && !this.isUp && !this.isRight && !this.isDown) {
            this.isMoving = false;
            this.tempOrder = -1;
            this.CocosAnim.play("cocos_anim_idle");
        }
    }

    update(deltaTime: number) {
        this.resetCameraPos();
        if (!this.isMoving) return;
        deltaTime = 0.1;
        //始终朝前方走
        if (this.isUp) {
            this.node.translate(new Vec3(Vec3.FORWARD.x * deltaTime, Vec3.FORWARD.y, -Vec3.FORWARD.z * deltaTime), 0);
        }
        if (this.isDown) {
            this.node.translate(new Vec3(Vec3.FORWARD.x * deltaTime, Vec3.FORWARD.y, Vec3.FORWARD.z * deltaTime), 0);
        }
        if (this.tempOrder != this.curOrder) {
            this.tempOrder = this.curOrder;
            this.CocosAnim.play("cocos_anim_run");
        }
    }


    public handleStart() {
        this.isMoving = true;
        this.CocosAnim.play("cocos_anim_run");
    }

    public handleStop() {
        this.CocosAnim.play("cocos_anim_idle");
        this.isMoving = false;
    }

    public handleMove(radian: number) {
        this.radian = radian;
        let ang = radian * 180 / Math.PI;
        let v3: Vec3 = new Vec3(0, ang - 90, 0);
        this.node.eulerAngles = v3;
        let speed: number = 0.1;
        let xx: number = Math.cos(radian) * speed;
        let zz: number = Math.sin(radian) * speed;

        /* 摄像机同步移动 */
        let nextV3 = this.node.getWorldPosition().add(new Vec3(-xx, 0, zz));
        this.node.setPosition(nextV3);

        // nextV3 = this.mainCamera.getWorldPosition().add(new Vec3(-xx, 0, zz));
        // this.mainCamera.setPosition(nextV3);
    }


    /* --------------------- */
    @type(Node)//
    endNode: Node | null = null;
    @type([Node])//
    obstacle: Node[] = [];
    private paths: pitem[] = [];
    async testFind() {
        Ppath.Init.initProperty();
        for (let i = 0; i < this.obstacle.length; i++) {
            Ppath.Init.obstacle.push(this.obstacle[i]);
        }
        let paths: pitem[] = await Ppath.Init.startFind(this.node.getWorldPosition(), this.endNode.getWorldPosition());
        this.paths = paths;

        if (paths.length > 0) {
            this.handleStart();
            this.tweenMove(paths[0], 0);
        }

    }

    tweenMove(item: pitem, idx: number) {
        tween(this.node).to(0.4, { position: new Vec3(item.x, this.node.getWorldPosition().y, item.z) }).call(() => {
            idx++;
            if (idx == this.paths.length) {
                this.handleStop();
                return;
            }
            this.setRotateXZ(idx, this.paths);
            this.tweenMove(this.paths[idx], idx);
        }).start();
    }


    setRotateXZ(idx: number, roads: pitem[]) {
        let p1: Vec2 = new Vec2(roads[idx].x, roads[idx].z);
        let p2: Vec2 = new Vec2(roads[idx - 1].x, roads[idx - 1].z);
        let radian: number = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        let angle: number = radian * 180 / Math.PI;
        tween(this.node).to(0, { eulerAngles: new Vec3(0, -angle - 90, 0) }).start();
    }
}
