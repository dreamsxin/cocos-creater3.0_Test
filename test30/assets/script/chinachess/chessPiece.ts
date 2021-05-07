import { _decorator, Component, Node, Vec3 } from 'cc';
import EventManager from '../shooting/eventManager';
import { ChessRole, ChessType } from './chessEnum';
const { ccclass, property } = _decorator;

@ccclass('ChessPiece')
export class ChessPiece extends Component {
    /* 选中状态 */
    @property(Node)
    selectedNode: Node = null as unknown as Node;

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
        (this.node.getChildByName(name) as Node).active = true;

        this.selectedNode.eulerAngles = new Vec3(0, 0, 0);
        if (this.type == ChessType.red) {
            this.selectedNode.eulerAngles = new Vec3(0, 180, 0);
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
     * 设置选中状态
     * @param bool 
     */
    setSelected(bool: boolean = false) {
        this.selectedNode.active = bool;
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
