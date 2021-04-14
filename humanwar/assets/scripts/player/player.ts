
import { _decorator, Component, Node, SkeletalAnimationComponent, Vec3, SystemEvent, systemEvent, Vec2, Collider, ICollisionEvent, Enum } from 'cc';
import EventManager from '../utils/eventManager';
import { PoolManager } from '../utils/poolManager';
const { ccclass, property, type } = _decorator;
/**
 * 
 * @export
 * @class Player
 * @extends {Component}
 */

/* 角色类型枚举 */
export enum IdentityType {
    player = 0,
    enemy,
}

Enum(IdentityType)

@ccclass('Player')
export class Player extends Component {
    @property({ type: IdentityType, displayOrder: 1 })
    identity: IdentityType = IdentityType.player;//0玩家,1敌人

    @property({ type: SkeletalAnimationComponent })
    CocosAnim: SkeletalAnimationComponent = new SkeletalAnimationComponent();

    @property({ type: Node, visible: function (this: Player) { return this.identity == IdentityType.player; } })
    mainCamera: Node = null as unknown as Node;

    @property(Node)
    bloodBar: Node = null as unknown as Node;

    /* 是否处于移动过程中 */
    public isMoving: boolean = false;

    /* 是否处于自动寻路过程中 */
    public isAutoMoving: boolean = false;

    /* 摄像机旋转速度 */
    private i: number = Math.PI / 2;

    /* 摄像机旋转半径 */
    private R: number = 0;

    /* 是否真正播放某个动作 */
    private isPlayingAnim: boolean = false;

    /* 死亡阵亡  */
    public isDied: boolean = false;

    /* 释放攻击技能 */
    public attackBool: boolean = false;

    /* 释放受伤技能 */
    public hurtBool: boolean = false;

    /* 释放跳跃技能 */
    private jumpBool: boolean = false;

    /* 总血量 */
    private bloodTotal: number = 100;

    /* id,唯标识 */
    public id: number = -1;

