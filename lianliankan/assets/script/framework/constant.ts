export class Constant {

    /**
     * 事件列表
     *
     * @static
     * @memberof Constant
     */
    public static EVENT_TYPE = {
        AddElement: 'add_element',
        SelectedElement: 'selected_element',
        GetTips: 'get_tips',
        NextLevel: 'next_level',
        LevelLayerBack:'level_layer_back',
        StartBtnEvent:'start_btn_event',
    }

    /**
     * 适配带来的屏幕缩放比率
     *
     * @static
     * @memberof Constant
     */
    public static screenScale = 1;

    /**
     *滑块种类
     *
     * @static
     * @memberof Constant
     */
    public static ElementKinds = 4;

    /**
     * 交换时间
     *
     * @static
     * @memberof Constant
     */
    public static changeTime = 0.3;

    /**
     * 下落时间
     *
     * @static
     * @memberof Constant
     */
    public static downTime = 0.5;

    /**
     * 无操作（消除时长
     *
     * @static
     * @memberof Constant
     */
    public static tipsTime = 5;

    /**
     *  开始游戏
     *
     * @type {boolean}
     * @memberof Constant
     */
    public static startGame: boolean = false;
}