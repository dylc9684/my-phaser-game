import Phaser from 'phaser';

export default class SunManager {
    constructor(scene, { economyManager, config }) {
        this.scene = scene;
        this.economyManager = economyManager;
        this.config = config;
        this.suns = new Set();
        this.skyTimer = null;
        this.skyInitialTimer = null;
    }

    startSkyDrops() {
        if (!this.config?.skyDrops) {
            return;
        }

        const drop = this.config.skyDrops;

        this.skyInitialTimer = this.scene.time.delayedCall(drop.initialDelay ?? drop.interval, () => {
            this.spawnSkySun();
        });

        this.skyTimer = this.scene.time.addEvent({
            delay: drop.interval,
            callback: () => this.spawnSkySun(),
            callbackScope: this,
            loop: true
        });
    }

    spawnSkySun() {
        const drop = this.config.skyDrops;
        const x = Phaser.Math.Between(drop.minX, drop.maxX);
        const y = Phaser.Math.Between(drop.minGroundY, drop.maxGroundY);

        this.spawnSun({
            x,
            y: drop.startY,
            targetY: y,
            amount: drop.amount,
            duration: drop.fallDuration
        });
    }

    spawnFromProducer(producer, production) {
        this.spawnSun({
            x: producer.x + Phaser.Math.Between(-18, 18),
            y: producer.y - 28,
            targetY: producer.y - 8,
            amount: production.amount,
            duration: 450
        });
    }

    spawnSun({ x, y, targetY, amount, duration }) {
        const sun = this.scene.add.image(x, y, 'sun').setInteractive({ useHandCursor: true });
        this.suns.add(sun);
        this.scene.events.emit('sun-spawned');

        this.scene.tweens.add({
            targets: sun,
            y: targetY,
            duration,
            ease: 'Sine.easeInOut'
        });

        sun.once('pointerdown', () => {
            this.economyManager.add(amount);
            this.scene.events.emit('sun-collected');
            this.suns.delete(sun);
            sun.destroy();
        });

        sun.once(Phaser.GameObjects.Events.DESTROY, () => {
            this.suns.delete(sun);
        });
    }

    stopAll() {
        if (this.skyTimer) {
            this.skyTimer.remove(false);
            this.skyTimer = null;
        }

        if (this.skyInitialTimer) {
            this.skyInitialTimer.remove(false);
            this.skyInitialTimer = null;
        }

        this.suns.forEach((sun) => sun.destroy());
        this.suns.clear();
    }
}
