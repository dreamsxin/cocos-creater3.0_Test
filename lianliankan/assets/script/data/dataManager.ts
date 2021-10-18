
import { _decorator, Component, Node } from 'cc';
import { elementsData, inelements } from './elementsData';
const { ccclass, property } = _decorator;

@ccclass('DataManager')
export class DataManager extends Component {
    /**
     * 根据id获取配置数据
     * @param id 
     * @returns infish
     */
    public static getelementsDataById(id: number): inelements {
        for (let i = 0; i < elementsData.data.length; i++) {
            if (id == elementsData.data[i].id) {
                return elementsData.data[i];
            }
        }
        return null;
    }

    /**
     * 获取随机一条鱼的数据,用于测试使用
     * @returns 
     */
    public static getRandomelementsData(): inelements {
        let idx = Math.floor(Math.random() * (elementsData.data.length - 9));
        return elementsData.data[idx];
    }
}

