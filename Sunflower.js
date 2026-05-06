export default class Sunflower extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'sunflower');
        scene.add.existing(this);
        
        // Generate sun every 10 seconds
        scene.time.addEvent({
            delay: 10000,
            callback: () => this.produceSun(scene),
            loop: true
        });
    }

    produceSun(scene) {
        // Logic to spawn a clickable sun sprite near the flower
    }
}