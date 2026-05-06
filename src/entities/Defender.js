import Phaser from 'phaser';
import EntityState from '../systems/EntityState';

export default class Defender extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, config) {
        super(scene, x, y, config.texture);
        this.config = config;
        this.health = config.health;
        this.state = EntityState.IDLE;

        scene.add.existing(this);
        scene.physics.add.existing(this, true);
        this.setScale(config.scale);
        this.body.updateFromGameObject();
    }

    die(onComplete) {
        this.state = EntityState.DYING;
        this.body.enable = false;

        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: this.scale * 0.8,
            duration: 220,
            onComplete: () => {
                this.state = EntityState.DEAD;
                this.destroy();
                onComplete?.();
            }
        });
    }
}
