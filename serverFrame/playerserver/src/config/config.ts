export default class ServerConfig {
    public static port = 9001;
    public static ip = "192.168.0.192";
    public static remoteIp = "172.16.0.14";//"139.199.80.239";
    public static dbName = "chat";
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
}
