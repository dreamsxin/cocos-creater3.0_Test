
import { _decorator, Component, Node, LayoutComponent, Prefab, UITransformComponent, Vec3, find } from 'cc';
import { clientEvent } from '../framwork/clientEvent';
import { Constant } from '../framwork/constant';
import { ArcheryCamera } from './archeryCamera';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = BloadBar
 * DateTime = Sun Sep 12 2021 16:59:24 GMT+0700 (印度尼西亚西部时间)
 * Author = zfs533
 * FileBasename = bloadBar.ts
 * FileBasenameNoExtension = bloadBar
 * URL = db://assets/script/joystickarchery/bloadBar.ts
 * ManualUrl = https://docs.cocos.com/creator/3.3/manual/zh/
 *
 */

@ccclass('BloadBar')
export class BloadBar extends Component {

    @property(Prefab)
    public pbLine: Prefab = null!//中间线预制体

    @property(LayoutComponent)
    public layoutContainer: LayoutComponent = null!;//container节点的layout组件

    @property(UITransformComponent)
    public curBloodBar: UITransformComponent = null!;//血量进度条的UI组件

    @property(UITransformComponent)
    public whiteBar: UITransformComponent = null!;//白色进度条的UI组件

    private _followRole: Node = null!//跟随对象
    private _totalWight: number = 102;//血条长度(宽度)
    private _totalBlood: number = 500;//总的血量
    private _maxItemBlood: number = 200;//每隔血条
    private _minBloodBarItemWidth: number = 10;//最小单个血块宽度
    private _bloodBarWidth: number = 0;//当前整体血条宽度
    private _curPos: Vec3 = new Vec3()!;//当前血条位置
    onLoad() {
        clientEvent.on(Constant.EVENT_TYPE.CarmeraRole, this._setFloowRole, this);
    }

    onDestroy() {
        clientEvent.off(Constant.EVENT_TYPE.CarmeraRole, this._setFloowRole, this);
    }

    start() {
        //UI层级
        this.node.setSiblingIndex(0);

    }

    _setFloowRole(role: Node) {
        this._followRole = role;
    }

    public show() {
        let totalBlood = this._totalBlood;
        //血块数量
        let bloodItemNum = Math.ceil(totalBlood / this._maxItemBlood);
        //当前血量条最小长度
        this._bloodBarWidth = this._minBloodBarItemWidth * bloodItemNum;
    }

    update(deltaTime: number) {
        if (!this._followRole || !ArcheryCamera.mainCamera) return;
        ArcheryCamera.mainCamera.convertToUINode(this._followRole.worldPosition, find("Canvas") as Node, this._curPos);
        this.node.setPosition(this._curPos);
    }
}

