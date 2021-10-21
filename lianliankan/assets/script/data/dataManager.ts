
import { _decorator, Component, Node } from 'cc';
import { elementsData, inelements } from './elementsData';
import { insigns, signsData } from './signsData';
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
    public static getSignDataById(id: number): insigns {
        let list = signsData.data;
        for (let i = 0; i < list.length; i++) {
            if (list[i].id == id) {
                return list[i];
            }
        }
        return list[0];
    }

    public static getSignData(): insigns[] {
        return signsData.data;
    }
}

