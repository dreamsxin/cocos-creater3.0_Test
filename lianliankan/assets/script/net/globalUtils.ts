
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

export interface elementData {
    x: number,//列
    y: number,//行
}

/**
 * 关卡数据接口
 */
export interface levelData {
    id: number,
    hor: number,
    ver: number,
    nd: number,
    kinds: number,
    time: number,
}

export interface userData {
    gold: number,//金币
    level: number,//关卡
    sign: number,//签到天数
    signDay: number,//签到当天
}