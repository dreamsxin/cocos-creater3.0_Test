import { Vec3 } from "cc";
import pitem from "./pitem";

/**
 * 寻路组件
 */

export default class Ppath {
    private startPos: Vec3 = new Vec3();
    private endPos: Vec3 = new Vec3();
    private openlist: pitem[] = [];
    private closelist: pitem[] = [];
    public obstacle: Node[] = [];
    private static _instance: Ppath;
    public static get Init(): Ppath {
        if (!this._instance) {
            this._instance = new Ppath();
        }
        return this._instance;
    }

    initProperty() {
        this.obstacle.splice(0);
    }

    async startFind(start: Vec3, end: Vec3): Promise<pitem[]> {
        return new Promise(async resolve => {
            this.openlist.splice(0);
            this.closelist.splice(0);
            this.startPos = start;
            this.endPos = end;
            let pathArr: pitem[] = [];
            pathArr = await this.begin();
            resolve(pathArr);
        });
    }

    async begin(): Promise<pitem[]> {
        return new Promise(resolve => {
            let origin: pitem = this.getPitem();
            origin.F = 0;
            origin.G = 0;
            origin.H = 0;
            origin.x = this.startPos.x;
            origin.z = this.startPos.z;
            let isFined: boolean = false;
            let center: pitem = origin;
            this.openlist.push(center);
            while (!isFined) {
                /* 找最小F值作为新center */
                this.openlist.sort((a, b) => { return a.F - b.F });
                center = this.openlist[0];
                /* 将center从openlist中移除 */
                this.removeCenter(center);
                this.closelist.push(center);
                for (let i = 0; i < 8; i++) {
                    let item: pitem = this.getPitem();
                    switch (i) {
                        case 0:/* 上 */
                            item.x = center.x;
                            item.z = center.z + center.height;
                            break;
                        case 1:/* 右上 */
                            item.x = center.x + center.width;
                            item.z = center.z + center.height;
                            break;
                        case 2:/* 右 */
                            item.x = center.x + center.width;
                            item.z = center.z;
                            break;
                        case 3:/* 右下 */
                            item.x = center.x + center.width;
                            item.z = center.z - center.height;
                            break;
                        case 4:/* 下 */
                            item.x = center.x;
                            item.z = center.z - center.height;
                            break;
                        case 5:/* 左下 */
                            item.x = center.x - center.width;
                            item.z = center.z - center.height;
                            break;
                        case 6:/* 左 */
                            item.x = center.x - center.width;
                            item.z = center.z;
                            break;
                        case 7:/* 左上 */
                            item.x = center.x - center.width;
                            item.z = center.z + center.height;
                            break;
                    }
                    /* 是否在障碍物上 */
                    if (this.isObstacle(item)) {
                        continue;
                    }
                    /* 是否在选中列表 */
                    if (this.isInCloseList(item)) {
                        continue;
                    }
                    /* 是否已经包含在了openlist中 */
                    let itemIn = this.isInOpenList(item);
                    if (!itemIn) {
                        item.parent = center;
                        item.G = center.G + item.value_h;
                        if (item.x != center.x && item.z != center.z) {
                            item.G = center.G + item.value_v;
                        }
                        item.F = this.getF(item);
                        this.openlist.push(item);

                        /* 检查是否已经到终点 */
                        let p1 = new Vec3(item.x, item.z);
                        let p2 = new Vec3(this.endPos.x, this.endPos.z);
                        let out = new Vec3();
                        Vec3.subtract(out, p1, p2);
                        if (out.length() < item.width) {
                            isFined = true;
                            this.closelist.push(item);
                            console.log("find finish");
                            let pathArr: pitem[] = [];
                            /* 最终路径 */
                            this.getPath(item, pathArr);
                            pathArr.reverse();
                            resolve(pathArr);
                            return;
                        }
                    }
                    else {
                        item = itemIn;
                        /* 比较G值，取最小的 */
                        /* 基于当前center的G值 */
                        let currentG = center.G + item.value_h;
                        if (item.x != center.x && item.z != center.z) {
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
        });
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
        let list: Node[] = this.obstacle;
        for (let i = 0; i < list.length; i++) {
            let obstacle: Node = list[i];
            let pos: Vec3 = obstacle.getWorldPosition();
            let scale = obstacle.getScale();
            let startx: number = pos.x - (scale.x - 1) / 2 - 0.5;
            let startz: number = pos.z - (scale.z - 1) / 2 - 0.5;

            let out1: Vec3 = new Vec3(startx, pos.y, startz);
            let out2: Vec3 = new Vec3(startx + scale.x, pos.y, startz + scale.z);
            let itemPos: Vec3 = new Vec3(item.x, pos.y, item.z);
            if (itemPos.x >= out1.x && itemPos.x <= out2.x && itemPos.z >= out1.z && itemPos.z <= out2.z) {
                return true;
            }
        }
        return false;
    }

    /**
     * 将当前center从openlist中移除
     * @param center 
     */
    removeCenter(center: pitem) {
        for (let i = 0; i < this.openlist.length; i++) {
            if (this.openlist[i].x == center.x && this.openlist[i].z == center.z) {
                this.openlist.splice(i, 1);
                break;
            }
        }
    }

    /**
     * 计算F值
     * @param item 
     */
    getF(item: pitem): number {
        let h: number = Math.abs(this.endPos.x - item.x) * item.value_h;
        let v: number = Math.abs(this.endPos.z - item.z) * item.value_h;
        let H = h + v;
        let F = H + item.G;
        return F;
    }

    /**
     * 检查center周围的方格是否在openlist中
     * @param item 
     */
    isInOpenList(item: pitem): any {
        let obj = this.openlist.find((o) => {
            if (o.x == item.x && o.z == item.z) {
                return o;
            }
        })
        return obj ? obj : false;
    }

    /**
     * 检查center周围的方格是否在closelist中
     * @param item 
     */
    isInCloseList(item: pitem) {
        let obj = this.closelist.find((o) => {
            if (o.x == item.x && o.z == item.z) {
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


