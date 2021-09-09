
import { _decorator, Component, Node, Vec3, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FormationBase')
export class FormationBase extends Component {

    noise: number = 0;
    Spread: number = 1;
    offsetPos: Vec3 = v3();
    EvaluatePoints(): Vec3[] {
        return [];
    }
    GetNoise(pos: Vec3): Vec3 {
        const noise = this.noise;
        const x = pos.x + Math.random() * noise - noise / 2;
        const z = pos.z + Math.random() * noise - noise / 2;
        pos.x = x;
        pos.z = z;
        return pos;
    }
}