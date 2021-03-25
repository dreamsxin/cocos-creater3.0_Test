
import { _decorator, Component, Node, Prefab, instantiate, Vec3 } from 'cc';
import { PoolManager } from '../infinitymap/poolManager';
import { TurnPoint } from './turnPoint';
const { ccclass, property } = _decorator;

@ccclass('PercenRun')
export class PercenRun extends Component {
    @property(Prefab)
    straight: Prefab = null as unknown as Prefab;

    @property(Prefab)
    turnPoint: Prefab = null as unknown as Prefab;

    @property(Node)
    camaraNode: Node = null as unknown as Node;


    private turnLeftEular: number = 90;
    private turnRightEular: number = -90;
    private straightTostraight: number = 20;
    private straightToturn: number = 10;

    private roadList: Node[] = [];

    start() {
        this.schedule(() => {
            this.createRoad();
        }, 1);
    }

    async createRoad() {
        let rand: number = Math.random();
        let node: Node;
        let length = this.roadList.length;
        if (length > 0) {
            if (rand > 0.35) {
                node = PoolManager.getNode(this.straight);
            }
            else {
                node = PoolManager.getNode(this.turnPoint);
            }
        }
        else {
            node = PoolManager.getNode(this.straight);
        }
        this.node.scene.addChild(node);
        await this.setRoadPosition(node);
        let pos = node.getWorldPosition();
        this.camaraNode.setWorldPosition(new Vec3(pos.x, this.camaraNode.getWorldPosition().y, pos.z))
        this.roadList.push(node);
        this.recycleRoad();
    }

    recycleRoad() {
        if (this.roadList.length > 15) {
            PoolManager.setNode(this.roadList[0]);
            this.roadList.splice(0, 1);
        }
    }

