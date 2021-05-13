import { _decorator, Component, Node, Vec3, tween, Vec2, sp, SkeletalAnimationComponent } from 'cc';
import EventManager from '../shooting/eventManager';
import ChessUtil, { ChessRole, ChessType } from './chessEnum';
import { ChessPlayer } from './chessPlayer';
const { ccclass, property } = _decorator;

@ccclass('ChessPiece')
export class ChessPiece extends Component {
    /* 选中状态 */
    @property(Node)
    selectedNode: Node = null as unknown as Node;

    @property(Node)
    camera: Node = null as unknown as Node;

    /* 类型,红/黑 */
    private _typee: number = 0;

    /* 角色,军/马/象/士/王/炮/兵 */
    private _role: ChessRole = ChessRole.boss;

    /* 记录一下坐标 */
    public x: number = -1;
    public z: number = -1;
    public y: number = 0.5;

    /**
     * 初始化角色/类型/坐标
     * @param x 
     * @param z 
     */
    init(x: number, z: number) {
        this.x = x;
        this.z = z;
        this.camera.active = false;
        this.showRole();
    }

    showRole() {
        let childs = this.node.children;
        for (let i = 0; i < childs.length; i++) {
            childs[i].active = false;
        }
        let head: string = "black_";
        if (this.type == ChessType.red) {
            head = "red_";
        }
        let behand: string = this.getRole(this.role);
        let name = head + behand;
        let chess = (this.node.getChildByName(name) as Node);
        chess.active = true;
        chess.eulerAngles = new Vec3(0, 0, 0);
        if (ChessPlayer.Inst.type == ChessType.black) {
            chess.eulerAngles = new Vec3(0, 180, 0);
        }

        this.selectedNode.eulerAngles = new Vec3(0, 0, 0);
        if (this.type == ChessType.red) {
            this.selectedNode.eulerAngles = new Vec3(0, 180, 0);
        }
        (this.selectedNode.getComponent(SkeletalAnimationComponent) as SkeletalAnimationComponent).play("cocos_anim_idle")
    }

    hideRole() {
        let childs = this.node.children;
        for (let i = 0; i < childs.length; i++) {
            childs[i].active = false;
        }
    }

    /**
     * 角色
     * @param rl 
     * @returns 
     */
    private getRole(rl: ChessRole): string {
        switch (rl) {
            case ChessRole.bing:
                return "bing";
            case ChessRole.boss:
                return "boss";
            case ChessRole.ju:
                return "ju";
            case ChessRole.ma:
                return "ma";
            case ChessRole.pao:
                return "pao";
            case ChessRole.si:
                return "si";
            case ChessRole.xiang:
                return "xiang";
            default: break;
        }
        return "";
    }

    /**
     * 初始化棋子位置,给个出场动画
     * @param pos 
     * @returns 
     */
    async initPosition(pos: Vec3) {
        return new Promise(resolve => {
            tween(this.node).to(0.1, { worldPosition: pos }).call(() => {
                resolve(null);
            }).start();
        });
    }

    /**
     * 更新棋子信息,坐标
     * @param pos 
     */
    updateInfo(pos: Vec3, x: number, z: number, cb?: Function) {
        (this.selectedNode.getComponent(SkeletalAnimationComponent) as SkeletalAnimationComponent).play("cocos_anim_run");
        this.x = x;
        this.z = z;
        this.hideRole();
        this.setSelected(true);
        this.setRotateXY(pos);
        let sPos = this.selectedNode.getWorldPosition();

        let out = new Vec3();
        let distance = Vec3.subtract(out, sPos, pos).length();
        sPos.y = 0.5;
        this.selectedNode.setWorldPosition(sPos);
        // this.camera.active = true;
        tween(this.node).to(distance / ChessUtil.chessMoveTime, { worldPosition: pos }).call(() => {
            let sPos = this.selectedNode.getWorldPosition();
            sPos.y = 1.3;
            this.selectedNode.setWorldPosition(sPos);
            this.showRole();
            this.camera.active = false;
            if (cb) {
                cb();
            }
        }).start();
    }

    setRotateXY(p: Vec3) {
        let pos = this.node.getWorldPosition();
        let p1: Vec2 = new Vec2(pos.x, pos.z);
        let p2: Vec2 = new Vec2(p.x, p.z);
        let radian: number = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        let angle: number = radian * 180 / Math.PI;
        this.selectedNode.eulerAngles = new Vec3(0, -angle + 90, 0);
    }

    /**
     * 设置选中状态
     * @param bool 
     */
    setSelected(bool: boolean = false) {
        this.selectedNode.active = bool;
    }

    getCameraPos() {
        return this.camera.getWorldPosition();
    }

    getCameraEul() {
        return this.camera.eulerAngles;
    }

    get type() {
        return this._typee;
    }

    set type(tp: number) {
        this._typee = tp;
    }

    get role() {
        return this._role;
    }

    set role(rl: number) {
        this._role = rl;
    }

}
