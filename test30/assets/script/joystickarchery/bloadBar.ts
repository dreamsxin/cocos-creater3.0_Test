
import { _decorator, Component, Node, LayoutComponent, Prefab, UITransformComponent, Vec3, find, UITransform, size, Size, tween } from 'cc';
import { clientEvent } from '../framwork/clientEvent';
import { Constant } from '../framwork/constant';
import { PoolManager } from '../infinitymap/poolManager';
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
    private _totalBlood: number = 5000;//总的血量
    private _curBlood: number = 5000;//当前血量
    private _ratio: number = 0;//血条长度与血量的比率
    private _maxItemBlood: number = 200;//每隔血条
    private _minBloodBarItemWidth: number = 10;//最小单个血块宽度
    private _bloodBarWidth: number = 0;//当前整体血条宽度
    private _bloodBarHeight: number = 17;//血条高度
    private _curPos: Vec3 = new Vec3()!;//当前血条位置
    onLoad() {
        clientEvent.on(Constant.EVENT_TYPE.CarmeraRole, this._setFloowRole, this);
    }

    onDestroy() {
        clientEvent.off(Constant.EVENT_TYPE.CarmeraRole, this._setFloowRole, this);
    }

    start() {
        //UI层级
        this.node.setSiblingIndex(10);
        this.show();
        this.schedule(() => {
            this._curBlood -= 1000;
            this.show();
        }, 2);
    }

    _setFloowRole(role: Node) {
        this._followRole = role;
    }

    public show() {
        this._refreshCurBlood();
    }

    /**
     * 刷新血条进度
     */
    private _refreshCurBlood() {
        this._curBlood = this._curBlood > 0 ? this._curBlood : this._totalBlood;
        let totalBlood = this._totalBlood;
        //血条长度与血量的比率
        this._ratio = this._totalWight / totalBlood;

        /* ------------- 展示分隔线 ------------- */
        //血块数量  line数量
        let bloodItemNum = Math.ceil(totalBlood / this._maxItemBlood);
        //layout X 偏移 计算每个分割线x位置
        let layoutOffset = totalBlood / bloodItemNum * this._ratio;
        for (let i = 0; i < bloodItemNum; i++) {
            let line = this.layoutContainer.node.children[i];
            if (!line) {
                line = PoolManager.getNode(this.pbLine);
            }
            line.setPosition(new Vec3(layoutOffset * i, 0, 0));
            line.active = false;
            line.parent = this.layoutContainer.node;
            line.getComponent(UITransform)?.setContentSize(1, 10);
            if (i % 5 == 0) {
                line.getComponent(UITransform)?.setContentSize(1, 15);
            }
        }

        /* ------------- 展示当前血量 ------------- */
        let curBlood = this._curBlood;
        let bloodRadi = curBlood / this._totalBlood;
        this._bloodBarWidth = bloodRadi * this._totalWight;
        bloodItemNum = Math.ceil(curBlood / this._maxItemBlood);
        tween(this.whiteBar).to(0.5, { contentSize: new Size(this._bloodBarWidth, this._bloodBarHeight) }).start();
        tween(this.curBloodBar).to(0.2, { contentSize: new Size(this._bloodBarWidth, this._bloodBarHeight) }).start();

        /* 只展示当前血量的分割线 */
        for (let i = 0; i < bloodItemNum; i++) {
            let line = this.layoutContainer.node.children[i];
            if (!line) {
                line = PoolManager.getNode(this.pbLine);
            }
            line.setPosition(new Vec3(layoutOffset * i, 0, 0));
            line.active = true;
            line.parent = this.layoutContainer.node;
            if (i == 0) {//第一个不用显示
                line.active = false;
            }
        }
    }

    update(deltaTime: number) {
        if (!this._followRole || !ArcheryCamera.mainCamera) return;
        ArcheryCamera.mainCamera.convertToUINode(this._followRole.worldPosition, find("Canvas") as Node, this._curPos);
        this.node.setPosition(this._curPos);
    }
}

