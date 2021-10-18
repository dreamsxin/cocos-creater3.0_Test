
import { _decorator, Component, Node } from 'cc';
import { DataManager } from '../../data/dataManager';
import { levelData } from '../../net/globalUtils';
const { ccclass, property } = _decorator;

@ccclass('PlayerData')
export class PlayerData {

    static _instance: PlayerData;

    public level: number = 1;
    private _levelData: levelData = null;

    public static get Inst() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new PlayerData();
        this._instance.init();
        return this._instance;
    }

    init() {

    }

    getLevelData(): levelData {
        this._levelData = DataManager.getelementsDataById(this.level);
        return this._levelData;
    }
}
