import { _decorator, Node, Prefab, instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PoolManager')
export class PoolManager {
    public static handle = new Map<string, Node[]>();
    /**
     * 获取
     * @param prefab 
     */
    public static getNode(prefab: Prefab): Node {
        const name = prefab.name;
        let node: Node = null;
        if (this.handle.has(name)) {
            node = this.handle.get(name)?.pop() as Node;
        }
        else {
            node = instantiate(prefab) as Node;
        }
        return node;
    }

    /**
     * 根据名字获取
     * @param name string 
     */
    public static getNodeBy(namee: string): Node {
        const name = namee;
        let node: Node = null;
        if (this.handle.has(name)) {
            node = this.handle.get(name)?.pop() as Node;
        }
        return node;
    }



    /**
     * 回收
     * @param target 
     */
    public static setNode(target: Node) {
        const name = target.name;
        target.parent = null;
        if (this.handle.has(name)) {
            this.handle.get(name)?.push(target);
        }
        else {
            this.handle.set(name, [target]);
        }
    }
}