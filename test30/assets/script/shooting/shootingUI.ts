
import { _decorator, Component, Node, Label } from 'cc';
import EventManager from './eventManager';
import { Hero } from './hero';
const { ccclass, property } = _decorator;

@ccclass('ShootingUI')
export class ShootingUI extends Component {
    @property(Hero)
    hero: Hero = null as unknown as Hero;
    @property(Node)
    upBtn: Node = null as unknown as Node;
    @property(Node)
    downBtn: Node = null as unknown as Node;
    @property(Node)
    addBtn: Node = null as unknown as Node;
    @property(Label)
    score: Label = null as unknown as Label;

    private offsetX: number = 0;
    private addValue: number = 0;
    start() {
        this.score.string = "0";
        EventManager.Inst.registerEevent(EventManager.EVT_shooted, this._addScore, this);
    }

    onLoad() {
        this.upBtn.on(Node.EventType.TOUCH_START, () => {
            this.offsetX = -0.1;
        });
        this.downBtn.on(Node.EventType.TOUCH_START, () => {
            this.offsetX = 0.1;
        });
        this.addBtn.on(Node.EventType.TOUCH_START, () => {
            this.addValue = 0.1;
        });

        this.upBtn.on(Node.EventType.TOUCH_END, () => {
            this.offsetX = 0;
        });
        this.downBtn.on(Node.EventType.TOUCH_END, () => {
            this.offsetX = 0;
        });
        this.addBtn.on(Node.EventType.TOUCH_END, () => {
            this.addValue = -0.02;
        });
    }

    update() {
        this.hero.changeOffsetX(this.offsetX);
        this.hero.setAddValue(this.addValue);
    }

    _addScore(score: number) {
        let count: number = Number(this.score.string);
        count += score;
        this.score.string = count.toString();
    }

}
