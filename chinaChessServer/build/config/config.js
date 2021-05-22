"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ServerConfig {
    constructor() {
    }
    static getIp(index) {
        if (index == this.dev.local) {
            return this.ip;
        }
        else if (index == this.dev.remote) {
            return this.remoteIp;
        }
        return this.ip;
    }
}
exports.default = ServerConfig;
ServerConfig.port = 9000;
ServerConfig.ip = "192.168.0.131";
ServerConfig.remoteIp = "172.16.0.14"; //"139.199.80.239";
ServerConfig.dbName = "chat";
ServerConfig.dbPort = 27017;
ServerConfig.dev = {
    local: 0,
    remote: 1
};
