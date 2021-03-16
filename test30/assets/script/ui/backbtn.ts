
import { _decorator, Component, Node, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Backbtn')
export class Backbtn extends Component {

    gobackTransfer() {
        director.preloadScene("tansfer", () => {
            director.loadScene("tansfer");
        });
    }
}

