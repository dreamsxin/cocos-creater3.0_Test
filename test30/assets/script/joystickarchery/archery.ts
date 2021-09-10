
import { _decorator, Component, Node, Vec3, SkeletalAnimationComponent, Enum } from 'cc';
import { clientEvent } from '../framwork/clientEvent';
import { Constant } from '../framwork/constant';
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
    @property(SkeletalAnimationComponent)
    anim: SkeletalAnimationComponent = undefined as unknown as SkeletalAnimationComponent;
    private _speed: number = 0.1;
    private _isMoving: boolean = false;
    private _originPos: Vec3 = new Vec3();
    onLoad() {
        clientEvent.on(Constant.EVENT_TYPE.StartMoving, this._startMoving, this);
        clientEvent.on(Constant.EVENT_TYPE.MoveEnd, this._moveEnd, this);
        clientEvent.dispatchEvent(Constant.EVENT_TYPE.CarmeraRole, this.node);
        this._originPos = this.node.getPosition();
    }
    onDestroy() {
        clientEvent.off(Constant.EVENT_TYPE.StartMoving, this._startMoving, this);
        clientEvent.off(Constant.EVENT_TYPE.MoveEnd, this._moveEnd, this);
    }

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
    }

    private _moveEnd() {
        this._isMoving = false;
        this._playActions(AnimClip.idle);
    }

    private _playActions(index: number) {
        this.anim.play(this.anim.clips[index]?.name);
    }
}


