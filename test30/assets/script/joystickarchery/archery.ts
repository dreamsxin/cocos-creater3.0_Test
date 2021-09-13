
import { _decorator, Component, Node, Vec3, SkeletalAnimationComponent, Enum, AnimationState, Prefab, instantiate, find, tween } from 'cc';
import { clientEvent } from '../framwork/clientEvent';
import { Constant } from '../framwork/constant';
import { PoolManager } from '../infinitymap/poolManager';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Archery
 * DateTime = Fri Sep 10 2021 10:10:21 GMT+0700 (印度尼西亚西部时间)
 * Author = zfs533
 * FileBasename = archery.ts
 * FileBasenameNoExtension = archery
 * URL = db://assets/script/joystickarchery/archery.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */
const AnimClip = Enum({
    idle: 0,
    attack: 1,
    die: 2,
    revive: 3,
    run: 4,
});

@ccclass('Archery')
export class Archery extends Component {
    @property(Prefab)
    launchArrow: Prefab = null as unknown as Prefab;

    @property(Node)
    arrowNormal: Node = null as unknown as Node;

    @property(SkeletalAnimationComponent)
    anim: SkeletalAnimationComponent = undefined as unknown as SkeletalAnimationComponent;
    private _speed: number = 0.1;
    private _isMoving: boolean = false;
    private _originPos: Vec3 = new Vec3();
    private _monsterList: Node[] = [];
    onLoad() {
        clientEvent.on(Constant.EVENT_TYPE.StartMoving, this._startMoving, this);
        clientEvent.on(Constant.EVENT_TYPE.MoveEnd, this._moveEnd, this);
        clientEvent.on(Constant.EVENT_TYPE.Shoot, this._shooting, this);
        clientEvent.on(Constant.EVENT_TYPE.AddMonsterToPlayerCheck, this._addMonsterList, this);
        clientEvent.dispatchEvent(Constant.EVENT_TYPE.CarmeraRole, this.node);
        this._originPos = this.node.getPosition();
    }

    start() {
        //只播放一次
        this.anim.getState("attack").repeatCount = 1;
    }

    onDestroy() {
        clientEvent.off(Constant.EVENT_TYPE.StartMoving, this._startMoving, this);
        clientEvent.off(Constant.EVENT_TYPE.MoveEnd, this._moveEnd, this);
        clientEvent.off(Constant.EVENT_TYPE.Shoot, this._shooting, this);
        clientEvent.off(Constant.EVENT_TYPE.AddMonsterToPlayerCheck, this._addMonsterList, this);
    }

    /**
     * 角色移动,通过事件驱动(摇杆中触发)
     * @param angle 
     * @param radius 
     */
    private _startMoving(angle: number, radius: number) {
        if (!this._isMoving) {
            this._isMoving = true;
            this._playActions(AnimClip.run);
        }
        let eularangle = this.node.eulerAngles;
        eularangle.set(eularangle.x, angle, eularangle.z);
        this.node.eulerAngles = eularangle;

        let zz = Math.cos(radius) * this._speed;
        let xx = Math.sin(radius) * this._speed;
        this._originPos.add(new Vec3(xx, 0, zz));

        this.node.setPosition(this._originPos);

        this.arrowNormal.active = true;
    }

    /**
     * 获取当前角色行走状态
     * @returns 
     */
    public getMoveState() {
        return this._isMoving;
    }

    private _moveEnd() {
        this._isMoving = false;
        this._playActions(AnimClip.idle);
    }

    private _playActions(index: number) {
        this.anim.play(this.anim.clips[index]?.name);
        if (index == AnimClip.attack) {
        }
        else {
            this.arrowNormal.active = true;
        }
    }

    /**
     * 射击
     */
    private _shooting() {
        this._checkMonster();
        this._playActions(AnimClip.attack);
        this.arrowNormal.active = true;
        this.scheduleOnce(() => {
            this.arrowNormal.active = false;
            this._launchArrow();
        }, 0.8);
        this.anim.on("finished", () => {
            this.arrowNormal.active = true;
            this.anim.off("finished");
        }, this);
    }

    /**
     * 射击
     */
    private _launchArrow() {
        let pos = this.arrowNormal.getWorldPosition();
        let angle = this.node.eulerAngles;
        angle = new Vec3(angle.y - 90, 0, 90);
        for (let i = 0; i < 8; i++) {
            let arrow: Node = PoolManager.getNode(this.launchArrow);
            let parent = this.node.parent;
            arrow.parent = parent;
            arrow.setWorldPosition(pos);
            let tempAngle = new Vec3(angle.x + (-40 + i * 10), angle.y, angle.z);
            arrow.eulerAngles = tempAngle;
        }


    }

    /**
     * 将场景中的monster添加到列表
     * @param monster 
     */
    private _addMonsterList(monster: Node) {
        this._monsterList.push(monster);
    }

    /**
     * 查看是否有怪物在射击范围内,在就转向怪物
     */
    private _checkMonster() {
        let monster: Node = null as unknown as Node;
        let distance = 10;
        let pos = this.node.worldPosition;
        let mPos: Vec3 = new Vec3();
        //找最近的mongster
        for (let i = 0; i < this._monsterList.length; i++) {
            mPos.set(this._monsterList[i].worldPosition);
            let out = new Vec3();
            Vec3.subtract(out, pos, mPos);
            let tempLen = out.length();
            if (tempLen <= distance) {
                monster = this._monsterList[i];
                break;
            }
        }
        if (!monster) return;

        let radius = Math.atan2(pos.x - mPos.x, pos.z - mPos.z);
        let angle = radius * 180 / Math.PI;
        let euler = this.node.eulerAngles;
        let yy = angle - 180;
        //转到同正负,播放转向动画好看一点
        if (yy * euler.y < 0) {
            if (euler.y > 0) {
                yy += 360;
            }
            else {
                yy -= 360;
            }
        }
        let v3 = new Vec3(euler.x, yy, euler.z);
        tween(this.node).to(0.3, { eulerAngles: v3 }).start();
    }

}


