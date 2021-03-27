import { Vec3 } from "cc";

export interface RoadPoints {
    pos: Vec3,
    type: number,
    euler: Vec3,
}

export default class PercenUtil {
    private static _instance: PercenUtil = null as unknown as PercenUtil;
    public static get Inst(): PercenUtil {
        if (!this._instance) {
            this._instance = new PercenUtil();
        }
        return this._instance;
    }

    private pointList: RoadPoints[] = [];

    public pushPoint(posObj: RoadPoints) {
        this.pointList.push(posObj);
    }

    public getPoints(): RoadPoints[] {
        return this.pointList;
    }

    public getPointByIdx(idx: number): RoadPoints {
        if (this.pointList.length > idx) {
            return this.pointList[idx];
        }
        else {
            return null as unknown as RoadPoints;
        }
    }

    public clear() {
        this.pointList.splice(0);
    }
}