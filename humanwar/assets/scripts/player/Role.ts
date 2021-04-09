import { _decorator, Component, Node, SkeletalAnimationComponent, Vec3, systemEvent, SystemEvent, EventKeyboard, Quat, math, sp, tween, Vec2, random, ICollisionEvent } from 'cc';
import EventManager from '../utils/eventManager';
import { Enemy } from './enemy';
import { IdentityType, Player } from './player';
// import pitem from './astar/pitem';
// import Ppath from './astar/ppath';
// import PstarComponent from './astar/pstarComponent';
const { ccclass, property, type } = _decorator;


const tempVec3_a = new Vec3();
@ccclass('Role')
export class Role extends Player {

    @type(Node)//控制摄像机上下
    verticalViewNode: Node = null as unknown as Node;

    private isRight: boolean = false;
    private isLeft: boolean = false;
    private isDown: boolean = false;
    private isUp: boolean = false;

    onLoad() {
        super.onLoad();
        EventManager.Inst.registerEevent(EventManager.EVT_skill_attack, this.evt_attack.bind(this), this);
        EventManager.Inst.registerEevent(EventManager.EVT_skill_jump, this.evt_Jump.bind(this), this);
        //键盘监听
        systemEvent.on(SystemEvent.EventType.KEY_DOWN, this._onKeyDown, this);
        systemEvent.on(SystemEvent.EventType.KEY_UP, this._onKeyUp, this);
    }
    start() {
        super.start();
        this.identity = IdentityType.player;
        // let pstartCon = this.node.getComponent(PstarComponent);
        // pstartCon?.setObstacle();
    }

    /**
     * 子类重写,监听身体碰撞器碰撞事件
     * @param event 
     */
    onBodyColliderEnter(event: ICollisionEvent) {
        let enemy = event.otherCollider.node.parent;
        /* 被攻击,对方处于攻击状态 other.attackBool=true */
        if (enemy?.name == "enemy") {
            let emy: Enemy = enemy.getComponent(Enemy) as Enemy;
            if (emy.attackBool) {
                this.handleHurt();
            }
        }
    }

    /**
     * 子类重写,监听两个拳头碰撞器碰撞事件
     * @param event 
     */
    onFishColliderEnter(event: ICollisionEvent) {
        let enemy = event.otherCollider.node;
        /* 主动攻击,自己处于攻击状态 attackBool=true */
        if (this.attackBool) {
            if (enemy?.name == "enemy") {
                console.log("打中 AI 啦");
            }
        }
    }

    _onKeyDown(event: any) {
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
        this.handleStop();
    }

    _onKeyUp(event: any) {
        switch (event.keyCode) {
            case 65: this.isLeft = false; break;
            case 83: this.isDown = false; break;
            case 68: this.isRight = false; break;
            case 87: this.isUp = false; break;
            case 32: return;
            default: console.log(event.keyCode); break;
        }
        if (!this.isLeft && !this.isUp && !this.isRight && !this.isDown) {
            this.handleStop();
            this.CocosAnim.play("cocos_anim_idle");
        }
    }

    update(deltaTime: number) {
        if (!this.isMoving) return;
        this.refreshRValue();
        // this.constrolAstarWayMove();
    }


    /* ----------start find way----------- */
    // private paths: pitem[] = [];
    async startfindWay(endPos: Vec3) {
        // if (this.isAutoMoving) return;
        // this.paths.splice(0);
        // let pstartCon = this.node.getComponent(PstarComponent);
        // let startPos = this.node.getWorldPosition();
        // let paths: pitem[] = await pstartCon?.getPaths(startPos, endPos);
        // this.paths = paths;

        // if (paths.length > 0) {
        //     this.handleStart();
        //     this.isAutoMoving = true;
        //     this.tweenMove(paths[0], 0);
        // }
    }
    private _pathIndex: number = 1;
    constrolAstarWayMove() {
        // if (this.paths.length > 0) {
        // this._pathIndex = this.paths.length - 1;
        // let idx = this._pathIndex;
        // let p2: Vec2 = new Vec2(this.paths[idx].x, this.paths[idx].z);
        // let p1: Vec3 = new Vec3(this.paths[0].x, this.paths[0].z);//this.node.getWorldPosition();
        // let radian: number = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        // let xx: number = Math.cos(radian) * 0.1;
        // let zz: number = Math.sin(radian) * 0.1;
        // let ang = radian * 180 / Math.PI;
        // let v3: Vec3 = new Vec3(0, ang - 90, 0);
        // this.node.eulerAngles = v3;
        // /* 摄像机同步移动 */
        // let nextV3 = this.node.getWorldPosition().add(new Vec3(xx, 0, zz));
        // this.node.setPosition(nextV3);

        // let out: Vec3 = new Vec3();
        // Vec3.subtract(out, new Vec3(this.paths[idx].x, this.node.getWorldPosition().y, this.paths[idx].z), this.node.getWorldPosition());
        // let distance = out.length();
        // if (distance < 0.3) {
        //     this.handleStop();
        //     this.paths.splice(0);
        // }
        // }
    }

    // tweenMove(item: pitem, idx: number) {
    //     tween(this.node).to(0.2, { position: new Vec3(item.x, this.node.getWorldPosition().y, item.z) }).call(() => {
    //         idx++;
    //         if (idx == this.paths.length) {
    //             this.isAutoMoving = false;
    //             this.handleStop();
    //             return;
    //         }
    //         console.log(this.paths.length, idx);
    //         this.setRotateXZ(idx, this.paths);
    //         this.tweenMove(this.paths[idx], idx);
    //     }).start();
    // }


    // setRotateXZ(idx: number, roads: pitem[]) {
    //     let p1: Vec2 = new Vec2(roads[idx].x, roads[idx].z);
    //     let p2: Vec2 = new Vec2(roads[idx - 1].x, roads[idx - 1].z);
    //     let radian: number = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    //     let angle: number = radian * 180 / Math.PI;
    //     tween(this.node).to(0, { eulerAngles: new Vec3(0, -angle - 90, 0) }).start();
    // }
}