    async setRoadPosition(node: Node) {
        return new Promise(resolve => {
            let length = this.roadList.length;
            if (length > 0) {
                let frontRoad: Node = this.roadList[length - 1];
                let pos: Vec3 = frontRoad.getWorldPosition();
                let euler: Vec3 = frontRoad.eulerAngles;
                let curName: string = node.name;
                let frontName: string = frontRoad.name;

                let angle: number = euler.y % 360;
                if (frontName == "straight") {
                    node.eulerAngles = euler;
                    if (frontName == curName) {
                        if (angle == 0) {
                            node.setWorldPosition(new Vec3(pos.x, pos.y, pos.z - this.straightTostraight));
                        }
                        else if (angle == 90 || angle == -270) {//left
                            node.setWorldPosition(new Vec3(pos.x - this.straightTostraight, pos.y, pos.z));
                        }
                        else if (angle == -90 || angle == 270) {//right
                            node.setWorldPosition(new Vec3(pos.x + this.straightTostraight, pos.y, pos.z));
                        }
                        else if (angle == 180 || angle == -180) {
                            node.setWorldPosition(new Vec3(pos.x, pos.y, pos.z + this.straightTostraight));
                        }
                    }
                    else {
                        if (angle == 0) {
                            node.setWorldPosition(new Vec3(pos.x, pos.y, pos.z - this.straightToturn));
                        }
                        else if (angle == 90 || angle == -270) {//left
                            node.setWorldPosition(new Vec3(pos.x - this.straightToturn, pos.y, pos.z));
                        }
                        else if (angle == -90 || angle == 270) {//right
                            node.setWorldPosition(new Vec3(pos.x + this.straightToturn, pos.y, pos.z));
                        }
                        else if (angle == 180 || angle == -180) {
                            node.setWorldPosition(new Vec3(pos.x, pos.y, pos.z + this.straightToturn));
                        }
                    }
                }
                else if (frontName == "turnpoint") {
                    let tp: TurnPoint = frontRoad.getComponent(TurnPoint) as TurnPoint;
                    let tag: number = tp.direction;// Math.random();
                    let gap: number = 0.5;
                    if (curName == "straight") {
                        if (angle == 0) {//straight
                            if (tag < gap) {//left
                                node.setWorldPosition(new Vec3(pos.x - this.turnTostraightX, pos.y, pos.z - this.turnToturnZ));
                                node.eulerAngles = new Vec3(euler.x, euler.y + 90, euler.z);
                            }
                            else {//right
                                node.setWorldPosition(new Vec3(pos.x + this.turnTostraightX, pos.y, pos.z - this.turnToturnZ));
                                node.eulerAngles = new Vec3(euler.x, euler.y - 90, euler.z);
                            }
                        }
                        else if (angle == 90 || angle == -270) {//left
                            if (tag < gap) {
                                node.setWorldPosition(new Vec3(pos.x - this.turnToturnZ, pos.y, pos.z + this.turnTostraightX));
                                node.eulerAngles = new Vec3(euler.x, euler.y + 90, euler.z);
                            }
                            else {
                                node.setWorldPosition(new Vec3(pos.x - this.turnToturnZ, pos.y, pos.z - this.turnTostraightX));
                                node.eulerAngles = new Vec3(euler.x, euler.y - 90, euler.z);
                            }
                        }
                        else if (angle == -90 || angle == 270) {//right
                            if (tag < gap) {
                                node.setWorldPosition(new Vec3(pos.x + this.turnToturnZ, pos.y, pos.z - this.turnTostraightX));
                                node.eulerAngles = new Vec3(euler.x, euler.y + 90, euler.z);
                            }
                            else {
                                node.setWorldPosition(new Vec3(pos.x + this.turnToturnZ, pos.y, pos.z + this.turnTostraightX));
                                node.eulerAngles = new Vec3(euler.x, euler.y - 90, euler.z);
                            }
                        }
                        else if (angle == 180 || angle == -180) {
                            if (tag < gap) {
                                node.setWorldPosition(new Vec3(pos.x + this.turnTostraightX, pos.y, pos.z + this.turnToturnZ));
                                node.eulerAngles = new Vec3(euler.x, euler.y + 90, euler.z);
                            }
                            else {
                                node.setWorldPosition(new Vec3(pos.x - this.turnTostraightX, pos.y, pos.z + this.turnToturnZ));
                                node.eulerAngles = new Vec3(euler.x, euler.y - 90, euler.z);
                            }
                        }
                    }
                    else {//turnToturn
                        if (angle == 0) {//straight
                            if (tag < gap) {//left
                                node.setWorldPosition(new Vec3(pos.x - this.turnToturnZ, pos.y, pos.z - this.turnToturnZ));
                                node.eulerAngles = new Vec3(euler.x, euler.y + 90, euler.z);
                            }
                            else {//right
                                node.setWorldPosition(new Vec3(pos.x + this.turnToturnZ, pos.y, pos.z - this.turnToturnZ));
                                node.eulerAngles = new Vec3(euler.x, euler.y - 90, euler.z);
                            }
                        }
                        else if (angle == 90 || angle == -270) {//left
                            if (tag < gap) {
                                node.setWorldPosition(new Vec3(pos.x - this.turnToturnZ, pos.y, pos.z + this.turnToturnZ));
                                node.eulerAngles = new Vec3(euler.x, euler.y + 90, euler.z);
                            }
                            else {
                                node.setWorldPosition(new Vec3(pos.x - this.turnToturnZ, pos.y, pos.z - this.turnToturnZ));
                                node.eulerAngles = new Vec3(euler.x, euler.y - 90, euler.z);
                            }
                        }
                        else if (angle == -90 || angle == 270) {//right
                            if (tag < gap) {
                                node.setWorldPosition(new Vec3(pos.x + this.turnToturnZ, pos.y, pos.z - this.turnToturnZ));
                                node.eulerAngles = new Vec3(euler.x, euler.y + 90, euler.z);
                            }
                            else {
                                node.setWorldPosition(new Vec3(pos.x + this.turnToturnZ, pos.y, pos.z + this.turnToturnZ));
                                node.eulerAngles = new Vec3(euler.x, euler.y - 90, euler.z);
                            }
                        }
                        else if (angle == 180 || angle == -180) {
                            if (tag < gap) {
                                node.setWorldPosition(new Vec3(pos.x + this.turnToturnZ, pos.y, pos.z + this.turnToturnZ));
                                node.eulerAngles = new Vec3(euler.x, euler.y + 90, euler.z);
                            }
                            else {
                                node.setWorldPosition(new Vec3(pos.x - this.turnToturnZ, pos.y, pos.z + this.turnToturnZ));
                                node.eulerAngles = new Vec3(euler.x, euler.y - 90, euler.z);
                            }
                        }
                    }
                }
            } else {
                node.setWorldPosition(new Vec3(0, 0, 0));
                node.eulerAngles = new Vec3(0, 0, 0);
            }
            resolve(null);
        });
    }
    private turnTostraightX: number = 22;
    private turnToturnZ: number = 12;

}
/*
直行接拐点,拐点与直行的角度一致,坐标在当前的直行上加10
拐点接直行
    左拐:22
    右拐:22
*/





