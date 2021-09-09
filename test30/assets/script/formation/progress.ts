
import { _decorator, Component, Node, Slider, ProgressBar, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Progress')
export class Progress extends Component {
    @property
    value: number = 1;

    @property
    lbHead: string = "";

    private _slider: Slider = null as unknown as Slider;
    private _progress: ProgressBar = null as unknown as ProgressBar;
    private _lb: Label = null as unknown as Label;

    private _progressValue: number = 0;
    onLoad() {
        this._slider = this.node.getChildByName('slider')?.getComponent(Slider) as Slider;
        this._progress = this.node.getChildByName('progress')?.getComponent(ProgressBar) as ProgressBar;
        this._lb = this.node.getChildByName('lable')?.getComponent(Label) as Label;
        this.slidderCallback();
    }

    slidderCallback() {
        let percent = this._slider.progress;
        this._progress.progress = percent;
        this._lb.string = this.lbHead + ": " + (percent * this.value).toFixed(2);
        this._progressValue = Number((percent * this.value).toFixed(2));
    }

    getValue() {
        return this._progressValue;
    }
}


