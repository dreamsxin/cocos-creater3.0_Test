/**
 * 消息格式
 */
export interface ModelAny {
    code?: number,
    msg?: any,
    err?: any,
}

/**
 * 协议头信息
 */
export interface Head {
    /* 唯一标示id */
    id: number,
    /* 服务器类型 */
    serverType: number,
    router: string,
}


export enum ChessType {
    red = 0,
    black,
}

/**
 * 房间信息
 */
export interface roomReq {
    roomId: number,
}

/**
 * 创建房间req
 */
export interface createRoomReq {
    roomId: number,
}
/**
 * 创建房间res
 */
export interface createRoomRes {
    roomId: number,
    /* 房间人数 */
    count: number,
}

/**
 * 走棋
 */
export interface playChessReq {
    roomId: number,
    type: number,//红/黑方
    role: number,//角色马/炮/军/兵/士
    x: number,//目标坐标
    z: number,
    ox: number,//原始坐标
    oz: number,
}

/**
 * 吃棋
 */
export interface eatChessReq {
    roomId: number,
    type: number,//红/黑方
    role: number,//角色马/炮/军/兵/士
    ox: number,//原始坐标
    oz: number,
}

/**
 * 重新开始
 */
export interface restartReq {
    type: number,//红/黑方
}

/**
 * 角色移动
 */
export interface moveReq {
    id: number,
    x: number,
    y: number,
    z: number,
}

/**
 * 用户上/下线
 */
export interface upLineReq {
    id: number,
}

/**
 *  玩家信息,推送
 */
export interface playerInfoRes {
    id: number[],
}

/**
 *  玩家进入房间,推送
 */
export interface joinRoomRes {
    id: number,
}