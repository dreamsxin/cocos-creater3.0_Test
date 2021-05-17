import DataViewUtils from "./dataviewUtils";
import { Router } from "./routers";
import { Head, ModelAny } from "./globalUtils";
import { getIp, IpType } from "./util";
import EventManager from "../../shooting/eventManager";

export default class ChessNet {
    private socket: WebSocket = null as unknown as WebSocket;
    private id: number = 0;
    private serverType: number = 0;
    public isConnected: boolean = false;
    init(cb?: any) {
        let ip = getIp(IpType.local);
        console.log(ip)
        this.socket = new WebSocket(ip);
        this.socket.binaryType = "arraybuffer";
        this.socket.onopen = () => {
            this.isConnected = true;
            console.log("--------connect success---------");
            if (cb) { cb(); }
        };
        this.socket.close = () => { console.log("close"); this.isConnected = false; };
        this.socket.onerror = () => { console.log("onerror") };
        this.socket.onmessage = (req) => {
            let message = req.data;
            let buf = new Uint8Array(message).buffer;
            let dtView = new DataView(buf);
            let head = DataViewUtils.getHeadData(dtView);
            let body = DataViewUtils.decoding(dtView, buf.byteLength);

            console.log("------------------receiveData------------------");
            console.log("router:" + head.router + " body:" + JSON.stringify(body));
            this.handleRecvdate(head, body);
        };
    }

    handleRecvdate(head: Head, body: ModelAny) {
        EventManager.Inst.dispatchEvent(head.router, body);
    }

    sendMsg(data: any, router: string) {
        console.log("------------------sendData------------------");
        console.log(data, router);
        let dt = DataViewUtils.encoding(this.id, this.serverType, Number(router), data);
        this.socket.send(dt);
    }
}

export const Net = new ChessNet();