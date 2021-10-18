
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


export interface levelData {
    id: number,
    hor: number,
    ver: number,
    nd: number,
}


