
import { _decorator, Component, Node, Prefab, Vec3 } from 'cc';
import { PoolManager } from './poolManager';
const { ccclass, property } = _decorator;

@ccclass('Infinitymap')
export class Infinitymap extends Component {
    @property({ type: Prefab })
    infinitymap: Prefab = null;

    @property({ type: Node })
    player: Node = null;

    @property({ type: Number })
    speed: Number = 0;
    private distance: number = 0;
    private count: number = 0;
    private mapIdx: number = 9;
    private mapArr: Node[] = [];
    start() {
        for (let i = 0; i < 10; i++) {
            this.createRoad(i);
        }
    }

    update() {
        this.distance += -this.speed;
        this.player.setPosition(new Vec3(0, 0, this.distance));
        this.count += +this.speed;
        if (this.count > 5 * (this.mapIdx - 8)) {
            // this.count = 0;
            this.mapIdx++;
            this.createRoad(this.mapIdx);
            this.recycleRoad();
            console.log(this.mapIdx, this.mapArr.length);
        }

    }

    createRoad(idx: number) {
        let node = PoolManager.getNode(this.infinitymap);
        node.setPosition(new Vec3(0, 0, -5 * idx));
        let rand = Math.random();
        node.eulerAngles = new Vec3(0, 0, 0);
        if (rand > 0.48) {
            node.eulerAngles = new Vec3(0, 180, 0);
        }
        this.node.scene.addChild(node);
        this.mapArr.push(node);
    }

    recycleRoad() {
        PoolManager.setNode(this.mapArr[0]);
        this.mapArr.splice(0, 1);
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.0/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.0/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.0/manual/en/scripting/life-cycle-callbacks.html
 */
