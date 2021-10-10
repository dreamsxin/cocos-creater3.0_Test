
import { _decorator, Component, Node, SystemEvent, systemEvent, EventTouch, director, find, UITransform, Vec3, UITransformComponent, view } from 'cc';
import { clientEvent } from '../framework/clientEvent';
import { Constant } from '../framework/constant';
import { ElementManager } from './element/elementManager';
const { ccclass, property } = _decorator;


@ccclass('TouchManager')
export class TouchManager extends Component {

    static _instance: TouchManager;

    private _elementLayer: Node = null;

    public static get Inst() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new TouchManager();
        this._instance.init();
        return this._instance;
    }

    init() {
        systemEvent.on(SystemEvent.EventType.TOUCH_START, this._touchStartEvt, this);
        systemEvent.on(SystemEvent.EventType.TOUCH_MOVE, this._touchStartEvt, this);
        systemEvent.on(SystemEvent.EventType.TOUCH_END, this._touchEndEvt, this);
        systemEvent.on(SystemEvent.EventType.TOUCH_CANCEL, this._touchEndEvt, this);
        this._elementLayer = find('Canvas/elementLayer');
    }

    _touchStartEvt(evt: any/*Touch*/) {
        let list = ElementManager.Inst.twoChange;
        if (list.length >= 2) {
            return;
        }

        let p = evt._point;
        //世界坐标转节点坐标
        // let eLayerPos = this._elementLayer.getComponent(UITransformComponent).convertToNodeSpaceAR(new Vec3(p.x, p.y, 0));
        let eLayerPos = new Vec3(p.x / Constant.screenScale, p.y / Constant.screenScale, 0);
        clientEvent.dispatchEvent(Constant.EVENT_TYPE.TouchElement, eLayerPos);
    }
    _touchMoveEvt(evt: any) {

    }
    _touchEndEvt(evt: any) {
        ElementManager.Inst.cleartwoChange();
    }

}
