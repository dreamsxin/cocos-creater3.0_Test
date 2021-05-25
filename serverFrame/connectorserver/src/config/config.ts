export interface Ip {
    ip: string,
    port: number,
    serverType: number,
}

export enum ServerType {
    gameServer = 101,
    userServer = 102,
}

export enum ServerPort {
    gameServer = 9000,
    userServer = 9001,
    connector = 8999,
}

export default class ServerConfig {
    /* 网关端口 */
    public static port = 8999;
    /* 网关ip */
    public static ip = "192.168.0.131";
    public static remoteIp = "172.16.0.14";//"139.199.80.239";
    public static dbName = "undefine";
    public static dbPort = 27017;

    public static dev = {
        local: 0,
        remote: 1
    }
    constructor() { }
    public static getIp(index: number): string {
        if (index == this.dev.local) {
            return this.ip;
        }
        else if (index == this.dev.remote) {
            return this.remoteIp;
        }
        return this.ip;
    }

    /**
     * 子服务器列表,网关需要作为客户端去连接的服务器
     * @returns 
     */
    public static getServerIpList(): Ip[] {
        let list: Ip[] = [
            { ip: "192.168.0.131", port: 9000, serverType: 101 },//游戏服务器
            { ip: "192.168.0.131", port: 9001, serverType: 102 },//用户服务器
        ];
        return list;
    }
}