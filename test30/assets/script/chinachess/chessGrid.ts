
import { _decorator, Component, Node, Vec3, Prefab, instantiate } from 'cc';
import { ChessRole, ChessType } from './chessEnum';
import { ChessPiece } from './chessPiece';
const { ccclass, property } = _decorator;

@ccclass('ChessGrid')
export class ChessGrid extends Component {

    @property(Prefab)
    chessPrefab: Prefab = null as unknown as Prefab;

    private offsetY: number = 0.5;
    public gridArr: Vec3[][] = [];
    private hor: number = 9;
    private ver: number = 10;

    async start() {
        await this.generateGrid();
        console.log(this.gridArr.length);
        for (let x = 0; x < this.hor; x++) {
            for (let z = 0; z < this.ver; z++) {
                let type: number = z < 5 ? ChessType.red : ChessType.black;
                let role: number = this.getChessRoleByPos(x, z);
                if (role < 0) continue;
                let pos: Vec3 = this.gridArr[x][z];
                console.log(x, z);
                let chess: Node = instantiate(this.chessPrefab);
                this.node.scene.addChild(chess);
                chess.setPosition(pos);

                let cp: ChessPiece = chess.getComponent(ChessPiece) as ChessPiece;
                cp.type = type;
                cp.role = role;
                cp.init(x, z);
            }
        }
    }

    /**
     * 生成网格坐标
     * @returns 
     */
    async generateGrid() {
        return new Promise(resolve => {
            for (let x = 0; x < this.hor; x++) {
                let arr: Vec3[] = [];
                this.gridArr.push(arr);
                for (let z = 0; z < this.ver; z++) {
                    let xx: number = -20 + x * 5;
                    let zz: number = 27 - z * 6;
                    let v3: Vec3 = new Vec3(xx, this.offsetY, zz);
                    this.gridArr[x].push(v3);
                }
            }
            resolve(null);
        });
    }

    /**
     * 获取棋盘上固定位置固定棋子
     * @param x 
     * @param z 
     */
    getChessRoleByPos(x: number, z: number) {
        let role: number = -1;
        if (z == 0 || z == this.ver - 1) {
            /* 军 */
            if (x == 0 || x == this.hor - 1) {
                role = ChessRole.ju;
            }
            /* 马 */
            if (x == 1 || x == this.hor - 2) {
                role = ChessRole.ma;
            }
            /* 象 */
            if (x == 2 || x == this.hor - 3) {
                role = ChessRole.xiang;
            }
            /* 士 */
            if (x == 3 || x == this.hor - 4) {
                role = ChessRole.si;
            }
            /* boss */
            if (x == 4) {
                role = ChessRole.boss;
            }
        }
        if (z == 2 || z == this.ver - 3) {
            /* 炮 */
            if (x == 1 || x == this.hor - 2) {
                role = ChessRole.pao;
            }
        }

        if (z == 3 || z == this.ver - 4) {
            /* 兵 */
            if (x % 2 == 0) {
                role = ChessRole.bing;
            }
        }
        return role;
    }
}

