
import { _decorator, Component, Node, Vec3, Sprite, Label, tween } from 'cc';
import { clientEvent } from '../framwork/clientEvent';
import { Constant } from '../framwork/constant';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = ArcherySkillBtn
 * DateTime = Fri Sep 10 2021 19:40:58 GMT+0700 (印度尼西亚西部时间)
 * Author = zfs533
 * FileBasename = archerySkillBtn.ts
 * FileBasenameNoExtension = archerySkillBtn
 * URL = db://assets/script/joystickarchery/archerySkillBtn.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

@ccclass('ArcherySkillBtn')
export class ArcherySkillBtn extends Component {
    @property
    idx: number = 0;

    @property(Sprite)
    progressSprite: Sprite = null as unknown as Sprite;

    @property(Label)
    timeLb: Label = null as unknown as Label;

    private _isDownTime: boolean = true;
    private _originScale: Vec3 = new Vec3(1, 1, 1);
    private _clickScale: Vec3 = new Vec3(1.1, 1.1, 1.1);

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this._touchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this._touchEnd, this);
        this.progressSprite.fillRange = 0;
        this.timeLb.node.active = false;
    }

    private _touchStart() {
        if (!this._isDownTime) return;
        this.node.setScale(this._clickScale);
    }
    private _touchEnd() {
        if (!this._isDownTime) return;
        this.node.setScale(this._originScale);
        this._playCountDown();
    }

    private _playCountDown() {
        clientEvent.dispatchEvent(Constant.EVENT_TYPE.Shoot);
        this._isDownTime = false;
        this.progressSprite.fillRange = 1;
        this.timeLb.node.active = true;
        var time = 1;
        this.timeLb.string = time + "";
        this.schedule(() => {
            time--;
            time = time >= 0 ? time : 0;
            this.timeLb.string = time + "";
        }, 0.7, 1);
        tween(this.progressSprite).to(1, { fillRange: 0 }).call(() => {
            this.progressSprite.fillRange = 0;
            this.timeLb.node.active = false;
            this._isDownTime = true;
        }).start();
    }
}
