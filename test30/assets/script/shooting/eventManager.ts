/* 自定义事件模块 */
export default class EventManager {
    public static EVT_shooted: string = "shooted";
    public static EVT_recycle: string = "recycle";
    public static EVT_openDoor: string = "openthedoor";
    public static EVT_closeDoor: string = "closethedoor";
    public static EVT_chessGameOver: string = "chessgameover";
    public static EVT_chessTip: string = "chessTip";
    public static EVT_chessDownLine: string = "chessdownline";
    public static EVT_chessRestart: string = "EVT_chessrestart";
    public static EVT_chessUpLine: string = "EVT_chessupline";
    private static _instance: EventManager = null as unknown as EventManager;
    public static get Inst(): EventManager {
        if (!EventManager._instance) {
            EventManager._instance = new EventManager();
        }
        return EventManager._instance;
    }
    /* 事件数组 [{name:[{target:,callback:,}]}] */
    private events: Array<any> = new Array<any>();

    /**
     * 注册事件
     * @param {事件类型 string} eventType 
     * @param {回调函数} callback 
     * @param {目标对象} target 
     */
    public registerEevent(event_type: string, callback: Function, target?: any): void {
        if (this.events[event_type]) {
            var ev = { target: target, callback: callback };
            this.events[event_type].push(ev);
        }
        else {
            this.events[event_type] = [];
            var ev = { target: target, callback: callback };
            this.events[event_type].push(ev);
        }
    }

    /**
     * 发送事件
     * @param {事件类型 string} eventType 
     * @param {传递参数} param 
     */
    public dispatchEvent(event_type: string, param?: any): void {
        for (var type in this.events) {
            if (event_type == type) {
                for (var i = 0; i < this.events[event_type].length; i++) {
                    this.events[event_type][i].callback.call(this.events[event_type][i].target, param);
                }
            }
        }
    }

    /**
     * 移除事件
     * @param {事件类型  string} eventType 
     * @param {回调函数} callback 
     * @param {目标对象} target 
     */
    public removeEvent(event_type: string, callback?: Function, target?: any): void {
        for (var type in this.events) {
            if (event_type == type) {
                // for (var i = 0; i < this.events[event_type].length; i++) {
                //     if (target == this.events[event_type][i].target && this.events[event_type][i].callback == callback) {
                // this.events[event_type].splice(i, 1);
                this.events[event_type].splice(0);
                return;
                // }
                // }
            }
        }
    }
}
