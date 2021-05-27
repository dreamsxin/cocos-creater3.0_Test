export default class Room {
    public id: number = -1;
    /* 房间人数 */
    public count: number = 0;
    /* 玩家列表 */
    public userList: number[] = [];

    init(id: number) {
        this.id = id;
    }

    updateInfo(userId: number) {
        this.userList.push(userId);
        this.count = this.userList.length;
    }

    /**
     * 获取对家userId
     * @param userId 
     * @returns 
     */
    getOtherUserId(userId: number): number {
        let id = userId == this.userList[0] ? this.userList[1] : this.userList[0];
        return id;
    }

    /**
     * 玩家离开房间,并返回房间是否空出
     * @param cl 
     */
    removeUser(userId: number) {
        for (let i = 0; i < this.userList.length; i++) {
            if (this.userList[i] == userId) {
                this.userList.splice(i, 1);
                this.count--;
                break;
            }
        }
    }

}