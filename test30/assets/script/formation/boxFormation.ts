
import { _decorator, Component, Node, Vec3, Prefab, instantiate, Toggle } from 'cc';
import { FormationBase } from './formationBase';
import { Progress } from './progress';
const { ccclass, property } = _decorator;

@ccclass('BoxFormation')
export class BoxFormation extends FormationBase {
    @property(Toggle)
    hollTg: Toggle = null as unknown as Toggle;

    @property(Progress)
    wP: Progress = null as unknown as Progress;

    @property(Progress)
    dP: Progress = null as unknown as Progress;

    @property(Progress)
    sP: Progress = null as unknown as Progress;

    @property(Progress)
    nP: Progress = null as unknown as Progress;

    @property(Progress)
    noiseP: Progress = null as unknown as Progress;

    @property(Prefab)
    rolePre: Prefab = null as unknown as Prefab;

    private _unitWidth = 5;
    private _unitDepth = 5;
    private _hollow = false;
    private _nthOffset = 0;

    private _roleList: Node[] = [];

    start() {
        this.progressCallBack();
    }

    progressCallBack() {
        this.Spread = this.sP.getValue();
        this._unitDepth = Math.ceil(this.dP.getValue());
        this._unitWidth = Math.ceil(this.wP.getValue());
        this._nthOffset = this.nP.getValue();
        this._hollow = this.hollTg.isChecked;
        this.noise = this.noiseP.getValue();
        this._updatePos();
    }

    _updatePos() {
        let points: Vec3[] = this.EvaluatePoints();
        if (this._roleList.length > points.length && points.length > 0) {
            for (let i = points.length - 1; i < this._roleList.length; i++) {
                this._roleList[i].active = false;
            }
        }

        for (let i = 0; i < points.length; i++) {
            if (i < this._roleList.length) {
                this._roleList[i].setPosition(points[i]);
                this._roleList[i].active = true;
            }
            else {
                let role = instantiate(this.rolePre);
                role.setPosition(points[i])
                this.node.addChild(role);
                this._roleList.push(role);
            }
        }

    }

    EvaluatePoints(): Vec3[] {
        let ret = [];
        let middleOffset = new Vec3(this._unitWidth * 0.5, 0, this._unitDepth * 0.5);
        for (var x = 0; x < this._unitWidth; x++) {
            for (var z = 0; z < this._unitDepth; z++) {
                if (this._hollow && x != 0 && x != this._unitWidth - 1 && z != 0 && z != this._unitDepth - 1) continue;

                var pos = new Vec3(x + (z % 2 == 0 ? 0 : this._nthOffset), 0, z);

                pos = pos.subtract(middleOffset);

                pos = pos.add(this.GetNoise(pos));

                pos = pos.multiplyScalar(this.Spread);
                pos.add(this.offsetPos);

                ret.push(pos);
            }
        }
        return ret;
    }
}

