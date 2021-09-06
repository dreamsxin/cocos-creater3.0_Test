
import { _decorator, Component, Node, SystemEventType, systemEvent, Quat, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Rotate')
export class Rotate extends Component {
    @property(Node)
    tar: Node = null as unknown as Node;

    @property(Node)
    tarSelf: Node = null as unknown as Node;

    @property(Node)
    p1: Node = null as unknown as Node;

    @property(Node)
    p2: Node = null as unknown as Node;

    private __temp_v3: Vec3 = new Vec3();
    private __temp_quat: Quat = new Quat();


    onLoad() {
        systemEvent.on(SystemEventType.TOUCH_MOVE, this._onTouchMove, this);
    }

    private _onTouchMove(touch: any) {
        const delta = touch.getDelta();
        // 绕轴转
        // 这里选取轴朝上
        const axis2 = Vec3.UP;//旋转轴
        const rad2 = 1e-2 * delta.x; //旋转角度
        // 计算坐标
        const point = this.p1.worldPosition; //旋转点
        const point_now = this.tar.worldPosition; // 当前点的位置

        // this._rotateQuat(axis2, rad2);

        this._rotateY(point_now, point, rad2);
        this._rotateSelf(touch);
    }

    /**
     * 根据四元素绕轴旋转
     * @param axis2 
     * @param rad2 
     */
    private _rotateQuat(axis2: any, rad2: any) {
        // 计算坐标
        const point = this.p1.worldPosition; //旋转点
        const point_now = this.tar.worldPosition; // 当前点的位置
        // 算出坐标点的旋转四元数
        Quat.fromAxisAngle(this.__temp_quat, axis2, rad2);
        // 计算旋转点和现有点的向量
        Vec3.subtract(this.__temp_v3, point_now, point);
        // 计算旋转后的向量
        Vec3.transformQuat(this.__temp_v3, this.__temp_v3, this.__temp_quat)
        // 计算旋转后的点
        Vec3.add(this.__temp_v3, point, this.__temp_v3);
        this.tar.setWorldPosition(this.__temp_v3);

        // 计算朝向
        // 这么旋转会按原始的朝向一起旋转
        const quat_now = this.tar.worldRotation;
        Quat.rotateAround(this.__temp_quat, quat_now, axis2, rad2);
        Quat.normalize(this.__temp_quat, this.__temp_quat);
        this.tar.setWorldRotation(this.__temp_quat);
    }

    /**
     * 绕轴旋转
     * @param point_now 角色点
     * @param point 旋转轴点
     * @param rad2 旋转弧度
     */
    private _rotateY(point_now: any, point: any, rad2: any) {
        Vec3.rotateY(this.__temp_v3, point_now, point, rad2);
        this.tar.setWorldPosition(this.__temp_v3);
    }

    /**
     * 自传
     * @param touch 
     */
    private _rotateSelf(touch: any) {
        const delta = touch.getDelta();

        // 自传
        // 这个物体模型‘锚点’在正中心效果比较好
        // 垂直的轴，右手  
        //  
        //  旋转轴
        //  ↑
        //  ---> 触摸方向
        const axis = v3(-delta.y, delta.x, 0); //旋转轴，根据相似三角形求出
        const rad = delta.length() * 1e-2; //旋转角度
        const quat_cur = this.tarSelf.getRotation(); //当前的四元数
        Quat.rotateAround(this.__temp_quat, quat_cur, axis.normalize(), rad); //当面的四元数绕旋转轴旋转
        // 旋转后的结果 / 当前的四元数 / 旋转轴 / 旋转四元数
        this.tarSelf.setRotation(this.__temp_quat);
    }
}