import { _decorator, Component, Node, Vec3 } from 'cc';
import pitem from './pitem';
import Ppath from './ppath';
const { ccclass, property, type } = _decorator;

@ccclass("PstarComponent")
export default class PstarComponent extends Component {
    @type([Node])
    obstacle: Node[] = [];
    private paths: pitem[] = [];
    setObstacle() {
        Ppath.Init.initProperty();
        for (let i = 0; i < this.obstacle.length; i++) {
            Ppath.Init.obstacle.push(this.obstacle[i]);
        }
    }

    async getPaths(start: Vec3, end: Vec3) {

        this.paths.splice(0);
        Ppath.Init.initProperty();
        for (let i = 0; i < this.obstacle.length; i++) {
            Ppath.Init.obstacle.push(this.obstacle[i]);
        }
        let paths: pitem[] = await Ppath.Init.startFind(start, end);
        this.paths = paths;
        return paths;
    }
    // async getPaths(start: Vec3, end: Vec3): Promise<pitem[]> {
    //     return new Promise(async resolve => {

    //         this.paths.splice(0);
    //         Ppath.Init.initProperty();
    //         for (let i = 0; i < this.obstacle.length; i++) {
    //             Ppath.Init.obstacle.push(this.obstacle[i]);
    //         }
    //         let paths: pitem[] = await Ppath.Init.startFind(start, end);
    //         this.paths = paths;
    //         resolve(this.paths);
    //     });
    // }
}
