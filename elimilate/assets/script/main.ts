
import { _decorator, Component, Node, view } from 'cc';
import { Constant } from './framework/constant';
import { localConfig } from './framework/localConfig';
import { ElementManager } from './game/element/elementManager';
import { TouchManager } from './game/touchManager';
const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends Component {
    start() {
        let viewSize = view.getCanvasSize();
        console.log(viewSize);
        Constant.screenScale = viewSize.width / 750;
        ElementManager.Inst;
        TouchManager.Inst;

    }

    private _loadCSV() {
        //加载CSV相关配置
        localConfig.instance.loadConfig(() => {
            this._loadFinish();
        })
    }

    private _loadFinish() {
        // console.log("loadFinished");
        //获取单张表数据
        let dt = localConfig.instance.getTable('level1');
        console.log(dt);
        //获取表中的某一项
        // dt = localConfig.instance.queryOne("power", "ID", 1);
        dt = localConfig.instance.queryByID("elements", "2");
        console.log(dt);
        //以数组形式还回数据
        dt = localConfig.instance.getTableArr("elements");
        console.log(dt);
    }

}
