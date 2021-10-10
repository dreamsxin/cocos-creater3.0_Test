
import { _decorator, Component, Node, Label, UITransformComponent, Vec3, v2, Vec2, tween, Sprite, Color, } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { Constant } from '../../framework/constant';
import { PoolManager } from '../../framework/poolManager';
import { elementData } from '../../net/globalUtils';
const { ccclass, property } = _decorator;

@ccclass('Element')
export class Element extends Component {
    private _idx: number = 0;
    public type: number = 0;//类型
    public data: elementData = null;
    private _width: number = 0;

    onLoad() {
        let trans = this.node.getComponent(UITransformComponent);
        this._width = trans.width;
        clientEvent.on(Constant.EVENT_TYPE.TouchElement, this._evtTouchElement, this);
    }

    start() {
        this.node.getChildByName('lbtp').getComponent(Label).string = this.data.x + `-${this.type}-` + this.data.y;
        let color = [
            Color.CYAN,
            Color.RED,
            Color.GREEN,
            Color.YELLOW,
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
    _evtTouchElement(pos: Vec3) {
        let lp = this.node.getWorldPosition();
        let distance = Vec3.distance(pos, lp);
        if (distance < this._width * Constant.screenScale) {
            //选中将自己发送出去
            clientEvent.dispatchEvent(Constant.EVENT_TYPE.SelectedElement, this);
        }
    }

    public getData() {
        return this.data;
    }

    setData(i: number, j: number) {
        this.data.x = i;
        this.data.y = j;
    }

    /**
     * 滑动移动
     * @param otherEle
     * @param cb 
     */
    public moveTo(otherEle: Element, cb?: Function) {
        let pos = otherEle.node.getPosition();
        this.node.getChildByName('lbtp').getComponent(Label).string = this.data.x + `-${this.type}-` + this.data.y;
        tween(this.node).to(0.5, { position: pos }, { easing: 'smooth' }).call(() => {
            if (cb) cb();
        }).start();
    }

    /**
     * 移除/回收
     */
    public destoryElement() {
        PoolManager.setNode(this.node);
    }
}

