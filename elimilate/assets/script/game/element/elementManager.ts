
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
    private _elementPre: Prefab = null;

    private _isMoving: boolean = false;
    private _hor: number = 10;//行
    private _ver: number = 10;//列
    private _countIdx: number = 0;//计数，下落次数，所有下落动作结束再次检测，直到没有满足条件的滑块为止
    public tipsCount: number = 0;//玩家一定时间无操作即提示玩家，时间计数

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
        clientEvent.on(Constant.EVENT_TYPE.GetTips, this._evtGetTips, this);
        Constant.startGame = true;
        this._layoutElement();
    }

    /**
     * 获取新滑块
     * @returns 滑块
     */
    public async getNewElement(): Promise<Node> {
        return new Promise(async resolve => {
            if (!this._elementPre) {
                this._elementPre = await resourceUtil.loadNormalRes('element');
            }
            let ele: Node = PoolManager.getNode(this._elementPre);
            resolve(ele);
        });
    }

    /**
     * 初始化，排列
     * @param {Prefab} element 
     */
    private async _layoutElement() {
        for (let i = 0; i < this._hor; i++) {
            this.elements.push([]);
            for (let j = 0; j < this._ver; j++) {
                this._countIdx++;
                let ele = await this.getNewElement();
                let w = ele.getComponent(UITransformComponent).width;
                let pos = new Vec3(-750 / 2 + w / 2 + i * w, -1330 / 2 + w / 2 + j * w + (this._ver - 1) * w);
                ele.setPosition(pos);
                clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, ele);
                let dt = this._getData(i, j + 9);
                let script = ele.getComponent(Element);
                let type: number = Math.floor(Math.random() * Constant.ElementKinds);
                script.init(dt, type);
                this.elements[i][j] = script;
                script.moveDown(9, async () => {
                    this._countIdx--;
                    if (this._countIdx == 0) {
                        await this._startCheck();
                    }
                });
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
        //所有下落结束后才能下一次交换
        // if (this._countIdx != 0) return;
        this.twoChange.push(element);
        if (this.twoChange.length == 2) {
            this._startChangeMove();
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
            //正在下落的也不能滑动交换
            if (item.getMoveState()) return false;
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
    private _startChangeMove() {
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
            //若是因为消除列表中包含了正在掉落的滑块，则只检测以这两个为中心点展开搜索
            isHave = await this._checkElementAround([item1, item2]);
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
     *   检测指定滑块是否有满足消除条件的存在
     * @param itemlist 
     * @returns 
     */
    private async _checkElementAround(itemlist: Element[]): Promise<boolean> {
        return new Promise(async resolve => {
            let bool: boolean = true;
            let samelist = [];
            for (let i = 0; i < itemlist.length; i++) {
                let item = itemlist[i];
                //优先查找基于该滑块的特殊排列阵型
                let hor: Element[] = this._checkHorizontal(item);
                let ver: Element[] = this._checkVertical(item);
                if (hor.length >= 3 && ver.length >= 3) {
                    hor = hor.slice(1, hor.length);//将自己去掉一个（重复）
                    hor = hor.concat(ver);
                    samelist.push(hor);
                }
            }
            for (let i = 0; i < itemlist.length; i++) {
                let item = itemlist[i];
                //普通单排，同行/同列
                if (this._checkExist(item, samelist)) continue;
                let hor: Element[] = this._checkHorizontal(item);
                let ver: Element[] = this._checkVertical(item);
                hor = hor.concat(ver);
                if (hor.length >= 3) {
                    samelist.push(hor);
                }
            }
            let isDown = await this._checkMovingDown(samelist);
            if (isDown) {
                resolve(false);
                return;
            }
            this._handleSamelist(samelist);
            bool = !!samelist.length;
            resolve(bool);
        });
    }

    /**
     * 开始检测是否有满足消除条件的存在
     * @returns bool
     */
    private async _startCheck(): Promise<boolean> {
        return new Promise(async resolve => {
            let samelist = [];//满足条件的列表
            let bool: boolean = true;

            for (let i = 0; i < this._hor; i++) {
                for (let j = 0; j < this._ver; j++) {
                    let item = this.elements[i][j];
                    if (!item || item.getMoveState()) continue;
                    if (this._checkExist(item, samelist)) continue;
                    //优先查找基于该滑块的特殊排列阵型
                    let hor: Element[] = this._checkHorizontal(item);
                    let ver: Element[] = this._checkVertical(item);
                    if (hor.length >= 3 && ver.length >= 3) {
                        hor = hor.slice(1, hor.length);//将自己去掉一个（重复）
                        hor = hor.concat(ver);
                        samelist.push(hor);
                    }
                }
            }

            for (let i = 0; i < this._hor; i++) {
                for (let j = 0; j < this._ver; j++) {
                    let item = this.elements[i][j];
                    if (!item || item.getMoveState()) continue;
                    //普通单排，同行/同列
                    if (this._checkExist(item, samelist)) continue;
                    let hor: Element[] = this._checkHorizontal(item);
                    let ver: Element[] = this._checkVertical(item);
                    hor = hor.concat(ver);
                    if (hor.length >= 3) {
                        samelist.push(hor);
                    }
                }
            }
            let isDown = await this._checkMovingDown(samelist);
            if (isDown) {
                resolve(false);
                return;
            }
            this._handleSamelist(samelist);
            bool = !!samelist.length;
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
            if (!ele || item.getMoveState()) break;
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
            if (!ele || item.getMoveState()) break;
            if (ele.type == item.type) {
                arr.push(ele);
            }
            else {
                break;
            }
        }
        if (arr.length < 3) return [];
        return arr;
    }

    /**
     * 以当前滑块为中心沿竖直方向检查
     * @param {Element} item 
     */
    private _checkVertical(item: Element): Element[] {
        let arr: Element[] = [item];
        let startX = item.data.x;
        let startY = item.data.y;
        // 上边
        for (let i = startY + 1; i < this._ver; i++) {
            let ele = this.elements[startX][i];
            if (!ele || item.getMoveState()) break;
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
            if (!ele || item.getMoveState()) break;
            if (ele.type == item.type) {
                arr.push(ele);
            }
            else {
                break;
            }
        }
        if (arr.length < 3) return [];
        return arr;
    }

    /**
     * 消除列表中是否有正在下落的滑块，若有则本次交换无效
     * @param samelist 
     */
    private async _checkMovingDown(samelist: any[]) {
        return new Promise(resolve => {
            let bool: boolean = false;
            for (let i = 0; i < samelist.length; i++) {
                let item = samelist[i];
                let downCount: number = 0;
                //查找是否有正在下落的
                for (let j = 0; j < item.length; j++) {
                    let ele: Element = item[j];
                    if (ele.getMoveState()) {
                        downCount++;
                    }
                }
                if (downCount > 0) {
                    bool = true;
                    break;
                }
            }
            resolve(bool);
        });
    }

    /**
     * 结果列表，进一步判断每一组元素是否合法
     * @param samelist [Element[]]
     * @returns 
     */
    private async _handleSamelist(samelist: any[]) {
        if (samelist.length < 1) return;
        this.tipsCount = 0;
        //0:去掉不合法的
        samelist = this._jugetLegitimate(samelist);
        //1:移除
        for (let i = 0; i < samelist.length; i++) {
            let item = samelist[i];
            for (let j = 0; j < item.length; j++) {
                let ele: Element = item[j];
                ele.destoryElement();
                this.elements[ele.data.x][ele.data.y] = null;
            }
        }
        //2:向下掉落,只需要检测竖直方向，计算出每个每个滑块的下面有多少个空位子，空位子的个数极为下落的位置
        for (let i = 0; i < this._hor; i++) {
            for (let j = 0; j < this._ver; j++) {
                let item = this.elements[i][j];
                if (item) {
                    this._checkVerticalEmpty(item);
                }
            }
        }
        //3:补差,每一列空多少个位置就不多少个滑块
        for (let i = 0; i < this._hor; i++) {
            let count: number = 0;//每一列的空位子
            for (let j = 0; j < this._ver; j++) {
                let item = this.elements[i][j];
                if (!item) {
                    count++;
                }
            }
            await this._fillVacancies(i, count);
        }
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
                bool = this._atLeastThreeSameHorAndVer(list);
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

    /**
     * 检测滑块竖直方向下面的空滑块个数
     * @param {Element} ele 
     */
    private _checkVerticalEmpty(ele: Element) {
        let x: number = ele.data.x;
        let y: number = ele.data.y;
        let count: number = 0;
        for (let i = y; i >= 0; i--) {
            let item = this.elements[x][i];
            if (!item) count++;
        }
        if (count == 0) return;
        this._countIdx++;
        //1:位置交换
        let x1 = ele.data.x;
        let y1 = ele.data.y;
        let x2 = ele.data.x;
        let y2 = y - count;
        let pTemp = this.elements[x1][y1];
        this.elements[x1][y1] = this.elements[x2][y2]
        this.elements[x2][y2] = pTemp;
        //向下掉
        ele.moveDown(count, async () => {
            this._countIdx--;
        });
    }

    /** 
     * 填补空缺位置
    */
    private async _fillVacancies(hor: number, count: number) {
        return new Promise(async resolve => {
            let sub = this._ver - count;
            for (let i = 0; i < count; i++) {
                let ele = await this.getNewElement();
                let w = ele.getComponent(UITransformComponent).width;
                let j = this._ver + i;
                let pos = new Vec3(-750 / 2 + w / 2 + hor * w, -1330 / 2 + w / 2 + j * w);
                ele.setPosition(pos);
                clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, ele);
                let dt = this._getData(hor, j);
                let script = ele.getComponent(Element);
                let type: number = Math.floor(Math.random() * Constant.ElementKinds);
                script.init(dt, type);
                this.elements[hor][sub + i] = script;
                this._countIdx++;
                script.moveDown(count, async () => {
                    this._countIdx--;
                    if (this._countIdx == 0) {
                        await this._startCheck();
                    }
                });
            }
            resolve(null);
        });
    }

    /**
     * 提示
     * @returns 
     */
    private async _evtGetTips(isShow: boolean): Promise<Element[]> {
        return new Promise(resolve => {
            let tipsList = [];
            for (let i = 0; i < this._hor; i++) {
                for (let j = 0; j < this._ver; j++) {
                    let item = this.elements[i][j];
                    if (!item) continue;
                    if (this._checkExist(item, tipsList)) continue;
                    //水平方向/竖直方向单独检测
                    let hor: Element[] = this._checkTipsHorizontal(item);
                    let ver: Element[] = this._checkTipVertical(item);
                    if (hor.length >= 3) {
                        tipsList.push(hor);
                    }
                    if (ver.length >= 3) {
                        tipsList.push(ver);
                    }
                    //水平方向+竖直方向同时不为3个的情况下检测
                    if (ver.length > 0 && ver.length < 3 && hor.length > 0 && hor.length < 3) {
                        if (ver[0].type == hor[0].type) {
                            hor = hor.concat(ver);
                            if (hor.length >= 3) {
                                if (hor.length > 3) hor.splice(hor.length - 1, 1);
                                tipsList.push(hor);
                            }
                        }
                    }
                }
            }
            //
            if (tipsList.length > 0) {
                if (isShow) {
                    let rand = Math.floor(Math.random() * tipsList.length);
                    let lt = tipsList[rand];
                    lt = lt ? lt : tipsList[0];
                    for (let j = 0; j < lt.length; j++) {
                        lt[j].showDebug();
                    }
                }
            }
            else {
                //没有可以消除的组合了
                this._relayoutElement();
            }
            resolve(tipsList);
        });
    }

    /**
     * 水平方向检测，筛选出所有提示== =，= ==
     * @param ele 
     */
    private _checkTipsHorizontal(ele: Element) {
        //左边
        let horArr: Element[] = [];
        for (let i = ele.data.x - 1; i >= 0; i--) {
            if (i < 0) break;
            let item = this.elements[i][ele.data.y];
            if (!item) continue;
            if (horArr.length < 1) {
                if (ele.type != item.type) {
                    horArr.push(item);
                }
                else {
                    break;
                }
            }
            else {
                if (item.type == horArr[0].type && ele.type != item.type) {
                    horArr.push(item);
                }
                else {
                    break;
                }
            }
        }
        //右边
        for (let j = ele.data.x + 1; j < this._hor; j++) {
            if (j > this._hor - 1) break;
            let item = this.elements[j][ele.data.y];
            if (!item) continue;
            if (horArr.length < 1) {
                break;
            }
            else {
                if (item.type == horArr[0].type && ele.type != item.type) {
                    horArr.push(item);
                }
                else {
                    break;
                }
            }
        }
        //只需要返回三个即可
        if (horArr.length > 3) horArr.splice(horArr.length - 1, 1);
        return horArr;
    }

    /**
     * 竖直方向检测，筛选出所有提示
     *          +       +
     *                  +
     *          +       
     *          +       +
     * @param ele 
     */
    private _checkTipVertical(ele: Element) {
        //下边
        let verArr: Element[] = [];
        for (let i = ele.data.y - 1; i >= 0; i--) {
            if (i < 0) break;
            let item = this.elements[ele.data.x][i];
            if (!item) continue;
            if (verArr.length < 1) {
                if (ele.type != item.type) {
                    verArr.push(item);
                }
                else {
                    break;
                }
            }
            else {
                if (item.type == verArr[0].type && ele.type != item.type) {
                    verArr.push(item);
                }
                else {
                    break;
                }
            }
        }
        //上边
        for (let j = ele.data.y + 1; j < this._ver; j++) {
            if (j > this._ver - 1) break;
            let item = this.elements[ele.data.x][j];
            if (!item) continue;
            if (verArr.length < 1) {
                break;
            }
            else {
                if (item.type == verArr[0].type && ele.type != item.type) {
                    verArr.push(item);
                }
                else {
                    break;
                }
            }
        }
        if (verArr.length > 3) verArr.splice(verArr.length - 1, 1);
        return verArr;
    }


    /**
     * 没有可消除的对象了，重新向排列
     */
    private async _relayoutElement() {
        for (let i = 0; i < this._hor; i++) {
            for (let j = 0; j < this._ver; j++) {
                let item = this.elements[i][j];
                if (item) item.destoryElement();
            }
        }
        await this._layoutElement()
    }
}