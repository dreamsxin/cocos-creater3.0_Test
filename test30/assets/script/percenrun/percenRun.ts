
import { _decorator, Component, Node, Prefab, instantiate, Vec3 } from 'cc';
import { PoolManager } from '../infinitymap/poolManager';
import EventManager from '../shooting/eventManager';
import PercenUtil, { RoadPoints } from './percenUtil';
import { Straight } from './straight';
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

    /* 直行接直行偏移 */
    private straightTostraight: number = 20;
    /* 直行接弯道偏移 */
    private straightToturn: number = 10;
    /* 弯道接直行偏移 */
    private turnTostraightX: number = 22;
    /* 弯道接弯道偏移 */
    private turnToturnZ: number = 12;

    /* 路径列表,用于回收处理 */
    private roadList: Node[] = [];

    start() {
        PercenUtil.Inst.clear();
        //根据事件机智来触发回收和生成路径操作
        EventManager.Inst.registerEevent(EventManager.EVT_recycle, this.recycleRoad.bind(this), this);
        //初始化先快速生成前段道路
        this.schedule(() => {
            this.createRoad();
        }, 0.5, 10);
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

        this.createRoadPoint(node);
    }

    /**
     * 根据道路生成轨道点路径
     * @param node 
     */
    createRoadPoint(node: Node) {
        let pos: Vec3 = node.getWorldPosition();
        let euler: Vec3 = node.eulerAngles;
        let type: number = 0;
        if (node.name == "turnpoint") {
            let tp: TurnPoint = node.getComponent(TurnPoint) as TurnPoint;
            if (tp.direction == 0) {
                type = 1;//left
                let posObj: RoadPoints = { pos: pos, type: type, euler: euler };
                PercenUtil.Inst.pushPoint(posObj);

                let centerLeftPos: Vec3 = tp.getCenterLeftPos();
                euler = new Vec3(euler.x, euler.y + 45, euler.z);
                posObj = { pos: centerLeftPos, type: type, euler: euler };
                PercenUtil.Inst.pushPoint(posObj);
            }
            else {
                type = 2;
                let posObj: RoadPoints = { pos: pos, type: type, euler: euler };
                PercenUtil.Inst.pushPoint(posObj);

                let centerRightPos: Vec3 = tp.getCenterRightPos();
                euler = new Vec3(euler.x, euler.y - 45, euler.z);
                posObj = { pos: centerRightPos, type: type, euler: euler };
                PercenUtil.Inst.pushPoint(posObj);
            }
        }
        else {
            type = 0;
            let st: Straight = node.getComponent(Straight) as Straight;
            let posArr = st.getPos();
            let posObj: RoadPoints = { pos: posArr[0], type: type, euler: euler };
            PercenUtil.Inst.pushPoint(posObj);
            posObj = { pos: posArr[1], type: type, euler: euler };
            PercenUtil.Inst.pushPoint(posObj);
        }
    }

    recycleRoad() {
        PoolManager.setNode(this.roadList[0]);
        this.roadList.splice(0, 1);
        this.createRoad();
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

}
/*
直行接拐点,拐点与直行的角度一致,坐标在当前的直行上加10
拐点接直行
    左拐:22
    右拐:22
*/





