import { director, Vec3, Node } from "cc";
import { Element } from '../game/element/element';
export enum IpType {
    local = 0,
    remote = 1
}

export enum ServerType {
    connectorServer = 100,
    gameServer = 101,
    userServer = 102,
}

export enum ServerPort {
    gameServer = 9000,
    userServer = 9001,
    connector = 8999,
}

export function getIp(type: number): string {
    if (type == IpType.local) {
        return "ws://192.168.0.192:9000/ws";
        // return "ws://192.168.0.192:8999/ws";
        // return "ws://192.168.0.192:8089/ws";
    }
    else if (type == IpType.remote) {
        return "ws://139.199.80.239:9000/ws"
    }
    return "";
}

/**
 * 将V3 Math.floor
 * @param v3 
 */
export function unitVec3(v3: Vec3): Vec3 {
    let re: Vec3 = new Vec3(Math.floor(v3.x), Math.floor(v3.y), Math.floor(v3.z));
    return re;
}


/**
 * 复制Vec3数组
 * @param arr 
 * @returns Vec3[]
 */
export function copyVec3Array(arr: any[]) {
    let copy: any[] = [];
    for (let i = 0; i < arr.length; i++) {
        let v3 = new Vec3(arr[i].x, arr[i].y, arr[i].z);
        copy.push(v3);
    }
    return copy;
}

/**
 * 判定两个数组是否一样
 * @param arr1 
 * @param arr2 
 */
export function checkSameArray(arr1: any[], arr2: any[]) {
    if (arr1.length == arr2.length) {
        let func = (item: Element) => {
            for (let j = 0; j < arr2.length; j++) {
                let item2: Element = arr2[j];
                if (item.data.x == item2.data.x && item.data.y == item.data.y) {
                    return true
                }
            }
            return false;
        }
        for (let i = 0; i < arr1.length; i++) {
            let item = arr1[i];
            if (!func(item)) {
                return false;
            }
        }
        return true;
    }
    return false;
}


/**
 * 将节点添加到elementLayer层
 * @param node 
 */
export function addNodeToElementLayer(node: Node) {
    director.getScene().getChildByPath('Canvas/elementLayer').addChild(node);
}
