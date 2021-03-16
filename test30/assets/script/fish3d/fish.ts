
import { _decorator, Component, Node, tween, Vec3, Vec2, random } from 'cc';
import { Road } from './road';
const { ccclass, property } = _decorator;

@ccclass('Fish')
export class Fish extends Component {
    @property({ type: Road })
    road: Road = null;
    private speed: number = 0.5;
    start() {
        this.speed += Math.random();
        let roads: Vec3[] = this.road.getRoadLines();
        this.startMove(0, roads);
    }

    async startMove(idx: number, roads: Vec3[]) {

        let curPoint: Vec3 = roads[idx];
        if (idx == 0) {
            this.node.setWorldPosition(curPoint);
            idx++;
            this.startMove(idx, roads);
        }
        else {
            let time = 4;
            let out: Vec3 = new Vec3();
            Vec3.subtract(out, roads[idx - 1], roads[idx]);
            let length = Vec3.len(out);
            time = length / this.speed;
            /* 在哪个面上转弯 */
            if (this.road.getIsXz()) {
                this.setRotateXZ(idx, roads);
            }
            else {
                this.setRotateXY(idx, roads);
            }
            tween(this.node).to(time, { position: roads[idx] }).call(() => {
                idx++;
                if (idx == roads.length) {
                    this.startMove(0, roads);
                    return;
                }
                this.startMove(idx, roads);
            }).start();
        }

    }

    setRotateXZ(idx: number, roads: Vec3[]) {
        let p1: Vec2 = new Vec2(roads[idx].x, roads[idx].z);
        let p2: Vec2 = new Vec2(roads[idx - 1].x, roads[idx - 1].z);
        let radian: number = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        let angle: number = radian * 180 / Math.PI;
        tween(this.node).to(2, { eulerAngles: new Vec3(0, -angle, 0) }).start();
    }
    setRotateXY(idx: number, roads: Vec3[]) {
        let p1: Vec2 = new Vec2(roads[idx].x, roads[idx].y);
        let p2: Vec2 = new Vec2(roads[idx - 1].x, roads[idx - 1].y);
        let radian: number = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        let angle: number = radian * 180 / Math.PI;
        tween(this.node).to(2, { eulerAngles: new Vec3(0, 0, angle) }).start();
    }
}

