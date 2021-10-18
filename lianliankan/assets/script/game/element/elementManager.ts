
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
                // await this._drawLine(item1, item2);
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
     * 画线,item1---->item2
     * @param item1 
     * @param item2 
     * @returns 
     */
    private async _drawLine(item1: Element, item2: Element): Promise<any> {
        return new Promise(async resove => {
            //计数方向
            let direction1 = this._getEmptyDirection(item1);
            let direction2 = this._getEmptyDirection(item2);
            //先画起点和终点
            await this._startDrawLine(item1, direction1);
            await this._startDrawLine(item2, direction2);
            //再画中间空缺位置
            await this._startDrawCenterLine(item1, item2, direction1, direction2);
            resove(null);
        });
    }
    private async _startDrawCenterLine(item1: Element, item2: Element, direction1: number, direction2: number) {
        let w: number = item1.getWidth();
        let pos1 = item1.node.getPosition();
        let pos2 = item2.node.getPosition();
        if (direction1 == direction2) {
            await this._startSameDirection(item1, item2, direction1);
            return;
        }
        let lnx: number = item1.data.x - item2.data.x;//lnx:linenumberX
        let dt = item1.data//取左边那个
        let dt2 = item2.data;//取右边那个
        let count1 = 0;
        let count2 = 0;
        let y = 0;
        let posY = 0;
        let data: { count: number, x: number } = null;
        console.log('direction1: ' + direction1 + "  direction2: " + direction2)
        switch (direction1) {
            case Direction.left:
                if (direction2 == Direction.up) {
                    y = this._checkEmptyHor(item2.data, Direction.left, item1.data);
                    lnx = Math.abs(item1.data.x - item2.data.x) + 1;//lnx:linenumberX
                    //水平方向
                    posY = -this._ver * w / 2 + y * w + w / 2 + w;
                    if (y == 0) {
                        y = dt.y > dt2.y ? dt.y : dt2.y;
                        posY = -this._ver * w / 2 + y * w + w / 2 + w;
                    }

                    //水平方向
                    await this._drawLineHor(lnx, w, posY, pos1, Direction.left);
                    //竖直方向
                    count1 = y - dt.y == 0 ? y - dt.y : y - dt.y + 1;
                    count2 = y - dt2.y == 0 ? y - dt2.y : y - dt2.y + 1;
                    pos2.x += w;
                    await this._drawLineVer(count1, count2, w, pos1, pos2, Direction.left);
                }
                else if (direction2 == Direction.right) {
                    data = this._checkEmptyVer2({ x: dt.x - 1, y: dt.y }, Direction.right, { x: dt2.x + 1, y: dt2.y }); //{ count: count, x: xx };// 返回竖直方向和x终点
                    lnx = Math.abs(dt.x - dt2.x) + 2;//lnx:linenumberX
                    y = data.count + (dt.y > dt2.y ? dt.y : dt2.y);
                    posY = -this._ver * w / 2 + y * w + w / 2;
                    console.log('y=> ' + y + ' data=> ' + JSON.stringify(data));
                    //水平方向
                    for (let i = 0; i < lnx; i++) {
                        let line = await this.getLineElement();
                        clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, line);
                        let lineTrans = line.getComponent(UITransformComponent);
                        lineTrans.setContentSize(w, 2);
                        let posOrg = pos1;
                        let pos = new Vec3(posOrg.x + w * (i) - w / 2, posY, 0);
                        if (dt.y < dt2.y) {
                            pos.set(posOrg.x + w * (i) - w / 2, posY - (dt2.y - dt.y) * w, 0);
                        }
                        line.setPosition(pos);
                    }
                    //down
                    for (let i = 0; i < data.count; i++) {
                        let line = await this.getLineElement();
                        clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, line);
                        let lineTrans = line.getComponent(UITransformComponent);
                        lineTrans.setContentSize(2, w);
                        let posOrg = pos1;
                        let pos = new Vec3(posOrg.x - w, posOrg.y + (w * (i + 1)) - w / 2, 0);
                        line.setPosition(pos);
                    }
                    count1 = dt.y > dt2.y ? (dt.y - dt2.y + data.count) : (dt.y + data.count - dt2.y);
                    for (let i = 0; i < count1; i++) {
                        let line = await this.getLineElement();
                        clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, line);
                        let lineTrans = line.getComponent(UITransformComponent);
                        lineTrans.setContentSize(2, w);
                        let posOrg = pos2;
                        let pos = new Vec3(posOrg.x + w, posOrg.y + (w * (i + 1)) - w / 2, 0);
                        line.setPosition(pos);
                    }
                    break;
                }
                else if (direction2 == Direction.down) {

                }
                break;
            case Direction.right:
                if (direction2 == Direction.down) {
                    data = this._checkEmptyVer(dt.x, Direction.right, dt2.x); //{ count: count, x: xx };// 返回竖直方向和x终点
                    lnx = Math.abs(dt.x - data.x);//lnx:linenumberX
                    if (data.x == this._hor - 1) lnx += 1;
                    lnx--;
                    y = data.count;
                    posY = -this._ver * w / 2 + y * w + w / 2;
                    //水平方向
                    for (let i = 0; i < Math.abs(lnx); i++) {
                        let line = await this.getLineElement();
                        clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, line);
                        let lineTrans = line.getComponent(UITransformComponent);
                        lineTrans.setContentSize(w, 2);
                        let posOrg = pos1;
                        let pos = new Vec3(posOrg.x + w * (i + 1) + w / 2, posY, 0);
                        line.setPosition(pos);
                    }
                    //down
                    let data2 = this._checkEmptyVer(dt2.x, Direction.right, dt2.x);//{ count: count, x: xx };// 返回竖直方向和x终点
                    let lnx2 = Math.abs(data2.x - dt2.x);//lnx:linenumberX
                    if (data2.x == this._hor - 1) lnx2 += 1;
                    //水平方向
                    for (let i = 0; i < Math.abs(lnx2); i++) {
                        let line = await this.getLineElement();
                        clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, line);
                        let lineTrans = line.getComponent(UITransformComponent);
                        lineTrans.setContentSize(w, 2);
                        let posOrg = pos2;
                        let pos = new Vec3(posOrg.x + w * i + w / 2, posOrg.y - (w * (count1 + 1)), 0);
                        line.setPosition(pos);
                    }
                    //竖直方向
                    for (let i = 0; i < data.count + 1; i++) {
                        let line = await this.getLineElement();
                        clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, line);
                        let lineTrans = line.getComponent(UITransformComponent);
                        lineTrans.setContentSize(2, w);
                        let pos = new Vec3(pos1.x + (data.x - dt.x) * w, pos2.y + w * (i - 1) + w / 2, 0);
                        if (data.x == this._hor - 1) {
                            pos = new Vec3(pos1.x + (data.x - dt.x) * w + w, pos2.y + w * (i - 1) + w / 2, 0);
                        }
                        line.setPosition(pos);
                    }
                    for (let i = 0; i < data.count - dt.y; i++) {
                        let line = await this.getLineElement();
                        clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, line);
                        let lineTrans = line.getComponent(UITransformComponent);
                        lineTrans.setContentSize(2, w);
                        let pos = new Vec3(pos1.x + w, pos1.y + w * i + w / 2, 0);
                        line.setPosition(pos);
                    }
                    break;
                }
                else if (direction2 == Direction.left) {
                    data = this._checkEmptyVer2(dt, Direction.right, dt2); //{ count: count, x: xx };// 返回竖直方向和x终点
                    lnx = Math.abs(dt.x - dt2.x) - 2;//lnx:linenumberX
                    y = data.count + (dt.y > dt2.y ? dt.y : dt2.y);
                    posY = -this._ver * w / 2 + y * w + w / 2;
                    //水平方向
                    for (let i = 0; i < lnx; i++) {
                        let line = await this.getLineElement();
                        clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, line);
                        let lineTrans = line.getComponent(UITransformComponent);
                        lineTrans.setContentSize(w, 2);
                        let posOrg = pos1;
                        let pos = new Vec3(posOrg.x + w * (i) + w + w / 2, posY, 0);
                        if (data.count != 0 && dt2.y > dt.y) {
                            pos = new Vec3(posOrg.x + w * (i) + w + w / 2, posY - (dt2.y - dt.y) * w, 0);
                        }
                        line.setPosition(pos);
                    }
                    //down
                    if (lnx == 0 || data.count == 0) {
                        for (let i = 0; i < Math.abs(dt2.y - dt.y); i++) {
                            let line = await this.getLineElement();
                            clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, line);
                            let lineTrans = line.getComponent(UITransformComponent);
                            lineTrans.setContentSize(2, w);
                            let posOrg = dt.y > dt2.y ? pos2 : pos1;
                            let pos = new Vec3(pos1.x + w, posOrg.y + w / 2 + (w * (i)), 0);
                            if (data.count == 0) {
                                if (dt.y > dt2.y) {
                                    pos.set(pos2.x - w, posOrg.y + w / 2 + (w * (i)), 0);
                                }
                                else {
                                    pos.set(pos1.x + w, posOrg.y + w / 2 + (w * (i)), 0);
                                }
                            }
                            line.setPosition(pos);
                        }
                        break;
                    }

                    for (let i = 0; i < data.count; i++) {
                        let line = await this.getLineElement();
                        clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, line);
                        let lineTrans = line.getComponent(UITransformComponent);
                        lineTrans.setContentSize(2, w);
                        let posOrg = pos1;
                        let pos = new Vec3(posOrg.x + w, posOrg.y + (w * (i + 1)) - w / 2, 0);
                        line.setPosition(pos);
                    }
                    count1 = dt.y > dt2.y ? (dt.y - dt2.y + data.count) : (dt.y + data.count - dt2.y);
                    for (let i = 0; i < count1; i++) {
                        let line = await this.getLineElement();
                        clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, line);
                        let lineTrans = line.getComponent(UITransformComponent);
                        lineTrans.setContentSize(2, w);
                        let posOrg = pos2;
                        let pos = new Vec3(posOrg.x - w, posOrg.y + (w * (i + 1)) - w / 2, 0);
                        line.setPosition(pos);
                    }
                    break;
                }
                else if (direction2 == Direction.up) {
                    y = this._checkEmptyHor(item1.data, Direction.right, item2.data);
                    lnx = item1.data.x - item2.data.x;//lnx:linenumberX
                    //水平方向
                    posY = -this._ver * w / 2 + y * w + w / 2 + w;
                    if (y == 0) {
                        y = dt.y > dt2.y ? dt.y : dt2.y;
                        posY = -this._ver * w / 2 + y * w + w / 2 + w;
                    }
                    // pos1.x += w;
                    await this._drawLineHor(Math.abs(lnx) - 1, w, posY, pos1, Direction.right);
                    if (lnx == 0) {
                        count2 = Math.abs(dt.y - dt2.y) + 1;
                        for (let i = 0; i < count2; i++) {
                            let line = await this.getLineElement();
                            clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, line);
                            let lineTrans = line.getComponent(UITransformComponent);
                            lineTrans.setContentSize(2, w);
                            let posOrg = dt.y > dt2.y ? pos2 : pos1;
                            let pos = new Vec3(posOrg.x + w, posOrg.y + (w * (i + 1)) - w / 2, 0);
                            line.setPosition(pos);
                        }
                        break;
                    }
                    //竖直方向
                    count1 = y - dt.y == 0 ? y - dt.y : y - dt.y + 1;
                    count2 = y - dt2.y == 0 ? y - dt2.y : y - dt2.y + 1;
                    pos2.x -= w;
                    await this._drawLineVer(count1, count2, w, pos1, pos2, Direction.right);
                }
                break;

            case Direction.up:
                if (direction2 == Direction.left) {
                    y = this._checkEmptyHor(item2.data, Direction.left, item1.data);
                    lnx = item1.data.x - item2.data.x;//lnx:linenumberX
                    //水平方向
                    posY = -this._ver * w / 2 + y * w + w / 2 + w;
                    if (y == 0) {
                        y = dt.y > dt2.y ? dt.y : dt2.y;
                        posY = -this._ver * w / 2 + y * w + w / 2;
                    }

                    lnx = item1.data.x - item2.data.x + 1;//lnx:linenumberX
                    pos1.x += w;
                    //水平方向
                    await this._drawLineHor(lnx, w, posY, pos1, Direction.left);
                    if (lnx == 0) {
                        count2 = Math.abs(dt.y - dt2.y);
                        for (let i = 0; i < count2; i++) {
                            let line = await this.getLineElement();
                            clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, line);
                            let lineTrans = line.getComponent(UITransformComponent);
                            lineTrans.setContentSize(2, w);
                            let posOrg = dt.y > dt2.y ? pos2 : pos1;
                            let pos = new Vec3(posOrg.x - w, posOrg.y + (w * (i + 1)) - w / 2, 0);
                            line.setPosition(pos);
                        }
                        return;
                    }
                    //竖直方向
                    count1 = y - dt.y == 0 ? y - dt.y : y - dt.y + 1;
                    count2 = y - dt2.y == 0 ? y - dt2.y : y - dt2.y + 1;
                    await this._drawLineVer(count1, count2, w, pos1, pos2, Direction.left);
                }
                else if (direction2 == Direction.right) {
                    y = this._checkEmptyHor(item1.data, Direction.right, item2.data);
                    lnx = item1.data.x - item2.data.x;//lnx:linenumberX
                    console.log('y=1> ' + y);
                    //水平方向
                    posY = -this._ver * w / 2 + y * w + w / 2 + w;
                    if (y == 0) {
                        y = dt.y > dt2.y ? dt.y : dt2.y;
                        posY = -this._ver * w / 2 + y * w + w / 2 + w;
                    }
                    pos1.x -= w;
                    await this._drawLineHor(Math.abs(lnx) + 1, w, posY, pos1, Direction.right);
                    if (lnx == 0) {
                        count2 = Math.abs(dt.y - dt2.y) + 1;
                        for (let i = 0; i < count2; i++) {
                            let line = await this.getLineElement();
                            clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, line);
                            let lineTrans = line.getComponent(UITransformComponent);
                            lineTrans.setContentSize(2, w);
                            let posOrg = dt.y > dt2.y ? pos2 : pos1;
                            let pos = new Vec3(posOrg.x + w, posOrg.y + (w * (i + 1)) - w / 2, 0);
                            line.setPosition(pos);
                        }
                        break;
                    }
                    //竖直方向
                    count1 = y - dt.y == 0 ? y - dt.y : y - dt.y + 1;
                    count2 = y - dt2.y == 0 ? y - dt2.y : y - dt2.y + 1;
                    await this._drawLineVer(count1, count2, w, pos1, pos2, Direction.right);
                }
                else if (direction2 == Direction.down) {
                    let data: { count: number, x: number } = null;
                    data = this._checkEmptyVer(dt.x, Direction.right, dt2.x); //{ count: count, x: xx };// 返回竖直方向和x终点
                    lnx = Math.abs(dt.x - data.x);//lnx:linenumberX
                    if (data.x == this._hor - 1) lnx += 1;
                    y = data.count;
                    posY = -this._ver * w / 2 + y * w + w / 2;
                    //水平方向
                    for (let i = 0; i < Math.abs(lnx); i++) {
                        let line = await this.getLineElement();
                        clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, line);
                        let lineTrans = line.getComponent(UITransformComponent);
                        lineTrans.setContentSize(w, 2);
                        let posOrg = pos1;
                        let pos = new Vec3(posOrg.x + w * i + w / 2, posY, 0);
                        line.setPosition(pos);
                    }
                    //down
                    let data2 = this._checkEmptyVer(dt2.x, Direction.right, dt2.x);//{ count: count, x: xx };// 返回竖直方向和x终点
                    let lnx2 = Math.abs(data2.x - dt2.x);//lnx:linenumberX
                    if (data2.x == this._hor - 1) lnx2 += 1;
                    //水平方向
                    for (let i = 0; i < Math.abs(lnx2); i++) {
                        let line = await this.getLineElement();
                        clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, line);
                        let lineTrans = line.getComponent(UITransformComponent);
                        lineTrans.setContentSize(w, 2);
                        let posOrg = pos2;
                        let pos = new Vec3(posOrg.x + w * i + w / 2, posOrg.y - (w * (count1 + 1)), 0);
                        line.setPosition(pos);
                    }
                    //竖直方向
                    for (let i = 0; i < data.count + 1; i++) {
                        let line = await this.getLineElement();
                        clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, line);
                        let lineTrans = line.getComponent(UITransformComponent);
                        lineTrans.setContentSize(2, w);
                        let pos = new Vec3(pos1.x + (data.x - dt.x) * w, pos2.y + w * (i - 1) + w / 2, 0);
                        if (data.x == this._hor - 1) {
                            pos = new Vec3(pos1.x + (data.x - dt.x) * w + w, pos2.y + w * (i - 1) + w / 2, 0);
                        }
                        line.setPosition(pos);
                    }
                    for (let i = 0; i < data.count - dt.y; i++) {
                        let line = await this.getLineElement();
                        clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, line);
                        let lineTrans = line.getComponent(UITransformComponent);
                        lineTrans.setContentSize(2, w);
                        let pos = new Vec3(pos1.x, pos1.y + w * i + w / 2, 0);
                        line.setPosition(pos);
                    }

                }
                break;
        }
    }

    /**
     * 同方向画线
     * @param item1 
     * @param item2 
     * @param direction1 
     * @param direction2 
     */
    private async _startSameDirection(item1: Element, item2: Element, direction1: number) {
        let w: number = item1.getWidth();
        let pos1 = item1.node.getPosition();
        let pos2 = item2.node.getPosition();
        let lnx: number = item1.data.x - item2.data.x;//lnx:linenumberX
        let cn = Math.abs(lnx) + 1;
        let dt = item1.data//取左边那个
        let dt2 = item2.data;//取右边那个
        let count1 = 0;
        let count2 = 0;
        let y = 0;
        let posY = 0;
        switch (direction1) {
            case Direction.up:
                for (let j = 0; j < cn; j++) {
                    let item = this.elements[dt.x + j][dt.y];
                    if (item) {
                        let num = this._checkEmpty(item.data);
                        count1 = num > count1 ? num : count1;
                    }
                }
                for (let j = 0; j < cn; j++) {
                    let item = this.elements[dt2.x - j][dt2.y];
                    if (item) {
                        let num = this._checkEmpty(item.data);
                        count2 = num > count2 ? num : count2;
                    }
                }
                lnx = item1.data.x - item2.data.x;//lnx:linenumberX
                //水平方向
                for (let i = 0; i < Math.abs(lnx); i++) {
                    let line = await this.getLineElement();
                    clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, line);
                    let lineTrans = line.getComponent(UITransformComponent);
                    lineTrans.setContentSize(w, 2);
                    let posOrg = pos1;
                    let pos = new Vec3(posOrg.x + w * i + w / 2, posOrg.y + (w * (count1 + 1)), 0);
                    line.setPosition(pos);
                }
                //竖直方向
                for (let i = 0; i < count1; i++) {
                    let line = await this.getLineElement();
                    clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, line);
                    let lineTrans = line.getComponent(UITransformComponent);
                    lineTrans.setContentSize(2, w);
                    let pos = new Vec3(pos1.x, pos1.y + (w * (i + 1)) + w / 2, 0);
                    line.setPosition(pos);
                }
                for (let i = 0; i < count2; i++) {
                    let line = await this.getLineElement();
                    clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, line);
                    let lineTrans = line.getComponent(UITransformComponent);
                    lineTrans.setContentSize(2, w);
                    let pos = new Vec3(pos2.x, pos2.y + (w * (i + 1)) + w / 2, 0);
                    line.setPosition(pos);
                }

                break;

            case Direction.right:
                y = this._checkEmptyHor(item1.data, Direction.right, item2.data);
                lnx = item1.data.x - item2.data.x;//lnx:linenumberX
                //水平方向
                posY = -this._ver * w / 2 + y * w + w / 2 + w;
                if (y == 0) {
                    y = dt.y > dt2.y ? dt.y : dt2.y;
                    posY = -this._ver * w / 2 + y * w + w / 2;
                }
                await this._drawLineHor(lnx, w, posY, pos1, Direction.right);
                if (lnx == 0) {
                    count2 = Math.abs(dt.y - dt2.y);
                    for (let i = 0; i < count2; i++) {
                        let line = await this.getLineElement();
                        clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, line);
                        let lineTrans = line.getComponent(UITransformComponent);
                        lineTrans.setContentSize(2, w);
                        let posOrg = dt.y > dt2.y ? pos2 : pos1;
                        let pos = new Vec3(posOrg.x + w, posOrg.y + (w * (i + 1)) - w / 2, 0);
                        line.setPosition(pos);
                    }
                    break;
                }
                //竖直方向
                if (dt.y == y || dt2.y == y) y -= 1;
                count1 = y - dt.y + 1;
                count2 = y - dt2.y + 1;
                await this._drawLineVer(count1, count2, w, pos1, pos2, Direction.right);
                break;

            case Direction.down:
                lnx = item1.data.x - item2.data.x;//lnx:linenumberX
                //水平方向
                for (let i = 0; i < Math.abs(lnx); i++) {
                    let line = await this.getLineElement();
                    clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, line);
                    let lineTrans = line.getComponent(UITransformComponent);
                    lineTrans.setContentSize(w, 2);
                    let posOrg = pos1;
                    let pos = new Vec3(posOrg.x + w * i + w / 2, posOrg.y - (w * (count1 + 1)), 0);
                    line.setPosition(pos);
                }
                break;

            case Direction.left:
                y = this._checkEmptyHor(item2.data, Direction.left, item1.data);
                lnx = item1.data.x - item2.data.x;//lnx:linenumberX
                //水平方向
                posY = -this._ver * w / 2 + y * w + w / 2 + w;
                if (y == 0) {
                    y = dt.y > dt2.y ? dt.y : dt2.y;
                    posY = -this._ver * w / 2 + y * w + w / 2;
                }

                lnx = item1.data.x - item2.data.x;//lnx:linenumberX
                // await this._drawLeft(lnx, w, posY, pos1, pos2, count1, count2, dt, dt2, y);
                //水平方向
                await this._drawLineHor(lnx, w, posY, pos1, Direction.left);
                if (lnx == 0) {
                    count2 = Math.abs(dt.y - dt2.y);
                    for (let i = 0; i < count2; i++) {
                        let line = await this.getLineElement();
                        clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, line);
                        let lineTrans = line.getComponent(UITransformComponent);
                        lineTrans.setContentSize(2, w);
                        let posOrg = dt.y > dt2.y ? pos2 : pos1;
                        let pos = new Vec3(posOrg.x - w, posOrg.y + (w * (i + 1)) - w / 2, 0);
                        line.setPosition(pos);
                    }
                    return;
                }
                //竖直方向
                if (dt.y == y || dt2.y == y) y -= 1;
                count1 = y - dt.y + 1;
                count2 = y - dt2.y + 1;
                await this._drawLineVer(count1, count2, w, pos1, pos2, Direction.left);
                break;
        }
    }

    private async _drawLineHor(lnx: number, w: number, posY: number, posOrg: Vec3, direction: number) {
        //水平方向
        for (let i = 0; i < Math.abs(lnx); i++) {
            let line = await this.getLineElement();
            clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, line);
            let lineTrans = line.getComponent(UITransformComponent);
            lineTrans.setContentSize(w, 2);
            let pos = new Vec3();
            if (direction == Direction.left) {
                pos.set(posOrg.x + w * i - w / 2, posY, 0)
            }
            else if (direction == Direction.right) {
                pos.set(posOrg.x + w * i + w / 2 + w, posY, 0)
            }
            line.setPosition(pos);
        }
    }

    private async _drawLineVer(count1: number, count2: number, w: number, pos1: Vec3, pos2: Vec3, direction: number) {
        // 竖直方向
        for (let i = 0; i < count1; i++) {
            let line = await this.getLineElement();
            clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, line);
            let lineTrans = line.getComponent(UITransformComponent);
            lineTrans.setContentSize(2, w);
            let pos = new Vec3();
            if (direction == Direction.left) {
                pos.set(pos1.x - w, pos1.y + (w * (i + 1)) - w / 2, 0)
            }
            else if (direction == Direction.right) {
                pos.set(pos1.x + w, pos1.y + (w * (i + 1)) - w / 2, 0)
            }
            line.setPosition(pos);
        }
        for (let i = 0; i < count2; i++) {
            let line = await this.getLineElement();
            clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, line);
            let lineTrans = line.getComponent(UITransformComponent);
            lineTrans.setContentSize(2, w);
            let pos = new Vec3();
            if (direction == Direction.left) {
                pos.set(pos2.x - w, pos2.y + (w * (i + 1)) - w / 2, 0)
            }
            else if (direction == Direction.right) {
                pos.set(pos2.x + w, pos2.y + (w * (i + 1)) - w / 2, 0)
            }
            line.setPosition(pos);
        }
    }

    /**
     * 检测水平方向的空缺
     * @param dt 
     */
    private _checkEmptyHor(dt: elementData, direction: number, dt2: elementData) {
        if (direction == Direction.left) {
            for (let i = this._ver - 1; i >= dt.y; i--) {
                for (let j = dt.x - 1; j >= dt2.x; j--) {
                    let ele = this.elements[j][i];
                    if (ele) {
                        return ele.data.y;
                    }
                }
            }
        }
        else if (direction == Direction.right) {
            for (let i = this._ver - 1; i >= dt.y; i--) {
                for (let j = dt.x + 1; j <= dt2.x; j++) {
                    let ele = this.elements[j][i];
                    if (ele) {
                        return ele.data.y;
                    }
                }
            }
        }
        return 0;
    }

    /**
     * 从指定滑块向上检测，直到空缺结束
     * @param dt 
     * @returns 
     */
    private _checkEmpty(dt: elementData) {
        let count: number = 0;
        for (let i = dt.y + 1; i < this._ver; i++) {
            let item = this.elements[dt.x][i];
            if (item) {
                count++;
            }
            else {
                break;
            }
        }
        return count;
    }
    /**
     * 检测竖排空缺
     * @param x 
     * @param direction 
     */
    private _checkEmptyVer2(dt: elementData, direction: number, dt2: elementData) {
        let count: number = 0;
        let xx: number = dt.x;
        if (direction == Direction.left) {
            for (let i = dt.x + 1; i >= 0; i--) {
                let ct: number = 0;
                xx = i;
                for (let j = dt.y; j < this._ver; j++) {
                    if (this.elements[i][j]) {
                        ct++;
                    }
                }
                if (ct == 0) {
                    break;
                }
                else {
                    count = ct > count ? ct : count;
                }
            }
            return { count: count, x: xx };// 返回竖直方向和x终点
        } else if (direction == Direction.right) {
            for (let i = dt.x + 1; i < this._ver; i++) {
                let ct: number = 0;
                xx = i;
                for (let j = dt.y; j < this._ver; j++) {
                    if (this.elements[i][j]) {
                        ct++;
                    }
                }
                if (ct == 0 || i >= dt2.x - 1) {
                    if (i == dt2.x - 1) {
                        break;
                    }
                }
                else {
                    count = ct > count ? ct : count;
                }
            }
            return { count: count, x: xx };// 返回竖直方向和x终点
        }
    }
    /**
     * 检测竖排空缺
     * @param x 
     * @param direction 
     */
    private _checkEmptyVer(x: number, direction: number, x2: number) {
        let count: number = 0;
        let xx: number = x;
        if (direction == Direction.left) {
            for (let i = x; i >= 0; i--) {
                let ct: number = 0;
                xx = i;
                for (let j = 0; j < this._ver; j++) {
                    if (this.elements[i][j]) {
                        ct++;
                    }
                }
                if (ct == 0) {
                    break;
                }
                else {
                    count = ct > count ? ct : count;
                }
            }
            return { count: count, x: xx };// 返回竖直方向和x终点
        } else if (direction == Direction.right) {
            for (let i = x; i < this._ver; i++) {
                let ct: number = 0;
                xx = i;
                for (let j = 0; j < this._ver; j++) {
                    if (this.elements[i][j]) {
                        ct++;
                    }
                }
                if (ct == 0 && i >= x2) {
                    break;
                }
                else {
                    count = ct > count ? ct : count;
                }
            }
            return { count: count, x: xx };// 返回竖直方向和x终点
        }
    }

    private async _startDrawLine(item: Element, direction: number) {
        let w: number = item.getWidth();
        let line = await this.getLineElement();
        let lineTrans = line.getComponent(UITransformComponent);
        let pos = item.node.getPosition();
        clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, line);
        switch (direction) {
            case Direction.up:
                pos.y += w / 2;
                lineTrans.setContentSize(2, w);
                break;

            case Direction.right:
                pos.x += w / 2;
                lineTrans.setContentSize(w, 2);
                break;

            case Direction.down:
                pos.y -= w / 2;
                lineTrans.setContentSize(2, w);
                break;

            case Direction.left:
                pos.x -= w / 2;
                lineTrans.setContentSize(w, 2);
                break;
        }
        line.setPosition(pos);
    }

    /**
     *  获取滑块空缺方向
     * @param item 
     * @returns 
     */
    private _getEmptyDirection(item: Element) {
        let dt = item.data;
        let direction: number = 0;
        if (dt.y == this._ver - 1) {
            direction = Direction.up;
        }
        else if (dt.x == this._hor - 1) {
            direction = Direction.right;
        }
        else if (dt.y == 0) {
            direction = Direction.down;
        }
        else if (dt.x == 0) {
            direction = Direction.left;
        }
        else {
            let list = [
                this.elements[dt.x][dt.y + 1],
                this.elements[dt.x + 1][dt.y],
                this.elements[dt.x][dt.y - 1],
                this.elements[dt.x - 1][dt.y],
            ]
            for (let i = 0; i < list.length; i++) {
                if (!list[i]) {
                    direction = i;
                    break;
                }
            }
        }
        return direction;
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