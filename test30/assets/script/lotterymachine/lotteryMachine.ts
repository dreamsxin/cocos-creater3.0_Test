
import { _decorator, Component, Node, Prefab, instantiate } from 'cc';
import { PoolManager } from '../infinitymap/poolManager';
import EventManager from '../shooting/eventManager';
import { Axis } from './axis';
const { ccclass, property } = _decorator;

@ccclass('LotteryMachine')
export class LotteryMachine extends Component {
    @property(Prefab)
    ballPrefab: Prefab = null as unknown as Prefab;

    @property(Node)
    startNode: Node = null as unknown as Node;

    @property(Axis)
    axis: Axis = null as unknown as Axis;

    @property(Node)
    door: Node = null as unknown as Node;

    private ballList: Node[] = [];

    onEnable() {
        EventManager.Inst.registerEevent(EventManager.EVT_openDoor, this.openTheDoor, this);
        EventManager.Inst.registerEevent(EventManager.EVT_closeDoor, this.closeTheDoor, this);
    }

    start() {
        this.closeTheDoor();
    }

    createBall() {
        for (let i = 0; i < 20; i++) {
            let ball = PoolManager.getNode(this.ballPrefab);
            ball.setWorldPosition(this.startNode.getWorldPosition());
            this.node.scene.addChild(ball);
            this.ballList.push(ball);
        }
    }

    async startGame() {
        await this.recycleBall();
        this.createBall();
        this.axis.startGame();
    }

    recycleBall() {
        return new Promise(resolve => {
            for (let i = 0; i < this.ballList.length; i++) {
                PoolManager.setNode(this.ballList[i]);
            }
            this.ballList.splice(0);
            resolve(null);
        });
    }

    private openTheDoor() {
        this.door.active = false;
    }

    private closeTheDoor() {
        this.door.active = true;
    }
}

