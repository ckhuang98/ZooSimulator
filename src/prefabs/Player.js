class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, endurance, wit, dexterity) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        this.endurance = endurance;
        this.wit = wit;
        this.dexterity = dexterity;
    }

    update(){
    }

    levelUpEndurance(){
        if(this.endurance < 20){
            this.endurance++;
        }
    }

    levelUpWit(){
        if(this.wit < 20){
            this.wit++;
        }
    }

    levelUpDexterity(){
        if(this.dexterity < 20){
            this.dexterity++;
        }
    }
}