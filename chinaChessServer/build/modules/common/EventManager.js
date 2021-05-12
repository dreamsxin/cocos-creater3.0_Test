"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* 自定义事件模块 */
class EventManager {
    constructor() {
        /* 事件数组 [{name:[{target:,callback:,}]}] */
        this.events = new Array();
    }
    static get Instance() {
        if (!EventManager._instance) {
            EventManager._instance = new EventManager();
        }
        return EventManager._instance;
    }
    /**
     * 注册事件
     * @param {事件类型 string} eventType
     * @param {回调函数} callback
     * @param {目标对象} target
     */
    registerEevent(event_type, callback, target) {
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
    dispatchEvent(event_type, param) {
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
    removeEvent(event_type, callback, target) {
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
exports.default = EventManager;
EventManager._instance = null;
EventManager.EvtSaveClientSocket = "evt_save_client_socket";
EventManager.EvtRemoveClientSocket = "evt_remove_client_socket";
EventManager.EvtResaveMessage = "evt_resave_massage";
