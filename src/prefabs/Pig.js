class Pig extends Animal{
    constructor(scene, x, y, texture, frame, type){
        super(scene, x, y, texture, frame);
        this.type = type;
    }

    // attacks target and emits Message event
    attack(target){
        this.scene.sound.add('pigSound').play();
        this.scene.events.emit("Message", "\"Take this cretin!\", the pig shouts as he throws a clump of (hopefully) mud in your eyes.\n\nYou take " + this.damage + " damage.");
        target.takeDamage(this.damage);
    }
}