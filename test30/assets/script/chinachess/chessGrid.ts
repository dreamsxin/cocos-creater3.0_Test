
import { _decorator, Component, Node, Vec3, Prefab, tween } from 'cc';
import { PoolManager } from '../infinitymap/poolManager';
import EventManager from '../shooting/eventManager';
import ChessUtil, { ChessRole, ChessType } from './chessEnum';
import { ChessPiece } from './chessPiece';
import { ChessPlayer } from './chessPlayer';
import { ChessTag } from './chessTag';
import { eatChessReq, playChessReq } from './net/globalUtils';
import { Net } from './net/net';
import { Router } from './net/routers';
const { ccclass, property } = _decorator;

@ccclass('ChessGrid')
export class ChessGrid extends Component {

    @property(Node)
    mainCamera: Node = null as unknown as Node;

    @property(Prefab)
    chessPrefab: Prefab = null as unknown as Prefab;

    /* 可行走路径 */
    @property(Prefab)
    chessTag: Prefab = null as unknown as Prefab;

    @property(Node)
    layoutNode: Node = null as unknown as Node;

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
    public curSelectChess: ChessPiece = null as unknown as ChessPiece;
    /* 选中的第二颗棋子,可能是要吃掉的 */
    private curTargetChess: ChessPiece = null as unknown as ChessPiece;
    /* 炮打翻山,中间的棋子,用来做跳跃动画使用 */
    private paoBridgeChess: ChessPiece = null as unknown as ChessPiece;
    /* 被吃掉的红棋子列表 */
    private layoutRedGrid: Vec3[][] = [];
    /* 被吃掉的黑棋子列表 */
    private layoutBlackGrid: Vec3[][] = [];
    /* 排列被吃掉的棋子 */
    private lyRedChessArr: ChessPiece[] = [];
    private lyBlackChessArr: ChessPiece[] = [];
    /* 棋子是否真正行走 */
    public isMoving: boolean = false;
    /* 摄像机视角 */
    private cameraPosArr: Vec3[] = [];
    private cameraEulArr: Vec3[] = [];
    private perspectiveIndex = 0;

    onEnable() {
        if (this.cameraPosArr.length < 1 && this.cameraEulArr.length < 1) {
            let redPos: Vec3 = new Vec3(-0.4, 32, 50);
            let redEul: Vec3 = new Vec3(-40, 0, 0);
            this.cameraPosArr.push(redPos);
            this.cameraEulArr.push(redEul);

            let centerPos: Vec3 = new Vec3(-0.7, 73, 0.1);
            let centerEul: Vec3 = new Vec3(-90, 0, 0);
            this.cameraPosArr.push(centerPos);
            this.cameraEulArr.push(centerEul);

            let centerPos1: Vec3 = new Vec3(-0.7, 73, 0.1);
            let centerEul1: Vec3 = new Vec3(-90, 180, 0);
            this.cameraPosArr.push(centerPos1);
            this.cameraEulArr.push(centerEul1);

            let blackPos: Vec3 = new Vec3(-0.4, 32, -50);
            let blackEul: Vec3 = new Vec3(-40, 180, 0);
            this.cameraPosArr.push(blackPos);
            this.cameraEulArr.push(blackEul);
            this.init();
        }
    }

    async init() {
        await this.generateGrid();
        this.initLayoutRedBlackGrid();
        // this.initGenerateChess();
    }

    /**
     * 切换视角
     */
    switchPerspective() {
        let pos = this.cameraPosArr[this.perspectiveIndex];
        let eul = this.cameraEulArr[this.perspectiveIndex];
        this.mainCamera.setWorldPosition(pos);
        tween(this.mainCamera).to(0.5, { worldPosition: pos, eulerAngles: eul }).start();
        this.perspectiveIndex++;
        if (this.perspectiveIndex >= 4) {
            this.perspectiveIndex = 0;
        }
    }

