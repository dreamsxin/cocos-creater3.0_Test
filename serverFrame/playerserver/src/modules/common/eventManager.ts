/* 自定义事件模块 */
export default class EventManager {
    private static _instance: EventManager = null;
    public static get Instance(): EventManager {
        if (!EventManager._instance) {
            EventManager._instance = new EventManager();
        }
        return EventManager._instance;
    }
    /* 事件数组 [{name:[{target:,callback:,}]}] */
    private events: Array<any> = new Array<any>();
    public static EvtSaveUserSocket = "evt_save_user_socket";
    public static EvtRemoveUserSocket = "evt_remove_user_socket";

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
                for (var i = 0; i < this.events[event_type].length; i++) {
                    if (target == this.events[event_type][i].target && this.events[event_type][i].callback == callback) {
                        this.events[event_type].splice(i, 1);
                        return;
                    }
                }
            }
        }
    }
}
