
import { _decorator, Component, Node, Prefab, Vec3, UITransformComponent } from 'cc';
import { clientEvent } from '../../framework/clientEvent';
import { Constant } from '../../framework/constant';
import { PoolManager } from '../../framework/poolManager';
import { resourceUtil } from '../../framework/resourceUtil';
import { elementData } from '../../net/globalUtils';
import { Element } from './element';
const { ccclass, property } = _decorator;
@ccclass('ElementManager')
export class ElementManager {
    static _instance: ElementManager;

    public elements: Element[][] = [];//所有element列表

    public twoChange: Element[] = [];//交换的两个element

    private _isMoving: boolean = false;
    private _hor: number = 10;//行
    private _ver: number = 10;//列

    public static get Inst() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new ElementManager();
        this._instance.init();
        return this._instance;
    }

    public async init() {
        clientEvent.on(Constant.EVENT_TYPE.SelectedElement, this._evtSelectedElement, this);
        let element: Prefab = await resourceUtil.loadNormalRes('element')
        this._layoutElement(element);
    }

    /**
     * 初始化，排列
     * @param {Prefab} element 
     */
    private _layoutElement(element: Prefab) {
        for (let i = 0; i < this._hor; i++) {
            this.elements.push([]);
            for (let j = 0; j < this._ver; j++) {
                let ele: Node = PoolManager.getNode(element);
                let w = ele.getComponent(UITransformComponent).width;
                let pos = new Vec3(-750 / 2 + w / 2 + i * w, -1330 / 2 + w / 2 + j * w);
                ele.setPosition(pos);
                clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, ele);
                let dt = this._getData(i, j);
                let script = ele.getComponent(Element);
                let type: number = Math.floor(Math.random() * 4);
                script.init(dt, type);
                this.elements[i][j] = script;
            }
        }
    }

    /**
     * 基础数据
     * @param {number} i 水平
     * @param {number} j 垂直
     * @returns 
     */
    private _getData(i: number, j: number): elementData {
        let dt: elementData = {
            x: i, y: j,
        }
        return dt;
    }

    /**
     * 接收滑动的两个滑块
     * @param {Element}  element 
     * @returns 
     */
    private _evtSelectedElement(element: Element) {
        let bool = this.twoChange.find((item: Element) => { return (element.getData().x == item.getData().x && element.getData().y == item.getData().y) });
        if (bool || this._isMoving || !this._jugementPushCondition(element)) return;
        this.twoChange.push(element);

        if (this.twoChange.length == 2) {
            this._startMove();
        }
    }

    /**
     * 排除对角线的element被选中
     * @param {Element}  element 
     */
    private _jugementPushCondition(element: Element) {
        if (this.twoChange.length > 0) {
            let item = this.twoChange[0];
            if (item.data.x != element.data.x && item.data.y != element.data.y) {
                return false;
            }
        }
        return true;
    }

    /**
     * 清楚当前的选择的两个滑块
     */
    public cleartwoChange() {
        this.twoChange.splice(0);
    }

    /**
     * 移动滑块
     */
    private _startMove() {
        this._isMoving = true;
        let item1 = this.twoChange[0];
        let item2 = this.twoChange[1];
        //交换数据
        this._changeData(item1, item2);
        let callFunc = async () => {
            let isHave = await this._startCheck();
            //满足消除条件则返回，否则还原
            if (isHave) {
                this._isMoving = false;
                return;
            }
            this._changeData(item1, item2);
            item1.moveTo(item2);
            item2.moveTo(item1, () => { this._isMoving = false });
        }
        item1.moveTo(item2);
        item2.moveTo(item1, callFunc);

    }

    /**
     * 两两交换数据
     * @param {Element两两交换数据} item1 
     * @param {Element} item2 
     */
    private _changeData(item1: Element, item2: Element) {
        //2:数据交换
        let temp = item1.data;
        item1.data = item2.data;
        item2.data = temp;

        //1:位置交换
        let x1 = item1.data.x;
        let y1 = item1.data.y;
        let x2 = item2.data.x;
        let y2 = item2.data.y;
        let pTemp = this.elements[x1][y1];
        this.elements[x1][y1] = this.elements[x2][y2]
        this.elements[x2][y2] = pTemp;
    }

    /**
     * 开始检测是否有满足消除条件的存在
     * @returns bool
     */
    private async _startCheck(): Promise<boolean> {
        return new Promise(resolve => {
            let samelist = [];//满足条件的列表
            let bool: boolean = true;
            for (let i = 0; i < this._hor; i++) {
                for (let j = 0; j < this._ver; j++) {
                    let item = this.elements[i][j];
                    if (!item || this._checkExist(item, samelist)) continue;
                    let hor: Element[] = this._checkHorizontal(item);
                    let ver: Element[] = this._checkVertical(item);
                    hor = hor.concat(ver);
                    if (hor.length >= 3) {
                        samelist.push(hor);
                    }
                }
            }
            console.log("length========> " + samelist.length);
            this._handleSamelist(samelist);
            resolve(bool);
        })
    }

    /**
     * 是否已经加入到列表中了
     * @param {Element} item 
     * @param {Element} samelist 
     * @returns 
     */
    private _checkExist(item: Element, samelist: any[]) {
        for (let i = 0; i < samelist.length; i++) {
            for (let j = 0; j < samelist[i].length; j++) {
                let ele: Element = samelist[i][j];
                if (ele.data.x == item.data.x && ele.data.y == item.data.y) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 以当前滑块为中心沿水平方向检查
     * @param {Element} item 
     */
    private _checkHorizontal(item: Element): Element[] {
        let arr: Element[] = [item];
        let startX = item.data.x;
        let startY = item.data.y;
        // 右边
        for (let i = startX + 1; i < this._hor; i++) {
            let ele = this.elements[i][startY];
            if (!ele) break;
            if (ele.type == item.type) {
                arr.push(ele);
            }
            else {
                break;
            }
        }
        // 左边
        for (let i = startX - 1; i >= 0; i--) {
            if (i < 0) break;
            let ele = this.elements[i][startY];
            if (!ele) break;
            if (ele.type == item.type) {
                arr.push(ele);
            }
            else {
                break;
            }
        }
        return arr;
    }

    /**
     * 以当前滑块为中心沿竖直方向检查
     * @param {Element} item 
     */
    private _checkVertical(item: Element): Element[] {
        let arr: Element[] = [];
        let startX = item.data.x;
        let startY = item.data.y;
        // 上边
        for (let i = startY + 1; i < this._ver; i++) {
            let ele = this.elements[startX][i];
            if (!ele) break;
            if (ele.type == item.type) {
                arr.push(ele);
            }
            else {
                break;
            }
        }
        // 下边
        for (let i = startY - 1; i >= 0; i--) {
            if (i < 0) break;
            let ele = this.elements[startX][i];
            if (!ele) break;
            if (ele.type == item.type) {
                arr.push(ele);
            }
            else {
                break;
            }
        }
        return arr;
    }

    /**
     * 去重后的数组，进一步判断每一组元素是否合法
     * @param samelist [Element[]]
     * @returns 
     */
    private _handleSamelist(samelist: any[]) {
        if (samelist.length < 1) return;
        //0:去掉不合法的
        samelist = this._jugetLegitimate(samelist);
        console.log("length2=> " + samelist.length);
        //1:移除
        for (let i = 0; i < samelist.length; i++) {
            let item = samelist[i];
            for (let j = 0; j < item.length; j++) {
                let ele: Element = item[j];
                ele.destoryElement();
                this.elements[ele.data.x][ele.data.y] = null;
            }
        }
        //2:补缺
    }

    /**
     * 去掉不合法的
     * @param samelist  [Element[]]
     */
    private _jugetLegitimate(samelist: any[]) {
        let arr: any[] = [];
        for (let i = 0; i < samelist.length; i++) {
            let itemlist = samelist[i];
            let bool: boolean = this._startJuge(itemlist);
            if (bool) {
                arr.push(itemlist);
            }
        }
        return arr;
    }

    private _startJuge(list: Element[]): boolean {
        let bool = false;
        let len = list.length;
        switch (len) {
            case 3:
                bool = this._atTheSameHorOrVer(list);
                break;

            case 4:
                bool = this._atTheSameHorOrVer(list);
                break;

            case 5:
                bool = this._atTheSameHorOrVer(list);
                if (!bool) {
                    bool = this._atLeastThreeSameHorAndVer(list);
                }
                break;

            case 6:
                bool = this._atLeastThreeSameHorAndVer(list);
                break;

            case 7:
                bool = this._atLeastThreeSameHorAndVer(list);
                break;

            default://全在行或者列
                bool = this._atTheSameHorOrVer(list);
                break;

        }
        return bool;
    }

    /**
     * 处在同一行/或者同一列
     * @param list 
     * @returns 
     */
    private _atTheSameHorOrVer(list: Element[]): boolean {
        let item = list[0];
        let bool = true;
        //同一列
        for (let i = 0; i < list.length; i++) {
            if (item.data.x != list[i].data.x) {
                bool = false;
                break;
            }
        }
        if (bool) return bool;
        bool = true;
        //同一行
        for (let i = 0; i < list.length; i++) {
            if (item.data.y != list[i].data.y) {
                bool = false;
                break;
            }
        }
        return bool;
    }

    /**
     * 至少有三个同行且三个同列
     * @param list 
     * @returns 
     */
    private _atLeastThreeSameHorAndVer(list: Element[]): boolean {
        let bool = false;
        let count = 0;
        //同一列
        for (let i = 0; i < list.length; i++) {
            let item1 = list[i];
            for (let j = 0; j < list.length; j++) {
                let item2 = list[j];
                if (item1.data.x == item2.data.x) {
                    count++;
                    break;
                }
            }
        }
        if (count < 3) return bool;
        count = 0;
        //同一行
        for (let i = 0; i < list.length; i++) {
            let item1 = list[i];
            for (let j = 0; j < list.length; j++) {
                let item2 = list[j];
                if (item1.data.y == item2.data.y) {
                    count++;
                    break;
                }
            }
        }
        if (count < 3) return bool;
        return true;
    }
}


//todo  4个5个一组的还需要进一步处理，将满足条件的拆分出来