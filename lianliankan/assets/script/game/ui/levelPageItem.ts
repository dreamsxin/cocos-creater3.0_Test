
import { _decorator, Component, Node, Button } from 'cc';
const { ccclass, property } = _decorator;
 
@ccclass('LevelPageItem')
export class LevelPageItem extends Component {

    onLoad () {

    }

    handleLevelClick(evt:Button){
        console.log(evt.name);
    }

}
