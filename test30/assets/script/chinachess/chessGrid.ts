
import { _decorator, Component, Node, Vec3, Prefab, instantiate } from 'cc';
import { PoolManager } from '../infinitymap/poolManager';
import EventManager from '../shooting/eventManager';
import { ChessRole, ChessType } from './chessEnum';
import { ChessPiece } from './chessPiece';
import { ChessPlayer } from './chessPlayer';
import { ChessTag } from './chessTag';
const { ccclass, property } = _decorator;

@ccclass('ChessGrid')
export class ChessGrid extends Component {

    @property(Prefab)
    chessPrefab: Prefab = null as unknown as Prefab;

    /* 可行走路径 */
    @property(Prefab)
    chessTag: Prefab = null as unknown as Prefab;

    private offsetY: number = 0.5;
    private offsetX: number = 5;
    private offsetZ: number = 6;
    public gridArr: Vec3[][] = [];
    /* 棋子 */
    public chessArr: ChessPiece[] = [];
    /* 棋盘横竖排数 */
    public hor: number = 9;
    public ver: number = 10;
    /* 记录临时可行走路径 */
    private chessTagArr: Node[] = [];

    /* 当前选中的棋子 */
    private curSelectChess: ChessPiece = null as unknown as ChessPiece;

    async start() {
        await this.generateGrid();
        /* 初始化默认棋盘/棋子 */
        for (let x = 0; x < this.hor; x++) {
            for (let z = 0; z < this.ver; z++) {
                let type: number = z < 5 ? ChessType.red : ChessType.black;
                let role: number = this.getChessRoleByPos(x, z);
                if (role < 0) continue;
                let pos: Vec3 = this.gridArr[x][z];
                let chess: Node = instantiate(this.chessPrefab);
                this.node.scene.addChild(chess);
                chess.setPosition(pos);

                let cp: ChessPiece = chess.getComponent(ChessPiece) as ChessPiece;
                cp.type = type;
                cp.role = role;
                cp.init(x, z);
                this.chessArr.push(cp);
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
                    let xx: number = -20 + x * this.offsetX;
                    let zz: number = 27 - z * this.offsetZ;
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
        // test
        // if (z == 1 || z == this.ver - 5) {
        //     if (x == 1) {
        //         role = ChessRole.xiang;
        //     }
        // }


        //---------------------------------

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

    /**
     * 隐藏所有棋子选中状态
     */
    hideAllSelected() {
        this.curSelectChess = null as unknown as ChessPiece;
        for (let i = 0; i < this.chessArr.length; i++) {
            this.chessArr[i].setSelected();
        }
    }

    /**
     * 点中棋子事件
     * @param cp
     */
    evtHandleSelected(cp: ChessPiece) {
        this.clearningChessTag();
        this.curSelectChess = cp;
        switch (cp.role) {
            case ChessRole.bing:
                this.handleBingPath(cp.type);
                break;

            case ChessRole.boss:
                this.handleBossPath(cp.type);
                break;

            case ChessRole.ju:
                this.handleJuPath(cp.type);
                break;

            case ChessRole.ma:
                break;

            case ChessRole.pao:
                this.handlePaoPath(cp.type);
                break;

            case ChessRole.si:
                this.handleSiPath(cp.type);
                break;

            case ChessRole.xiang:
                this.handleXiangPath(cp.type);
                break;

            default: break;
        }
    }

    // todo
    handleXiangPath(role: number) {
        let cp: ChessPiece = this.curSelectChess;
        let grid = this.gridArr[cp.x][cp.z];
        let v3: Vec3 = new Vec3(0, cp.y, 0);
        /* 象心 */
        let center: Vec3 = new Vec3(0, cp.y, 0);
        if (cp.x > 0) {
            /* 左上 */
            v3.x = grid.x - this.offsetX * 2;
            center.x = grid.x - this.offsetX;
            if (cp.type == ChessType.red) {
                if (cp.z < 4) {//不能过河
                    /* 判断象心是否有棋子 */
                    center.z = grid.z - this.offsetZ;
                    if (!this.checkExisted(center)) {
                        v3.z = grid.z - this.offsetZ * 2;
                        this.jugedGenerateChessTag(v3);
                    }
                }
            }
            else {
                if (cp.z <= this.ver - 3) {
                    center.z = grid.z - this.offsetZ;
                    if (!this.checkExisted(center)) {
                        v3.z = grid.z - this.offsetZ * 2;
                        this.jugedGenerateChessTag(v3);
                    }
                }
            }
            /* 左下 */
            if (cp.type == ChessType.black) {
                if (cp.z > 5) {//不能过河
                    center.z = grid.z + this.offsetZ;
                    if (!this.checkExisted(center)) {
                        v3.z = grid.z + this.offsetZ * 2;
                        this.jugedGenerateChessTag(v3);
                    }
                }
            }
            else {
                if (cp.z > 2) {
                    center.z = grid.z + this.offsetZ;
                    if (!this.checkExisted(center)) {
                        v3.z = grid.z + this.offsetZ * 2;
                        this.jugedGenerateChessTag(v3);
                    }
                }
            }
        }
        if (cp.x < this.ver - 1) {
            /* 右上 */
            v3.x = grid.x + this.offsetX * 2;
            center.x = grid.x + this.offsetX;
            if (cp.type == ChessType.red) {
                if (cp.z < 4) {//不能过河
                    center.z = grid.z - this.offsetZ;
                    if (!this.checkExisted(center)) {
                        v3.z = grid.z - this.offsetZ * 2;
                        this.jugedGenerateChessTag(v3);
                    }
                }
            }
            else {
                if (cp.z <= this.ver - 3) {
                    center.z = grid.z - this.offsetZ;
                    if (!this.checkExisted(center)) {
                        v3.z = grid.z - this.offsetZ * 2;
                        this.jugedGenerateChessTag(v3);
                    }
                }
            }
            /* 右下 */
            if (cp.type == ChessType.black) {
                if (cp.z > 5) {//不能过河
                    center.z = grid.z + this.offsetZ;
                    if (!this.checkExisted(center)) {
                        v3.z = grid.z + this.offsetZ * 2;
                        this.jugedGenerateChessTag(v3);
                    }
                }
            }
            else {
                if (cp.z > 2) {
                    center.z = grid.z + this.offsetZ;
                    if (!this.checkExisted(center)) {
                        v3.z = grid.z + this.offsetZ * 2;
                        this.jugedGenerateChessTag(v3);
                    }
                }
            }
        }
    }

    /**
     * 主将可以走的步,河内/外,
     * @param role 
     */
    handleBossPath(role: number) {
        let cp: ChessPiece = this.curSelectChess;
        let grid = this.gridArr[cp.x][cp.z];
        let v3: Vec3 = new Vec3(0, cp.y, 0);
        /* 前 */
        if (cp.type == ChessType.black) {
            if (cp.z + 1 < this.ver) {
                v3 = new Vec3(grid.x, cp.y, grid.z - this.offsetZ);
                this.jugedGenerateChessTag(v3);
            }
        } else {
            v3 = new Vec3(grid.x, cp.y, grid.z - this.offsetZ);
            this.jugedGenerateChessTag(v3);
        }
        // /* 后 */
        if (cp.type == ChessType.red) {
            if (cp.z - 1 >= 0) {
                v3 = new Vec3(grid.x, cp.y, grid.z + this.offsetZ);
                this.jugedGenerateChessTag(v3);
            }
        }
        else {
            v3 = new Vec3(grid.x, cp.y, grid.z + this.offsetZ);
            this.jugedGenerateChessTag(v3);
        }
        /* 左 */
        if (cp.x - 1 >= 3) {
            v3 = new Vec3(grid.x - this.offsetX, cp.y, grid.z);
            this.jugedGenerateChessTag(v3);
        }
        /* 右 */
        if (cp.x + 1 < this.ver - 3) {
            v3 = new Vec3(grid.x + this.offsetX, cp.y, grid.z);
            this.jugedGenerateChessTag(v3);
        }
    }

    /**
     * 士可以走的步,河内/外,
     * @param role 
     */
    handleSiPath(role: number) {
        let cp: ChessPiece = this.curSelectChess;
        let grid = this.gridArr[cp.x][cp.z];
        let v3: Vec3 = new Vec3(0, cp.y, 0);
        if (cp.x == 3) {
            v3.x = grid.x + this.offsetX;
            if (cp.z == 0 || cp.z == this.ver - 1) {
                if (cp.z < 5) {//red
                    v3.z = grid.z - this.offsetZ;
                }
                else {//black
                    v3.z = grid.z + this.offsetZ;
                }
            }
            else if (cp.z == 2 || cp.z == this.ver - 3) {
                if (cp.z < 5) {//red
                    v3.z = grid.z + this.offsetZ;
                }
                else {//black
                    v3.z = grid.z - this.offsetZ;
                }
            }
            this.jugedGenerateChessTag(v3);
        }
        else if (cp.x == 4) {
            /* 右上 */
            v3.x = grid.x + this.offsetX;
            v3.z = grid.z - this.offsetZ;
            this.jugedGenerateChessTag(v3);
            /* 右下 */
            v3.z = grid.z + this.offsetZ;
            this.jugedGenerateChessTag(v3);
            /* 左上 */
            v3.x = grid.x - this.offsetX;
            v3.z = grid.z - this.offsetZ;
            this.jugedGenerateChessTag(v3);
            /* 左下 */
            v3.z = grid.z + this.offsetZ;
            this.jugedGenerateChessTag(v3);
        }
        else if (cp.x == 5) {
            v3.x = grid.x - this.offsetX;
            if (cp.z == 0 || cp.z == this.ver - 1) {
                if (cp.z < 5) {//red
                    v3.z = grid.z - this.offsetZ;
                }
                else {//black
                    v3.z = grid.z + this.offsetZ;
                }
            }
            else if (cp.z == 2 || cp.z == this.ver - 3) {
                if (cp.z < 5) {//red
                    v3.z = grid.z + this.offsetZ;
                }
                else {//black
                    v3.z = grid.z - this.offsetZ;
                }
            }
            this.jugedGenerateChessTag(v3);
        }
    }

    /**
     * 兵可以走的步,河内:只能前进,河外:左/右/前进,吃子动作
     * @param role 
     */
    handleBingPath(role: number) {
        let cp: ChessPiece = this.curSelectChess;
        let grid = this.gridArr[cp.x][cp.z];
        /* 红方 */
        if (role == ChessType.red) {
            if (cp.z <= 4) {//河内
                /* 前 */
                let v3: Vec3 = new Vec3(grid.x, cp.y, grid.z - this.offsetZ);
                this.jugedGenerateChessTag(v3);
            }
            else {//河外
                /* 前 */
                let v3: Vec3 = new Vec3(grid.x, cp.y, grid.z - this.offsetZ);
                if (cp.z < this.ver - 1) {
                    this.jugedGenerateChessTag(v3);
                }
                if (cp.x > 0 && cp.x < this.hor - 1) {
                    /* 左 */
                    v3 = new Vec3(grid.x - this.offsetX, cp.y, grid.z);
                    this.jugedGenerateChessTag(v3);
                    /* 右 */
                    v3 = new Vec3(grid.x + this.offsetX, cp.y, grid.z);
                    this.jugedGenerateChessTag(v3);
                }
            }
        }
        else if (role == ChessType.black) {
            if (cp.z >= 5) {//河内
                /* 前 */
                let v3: Vec3 = new Vec3(grid.x, cp.y, grid.z + this.offsetZ);
                this.jugedGenerateChessTag(v3);
            }
            else {//河外
                /* 前 */
                let v3: Vec3 = new Vec3(grid.x, cp.y, grid.z - this.offsetZ);
                if (cp.z > 0) {
                    this.jugedGenerateChessTag(v3);
                }
                if (cp.x > 0 && cp.x < this.hor - 1) {
                    /* 左 */
                    v3 = new Vec3(grid.x - this.offsetX, cp.y, grid.z);
                    this.jugedGenerateChessTag(v3);
                    /* 右 */
                    v3 = new Vec3(grid.x + this.offsetX, cp.y, grid.z);
                    this.jugedGenerateChessTag(v3);
                }
            }
        }
    }

    /**
     * 军可以走的步
     * @param role 
     */
    handleJuPath(role: number) {
        let cp: ChessPiece = this.curSelectChess;
        let grid = this.gridArr[cp.x][cp.z];
        let v3: Vec3 = new Vec3();
        /* 前 */
        for (let i = cp.z + 1; i < this.ver; i++) {
            v3 = new Vec3(grid.x, cp.y, grid.z - this.offsetZ * (i - cp.z));
            let chess = this.checkExisted(v3);
            if (chess) {
                if (chess.type != cp.type) {
                    this.generateChessTag(v3);
                }
                break;
            }
            this.generateChessTag(v3);
        }
        /* 后 */
        for (let i = cp.z - 1; i >= 0; i--) {
            v3 = new Vec3(grid.x, cp.y, grid.z - this.offsetZ * (i - cp.z));
            let chess = this.checkExisted(v3);
            if (chess) {
                if (chess.type != cp.type) {
                    this.generateChessTag(v3);
                }
                break;
            }
            this.generateChessTag(v3);
        }
        /* 左 */
        for (let i = cp.x - 1; i >= 0; i--) {
            v3 = new Vec3(grid.x - this.offsetX * (cp.x - i), cp.y, grid.z);
            let chess = this.checkExisted(v3);
            if (chess) {
                if (chess.type != cp.type) {
                    this.generateChessTag(v3);
                }
                break;
            }
            this.generateChessTag(v3);
        }
        /* 右 */
        for (let i = cp.x + 1; i < this.hor; i++) {
            v3 = new Vec3(grid.x + this.offsetX * (i - cp.x), cp.y, grid.z);
            let chess = this.checkExisted(v3);
            if (chess) {
                if (chess.type != cp.type) {
                    this.generateChessTag(v3);
                }
                break;
            }
            this.generateChessTag(v3);
        }
    }

    /**
     * 炮可以走的步 TODO
     * @param role 
     */
    handlePaoPath(role: number) {
        let cp: ChessPiece = this.curSelectChess;
        let grid = this.gridArr[cp.x][cp.z];
        let v3: Vec3 = new Vec3();
        /* 记录直线上的棋子数量,炮打翻三 */
        let count: number = 0;
        /* 前 */
        for (let i = cp.z + 1; i < this.ver; i++) {
            v3 = new Vec3(grid.x, cp.y, grid.z - this.offsetZ * (i - cp.z));
            let chess = this.checkExisted(v3);
            if (chess) {
                count++;
                if (count == 2) {//翻山有子,可打
                    if (chess.type != cp.type) {
                        this.generateChessTag(v3);
                    }
                    break;
                }
                continue;
            }
            if (count < 1) {
                this.generateChessTag(v3);
            }
        }
        /* 后 */
        count = 0;
        for (let i = cp.z - 1; i >= 0; i--) {
            v3 = new Vec3(grid.x, cp.y, grid.z - this.offsetZ * (i - cp.z));
            let chess = this.checkExisted(v3);
            if (chess) {
                count++;
                if (count == 2) {//翻山有子,可打
                    if (chess.type != cp.type) {
                        this.generateChessTag(v3);
                    }
                    break;
                }
                continue;
            }
            if (count < 1) {
                this.generateChessTag(v3);
            }
        }
        /* 左 */
        count = 0;
        for (let i = cp.x - 1; i >= 0; i--) {
            v3 = new Vec3(grid.x - this.offsetX * (cp.x - i), cp.y, grid.z);
            let chess = this.checkExisted(v3);
            if (chess) {
                count++;
                if (count == 2) {//翻山有子,可打
                    if (chess.type != cp.type) {
                        this.generateChessTag(v3);
                    }
                    break;
                }
                continue;
            }
            if (count < 1) {
                this.generateChessTag(v3);
            }
        }
        /* 右 */
        count = 0;
        for (let i = cp.x + 1; i < this.hor; i++) {
            v3 = new Vec3(grid.x + this.offsetX * (i - cp.x), cp.y, grid.z);
            let chess = this.checkExisted(v3);
            if (chess) {
                count++;
                if (count == 2) {//翻山有子,可打
                    if (chess.type != cp.type) {
                        this.generateChessTag(v3);
                    }
                    break;
                }
                continue;
            }
            if (count < 1) {
                this.generateChessTag(v3);
            }
        }
    }

    /**
     * 显示可走路径
     * @param pos 
     */
    generateChessTag(pos: Vec3) {
        let ct = PoolManager.getNode(this.chessTag);
        ct.setWorldPosition(pos);
        (ct.getComponent(ChessTag) as ChessTag).init(this.curSelectChess.z);
        this.node.scene.addChild(ct);
        this.chessTagArr.push(ct);
    }

    /**
     * 清除棋子可行走路径
     */
    clearningChessTag() {
        for (let i = 0; i < this.chessTagArr.length; i++) {
            PoolManager.setNode(this.chessTagArr[i]);
        }
        this.chessTagArr.splice(0);
    }

    /**
     * 检测该位置是否已经有棋子了
     * @param pos 
     */
    checkExisted(pos: Vec3): ChessPiece {
        for (let i = 0; i < this.chessArr.length; i++) {
            let cpos: Vec3 = this.chessArr[i].node.getWorldPosition();
            if (pos.x == cpos.x && pos.z == cpos.z) {
                return this.chessArr[i];
            }
        }
        return null as unknown as ChessPiece;
    }

    /**
     * 根据玩家拿着的红/黑棋判定是否可走,并生成
     * @param v3 
     */
    jugedGenerateChessTag(v3: Vec3) {
        let chess = this.checkExisted(v3);
        if (chess) {
            if (chess.type != this.curSelectChess.type) {
                this.generateChessTag(v3);
            }
        }
        else {
            this.generateChessTag(v3);
        }
    }
}

