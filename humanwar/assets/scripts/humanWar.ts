
import { _decorator, Component, Node, Prefab } from 'cc';
import { Enemy } from './player/enemy';
import { IdentityType } from './player/player';
import EventManager from './utils/eventManager';
import { PoolManager } from './utils/poolManager';
const { ccclass, property } = _decorator;

@ccclass('HumanWar')
export class HumanWar extends Component {
    @property([Node])
    enemyBornPlace: Node[] = [];

    @property(Node)
    playerBornPlace: Node = null as unknown as Node;

    @property(Prefab)
    enemyPrefab: Prefab = null as unknown as Prefab;

    onLoad() {
        EventManager.Inst.registerEevent(EventManager.EVT_generate_enemy, this.generateEnemy.bind(this), this);
        EventManager.Inst.registerEevent(EventManager.EVT_generate_player, this.generatePlayer.bind(this), this);
    }

    start() {
        for (let i = 0; i < 3; i++) {
            this.generateEnemy(i);
        }
    }

    /**
     * 根据id生成AI
     * @param id 
     */
    generateEnemy(id: number) {
        let enemy: Node = PoolManager.getNode(this.enemyPrefab);
        (enemy.getComponent(Enemy) as Enemy).id = id;
        (enemy.getComponent(Enemy) as Enemy).identity = IdentityType.enemy;
        this.node.scene.addChild(enemy);
        let pos = this.enemyBornPlace[id].getWorldPosition();
        enemy.setWorldPosition(pos);
    }

    /**
     * 生成玩家
     */
    generatePlayer() {
        // this.scheduleOnce(() => {
        //     let role: Node = PoolManager.getNode(this.playerPrefab);
        //     this.node.scene.addChild(role);
        //     let pos = this.playerBornPlace.getWorldPosition();
        //     role.setWorldPosition(pos)
        // }, 3);
    }
}
