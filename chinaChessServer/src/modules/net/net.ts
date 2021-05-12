import EventManager from "../common/EventManager";
import ServerConfig from "../../config/config"
import Logger from "../utils/logger";
import ClientSocket from "./clientSocket";
let WS = require('ws');
export default class Net {
    private _server: any;
    private static _instance: Net = null;
    public static get Instance(): Net {
        if (!Net._instance) {
            Net._instance = new Net();
        }
        return Net._instance;
    }

    /**
     * 启动服务器
     */
    public async startServer() {
        /* 先连接数据库 */
        // await MongodbUtil.Inst.init();
        let ip = ServerConfig.getIp(ServerConfig.dev.local);
        Logger.info(`start server ${ip} ${ServerConfig.port}`);
        this._server = new WS.Server({ host: ip, port: ServerConfig.port });
        this._server.on('open', () => { Logger.info('connected') });
        this._server.on('close', (param) => { Logger.info(JSON.stringify(param)) });
        this._server.on('error', (err) => { Logger.info(JSON.stringify(err)) });
        this._server.on('connection', (socket: any, data) => {
            let ip = data.connection.remoteAddress;
            let port = data.connection.remotePort;
            Logger.info(`${ip}:${port} is connected`);
            let clientSocket = new ClientSocket(socket);
            EventManager.Instance.dispatchEvent(EventManager.EvtSaveClientSocket, clientSocket);
        });
    }
}