    onLoad() {
        if (this.identity > 0) return;
        //触摸监听,控制摄像机旋转
        systemEvent.on(SystemEvent.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    start() {
        this.addColliderEvent();
        this.setAnimationEvent();
        if (this.identity < 1) {
            this.initCameraPos(true);
        }
    }

    onEnable() {
        let scale: Vec3 = this.bloodBar.getScale();
        scale.y = 2;
        this.bloodBar.setScale(scale);
        this.bloodBar.active = true;
        this.isDied = false;
        this.resumeIdleState();
    }

    /**
     * 初始化摄像机位置设置
     */
    initCameraPos(bool: boolean = false) {
        let rolePos = this.node.getWorldPosition();
        let cameraPos = new Vec3(rolePos.x + 25, 10, rolePos.z);
        if (bool && this.identity < 1) {//初始化,固定相机位置
            this.mainCamera.eulerAngles = new Vec3(-20, 90, 0);
            this.mainCamera.setPosition(cameraPos);
        }
        this.refreshRValue();
    }

    /**
     * 角色移动
     * @param radian 
     */
    public handleMove(radian: number) {
        if (this.isAutoMoving || this.isDied) return;

        this.attackBool = false;

        let mCameraEular = new Vec3();
        let ang = radian * 180 / Math.PI;
        if (this.identity < 1) {//区分玩家和AI
            mCameraEular = this.mainCamera.eulerAngles;
            ang = radian * 180 / Math.PI + (mCameraEular.y - 90);
        }

        /* 这里加了一个摄像机旋转的偏移角度 */
        let v3: Vec3 = new Vec3(0, ang + 180, 0);
        this.node.eulerAngles = v3;
        let speed: number = 0.2;

        radian = ang / 180 * Math.PI;
        let xx: number = Math.cos(radian) * speed;
        let zz: number = Math.sin(radian) * speed;

        let gap: Vec3 = new Vec3(-zz, 0, -xx);
        /* 角色移动 */
        let nextV3 = this.node.getWorldPosition().add(gap);
        this.node.setPosition(nextV3);

        if (this.identity < 1) {
            /* 摄像机同步移动 */
            nextV3 = this.mainCamera.getWorldPosition().add(gap);
            this.mainCamera.setPosition(nextV3);
        }
    }

    /**
     * 设置摄像机旋转半径
     */
    refreshRValue() {
        if (this.isDied) return;
        if (this.identity > 0) { return; }
        //R:摄像机绕角色旋转半径
        let p1: Vec3 = this.node.getWorldPosition();
        let p2: Vec3 = this.mainCamera.getWorldPosition();
        let out: Vec3 = new Vec3();
        out = Vec3.subtract(out, p1, p2);
        this.R = Vec3.len(out);
    }

    /**
     * 设置摄像机绕着人物转
     * @param value 
     */
    setRotateByControl(value: number) {
        this.i += 0.1 * (value);

        //绕着某个点做圆周运动
        let R: number = this.R;//20
        let xx = Math.cos(this.i) * R + this.node.getWorldPosition().x;
        let zz = Math.sin(this.i) * R + this.node.getWorldPosition().z;
        this.mainCamera.setPosition(new Vec3(xx, this.mainCamera.getWorldPosition().y, zz));

        let p1: Vec3 = this.node.getWorldPosition();
        let p2: Vec3 = this.mainCamera.getWorldPosition();
        let radian: number = Math.atan2(p2.x - p1.x, p2.z - p1.z);
        let angle: number = radian * 180 / Math.PI;
        // this.mainCamera.eulerAngles = new Vec3(-20, angle, 0);
        this.mainCamera.eulerAngles = new Vec3(this.mainCamera.eulerAngles.x, angle, 0);
    }

    /**
     * 通过触摸事件控制摄像机旋转
     * @param event 
     */
    private onTouchMove(event: any) {
        /* 左右旋转 */
        if (event.getDelta().x != 0) {
            let v2: Vec2 = event.getDelta();
            if (v2.x > 0) {
                this.setRotateByControl(1);
            }
            else {
                this.setRotateByControl(-1);
            }
        }
        /* 上下旋转 */
        if (event.getDelta().y != 0) {
            let v2: Vec2 = event.getDelta();
            let euler: Vec3 = this.mainCamera.eulerAngles;
            if (v2.y > 0) {
                euler.x -= 0.2;
            }
            else {
                euler.x += 0.2;
            }
            this.mainCamera.eulerAngles = euler;
        }

    }

    /**
     * 移动,奔跑状态
     */
    public handleRun() {
        if (this.isDied) return;
        this.isMoving = true;
        this.attackBool = false;
        this.hurtBool = false;
        this.jumpBool = false;
        this.CocosAnim.play("cocos_anim_run");
    }

    /**
     * 移动,行走状态
     */
    public handleWalk() {
        if (this.isDied) return;
        this.isMoving = true;
        this.attackBool = false;
        this.hurtBool = false;
        this.jumpBool = false;
        this.CocosAnim.play("cocos_anim_walk");
    }

    /**
     * 停下,待机状态
     */
    public handleStop() {
        if (this.isDied) return;
        if (this.isAutoMoving) return;
        this.isMoving = false;
        this.CocosAnim.play("cocos_anim_idle");
    }

    /**
     * 死亡动画
     */
    public handleDied() {
        if (this.isDied) return;
        this.isDied = true;
        this.CocosAnim.play("cocos_anim_die");
        /* 回收并发送生成角色事件 */
        this.scheduleOnce(() => {
            if (this.identity > 0) {
                EventManager.Inst.dispatchEvent(EventManager.EVT_generate_enemy, this.id);
            }
            else {
                EventManager.Inst.dispatchEvent(EventManager.EVT_generate_player, this.id);
            }
            PoolManager.setNode(this.node);
        }, 3);
        EventManager.Inst.dispatchEvent(EventManager.EVT_skill_died);
    }

    /**
     * 跳跃动画
     */
    public evt_Jump() {
        if (this.isDied) return;
        this.jumpBool = true;
        this.CocosAnim.play("cocos_anim_jump");
    }

    /**
     * 受到攻击
     */
    public handleHurt() {
        if (this.isDied) return;
        this.hurtBool = true;
        this.isPlayingAnim = true;
        this.CocosAnim.play("cocos_anim_hurt");
        EventManager.Inst.dispatchEvent(EventManager.EVT_skill_hurt);
    }

    /**
     * 攻击
     */
    public evt_attack() {
        if (this.isDied) return;
        this.attackBool = true;
        this.CocosAnim.play("cocos_anim_attack");
        EventManager.Inst.dispatchEvent(EventManager.EVT_skill_attack_music);

    }

    getMoveState() {
        return this.isMoving;
    }

    /**
     * 恢复到Idle状态
     */
    private resumeIdleState() {
        if (this.isDied) return;
        this.CocosAnim.play("cocos_anim_idle");
    }

    /**
     * 监听动画播放结束事件
     */
    public setAnimationEvent() {
        this.CocosAnim.on("finished", () => {
            /* 恢复到idle状态 */
            this.resumeIdleState();
            if (this.attackBool) {
                this.attackBool = false;
            }

            if (this.hurtBool) {
                this.hurtBool = false;
                this.refreshBloodValue();
                /* AI反击 */
                // if (this.identity > 0) {
                this.evt_attack();
                // }
            }

            if (this.jumpBool) {
                this.jumpBool = false;
            }
        });
    }

    /**
     * 添加碰撞事件
     */
    private addColliderEvent() {
        /*
        这里在项目设置里面加了两个分组,Player,Enemy,只有Player和Enemy间会发生碰撞
         */
        let bodyCollider = this.node.getComponent(Collider);
        bodyCollider?.on("onCollisionEnter", this.onBodyColliderEnter.bind(this), this);

        let leftfistCollider = this.node.getChildByName("leftfist")?.getComponent(Collider);
        leftfistCollider?.on("onCollisionEnter", this.onFishColliderEnter.bind(this), this);

        let rightfistCollider = this.node.getChildByName("rightfist")?.getComponent(Collider);
        rightfistCollider?.on("onCollisionEnter", this.onFishColliderEnter.bind(this), this);
    }

    /**
     * 监听身体碰撞器碰撞事件
     * @param event 
     */
    onBodyColliderEnter(event: ICollisionEvent) { }

    /**
     * 监听两个拳头碰撞器碰撞事件
     * @param event 
     */
    onFishColliderEnter(event: ICollisionEvent) { }

    /**
     * 刷新血量
     */
    refreshBloodValue() {
        let scale: Vec3 = this.bloodBar.getScale();
        if (this.identity > 0) {
            scale.y -= 1;
        }
        else {
            scale.y -= 0.1;
        }
        this.bloodBar.setScale(scale);
        if (scale.y <= 0) {
            this.bloodBar.active = false;
            this.handleDied();
        }
    }
}

