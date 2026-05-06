import Phaser from 'phaser';
import EntityState from '../systems/EntityState';

export default class Producer extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, config) {
        super(scene, x, y, config.texture);
        this.config = config;
        this.health = config.health;
        this.state = EntityState.IDLE;
        this.productionTimer = null;

        scene.add.existing(this);
        scene.physics.add.existing(this, true);
        this.setScale(config.scale);
        this.body.updateFromGameObject();
    }

    startProduction(onProduce) {
        const production = this.config.production;

        if (!production) {
            return;
        }

        this.productionTimer = this.scene.time.addEvent({
            delay: production.interval,
            callback: () => onProduce(this, production),
            loop: true
        });
    }

    stopProduction() {
        if (this.productionTimer) {
            this.productionTimer.remove(false);
            this.productionTimer = null;
        }
    }

    die(onComplete) {
        this.state = EntityState.DYING;
        this.stopProduction();
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
