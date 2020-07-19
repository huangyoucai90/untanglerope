
/**
 * 


        

        ///////////////////////////////////////////////////////////////////////////////////
        // function rnd(n, m) {
        //     var random = Math.floor(Math.random() * (m - n + 1) + n);
        //     return random;
        // }
        // function stageLogic(crt) {
        //     let list = [...listPos];
        //     for (let i = 0; i < list.length; i++) {
        //         let indexs = list[i];
        //         if (indexs != 0 && crt == indexs) {
        //             console.log('current:', crt, 'i', i);
        //             logic(i);
        //             let checknum = 0;
        //             let rand = rnd(1, 2);
        //             for (let j = 0; j < list.length; j++) {
        //                 let subIndex = list[j];
        //                 if (subIndex == 0) {
        //                     checknum++;
        //                     console.log('rnd', rand, 'check', checknum, 'j', j);
        //                     if (rand == checknum) {
        //                         logic(j);
        //                         return;
        //                     }
        //                 }
        //             }

        //         }
        //     }
        // }

        ///////////////////
        // for(let k=0;k<100;k++){
        //     let current=rnd(1,3);
        //     stageLogic(current);
        // }
        ////////////////////////////////////
        // setTimeout(()=>{
            
        // },1000)


 * 本示例采用非脚本的方式实现，而使用继承页面基类，实现页面逻辑。在IDE里面设置场景的Runtime属性即可和场景进行关联
 * 相比脚本方式，继承式页面类，可以直接使用页面定义的属性（通过IDE内var属性定义），比如this.tipLbll，this.scoreLbl，具有代码提示效果
 * 建议：如果是页面级的逻辑，需要频繁访问页面内多个元素，使用继承式写法，如果是独立小模块，功能单一，建议用脚本方式实现，比如子弹脚本。
 */
//1 #FF5656  2 #4EE881 3 #5563EB 4 #B346FF 5 #FFC036
import Lines from "./Lines";
import { TestSceneUI } from "../ui/layaMaxUI";
import GameView from "./GameView";



export default class TestSceneView extends TestSceneUI {


    constructor() {
        super();
        // Laya.MiniAdpter.init();
        // //初始化引擎
        // Laya.init(750,1334);

        //加载场景文件
        this.lines = null;
        this.lines2 = null;
        this.lines3 = null;
        this.textureList = [];
        this.btnList = [];
        this.gamestate = -1;
        this.lineMatList = [];

        this.pos = [-30, -15, 0, 15, 30];
        this.listPos = [0, 1, 2, 3, 0];
        this.endBallIndex = null;//当前线的末端索引
        this.lineIndex = -1;//第几根线
        this.lineBackIndex = -1;
        this.up = false;
        /////////////////////////////////////////////////////////////////////
        this.lineList = [];


        //this.loadScene("test/TestScene.scene");
    }

    onOpened() {
        this.gameUI = new GameView(this);
        this.contant.addChild(this.gameUI);

        // this.gameUI.init();
        Laya.loader.create(["res/mat/hong.png"
            , "res/mat/huang.png", "res/mat/lan.png", "res/mat/lv.png", "res/mat/zi.png"
            , "res/mat/gan.png"
        ], Laya.Handler.create(this, this.onPreLoadFinish));
    }

    onLoaded() {

    }

