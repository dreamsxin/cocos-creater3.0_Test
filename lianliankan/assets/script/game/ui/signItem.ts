
import { _decorator, Component, Node, Label, tween, Vec3 } from 'cc';
import { DataManager } from '../../data/dataManager';
import { insigns } from '../../data/signsData';
import { Constant } from '../../framework/constant';
import { StorageManager1 } from '../../framework/storageManager';
import { getDay } from '../../net/util';
const { ccclass, property } = _decorator;



@ccclass('SignItem')
export class SignItem extends Component {
    @property(Label)
    titleLb: Label = undefined;

    @property(Label)
    goldLb: Label = undefined;

    @property(Node)
    signTag: Node = undefined;

    private _data: insigns = null;

    private _isOnload: boolean = false;

    async onLoad() {
        this._isOnload = true;
        this.signTag.active = false;
        let name = this.node.name;
        let day = name.substring(name.length - 1, name.length);
        this._data = await DataManager.getSignDataById(Number(day));
        if (this._data) {
            this._setInfo();
            this._refreshState();
        }
    }

    onEnable() {
        if (this._isOnload) {
            this._isOnload = false;
            return;
        }
        this._refreshState();
    }

    private _setInfo() {
        this.titleLb.string = `第${this._getDay(this._data.day)}天`;
        this.goldLb.string = `金币X${this._data.gold}`;
    }

    handleClickEvent(evt: any/*TouchEvent*/) {
        let time = 0.1;
        tween(this.node).to(time, { scale: new Vec3(1.1, 1.1, 1.1) }, { easing: 'circOut' }).call(() => {
            tween(this.node).to(time, { scale: new Vec3(1, 1, 1) }, { easing: 'circIn' }).start();
        }).start();

        if (this.signTag.active) return;
        let sign = StorageManager1.Inst.getData(Constant.UserData.sign);
        let signday = StorageManager1.Inst.getData(Constant.UserData.signDay);
        if (this._data.day == sign + 1 && signday != getDay()) {
            console.log('签到成功');
            StorageManager1.Inst.setData(Constant.UserData.sign, sign + 1);
            StorageManager1.Inst.setData(Constant.UserData.signDay, getDay());
            this._refreshState();
        }
        else if (this._data.day > sign + 1 || signday == getDay()) {
            console.log('时间未到，亲明天再来领取奖励哟！');
        }
    }

    private _refreshState() {
        let sign = StorageManager1.Inst.getData(Constant.UserData.sign);
        let signday = StorageManager1.Inst.getData(Constant.UserData.signDay);
        if (this._data.day <= sign) {
            this.signTag.active = true;
        }
        else {
            this.signTag.active = false;
        }
        if (sign >= 7 && signday != getDay()) {
            StorageManager1.Inst.setData(Constant.UserData.sign, 0);
            StorageManager1.Inst.setData(Constant.UserData.signDay, 0);
            sign = 0;
        }
    }

    private _getDay(num: number) {
        switch (num) {
            case 1: return "一"
            case 2: return "二"
            case 3: return "三"
            case 4: return "四"
            case 5: return "五"
            case 6: return "六"
            case 7: return "七"
        }
    }
}

