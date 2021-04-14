
import { _decorator, Component, Node, AudioClip, AudioSource } from 'cc';
import EventManager from './utils/eventManager';
const { ccclass, property } = _decorator;

@ccclass('Audiomusic')
export class Audiomusic extends Component {
    @property(AudioClip)
    background: AudioClip = null as unknown as AudioClip;

    @property(AudioClip)

    attack: AudioClip = null as unknown as AudioClip;
    @property(AudioClip)

    hurt: AudioClip = null as unknown as AudioClip;

    @property(AudioClip)
    died: AudioClip = null as unknown as AudioClip;

    private as: AudioSource = null as unknown as AudioSource;

    onLoad() {
        EventManager.Inst.registerEevent(EventManager.EVT_skill_attack_music, this.playAttack.bind(this), this);
        EventManager.Inst.registerEevent(EventManager.EVT_skill_hurt, this.playHurt.bind(this), this);
        EventManager.Inst.registerEevent(EventManager.EVT_skill_died, this.playDied.bind(this), this);
    }

    start() {
        this.as = this.node.getComponent(AudioSource) as AudioSource;
    }

    playAttack() {
        this.scheduleOnce(() => {
            this.as.playOneShot(this.attack, 1);
        }, 0.5);
    }

    playHurt() {
        this.scheduleOnce(() => {
            this.as.playOneShot(this.hurt, 1);
        }, 0.2);
    }

    playDied() {
        this.as.playOneShot(this.died, 1);
    }

}

