
import { _decorator, Component, Node, Prefab, Vec3 } from 'cc';
import { PoolManager } from '../utils/poolManager';
import { Bullet } from './bullet';
const { ccclass, property } = _decorator;

@ccclass('DefensiveTower')
export class DefensiveTower extends Component {

    @property(Node)
    startNode: Node = null as unknown as Node;

    @property(Node)
    effNode: Node = null as unknown as Node;

    @property(Prefab)
    bulletPrefab: Prefab = null as unknown as Prefab;

    /* 防御区域 */
    private defensiveOffset: number = 15;

    private count: number = 0;

    /* 玩家 */
    private player: Node = null as unknown as Node;

    start() {
        let player: Node = this.node.parent?.getChildByName("player") as Node;
        this.player = player;
    }

    startFire() {
        let bullet = PoolManager.getNode(this.bulletPrefab);
        this.node.scene.addChild(bullet);
        bullet.setWorldPosition(this.startNode.getWorldPosition());
        (bullet.getComponent(Bullet) as Bullet).shoot(this.player);
    }

    /**
     * 获取玩家与防御塔间的距离
     */
    getDistance() {
        let v1: Vec3 = this.player.getWorldPosition();
        v1.y = 4;
        let v2: Vec3 = this.node.getWorldPosition();
        let out = new Vec3();
        out = Vec3.subtract(out, v1, v2);
        let distance = Vec3.len(out);
        return distance;
    }

    update() {
        if (this.getDistance() < this.defensiveOffset) {
            this.effNode.active = true;
            if (this.count % 120 == 0) {
                this.startFire();
            }
            this.count++
        }
        else {
            this.effNode.active = false;
        }
    }
}
