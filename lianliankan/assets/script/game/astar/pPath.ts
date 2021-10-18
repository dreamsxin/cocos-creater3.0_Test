import { Component, v2, v3, Node, Vec3, _decorator, UITransformComponent } from "cc";
import pitem from "./pItem";
import { Element } from '../element/element';
import { levelData } from "../../net/globalUtils";
import { PlayerData } from "../player/playerData";
import { ElementManager } from "../element/elementManager";
import { resourceUtil } from "../../framework/resourceUtil";
import { PoolManager } from "../../framework/poolManager";
import { Constant } from "../../framework/constant";
import { clientEvent } from "../../framework/clientEvent";
const { ccclass, property } = _decorator;
/**
 * 寻路组件
 */
@ccclass('Ppath')
export class Ppath {
    static _instance: Ppath;
    public static get Inst() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new Ppath();
        return this._instance;
    }
    private _distination: Vec3 = new Vec3();

    private _startPos: Vec3 = new Vec3();
    private _openlist: pitem[] = [];
    private _closelist: pitem[] = [];

    private _levelData: levelData = null;

    private _count = 0;

    public findWay(start: Element, end: Element) {
        this._count = 0;
        this._openlist.splice(0);
        this._closelist.splice(0);
        this._levelData = PlayerData.Inst.getLevelData();
        this._startPos.set(start.node.getPosition())
        this._distination.set(end.node.getPosition());
        this._begin();
    }

    async _drawPoint(item: pitem) {
        let linePro = await resourceUtil.loadNormalRes('line');
        let line: Node = PoolManager.getNode(linePro);
        clientEvent.dispatchEvent(Constant.EVENT_TYPE.AddElement, line);
        let lineTrans = line.getComponent(UITransformComponent);
        lineTrans.setContentSize(10, 10);
        line.setPosition(new Vec3(item.x, item.y, 0));
    }

    private _begin() {
        let origin: pitem = this.getPitem();
        origin.F = 0;
        origin.G = 0;
        origin.H = 0;
        origin.x = this._startPos.x;
        origin.y = this._startPos.y;
        let isFined: boolean = false;
        let center: pitem = origin;
        this._openlist.push(center);
        while (!isFined) {
            /* 找最小F值作为新center */
            this._openlist.sort((a, b) => { return a.F - b.F });
            center = this._openlist[0];
            /* 将center从_openlist中移除 */
            this.removeCenter(center);
            this._closelist.push(center);
            for (let i = 0; i < 4; i++) {
                let item: pitem = this.getPitem();
                switch (i) {
                    case 0:/* 上 */
                        item.x = center.x;
                        item.y = center.y + center.height;
                        item.h = item.width;
                        break;
                    case 1:/* 右 */
                        item.x = center.x + center.width;
                        item.y = center.y;
                        item.w = item.width;
                        break;
                    case 2:/* 下 */
                        item.x = center.x;
                        item.y = center.y - center.height;
                        item.h = item.width;
                        break;
                    case 3:/* 左 */
                        item.x = center.x - center.width;
                        item.y = center.y;
                        item.w = item.width;
                        break;
                }
                /* 是否在障碍物上 */
                if (this.isObstacle(item)) {
                    continue;
                }
                /* 是否在选中列表 */
                if (this.isIn_closelist(item)) {
                    continue;
                }
                this._count++;
                if (this._count > 300) { return; }
                /* 是否已经包含在了_openlist中 */
                let itemIn = this.isIn_openlist(item);
                if (!itemIn) {
                    item.parent = center;
                    item.G = center.G + item.value_h;
                    if (item.x != center.x && item.y != center.y) {
                        item.G = center.G + item.value_v;
                    }
                    item.F = this.getF(item);
                    this._openlist.push(item);

                    /* 检查是否已经到终点 */
                    let p1 = v3(item.x, item.y);
                    let p2 = v3(this._distination.x, this._distination.y);
                    let out = new Vec3();
                    Vec3.subtract(out, p1, p2);
                    if (out.length() <= item.width) {
                        isFined = true;
                        this._closelist.push(item);
                        console.log("finish-find-way");
                        let pathArr: pitem[] = [];
                        /* 最终路径 */
                        this.getPath(item, pathArr);
                        let end = new pitem();
                        end.x = this._distination.x;
                        end.y = this._distination.y;
                        pathArr.push(end)//把终点放进去
                        pathArr.forEach((obj) => { this._drawPoint(obj); });
                        break;
                    }
                }
                else {
                    item = itemIn;
                    /* 比较G值，取最小的 */
                    /* 基于当前center的G值 */
                    let currentG = center.G + item.value_h;
                    if (item.x != center.x && item.y != center.y) {
                        currentG = center.G + item.value_v;
                    }
                    /* 如果基于当前center的G值更小，则以当前center为parent */
                    if (currentG < item.G) {
                        item.parent = center;
                        item.G = currentG;
                        item.F = this.getF(item);
                    }
                }

            }
        }
    }

    /**
     * 获取最终路径
     * @param item 
     * @param pathArr 
     */
    getPath(item: pitem, pathArr: pitem[]) {
        pathArr.push(item);
        if (item.parent) {
            this.getPath(item.parent, pathArr);
        }
    }

    /**
     * 是否在障碍物上
     * @param item 
     */
    isObstacle(item: pitem) {
        // let list: Node[] = this.obstacle.children;
        // for (let i = 0; i < list.length; i++) {
        //     if (item.x >= list[i].x && item.y >= list[i].y && item.x < list[i].x + list[i].width && item.y < list[i].y + list[i].height) {
        //         return true;
        //     }
        // }
        let list = ElementManager.Inst.elements;
        let hor = this._levelData.hor;
        let ver = this._levelData.ver;
        for (let i = 0; i < hor; i++) {
            for (let j = 0; j < ver; j++) {
                let ele = list[i][j];
                if (ele) {
                    let pos = ele.node.getPosition();
                    if (item.x == pos.x && item.y == pos.y) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * 将当前center从_openlist中移除
     * @param center 
     */
    removeCenter(center: pitem) {
        for (let i = 0; i < this._openlist.length; i++) {
            if (this._openlist[i].x == center.x && this._openlist[i].y == center.y) {
                this._openlist.splice(i, 1);
                break;
            }
        }
    }

    /**
     * 计算F值
     * @param item 
     */
    getF(item: pitem): number {
        let h: number = Math.abs(this._distination.x - item.x) * item.value_h;
        let v: number = Math.abs(this._distination.y - item.y) * item.value_h;
        let H = h + v;
        let F = H + item.G;
        return F;
    }

    /**
     * 检查center周围的方格是否在_openlist中
     * @param item 
     */
    isIn_openlist(item: pitem): any {
        let obj = this._openlist.find((o) => {
            if (o.x == item.x && o.y == item.y) {
                return o;
            }
        })
        return obj ? obj : false;
    }

    /**
     * 检查center周围的方格是否在_closelist中
     * @param item 
     */
    isIn_closelist(item: pitem) {
        let obj = this._closelist.find((o) => {
            if (o.x == item.x && o.y == item.y) {
                return o;
            }
        })
        return obj ? true : false;
    }

    /**
     * 创建一个方格子
     */
    getPitem(): pitem {
        let item: pitem = new pitem();
        return item;
    }
}