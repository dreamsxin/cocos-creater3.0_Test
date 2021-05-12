"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const EventManager_1 = require("../common/EventManager");
const config_1 = require("../../config/config");
const logger_1 = require("../utils/logger");
const clientSocket_1 = require("./clientSocket");
let WS = require('ws');
class Net {
    static get Instance() {
        if (!Net._instance) {
            Net._instance = new Net();
        }
        return Net._instance;
    }
    /**
     * 启动服务器
     */
    startServer() {
        return __awaiter(this, void 0, void 0, function* () {
            /* 先连接数据库 */
            // await MongodbUtil.Inst.init();
            let ip = config_1.default.getIp(config_1.default.dev.local);
            logger_1.default.info(`start server ${ip} ${config_1.default.port}`);
            this._server = new WS.Server({ host: ip, port: config_1.default.port });
            this._server.on('open', () => { logger_1.default.info('connected'); });
            this._server.on('close', (param) => { logger_1.default.info(JSON.stringify(param)); });
            this._server.on('error', (err) => { logger_1.default.info(JSON.stringify(err)); });
            this._server.on('connection', (socket, data) => {
                let ip = data.connection.remoteAddress;
                let port = data.connection.remotePort;
                logger_1.default.info(`${ip}:${port} is connected`);
                let clientSocket = new clientSocket_1.default(socket);
                EventManager_1.default.Instance.dispatchEvent(EventManager_1.default.EvtSaveClientSocket, clientSocket);
            });
        });
    }
}
exports.default = Net;
Net._instance = null;
