import { _decorator, sys, log } from "cc";
import { userData } from "../net/globalUtils";
import { util } from "./util";

const { ccclass, property } = _decorator;

@ccclass("StorageManager1")
export class StorageManager1 {
    private static _instance: StorageManager1;

    public static get Inst() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new StorageManager1();
        this._instance.init();
        return this._instance;
    }

    private _keyConfig: string = 'llk';//游戏英文名称
    private _markSave: boolean = false;
    private _saveTimer: number = -1;
    public jsonData: userData = {
        gold: 100,
        level: 1,
        sign: 0
    };

    init() {
        var content = sys.localStorage.getItem(this._keyConfig);

        if (content) {
            try {
                //初始化操作
                var jsonData = JSON.parse(content);
                this.jsonData = jsonData;
            } catch (excepaiton) {
                console.log("jsonData 初始化失败")
            }
        }
        else {
            this.save();
        }

        //每隔5秒保存一次数据，主要是为了保存最新在线时间，方便离线奖励时间判定
        this._saveTimer = setInterval(() => {
            this.scheduleSave();
        }, 5000);
    }

    /**
     * 设置全局数据
     * @param {string} key 关键字
     * @param {any}value  存储值
     * @returns 
     */
    public setData(key: string, value: any) {
        this.jsonData[key] = value;
        this.save();
    }

    /**
     * 获取全局数据
     * @param {string} key 关键字
     * @returns 
     */
    public getData(key: string) {
        return this.jsonData[key];
    }

    /**
     * 定时存储
     * @returns 
     */
    public scheduleSave() {
        if (!this._markSave) {
            return;
        }

        this.save();
    }

    /**
     * 标记为已修改
     */
    public markModified() {
        this._markSave = true;
    }

    /**
     * 保存配置文件
     * @returns 
     */
    public save() {
        // 写入文件
        var str = JSON.stringify(this.jsonData);
        this._markSave = false;
        var ls = sys.localStorage;
        ls.setItem(this._keyConfig, str);
    }
}
