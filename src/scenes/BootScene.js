import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.load.json('level1', 'data/level1.json');
        this.load.json('level2', 'data/level2.json');
        this.load.json('level3', 'data/level3.json');
        this.load.json('level4', 'data/level4.json');
    }

    create() {
        this.createGameTextures();
        this.scene.start('MenuScene');
    }

    createGameTextures() {
        const graphics = this.add.graphics();

        this.createBackgroundTexture(graphics);
        this.createSunflowerTexture(graphics);
        this.createTwinSunflowerTexture(graphics);
        this.createPeashooterTexture(graphics);
        this.createWalnutTexture(graphics);
        this.createCherryBombTexture(graphics);
        this.createZombieTexture(graphics, 'zombie', 0x8ab36f, 0x6d7c3f, 0x3c5f8c);
        this.createZombieTexture(graphics, 'runnerZombie', 0xa0c884, 0xd34f3f, 0x6b78a8);
        this.createZombieTexture(graphics, 'coneheadZombie', 0x8ab36f, 0xe07b22, 0x3c5f8c, 'cone');
        this.createZombieTexture(graphics, 'bucketheadZombie', 0x8ab36f, 0xb9c3ca, 0x3c5f8c, 'bucket');
        this.createProjectileTextures(graphics);
        graphics.destroy();
    }

    createBackgroundTexture(graphics) {
        graphics.clear();
        graphics.fillStyle(0x9bd56b, 1);
        graphics.fillRect(0, 0, 800, 600);
        graphics.fillStyle(0x86c85b, 1);
        graphics.fillRect(0, 70, 800, 100);
        graphics.fillRect(0, 270, 800, 100);
        graphics.fillRect(0, 470, 800, 100);
        graphics.fillStyle(0x6cad4b, 1);
        for (let x = 60; x < 800; x += 120) {
            graphics.fillEllipse(x, 560, 90, 18);
        }
        graphics.fillStyle(0x6b4d2e, 1);
        graphics.fillRect(0, 0, 70, 600);
        graphics.fillStyle(0xd7c09a, 1);
        graphics.fillRect(16, 0, 38, 600);
        graphics.generateTexture('background', 800, 600);
    }

    createSunflowerTexture(graphics) {
        graphics.clear();
        graphics.fillStyle(0x2f7d32, 1);
        graphics.fillRect(36, 50, 8, 28);
        graphics.fillStyle(0x4caf50, 1);
        graphics.fillEllipse(28, 64, 24, 12);
        graphics.fillEllipse(50, 62, 24, 12);

        graphics.fillStyle(0xffc72c, 1);
        for (let index = 0; index < 12; index++) {
            const angle = (Math.PI * 2 * index) / 12;
            graphics.fillEllipse(40 + Math.cos(angle) * 22, 30 + Math.sin(angle) * 22, 14, 26);
        }

        graphics.fillStyle(0x7a4b20, 1);
        graphics.fillCircle(40, 30, 18);
        graphics.fillStyle(0x3d2413, 1);
        graphics.fillCircle(34, 27, 3);
        graphics.fillCircle(46, 27, 3);
        graphics.lineStyle(2, 0x3d2413, 1);
        graphics.strokeCircle(40, 34, 7);
        graphics.generateTexture('sunflower', 80, 88);
    }

    createTwinSunflowerTexture(graphics) {
        graphics.clear();
        graphics.fillStyle(0x2f7d32, 1);
        graphics.fillRect(36, 50, 8, 28);
        graphics.fillStyle(0x4caf50, 1);
        graphics.fillEllipse(26, 64, 24, 12);
        graphics.fillEllipse(52, 62, 24, 12);

        [28, 52].forEach((centerX) => {
            graphics.fillStyle(0xffc72c, 1);
            for (let index = 0; index < 10; index++) {
                const angle = (Math.PI * 2 * index) / 10;
                graphics.fillEllipse(centerX + Math.cos(angle) * 15, 31 + Math.sin(angle) * 15, 10, 18);
            }

            graphics.fillStyle(0x7a4b20, 1);
            graphics.fillCircle(centerX, 31, 12);
            graphics.fillStyle(0x3d2413, 1);
            graphics.fillCircle(centerX - 4, 29, 2);
            graphics.fillCircle(centerX + 4, 29, 2);
            graphics.lineStyle(1, 0x3d2413, 1);
            graphics.strokeCircle(centerX, 34, 5);
        });

        graphics.generateTexture('twinSunflower', 80, 88);
    }

    createPeashooterTexture(graphics) {
        graphics.clear();
        graphics.fillStyle(0x56b85a, 1);
        graphics.fillCircle(32, 30, 22);
        graphics.fillStyle(0x7bd14f, 1);
        graphics.fillCircle(24, 24, 8);
        graphics.fillStyle(0x2f7d32, 1);
        graphics.fillRect(30, 52, 8, 24);
        graphics.fillStyle(0x4caf50, 1);
        graphics.fillEllipse(22, 66, 28, 12);
        graphics.fillEllipse(48, 65, 28, 12);
        graphics.fillStyle(0x3f9d42, 1);
        graphics.fillEllipse(50, 32, 36, 22);
        graphics.fillStyle(0x1c5f24, 1);
        graphics.fillCircle(60, 32, 5);
        graphics.generateTexture('peashooter', 80, 88);
    }

    createWalnutTexture(graphics) {
        graphics.clear();
        graphics.fillStyle(0x9b672f, 1);
        graphics.fillEllipse(36, 42, 50, 68);
        graphics.fillStyle(0xc28a45, 1);
        graphics.fillEllipse(30, 35, 18, 42);
        graphics.lineStyle(3, 0x6f451f, 1);
        graphics.strokeEllipse(36, 42, 50, 68);
        graphics.lineBetween(33, 14, 42, 34);
        graphics.lineBetween(42, 34, 34, 52);
        graphics.lineBetween(34, 52, 43, 70);
        graphics.fillStyle(0x2a1a10, 1);
        graphics.fillCircle(27, 36, 4);
        graphics.fillCircle(46, 36, 4);
        graphics.lineStyle(2, 0x2a1a10, 1);
        graphics.lineBetween(29, 54, 43, 54);
        graphics.generateTexture('walnut', 72, 84);
    }

    createCherryBombTexture(graphics) {
        graphics.clear();
        graphics.fillStyle(0x3d7b36, 1);
        graphics.fillRect(35, 12, 6, 22);
        graphics.lineStyle(3, 0x3d7b36, 1);
        graphics.lineBetween(38, 16, 28, 26);
        graphics.lineBetween(38, 16, 50, 26);
        graphics.fillStyle(0xc71f2d, 1);
        graphics.fillCircle(27, 44, 22);
        graphics.fillCircle(51, 44, 22);
        graphics.fillStyle(0xff5a68, 1);
        graphics.fillCircle(19, 35, 7);
        graphics.fillCircle(43, 35, 7);
        graphics.fillStyle(0x2b1114, 1);
        graphics.fillCircle(25, 43, 3);
        graphics.fillCircle(49, 43, 3);
        graphics.lineStyle(2, 0x2b1114, 1);
        graphics.lineBetween(25, 55, 54, 55);
        graphics.generateTexture('cherryBomb', 80, 88);
    }

    createZombieTexture(graphics, key, skinColor, accentColor, shirtColor, armor = null) {
        graphics.clear();
        graphics.fillStyle(0x4f3422, 1);
        graphics.fillRect(28, 58, 8, 24);
        graphics.fillRect(42, 58, 8, 24);
        graphics.fillStyle(shirtColor, 1);
        graphics.fillRect(24, 34, 30, 30);
        graphics.fillStyle(0x263238, 1);
        graphics.fillRect(26, 44, 26, 7);
        graphics.fillStyle(skinColor, 1);
        graphics.fillCircle(38, 22, 18);
        graphics.fillRect(18, 38, 12, 10);
        graphics.fillRect(52, 38, 12, 10);
        graphics.fillStyle(0x1f2519, 1);
        graphics.fillCircle(31, 20, 3);
        graphics.fillCircle(44, 20, 3);
        graphics.lineStyle(2, 0x1f2519, 1);
        graphics.lineBetween(31, 30, 47, 28);

        if (armor === 'cone') {
            graphics.fillStyle(accentColor, 1);
            graphics.fillTriangle(20, 14, 56, 14, 38, -18);
            graphics.lineStyle(2, 0x7f3a11, 1);
            graphics.strokeTriangle(20, 14, 56, 14, 38, -18);
        } else if (armor === 'bucket') {
            graphics.fillStyle(accentColor, 1);
            graphics.fillRect(22, 0, 34, 20);
            graphics.lineStyle(2, 0x6f7c82, 1);
            graphics.strokeRect(22, 0, 34, 20);
        } else {
            graphics.fillStyle(accentColor, 1);
            graphics.fillRect(26, 8, 26, 5);
        }

        graphics.generateTexture(key, 76, 88);
    }

    createProjectileTextures(graphics) {
        graphics.clear();
        graphics.fillStyle(0x7fe55f, 1);
        graphics.fillCircle(8, 8, 8);
        graphics.lineStyle(2, 0x2f7d32, 1);
        graphics.strokeCircle(8, 8, 7);
        graphics.generateTexture('pea', 16, 16);

        graphics.clear();
        graphics.fillStyle(0xffd257, 1);
        graphics.fillCircle(16, 16, 14);
        graphics.lineStyle(2, 0xfff0a8, 1);
        graphics.strokeCircle(16, 16, 11);
        graphics.generateTexture('sun', 32, 32);
    }
}
