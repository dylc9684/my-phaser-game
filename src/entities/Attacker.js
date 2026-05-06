import Phaser from 'phaser';
import EntityState from '../systems/EntityState';

export default class Attacker extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, config) {
        super(scene, x, y, config.texture);
        this.config = config;
        this.health = config.health;
        this.state = EntityState.IDLE;
        this.nextShotAt = 0;

        scene.add.existing(this);
        scene.physics.add.existing(this, true);
        this.setScale(config.scale);
        this.body.updateFromGameObject();
    }

    updateCombat(time, hasTarget, fireProjectile) {
        if (this.state === EntityState.DYING || this.state === EntityState.DEAD) {
            return;
        }

        this.state = EntityState.IDLE;

        if (!hasTarget || time < this.nextShotAt) {
            return;
        }

        this.state = EntityState.ATTACKING;
        fireProjectile(this);
        this.nextShotAt = time + this.config.attack.fireRate;
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
