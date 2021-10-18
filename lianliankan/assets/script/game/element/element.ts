
import { _decorator, Component, Node, Label, UITransformComponent, Vec3, tween, Sprite, Color, color, } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { Constant } from '../../framework/constant';
import { PoolManager } from '../../framework/poolManager';
import { elementData } from '../../net/globalUtils';
import { ElementManager } from './elementManager';
const { ccclass, property } = _decorator;

@ccclass('Element')
export class Element extends Component {
    public type: number = 0;//类型
    public data: elementData = null;
    private _width: number = 0;
    private _isMovingDown: boolean = false;
    private _isMoving: boolean = false;

    onLoad() {
        let trans = this.node.getComponent(UITransformComponent);
        this._width = trans.width;
        this.node.on(Node.EventType.TOUCH_END, this._evtTouchElement, this);
    }

    start() {
        this._debugshow();
        let color = [
            Color.CYAN,
            Color.RED,
            Color.BLUE,
            Color.MAGENTA,
        ]
        this.node.getChildByName('bg').getComponent(Sprite).color = color[this.type];
    }

    /**
     *初始化
     * @param {elementData} dt 
     */
    init(dt: elementData, type: number) {
        this.data = dt;
        this.type = type;
    }

    /**
     * 接收屏幕触摸事件，筛选是否被选中
     * @param {Vec3} pos 
     */
    _evtTouchElement() {
        if (this._isMoving) return;
        if (this._isMovingDown) return;
        //选中将自己发送出去
        clientEvent.dispatchEvent(Constant.EVENT_TYPE.SelectedElement, this);
    }

    public getData() {
        return this.data;
    }

    setData(i: number, j: number) {
        this.data.x = i;
        this.data.y = j;
    }

    /**
     * 滑动移动(交换)
     * @param otherEle
     * @param cb 
     */
    public moveTo(otherEle: Element, cb?: Function) {
        if (this._isMoving) return;
        if (this._isMovingDown) return;
        let pos = otherEle.node.getPosition();
        this._debugshow();
        this._isMoving = true;
        tween(this.node).to(Constant.changeTime, { position: pos }, { easing: 'circOut' }).call(() => {
            this._isMoving = false;
            if (cb) cb();
        }).start();
    }

    /**
     * 移除/回收
     */
    public destoryElement() {
        PoolManager.setNode(this.node);
    }

    /**
     * 向下移动重新排列
     * @param count 
     */
    public moveDown(count: number, cb?: Function) {
        this._isMovingDown = true;
        this.data.y -= count;
        let pos = this.node.getPosition();
        // pos.y -= count * this._width;
        let ver = ElementManager.Inst.getVer();
        pos.y = this.data.y * this._width - ver * this._width / 2 + this._width / 2
        this._debugshow();
        tween(this.node).to(Constant.downTime, { position: pos }, { easing: 'backOut' }).call(() => {
            this._isMovingDown = false;
            if (cb) cb();
        }).start();
    }

    public getMoveState() {
        return this._isMoving || this._isMovingDown;
    }

    private _debugshow() {
        this.node.getChildByName('lbtp').getComponent(Label).string = this.data.x + `-${this.type}-` + this.data.y;
    }

    public showDebug() {
        let bg = this.node.getChildByName('bg');
        tween(bg).to(0.2, { scale: new Vec3(0.5, 0.5, 0.5) }).call(() => {
            tween(bg).to(0.2, { scale: new Vec3(1, 1, 1) }).start();
        }).start();
    }

    public getWidth() {
        return this._width;
    }
}

