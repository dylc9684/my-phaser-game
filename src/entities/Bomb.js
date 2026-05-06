import Phaser from 'phaser';
import EntityState from '../systems/EntityState';

export default class Bomb extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, config) {
        super(scene, x, y, config.texture);
        this.config = config;
        this.health = config.health;
        this.state = EntityState.IDLE;
        this.fuseTimer = null;

        scene.add.existing(this);
        scene.physics.add.existing(this, true);
        this.setScale(config.scale);
        this.body.updateFromGameObject();
    }

    startFuse(onExplode) {
        this.state = EntityState.ATTACKING;
        this.scene.tweens.add({
            targets: this,
            scale: this.scale * 1.12,
            yoyo: true,
            repeat: 2,
            duration: 160
        });
        this.fuseTimer = this.scene.time.delayedCall(this.config.bomb.fuseTime, () => {
            onExplode(this, this.config.bomb);
        });
    }

    stopFuse() {
        if (this.fuseTimer) {
            this.fuseTimer.remove(false);
            this.fuseTimer = null;
        }
    }

    die(onComplete) {
        this.state = EntityState.DYING;
        this.stopFuse();
        this.body.enable = false;

        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: this.scale * 1.7,
            duration: 180,
            onComplete: () => {
                this.state = EntityState.DEAD;
                this.destroy();
                onComplete?.();
            }
        });
    }
}
