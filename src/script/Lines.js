
export default class Lines {


    constructor(sp, ep, parent, world) {//sp,ep,world
        this.startPoint = sp;
        this.endPoint = ep;
        this.parent = parent;
        this.world = world;
        this.listSP = [];
        this.listBox = [];
        this.constraintList = [];
        this.ballNum = 14;
        this.size = 6;
        this.dist = 8;
        this.sphereShape;
        this.mass = 2;
        this.lastBody = null;
        this.offsetDist = 0;
    }

    drawLine(material) {
        this.sphereShape = new CANNON.Sphere(this.size);
        for (let i = 0; i < this.ballNum; i++) {
            var spherebody = new CANNON.Body({ mass: i === 0 || i === this.ballNum - 1 ? 0 : this.mass });
            spherebody.addShape(this.sphereShape);
            spherebody.position.set(this.startPoint.x, (this.ballNum - i) * (this.dist - this.offsetDist) - (this.ballNum * (this.dist - this.offsetDist)) / 2, this.startPoint.z);
            // spherebody.velocity.z = 5 - Math.abs(5 - i);
            this.world.addBody(spherebody);
            this.listSP.push(spherebody);

            //添加自定义模型
            var box3 = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createSphere(this.size));
            this.parent.addChild(box3);//球
            box3.transform.rotate(new Laya.Vector3(0, 30, 0), false, false);
            box3.transform.position = new Laya.Vector3(this.startPoint.x, (this.ballNum - i) * (this.dist - this.offsetDist) - (this.ballNum * (this.dist - this.offsetDist)) / 2, this.startPoint.z);

            // var material0 = new Laya.BlinnPhongMaterial();
            box3.meshRenderer.material = material;

            this.listBox.push(box3);

            // Connect this body to the last one added
            if (this.lastBody !== null) {
                let c = new CANNON.DistanceConstraint(spherebody, this.lastBody, (this.dist - this.offsetDist));
                c.collideConnected = true;
                this.world.addConstraint(c);
                this.constraintList.push(c);
            }

            // Keep track of the lastly added body
            this.lastBody = spherebody;

        }
        this.updatePhy();
    }

    despose() {
        let that = this;
        this.constraintList.forEach(item => {
            if (item) {
                that.world.removeConstraint(item);
                item = null;
            }
        })
        this.constraintList = [];
        for (let i = 0; i < this.listSP.length; i++) {

            // this.world.addBody(this.listSP[i]);
            this.world.removeBody(this.listSP[i]);

            this.listBox[i].destroy();
            //对网格进行销毁
            this.listBox[i].destroy();
        }
        this.listSP = [];
        this.listBox = [];


    }

    updatePhy() {
        let that = this;
        for (let i = 0; i < that.listBox.length; i++) {
            let pos = that.listSP[i].position;
            that.listBox[i].transform.position = new Laya.Vector3(pos.x, pos.y, pos.z);
        }
    }

    endLine() {
        if (this.listSP.length <= 0) {
            return null;
        }
        return this.listSP[this.listSP.length - 1];
    }

    minX() {
        if (this.listSP.length <= 0) {
            return 0;
        }
        let pos = this.listSP[0].position;
        let x = pos.x;
        this.listSP.forEach(item => {
            if (item)
                if (item.position.x < x) {
                    x = item.position.x;
                }
        })
        return x;
    }

    maxX() {
        if (this.listSP.length <= 0) {
            return 0;
        }
        let pos = this.listSP[0].position;
        let x = pos.x;
        this.listSP.forEach(item => {
            if (item)
                if (item.position.x > x) {
                    x = item.position.x;
                }
        })
        return x;
    }

}


