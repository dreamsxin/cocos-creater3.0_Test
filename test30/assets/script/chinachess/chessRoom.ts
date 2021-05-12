export default class Room {
    public roomId: number = -1;
    /* 房间人数 */
    public count: number = -1;

    init(id: number, count: number) {
        this.roomId = id;
        this.count = count;
    }
}