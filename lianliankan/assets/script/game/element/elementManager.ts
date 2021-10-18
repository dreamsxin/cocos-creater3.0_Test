
import { _decorator, Component, Node, Prefab, Vec3, UITransformComponent } from 'cc';
import { DataManager } from '../../data/dataManager';
import { clientEvent } from '../../framework/clientEvent';
import { Constant } from '../../framework/constant';
import { PoolManager } from '../../framework/poolManager';
import { resourceUtil } from '../../framework/resourceUtil';
import { elementData, levelData } from '../../net/globalUtils';
import { Ppath } from '../astar/pPath';
import { PlayerData } from '../player/playerData';
import { Element } from './element';
const { ccclass, property } = _decorator;


export enum Direction {
    up = 0,
    right,
    down,
    left,
}

@ccclass('ElementManager')
export class ElementManager {
    static _instance: ElementManager;

    public elements: Element[][] = [];//所有element列表

    public twoChange: Element[] = [];//交换的两个element
    private _elementPre: Prefab = null;
    private _linePre: Prefab = null;
    private _hor: number = 10;//行
    private _ver: number = 10;//列
    private _countIdx: number = 0;//计数，下落次数，所有下落动作结束再次检测，直到没有满足条件的滑块为止
    public tipsCount: number = 0;//玩家一定时间无操作即提示玩家，时间计数
    private _fillCount: number = 0;//当前关卡可以掉落的新滑块个数

    private _levelData: levelData = null;

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
        this._levelData = PlayerData.Inst.getLevelData();
        this._hor = this._levelData.hor;
        this._ver = this._levelData.ver;
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
     * 获取线条
     * @returns 滑块
     */
    public async getLineElement(): Promise<Node> {
        return new Promise(async resolve => {
            if (!this._linePre) {
                this._linePre = await resourceUtil.loadNormalRes('line');
            }
            let line: Node = PoolManager.getNode(this._linePre);
            resolve(line);
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
                let pos = new Vec3(-this._hor * w / 2 + w / 2 + i * w, -this._ver * w / 2 + j * w + (this._ver - 1) * w);
                ele.setPosition(pos);
                clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, ele);
                let dt = this._getData(i, j + this._ver - 1);
                let script = ele.getComponent(Element);
                let type: number = Math.floor(Math.random() * Constant.ElementKinds);
                script.init(dt, type);
                this.elements[i][j] = script;
                script.moveDown(this._ver - 1, async () => {
                    this._countIdx--;
                    if (this._countIdx == 0) {
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
        if (this.twoChange.length >= 2) {
            this.twoChange.splice(0);
        }
        let bool = this.twoChange.find((item: Element) => { return (element.getData().x == item.getData().x && element.getData().y == item.getData().y) });
        if (bool) return;
        this.twoChange.push(element);
        if (this.twoChange.length == 2) {
            this._startCheck();
        }
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
    private async _startCheck() {
        this.twoChange.sort((a, b) => { return a.data.x - b.data.x });
        let item1 = this.twoChange[0];
        let item2 = this.twoChange[1];
        let bool1: boolean = this._checkElementAround(item1);
        let bool2: boolean = this._checkElementAround(item2);
        if (bool1 && bool2) {
            if (item1.type == item2.type) {
                //画线
                Ppath.Inst.findWay(item1, item2);
                //消除
                item1.destoryElement();
                item2.destoryElement();
                this.elements[item1.data.x][item1.data.y] = null;
                this.elements[item2.data.x][item2.data.y] = null;
                this._checkDownAndFill();
                this.tipsCount = 0;
            }
            else {
                this.twoChange.splice(0);
                this.twoChange.push(item2);
            }
        }
    }

    /**
     *   检测指定滑块四周是否空缺
     * @param itemlist 
     * @returns 
     */
    private _checkElementAround(item: Element): boolean {
        let dt = item.data;
        let bool: boolean = false;
        if (dt.x == 0 || dt.x == this._hor - 1 || dt.y == 0 || dt.y == this._ver - 1) {
            bool = true;
        }
        else {
            let list = [
                this.elements[dt.x - 1][dt.y],
                this.elements[dt.x + 1][dt.y],
                this.elements[dt.x][dt.y - 1],
                this.elements[dt.x][dt.y + 1],
            ]
            let count: number = 0;
            for (let i = 0; i < list.length; i++) {
                if (list[i]) {
                    count++;
                }
            }
            bool = count == 4 ? false : true;
        }
        return bool;
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
     * 向下掉落，不差
     * @returns 
     */
    private async _checkDownAndFill() {
        //1:向下掉落,只需要检测竖直方向，计算出每个每个滑块的下面有多少个空位子，空位子的个数极为下落的位置
        for (let i = 0; i < this._hor; i++) {
            for (let j = 0; j < this._ver; j++) {
                let item = this.elements[i][j];
                if (item) {
                    this._checkVerticalEmpty(item);
                }
            }
        }
        //2:补差,每一列空多少个位置就不多少个滑块
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
            if (this._fillCount >= this._levelData.nd) {
                resolve(null);
                return;
            }
            let sub = this._ver - count;
            for (let i = 0; i < count; i++) {
                if (this._fillCount >= this._levelData.nd) {
                    resolve(null);
                    return;
                }
                let ele = await this.getNewElement();
                let w = ele.getComponent(UITransformComponent).width;
                let j = this._ver + i;
                let pos = new Vec3(-this._hor * w / 2 + w / 2 + hor * w, -this._ver * w / 2 + j * w);
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
                    }
                });
                this._fillCount++;
            }
            resolve(null);
        });
    }

    /**
     * 提示
     * @returns 
     */
    private _evtGetTips(isShow: boolean) {
        let tipsList = [];
        let func = (item1: Element) => {
            for (let i = 0; i < this._hor; i++) {
                for (let j = 0; j < this._ver; j++) {
                    let item2 = this.elements[i][j];
                    if (!item2) continue;
                    if (item1.data.x == item2.data.x && item1.data.y == item2.data.y) { continue; }
                    let bool: boolean = this._checkElementAround(item2);
                    if (!bool) continue;
                    if (this._checkExist(item2, tipsList)) continue;
                    if (item1.type == item2.type) {
                        return item2;
                    }
                }
            }
            return false;
        }

        for (let i = 0; i < this._hor; i++) {
            for (let j = 0; j < this._ver; j++) {
                let item = this.elements[i][j];
                if (!item) continue;
                let bool: boolean = this._checkElementAround(item);
                if (!bool) continue;
                if (this._checkExist(item, tipsList)) continue;
                let temp = [item];
                let two = func(item);
                if (two) {
                    temp.push(two);
                    tipsList.push(temp);
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
                Ppath.Inst.findWay(lt[0], lt[1]);
            }
        }
        else {
            //没有可以消除的组合了
            this._relayoutElement();
        }
    }

    /**
     * 没有可消除的对象了，重新向排列
     */
    private async _relayoutElement() {
        this.tipsCount = 0;
        for (let i = 0; i < this._hor; i++) {
            for (let j = 0; j < this._ver; j++) {
                let item = this.elements[i][j];
                if (item) item.destoryElement();
            }
        }
        await this._layoutElement()
    }

    public getVer() {
        return this._ver;
    }
}