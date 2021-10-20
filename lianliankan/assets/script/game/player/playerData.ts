
import { _decorator, Component, Node } from 'cc';
import { DataManager } from '../../data/dataManager';
import { elementsData } from '../../data/elementsData';
import { Constant } from '../../framework/constant';
import { StorageManager1 } from '../../framework/storageManager';
import { levelData, userData } from '../../net/globalUtils';
const { ccclass, property } = _decorator;

@ccclass('PlayerData')
export class PlayerData {

    static _instance: PlayerData;

    public level: number = 1;
    private _levelData: levelData = null;

    private _data: userData = null;

    public static get Inst() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new PlayerData();
        this._instance.init();
        return this._instance;
    }

    init() {
        this._data = {
            gold: StorageManager1.Inst.getData('gold'),
            level: StorageManager1.Inst.getData('level'),
            sign: StorageManager1.Inst.getData('sign'),
        }
        this.level = this._data.level;
    }

    getLevelData(): levelData {
        let list = elementsData.data;
        this.level = this.level < list.length ? this.level : list.length - 1;
        this._levelData = DataManager.getelementsDataById(this.level);
        return this._levelData;
    }

    nextNevel() {
        this.level++;
        StorageManager1.Inst.setData(Constant.UserData.level, this.level);
    }
}

