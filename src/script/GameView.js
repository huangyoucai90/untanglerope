import { GameViewUI } from "../ui/layaMaxUI";
import Logic from "./Logic";

export default class GameView extends GameViewUI {


    constructor(that) {
        super();
        this.that = that;
    }

    onEnable() {
        this.nextBtn.on(Laya.Event.CLICK, this, this.onNextGame);
        this.resetBtn.on(Laya.Event.CLICK, this, this.onResetGame);

        this.init();
    }
    init() {

        this.btnList = [this.btn1, this.btn2, this.btn3, this.btn4, this.btn5];

        this.btnList.forEach(item => {
            item.alpha = 0;
        })
        this.btn1.on(Laya.Event.MOUSE_DOWN, this, () => {
            this.that.logic(0);
        });
        this.btn2.on(Laya.Event.MOUSE_DOWN, this, () => {
            // this.callFun(1);
            this.that.logic(1);
        });
        this.btn3.on(Laya.Event.MOUSE_DOWN, this, () => {
            // this.callFun(2);
            this.that.logic(2);
        });
        this.btn4.on(Laya.Event.MOUSE_DOWN, this, () => {
            // this.callFun(3);
            this.that.logic(3);
        });
        this.btn5.on(Laya.Event.MOUSE_DOWN, this, () => {
            // this.callFun(4);
            this.that.logic(4);
        });
    }
    /**
     * 开始下一关卡
     * @param {*} e 
     */
    onNextGame(e = null) {
        this.result.visible = false;
        this.game.visible = true;
    }

    /**
     * 游戏过关
     * @param {*} e 
     */
    onResult() {
        this.that.nextGame();
        this.result.visible = true;
        this.game.visible = false;
    }


    /**
     * 本关恢复
     * @param {*} e 
     */
    onResetGame() {
        this.that.initCurrentStage();
    }


    /**
     * 更新按钮位置
     * @param {*} e 
     */
    updateView(camera, anniuList) {
        let change = new Logic();
        for (let i = 1; i < 6; i++) {
            let temppos = change.WorldToScreen2(camera, anniuList[i - 1].transform.position);
            if (this['btn' + i])
                this['btn' + i].x = temppos.x - this['btn' + i].width / 2;
            this['btn' + i].y = temppos.y - 100;//this['btn'+i].height/2;
            this['btn' + i].height = 400;
        }
    }

}