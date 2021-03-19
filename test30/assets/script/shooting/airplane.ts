
import { _decorator, Component, Node, Vec3, tween, Prefab } from 'cc';
import { PoolManager } from '../infinitymap/poolManager';
import { Bomb } from './bomb';
import { ShootCfg } from './shootCfg';
const { ccclass, property } = _decorator;

@ccclass('Airplane')
export class Airplane extends Component {
    @property(Prefab)
    bomb: Prefab = null as unknown as Prefab;

    /* 0:up,1:down */
    private verticleTag: number = 0;
    start() {
        this.schedule(() => {
            this.shooting();
        }, 1);
    }
    shooting() {
        let left: Node = this.node.getChildByName("left") as Node;
        let right: Node = this.node.getChildByName("right") as Node;
        this.createBomb(left.getWorldPosition());
        this.createBomb(right.getWorldPosition());
    }
    createBomb(pos: Vec3) {
        let bomb: Node = PoolManager.getNode(this.bomb);
        this.node.scene.addChild(bomb);
        bomb.getComponent(Bomb)?.shoot(pos);
    }

    update() {
        if (ShootCfg.movePause) return;
        let pos: Vec3 = this.node.getWorldPosition();
        let zz: number = pos.z + Number(-ShootCfg.speed);

        let gap = 0.04;
        if (this.verticleTag < 1) {
            pos.y += gap;
            if (pos.y >= 10) {
                this.verticleTag = 1;
            }
        }
        else if (this.verticleTag > 0) {
            pos.y -= gap;
            if (pos.y <= 3) {
                this.verticleTag = 0;
            }
        }
        this.node.setPosition(new Vec3(pos.x, pos.y, zz));
    }
}
