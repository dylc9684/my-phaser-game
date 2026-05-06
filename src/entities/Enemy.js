import Phaser from 'phaser';
import EntityState from '../systems/EntityState';

export default class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, config) {
        super(scene, x, y, config.texture);
        this.config = config;
        this.health = config.health;
        this.state = EntityState.IDLE;
        this.nextAttackAt = 0;

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.setScale(config.scale);
        this.setActive(false);
        this.setVisible(false);
        this.body.enable = false;
    }

    spawn(x, y, row) {
        this.health = this.config.health;
        this.row = row;
        this.state = EntityState.MOVING;
        this.nextAttackAt = 0;
        this.setPosition(x, y);
        this.setAlpha(1);
        this.setScale(this.config.scale);
        this.setTexture(this.config.texture);
        this.clearTint();
        this.setActive(true);
        this.setVisible(true);
        this.body.enable = true;
        this.body.reset(x, y);
        this.walk();
    }

    walk() {
        this.state = EntityState.MOVING;
        this.body.setVelocityX(this.config.speed);
    }

    attack(target, time, damageTarget) {
        this.state = EntityState.ATTACKING;
        this.body.setVelocityX(0);

        if (time < this.nextAttackAt) {
            return;
        }

        damageTarget(target, this.config.dps);
        this.nextAttackAt = time + this.config.attackRate;
    }

    sleep() {
        this.state = EntityState.DEAD;
        this.setActive(false);
        this.setVisible(false);
        this.body.setVelocity(0, 0);
        this.body.enable = false;
    }

    die(onComplete) {
        this.state = EntityState.DYING;
        this.body.setVelocityX(0);
        this.body.enable = false;

        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: this.scale * 0.8,
            duration: 220,
            onComplete: () => {
                this.sleep();
                onComplete?.();
            }
        });
    }
}
