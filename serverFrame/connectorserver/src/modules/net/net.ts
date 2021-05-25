import EventManager from "../common/EventManager";
import ServerConfig, { Ip } from "../../config/config"
import Logger from "../utils/logger";
import ServerClientSocket from "./serverClientSocket";
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
            /* 游戏客户端接入 */
            let clientSocket = new ClientSocket(socket);
            EventManager.Instance.dispatchEvent(EventManager.EvtSaveClientSocket, clientSocket);
        });
    }

    /**
     * 作为客户端连接子服务器
     */
    public async connectSonServer() {
        let sList: Ip[] = ServerConfig.getServerIpList();
        for (let i = 0; i < sList.length; i++) {
            this.startConnect(sList[i].ip, sList[i].port, sList[i].serverType);
        }
    }

    /**
     * 开始建立连接
     * @param ip 
     * @param port
     */
    startConnect(ip: string, port: number, serverType: number) {
        let url = `ws://${ip}:${port}/`
        var WebSocketClient = require('websocket').client;
        var serverClient = new WebSocketClient();
        serverClient.on('connectFailed', (error) => {
            console.log('Connect Error: ' + error.toString());
            /* 连接失败,间隔3秒重新连接 */
            setTimeout(() => {
                this.startConnect(ip, port, serverType);
            }, 3000)
        });

        serverClient.on('connect', (connection) => {
            console.log('connected server ' + ip + ":" + port);
            connection.on('error', (error) => {
                console.log("Connection Error: " + error.toString());
            });
            let scClient: ServerClientSocket = new ServerClientSocket(connection, serverType, port, ip);
            EventManager.Instance.dispatchEvent(EventManager.EvtSaveServerClientSocket, scClient);
        });

        serverClient.connect(url);
    }
}