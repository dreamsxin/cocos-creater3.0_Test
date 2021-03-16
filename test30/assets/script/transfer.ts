
import { _decorator, Component, Node, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Transfer')
export class Transfer extends Component {


    public gotoScene(event: any, scenename: string) {
        director.preloadScene(scenename, () => {
            director.loadScene(scenename);
        });
    }
}