    onPreLoadFinish() {
        let txt1 = Laya.Loader.getRes("res/mat/hong.png");
        let txt2 = Laya.Loader.getRes("res/mat/huang.png");
        let txt3 = Laya.Loader.getRes("res/mat/lan.png");
        let txt4 = Laya.Loader.getRes("res/mat/lv.png");
        let txt5 = Laya.Loader.getRes("res/mat/zi.png");
        let txt = Laya.Loader.getRes("res/mat/gan.png");

        this.textureList.push(txt);
        this.textureList.push(txt1);
        this.textureList.push(txt2);
        this.textureList.push(txt3);
        this.textureList.push(txt4);
        this.textureList.push(txt5);

        for (let i = 0; i < 5; i++) {
            var linesmaterial = new Laya.BlinnPhongMaterial();
            linesmaterial.albedoTexture = this.textureList[i + 1];
            this.lineMatList.push(linesmaterial);
        }

        //添加3D场景
        this.scene2 = new Laya.Scene3D();
        Laya.stage.addChild(this.scene2);
        this.initScene();
        this.stage.setChildIndex(this.scene2, 0);

    }
    initScene() {
        // wx.login({
        //     success: function () {
        //         wx.getUserInfo()
        //     }
        // })

        //添加照相机
        this.camera = (this.scene2.addChild(new Laya.Camera(0, 0.1, 300)));
        this.camera.transform.translate(new Laya.Vector3(0, -30, 200));
        this.camera.transform.rotate(new Laya.Vector3(10, 0, 0), true, false);

        //添加方向光
        var directionLight = this.scene2.addChild(new Laya.DirectionLight());
        directionLight.color = new Laya.Vector3(0.6, 0.6, 0.6);
        directionLight.transform.worldMatrix.setForward(new Laya.Vector3(0, 0, -1));

        this.world = new CANNON.World();
        this.world.broadphase = new CANNON.NaiveBroadphase();
        // world.gravity.set(0, -10, 0);
        this.world.gravity.set(0, 0, -10);
        this.world.solver.tolerance = 0.001;
        // world.solver.tolerance = 10;
        //////////////////////
        this.initGan();
        /////////////////////////////////////////////////////////////////////
        this.initLine();
        this.initBtnBall();
        this.initCurrentStage();
        ////////////////////////////

        ////////////////////////////
        Laya.timer.loop(1000, this, this.updateView);

        var fixedTimeStep = 1.0 / 60.0; // seconds
        var maxSubSteps = 3;

        // Start the simulation loop
        var lastTime;
        let that = this;
        (function simloop(time) {
            requestAnimationFrame(simloop);
            if (lastTime !== undefined) {
                var dt = (time - lastTime) / 1000;
                that.world.step(fixedTimeStep, dt, maxSubSteps);
                // that.world.step(1/60);
            }

            that.lineList.forEach(item => {
                if (item)
                    item.updatePhy();
            })
            lastTime = time;
        })();
    }

