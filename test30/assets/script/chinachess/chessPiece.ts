import { _decorator, Component, Node } from 'cc';
import { ChessRole, ChessType } from './chessEnum';
const { ccclass, property } = _decorator;

@ccclass('ChessPiece')
export class ChessPiece extends Component {

    /* 类型,红/黑 */
    private _typee: number = 0;

    /* 角色,军/马/象/士/王/炮/兵 */
    private _role: ChessRole = ChessRole.boss;

    /* 位置记录一下 */
    private x: number = -1;
    private z: number = -1;

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
    }

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
