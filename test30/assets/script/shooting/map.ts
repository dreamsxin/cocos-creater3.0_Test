
import { _decorator, Component, Node, Prefab, Vec3 } from 'cc';
import { PoolManager } from '../infinitymap/poolManager';
import { ShootCfg } from './shootCfg';
const { ccclass, property } = _decorator;

@ccclass('Map')
export class Map extends Component {
    @property({ type: Prefab })
    road: Prefab = null as unknown as Prefab;

    @property({ type: Node })
    player: Node = null as unknown as Node;
    private count: number = 0;
    private mapIdx: number = 9;
    private mapArr: Node[] = [];
    start() {
        for (let i = 0; i < 10; i++) {
            this.createRoad(i);
        }
    }

    update() {
        if (ShootCfg.movePause) return;
        let zz: number = this.player.getWorldPosition().z + Number(-ShootCfg.speed);
        this.player.setPosition(new Vec3(this.player.getWorldPosition().x, this.player.getWorldPosition().y, zz));
        this.count += +ShootCfg.speed;
        if (this.count > 10 * (this.mapIdx - 8)) {
            this.mapIdx++;
            this.createRoad(this.mapIdx);
            this.recycleRoad();
        }
    }

    createRoad(idx: number) {
        let node = PoolManager.getNode(this.road);
        node.setPosition(new Vec3(0, 0, -10 * idx));
        this.node.scene.addChild(node);
        this.mapArr.push(node);
    }

    recycleRoad() {
        PoolManager.setNode(this.mapArr[0]);
        this.mapArr.splice(0, 1);
    }
}

