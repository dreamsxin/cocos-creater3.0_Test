export enum IpType {
    local = 0,
    remote = 1
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

export function getIp(type: number): string {
    if (type == IpType.local) {
        return "ws://192.168.0.131:8999/ws";
        // return "ws://192.168.0.197:8089/ws";
    }
    else if (type == IpType.remote) {
        return "ws://139.199.80.239:8999/ws"
    }
    return "";
}