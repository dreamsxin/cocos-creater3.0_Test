export enum IpType {
    local = 0,
    remote = 1
}

export function getIp(type: number): string {
    if (type == IpType.local) {
        return "ws://127.0.0.1:9000/ws";
        // return "ws://192.168.0.197:8089/ws";
    }
    else if (type == IpType.remote) {
        return "ws://139.199.80.239:9000/ws"
    }
    return "";
}