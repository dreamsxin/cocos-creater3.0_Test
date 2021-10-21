
import { _decorator, Component, Node, Label, PageView } from 'cc';
import { PoolManager } from '../../framework/poolManager';
import { resourceUtil } from '../../framework/resourceUtil';
import { PlayerData } from '../player/playerData';
import { LevelPageItem } from './levelPageItem';
const { ccclass, property } = _decorator;



@ccclass('LevelLayer')
export class LevelLayer extends Component {
    @property(PageView)
    pageView: PageView = undefined;

    private _isOnload: boolean = false;//只一次onLoad

    private _level: number = 1;//关卡
    private _pages: number = 0;//页数

    async onLoad() {
        this._isOnload = true;
        this._level = PlayerData.Inst.level;
        this._pages = Math.ceil(this._level / 9);
        for (let i = 0; i < this._pages; i++) {
            let pageItemPre = await resourceUtil.loadNormalRes('levelPageItem');
            let pageItem: Node = PoolManager.getNode(pageItemPre);
            this.pageView.addPage(pageItem);
            pageItem.getComponent(LevelPageItem).setInfo(i);
        }
    }

    onEnable() {
        if (this._isOnload) {
            this._isOnload = false;
            return;
        }
        this.refreshPages();
    }

    /**
     * 刷新关卡页面，只有当前页面关卡过完了才加载下一页关卡
     * @returns 
     */
    async refreshPages() {
        let pages = Math.ceil(this._level / 9);
        if (pages == this._pages) return;
        for (let i = this._pages; i < pages; i++) {
            let pageItemPre = await resourceUtil.loadNormalRes('levelPageItem');
            let pageItem: Node = PoolManager.getNode(pageItemPre);
            this.pageView.addPage(pageItem);
            pageItem.getComponent(LevelPageItem).setInfo(i);
        }
        this._pages = pages;
    }
}