    initGan() {
        // var bgmaterial = new Laya.BlinnPhongMaterial();
        // var bg = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createQuad(375, 667));
        // // scene.addChild(bg);//球
        // bg.transform.position = new Laya.Vector3(0, 0, -50);
        // bg.transform.rotate(new Laya.Vector3(10, 0, 180), true, false);
        // bgmaterial.albedoTexture = this.textureList[6];
        // bg.meshRenderer.material = bgmaterial;

        let len = 90;
        var gan = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createCylinder(5, len));
        this.scene2.addChild(gan);//球
        gan.transform.rotate(new Laya.Vector3(0, 0, 90), false, false);
        let posx = len / 2;
        gan.transform.position = new Laya.Vector3(-posx + 45, 56 + 8, 30);
        var ganmaterial = new Laya.BlinnPhongMaterial();
        ganmaterial.albedoTexture = this.textureList[5];
        gan.meshRenderer.material = ganmaterial;

    }

    initLine() {
        this.listPos = [0, 1, 2, 3, 0];
        this.lines = new Lines({ x: this.pos[1], y: -60, z: 30 }, null, this.scene2, this.world);//{x:-30,y:-60,z:0},null,parent,world
        this.lines.drawLine(this.lineMatList[0]);
        this.lineList.push(this.lines);

        this.lines2 = new Lines({ x: this.pos[2], y: -60, z: 30 }, null, this.scene2, this.world);//{x:-30,y:-60,z:0},null,parent,world
        this.lines2.drawLine(this.lineMatList[1]);
        this.lineList.push(this.lines2);

        this.lines3 = new Lines({ x: this.pos[3], y: -60, z: 30 }, null, this.scene2, this.world);//{x:-30,y:-60,z:0},null,parent,world
        this.lines3.drawLine(this.lineMatList[2]);
        this.lineList.push(this.lines3);

    }

    initBtnBall() {
        let offsetY = 0;
        let endY = -48 - 5;
        let rid = 7;

        for (let j = 0; j < 5; j++) {
            let anniu = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createSphere(rid));
            this.scene2.addChild(anniu);//球
            anniu.transform.position = new Laya.Vector3(this.pos[j], endY - offsetY, 30);
            var anniu1mat = new Laya.BlinnPhongMaterial();
            anniu1mat.albedoTexture = this.textureList[5];
            anniu.meshRenderer.material = anniu1mat;
            this.btnList.push(anniu);
        }
        this.updateBtnMat();
    }

    initCurrentStage() {
        this.listPos = [0, 1, 2, 3, 0];
        this.endBallIndex = null;//当前线的末端索引
        this.lineIndex = -1;//第几根线
        this.lineBackIndex = -1;
        this.up = false;
        setTimeout(() => {
            this.resetGame();
        }, 100);
    }

    clearList() {
        this.lineList.forEach(item => {
            if (item) {
                item.despose();
            }
            item = null;
        })
        this.lineList = [];
    }

    resetGame() {
        // this.clearList();
        // this.initLine();
        // this.gamestate = 0;
        this.nextGame();
    }

    nextGame() {
        this.clearList();
        this.initLine();
        this.logic(2);
        setTimeout(() => {
            this.logic(0);
            this.gamestate = 0;
        }, 100);
    }

    updateView() {
        this.gameUI.updateView(this.camera, this.btnList);
        this.checkIsOpen();
    }

    updateBtnMat() {
        for (let i = 0; i < this.btnList.length; i++) {
            let item = this.btnList[i];
            if(item)
            if (this.listPos[i] != 0) {
                // item.meshRenderer.material=null;//5
            }
            else {
                // item.meshRenderer.material=this.lineMatList[0];
            }
        }
    }

    logic(btnIndex = 0) {
        if (this.lineList.length <= 0) {
            return;
        }
        if (this.up == false) {//可以把绳子拿起来
            let index = this.listPos[btnIndex];
            if (index != 0) {
                this.lineBackIndex = btnIndex;
                this.endBallIndex = this.lineList[index - 1].endLine();

                this.lineIndex = index;//确定当前操作的线
                this.endBallIndex.position.set(this.pos[btnIndex], this.endBallIndex.position.y, 40);//把当前的绳子设置up状态
                this.up = true;
            }
        }
        else {//把绳子系上
            let index = this.listPos[btnIndex];
            if (index == 0 || btnIndex == this.lineBackIndex) {//当前是空的桩
                if (this.endBallIndex != null) {//有末端索引
                    // console.log('y', endBallIndex.position.y);
                    this.endBallIndex.position.set(this.pos[btnIndex], this.endBallIndex.position.y, 30);//50  30  dist - offset
                    this.listPos[this.lineBackIndex] = 0;
                    this.listPos[btnIndex] = this.lineIndex;
                    this.endBallIndex = null;
                    this.up = false;
                    this.lineIndex = -1;
                    this.lineBackIndex = -1;
                }
            }
        }
        this.updateBtnMat();
    }

    checkIsOpen() {
        let a1 = this.checkIsPZ(this.lineList[0], this.lineList[1]);
        let a2 = this.checkIsPZ(this.lineList[1], this.lineList[2]);
        let a3 = this.checkIsPZ(this.lineList[0], this.lineList[2]);
        // if (a1 || a3) {
        //     console.log('第一根线有缠绕');
        // }
        // if (a1 || a2) {
        //     console.log('第二根线有缠绕');
        // }
        // if (a2 || a3) {
        //     console.log('第三根线有缠绕');
        // }
        if (!a1 && !a2 && !a3) {
            if (this.gamestate == 0) {
                this.gamestate = 1;
                this.gameUI.onResult();
            }

        }
    }
    checkIsPZ(line1, line2) {
        if (line1 == null || line2 == null) {
            return true;
        }
        for (let i = 0; i < line2.listSP.length; i++) {
            let max = line2.listSP[i].position;
            let min = line2.listSP[i].position;
            if (max.x < min.x) {
                return true;
            }
        }
        if (line2.minX() < line1.maxX()) {
            return true;
        }

        for (let i = 0; i < line2.listSP.length; i++) {
            let max = line2.listSP[i].position;
            let min = line2.listSP[i].position;
            if (min.x > max.x) {
                return true;
            }
        }
    }
}


