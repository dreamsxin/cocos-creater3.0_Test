
import { _decorator, Component, Node, ICollisionEvent, Vec3, sp } from 'cc';
import { IdentityType, Player } from './player';
import { Role } from './Role';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Player {

    /* 用来给AI面向玩家,记录玩家,保证玩家和AI在场景里的同一个层级*/
    private role: Role = null as unknown as Role;

    /* 是否开始跟随玩家 */
    private isMoveToPlayer: boolean = false;

    /* 与玩家间的最终最小距离 */
    private offsetPlayer: number = 3;

    /* 移动速度 */
    private speed: number = 0.01;

    start() {
        super.start()
        this.identity = IdentityType.enemy;
        this.role = this.node.parent?.getChildByName("player")?.getComponent(Role) as Role;
        this.handleSchedule();
    }

    /**
     * 控制AI追踪玩家的时间间隔
     */
    handleSchedule() {
        return;
        this.schedule(() => {
            let distance = this.getDistance();
            if (distance > this.offsetPlayer) {
                this.isMoveToPlayer = true;
                let random = Math.random();
                this.speed = 0.01 + random * 0.1;
                /* 给个随机因子来决定行走还是奔跑 */
                if (random > 0.45) {
                    this.handleRun();
                }
                else {
                    this.handleWalk();
                }
            }
            else {
                this.isMoveToPlayer = false;
                this.handleStop();
            }
        }, 5);
    }

    /**
     * 子类重写,监听身体碰撞器碰撞事件
     * @param event 
     */
    onBodyColliderEnter(event: ICollisionEvent) {
        let player = event.otherCollider.node.parent;
        /* 被攻击,对方处于攻击状态 other.attackBool=true */
        if (player?.name == "player") {
            let role: Role = player.getComponent(Role) as Role;
            if (role.attackBool) {
                this.setEnemyRotateToPlayer();
                this.handleHurt();
            }
        }
    }

    /**
     * 子类重写,监听两个拳头碰撞器碰撞事件
     * @param event 
     */
    onFishColliderEnter(event: ICollisionEvent) {
        let player = event.otherCollider.node;
        /* 主动攻击,自己处于攻击状态 attackBool=true */
        if (this.attackBool) {
            if (player?.name == "player") {
                console.log("打中 玩家 啦");
            }
        }
    }

    /**
     * 获取与玩家间的距离
     */
    getDistance() {
        let v1: Vec3 = this.role.node.getWorldPosition();
        let v2: Vec3 = this.node.getWorldPosition();
        let out = new Vec3();
        out = Vec3.subtract(out, v1, v2);
        let distance = Vec3.len(out);
        return distance;
    }

    /**
     * 重写播放攻击方法,AI主动发起攻击时,朝向玩家
     */
    evt_attack() {
        super.evt_attack();
        this.setEnemyRotateToPlayer();
    }

    /**
     * 使得AI面向玩家
     */
    setEnemyRotateToPlayer() {
        let v1: Vec3 = this.role.node.getWorldPosition();
        let v2: Vec3 = this.node.getWorldPosition();
        let radian: number = Math.atan2(v1.x - v2.x, v1.z - v2.z);
        let angle: number = radian / Math.PI * 180;
        let euler: Vec3 = this.node.eulerAngles;
        euler.y = angle;
        this.node.eulerAngles = euler;
    }

    /**
     * 让AI朝向玩家移动
     */
    moveToPlayer() {
        let v1: Vec3 = this.role.node.getWorldPosition();
        let v2: Vec3 = this.node.getWorldPosition();
        let distance = this.getDistance();
        if (distance <= 3) {
            this.isMoveToPlayer = false;
            this.evt_attack();
            return;
        }
        this.setEnemyRotateToPlayer();
        let radian: number = Math.atan2(v1.x - v2.x, v1.z - v2.z);
        let speed = this.speed;
        let xx = Math.sin(radian) * speed;
        let zz = Math.cos(radian) * speed;
        v2.x += xx;
        v2.z += zz;
        this.node.setWorldPosition(v2);
    }

    update() {
        if (this.isDied) return;
        if (this.isMoveToPlayer) {
            this.moveToPlayer();
        }
    }

}