    /**
     * 初始化排列被吃掉的棋子的网格
     */
    initLayoutRedBlackGrid() {
        for (let x = 0; x < 2; x++) {
            let arr: Vec3[] = [];
            this.layoutRedGrid.push(arr);
            for (let z = 0; z < 8; z++) {
                let xx: number = -25 - x * 5;
                let zz: number = 27 - z * 4;
                let v3: Vec3 = new Vec3(xx, this.offsetY, zz);
                this.layoutRedGrid[x].push(v3);
            }
        }
        for (let x = 0; x < 2; x++) {
            let arr: Vec3[] = [];
            this.layoutBlackGrid.push(arr);
            for (let z = 0; z < 8; z++) {
                let xx1 = 25 + x * 5;
                let zz1 = -27 + z * 4;
                let v31 = new Vec3(xx1, this.offsetY, zz1);
                this.layoutBlackGrid[x].push(v31);
            }
        }
    }

    /**
     * 初始化默认棋盘/棋子
     */
    async initGenerateChess() {
        if (ChessPlayer.Inst.type == ChessType.black) {
            this.mainCamera.eulerAngles = this.cameraEulArr[2];
            this.mainCamera.setWorldPosition(this.cameraPosArr[2]);
        }
        else {
            this.mainCamera.eulerAngles = this.cameraEulArr[1];
            this.mainCamera.setWorldPosition(this.cameraPosArr[1]);
        }

        for (let x = 0; x < this.hor; x++) {
            for (let z = 0; z < this.ver; z++) {
                let type: number = z < 5 ? ChessType.red : ChessType.black;
                let role: number = this.getChessRoleByPos(x, z);
                if (role < 0) continue;
                let pos: Vec3 = this.gridArr[x][z];
                let chess: Node = PoolManager.getNode(this.chessPrefab);
                this.node.scene.addChild(chess);
                chess.setPosition(new Vec3(0, this.offsetY, 0));

                let cp: ChessPiece = chess.getComponent(ChessPiece) as ChessPiece;
                cp.type = type;
                cp.role = role;
                cp.init(x, z);
                this.chessArr.push(cp);
                await cp.initPosition(pos);
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
        this.curTargetChess = null as unknown as ChessPiece;
        for (let i = 0; i < this.chessArr.length; i++) {
            this.chessArr[i].setSelected();
        }
        this.clearningChessTag();
    }

    /**
     * 处理前两次点中的棋子
     * @param cp 
     */
    handleClickChessPiece(cp: ChessPiece): boolean {
        let continueBool: boolean = true;
        if (this.curSelectChess) {
            if (this.curSelectChess.x == cp.x && this.curSelectChess.z == cp.z) {
                continueBool = false;
            }
            else {
                if (!this.curTargetChess) {
                    this.curTargetChess = cp;
                    let pos = this.curSelectChess.node.getWorldPosition();
                    /* 可以吃该棋子 */
                    if (this.moveToTargetPos(cp.node.getWorldPosition(), () => {
                        this.sendEatChessInof(cp, pos);
                    })) {
                        continueBool = false;
                    }
                }
            }
        }
        return continueBool;
    }

    /**
     * 发送吃棋子消息
     * @param eated 
     * @param pos 
     */
    async sendEatChessInof(eated: ChessPiece, pos: Vec3) {
        console.log("chessarr.length=> " + this.chessArr.length);
        // let xz = this.getOffsetXZ(pos);
        let data: eatChessReq = {
            roomId: ChessPlayer.Inst.roomId,
            type: ChessPlayer.Inst.type == ChessType.red ? ChessType.black : ChessType.red,
            role: eated.role,
            ox: eated.x, oz: eated.z
        }
        Net.sendMsg(data, Router.rut_eatChess);
    }

    /**
     * 吃棋子操作
     * @param eated 
     */
    async handleEatChess(eated: ChessPiece, pos: Vec3) {
        let pos2 = eated.node.getWorldPosition();
        let out = new Vec3()
        let distance = Vec3.subtract(out, pos2, pos).length();
        this.removeEatedFromList(pos, eated);
        /*  将被吃掉的棋子移除 */
        this.layoutRemoveNode(eated);
        PoolManager.setNode(eated.node);
        if (eated.role == ChessRole.boss) {
            EventManager.Inst.dispatchEvent(EventManager.EVT_chessGameOver, eated);
        }
    }

    /**
     * 将吃掉的棋子排列到两侧
     * @param cp 
     */
    layoutRemoveNode(cpe: ChessPiece) {
        let chess: Node = PoolManager.getNode(this.chessPrefab);
        this.layoutNode.addChild(chess);
        let type: number = cpe.type;

        for (let x = 0; x < 2; x++) {
            for (let z = 0; z < 8; z++) {
                let grid: Vec3 = type == ChessType.red ? this.layoutRedGrid[x][z] : this.layoutBlackGrid[x][z];
                if (!this.checkExistedLayout(grid, type)) {
                    chess.setPosition(grid);

                    let cp: ChessPiece = chess.getComponent(ChessPiece) as ChessPiece;
                    cp.type = cpe.type;
                    cp.role = cpe.role;
                    cp.init(x, z);
                    if (type == ChessType.red) {
                        this.lyRedChessArr.push(cp)
                    }
                    else {
                        this.lyBlackChessArr.push(cp);
                    }
                    return;
                }
            }
        }
    }

    /**
     * 将被吃掉的棋子从列表中移除
     * @param pos 
     * @returns 
     */
    removeEatedFromList(pos: Vec3, cs: ChessPiece) {
        for (let i = 0; i < this.chessArr.length; i++) {
            let cpos: Vec3 = this.chessArr[i].node.getWorldPosition();
            if (pos.x == cpos.x && pos.z == cpos.z && cs.type == this.chessArr[i].type && cs.role == this.chessArr[i].role) {
                this.chessArr.splice(i, 1);
                break;
            }
        }
    }


    /**
     * 点中棋子事件
     * @param cp
     */
    evtHandleSelected(cp: ChessPiece) {
        if (!this.curSelectChess) {
            /* 只能操作自己的棋子 */
            if (cp.type != ChessPlayer.Inst.type) return;
        }
        if (!this.handleClickChessPiece(cp)) return;
        this.hideAllSelected();
        cp.setSelected(true);
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
                this.handleMaPath(cp.type);
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

    /**
     * 马将可以走的步,河内/外,
     * @param role 
     */
    handleMaPath(role: number) {
        let cp: ChessPiece = this.curSelectChess;
        let grid = this.gridArr[cp.x][cp.z];
        let v3: Vec3 = new Vec3(0, cp.y, 0);
        /* 马心 */
        let center: Vec3 = new Vec3(0, cp.y, 0);
        /* 左上 */
        if (cp.x > 0 && cp.z <= this.ver - 3) {
            v3.x = grid.x - this.offsetX;
            v3.z = grid.z - this.offsetZ * 2;
            center.x = grid.x;
            center.z = grid.z - this.offsetZ;
            /* 判断马心是否有棋子 */
            if (!this.checkExisted(center)) {
                this.jugedGenerateChessTag(v3);
            }
        }
        if (cp.x > 1 && cp.z <= this.ver - 2) {
            v3.x = grid.x - this.offsetX * 2;
            v3.z = grid.z - this.offsetZ;
            center.x = grid.x - this.offsetX;
            center.z = grid.z;
            if (!this.checkExisted(center)) {
                this.jugedGenerateChessTag(v3);
            }
        }
        /* 左下 */
        if (cp.x > 0 && cp.z >= 2) {
            v3.x = grid.x - this.offsetX;
            v3.z = grid.z + this.offsetZ * 2;
            center.x = grid.x;
            center.z = grid.z + this.offsetZ;
            if (!this.checkExisted(center)) {
                this.jugedGenerateChessTag(v3);
            }
        }
        if (cp.x > 1 && cp.z >= 1) {
            v3.x = grid.x - this.offsetX * 2;
            v3.z = grid.z + this.offsetZ;
            center.x = grid.x - this.offsetX;
            center.z = grid.z;
            if (!this.checkExisted(center)) {
                this.jugedGenerateChessTag(v3);
            }
        }
        /* 右上 */
        if (cp.x < this.hor - 1 && cp.z <= this.ver - 3) {
            v3.x = grid.x + this.offsetX;
            v3.z = grid.z - this.offsetZ * 2;
            center.x = grid.x;
            center.z = grid.z - this.offsetZ;
            if (!this.checkExisted(center)) {
                this.jugedGenerateChessTag(v3);
            }
        }
        if (cp.x < this.hor - 2 && cp.z <= this.ver - 2) {
            v3.x = grid.x + this.offsetX * 2;
            v3.z = grid.z - this.offsetZ;
            center.x = grid.x + this.offsetX;
            center.z = grid.z;
            if (!this.checkExisted(center)) {
                this.jugedGenerateChessTag(v3);
            }
        }
        /* 右下 */
        if (cp.x < this.hor - 1 && cp.z >= 2) {
            v3.x = grid.x + this.offsetX;
            v3.z = grid.z + this.offsetZ * 2;
            center.x = grid.x;
            center.z = grid.z + this.offsetZ;
            if (!this.checkExisted(center)) {
                this.jugedGenerateChessTag(v3);
            }
        }
        if (cp.x < this.hor - 2 && cp.z >= 1) {
            v3.x = grid.x + this.offsetX * 2;
            v3.z = grid.z + this.offsetZ;
            center.x = grid.x + this.offsetX;
            center.z = grid.z;
            if (!this.checkExisted(center)) {
                this.jugedGenerateChessTag(v3);
            }
        }
    }
    /**
     * 象将可以走的步,河内/外,
     * @param role 
     */
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
                if (cp.z >= 2) {
                    center.z = grid.z + this.offsetZ;
                    if (!this.checkExisted(center)) {
                        v3.z = grid.z + this.offsetZ * 2;
                        this.jugedGenerateChessTag(v3);
                    }
                }
            }
        }
        if (cp.x < this.hor - 1) {
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
                if (cp.z >= 2) {
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
                let v3: Vec3 = new Vec3(grid.x, cp.y, grid.z + this.offsetZ);
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
        this.paoBridgeChess = null as unknown as ChessPiece;
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
                if (!this.paoBridgeChess) {
                    this.paoBridgeChess = chess;
                }
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
                if (!this.paoBridgeChess) {
                    this.paoBridgeChess = chess;
                }
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
                if (!this.paoBridgeChess) {
                    this.paoBridgeChess = chess;
                }
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
                if (!this.paoBridgeChess) {
                    this.paoBridgeChess = chess;
                }
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
     * 清除棋盘上的棋子
     */
    clearningChess() {
        for (let i = 0; i < this.chessArr.length; i++) {
            PoolManager.setNode(this.chessArr[i].node);
        }
        this.chessArr.splice(0);
    }

    clearningLayoutChess() {
        for (let i = 0; i < this.lyBlackChessArr.length; i++) {
            PoolManager.setNode(this.lyBlackChessArr[i].node);
        }
        this.lyBlackChessArr.splice(0);
        for (let i = 0; i < this.lyRedChessArr.length; i++) {
            PoolManager.setNode(this.lyRedChessArr[i].node);
        }
        this.lyRedChessArr.splice(0);
    }

    /**
     * 清场
     */
    clearningAll() {
        this.clearningChessTag();
        this.clearningLayoutChess();
        this.clearningChess();
    }

    /**
     * 重新开始游戏
     */
    startGame() {
        this.clearningAll();
        this.initGenerateChess();
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

    checkExistedLayout(pos: Vec3, type: number) {
        let chessArr: ChessPiece[] = type == ChessType.red ? this.lyRedChessArr : this.lyBlackChessArr;
        for (let i = 0; i < chessArr.length; i++) {
            let cpos: Vec3 = chessArr[i].node.getWorldPosition();
            if (pos.x == cpos.x && pos.z == cpos.z) {
                return chessArr[i];
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

    /**
     * 获取棋子合法行走路径
     * @returns 
     */
    getPath(): Vec3[] {
        let result: Vec3[] = [];
        for (let i = 0; i < this.chessTagArr.length; i++) {
            result.push(this.chessTagArr[i].getWorldPosition());
        }
        return result;
    }

    /**
     * 移动到目标位置
     * @param pos 
     */
    moveToTargetPos(pos: Vec3, cb?: Function, v3?: Vec3[]): Promise<boolean> {
        return new Promise(async resolve => {
            let isCanMove: boolean = false;
            let pArr: Vec3[] = this.getPath();
            if (v3) {
                pArr = v3;
            }
            for (let i = 0; i < pArr.length; i++) {
                let p = pArr[i];
                if (Vec3.equals(p, pos)) {
                    this.isMoving = true;
                    let xz: { x: number, z: number } = this.getOffsetXZ(p);
                    if (this.curSelectChess.type == ChessPlayer.Inst.type) {
                        this.sendPlayChessReq(xz.x, xz.z);
                    }
                    await this.handleCameraAction();
                    if (cb) {
                        // /*  将被吃掉的棋子移除 */
                        // this.removeEatedFromList(pos);
                    }
                    this.curSelectChess.updateInfo(p, xz.x, xz.z, () => {
                        this.chessMovedCallBack();
                        if (cb) {
                            cb();
                        }
                        this.isMoving = false;
                    });
                    /* 炮翻山动作 */
                    if (this.curSelectChess.role == ChessRole.pao) {
                        // this.paoBridgeChess
                        //todo
                    }
                    isCanMove = true;
                    break;
                }
            }
            this.clearningChessTag();
            this.curSelectChess = null as unknown as ChessPiece;
            resolve(isCanMove);
        });
    }

    //发送走棋消息
    sendPlayChessReq(x: number, z: number) {
        let p: Vec3 = this.curSelectChess.node.getWorldPosition();
        let xz: { x: number, z: number } = this.getOffsetXZ(p);
        let data: playChessReq = {
            type: this.curSelectChess.type,
            roomId: ChessPlayer.Inst.roomId,
            role: this.curSelectChess.role,
            x: x, z: z, ox: xz.x, oz: xz.z
        }
        Net.sendMsg(data, Router.rut_playChess);
        ChessPlayer.Inst.isCanPlay = false;
    }

    /**
     * 走棋回调函数
     */
    chessMovedCallBack() {
    }

    /**
     * 摄像机移动处理
     * @returns 
     */
    async handleCameraAction() {
        return new Promise(resolve => {
            resolve(null);
        });
    }

    getOffsetXZ(pos: Vec3): { x: number, z: number } {
        let xz = { x: 0, z: 0 }
        for (let x = 0; x < this.hor; x++) {
            for (let z = 0; z < this.ver; z++) {
                let p: Vec3 = this.gridArr[x][z];
                if (p && Vec3.equals(p, pos)) {
                    xz.z = z;
                    xz.x = x;
                }
            }
        }
        return xz;
    }

    /**
     * 通过角色和阵营获取棋子
     * @param role 
     * @param type 
     */
    getChessPieceByRole(role: number, type: number, x: number, z: number): ChessPiece {
        for (let i = 0; i < this.chessArr.length; i++) {
            let item = this.chessArr[i];
            if (item.role == role && item.type == type && item.x == x && item.z == z) {
                return item;
            }
        }
        return null as unknown as ChessPiece;
    }

}

