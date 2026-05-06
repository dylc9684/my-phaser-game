import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    create(data) {
        this.playScene = this.scene.get('PlayScene');
        this.level = data.level ?? 1;
        this.levelConfig = this.cache.json.get(`level${this.level}`);
        this.isPaused = false;
        this.pauseMenu = null;

        this.createSeedBar();
        this.createSunCounter();
        this.createPauseButton();
        this.bindPlaySceneEvents();
    }

    createSeedBar() {
        const plantEntries = Object.entries(this.levelConfig.plants);
        const seedBarWidth = Math.max(300, plantEntries.length * 78 + 36);

        this.seedBar = this.add.rectangle(80 + seedBarWidth / 2, 42, seedBarWidth, 68, 0x1f2d1f, 0.9);
        this.seedCards = new Map();

        plantEntries.forEach(([seedKey, seedConfig], index) => {
            const x = 115 + (index * 78);
            const card = this.add.rectangle(x, 42, 74, 54, 0x355e32, 1)
                .setStrokeStyle(2, 0xd6ffd1)
                .setInteractive({ useHandCursor: true });

            this.add.image(x, 38, seedConfig.texture).setScale(0.42);
            this.add.text(x, 64, String(seedConfig.cost), {
                fontSize: '14px',
                color: '#ffffff'
            }).setOrigin(0.5);

            card.on('pointerdown', () => {
                this.playScene.events.emit('begin-placement', seedKey);
            });

            this.seedCards.set(seedKey, card);
        });
    }

    createSunCounter() {
        this.sunPanel = this.add.rectangle(48, 42, 76, 48, 0x442f12, 0.95);
        this.sunText = this.add.text(48, 42, 'Sun: 0', {
            fontSize: '18px',
            color: '#ffe680'
        }).setOrigin(0.5);
    }

    createPauseButton() {
        this.pauseButton = this.add.rectangle(730, 42, 96, 44, 0x27313f, 0.95)
            .setInteractive({ useHandCursor: true });
        this.pauseText = this.add.text(730, 42, 'Pause', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.pauseButton.on('pointerdown', () => this.togglePause());
    }

    bindPlaySceneEvents() {
        this.playScene.events.on('sun-changed', this.updateSunText, this);
        this.playScene.events.on('seed-selected', this.updateSelectedSeed, this);
        this.playScene.events.on('level-complete', this.showLevelCompleteMenu, this);
        this.playScene.events.on('game-over', this.showGameOverMenu, this);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.playScene.events.off('sun-changed', this.updateSunText, this);
            this.playScene.events.off('seed-selected', this.updateSelectedSeed, this);
            this.playScene.events.off('level-complete', this.showLevelCompleteMenu, this);
            this.playScene.events.off('game-over', this.showGameOverMenu, this);
        });

        this.updateSunText(this.playScene.economyManager?.sun ?? 0);
        this.updateSelectedSeed(this.playScene.selectedSeed ?? this.levelConfig.defaultSeed);
    }

    updateSunText(sun) {
        this.sunText.setText(`Sun: ${sun}`);
    }

    updateSelectedSeed(seedKey) {
        this.seedCards.forEach((card, cardSeedKey) => {
            const selectedColor = cardSeedKey === seedKey ? 0x4d8f45 : 0x355e32;
            card.setFillStyle(selectedColor, 1);
        });
    }

    togglePause() {
        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.scene.pause('PlayScene');
            this.pauseText.setText('Resume');
            this.showPauseMenu();
        } else {
            this.resumeGame();
        }
    }

    showPauseMenu() {
        if (this.pauseMenu) {
            return;
        }

        const shade = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.45);
        const panel = this.add.rectangle(400, 300, 300, 260, 0x142016, 0.98)
            .setStrokeStyle(2, 0xd6ffd1, 0.85);
        const title = this.add.text(400, 218, 'Paused', {
            fontSize: '30px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const resume = this.createPauseMenuButton(400, 275, 'Resume', () => this.resumeGame());
        const restart = this.createPauseMenuButton(400, 335, 'Restart', () => this.restartLevel());
        const menu = this.createPauseMenuButton(400, 395, 'Main Menu', () => this.returnToMenu());

        this.pauseMenu = this.add.container(0, 0, [
            shade,
            panel,
            title,
            ...resume,
            ...restart,
            ...menu
        ]);
    }

    showLevelCompleteMenu() {
        this.showResultMenu('Level Complete', 0xd6ffd1);
    }

    showGameOverMenu() {
        this.showResultMenu('Game Over', 0xffdddd);
    }

    showResultMenu(titleText, color) {
        this.isPaused = false;
        this.pauseText.setText('Pause');
        this.pauseMenu?.destroy(true);

        const shade = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.48);
        const panel = this.add.rectangle(400, 318, 320, 230, 0x142016, 0.98)
            .setStrokeStyle(2, color, 0.85);
        const title = this.add.text(400, 250, titleText, {
            fontSize: '30px',
            color: `#${color.toString(16).padStart(6, '0')}`
        }).setOrigin(0.5);
        const restart = this.createPauseMenuButton(400, 325, 'Restart', () => this.restartLevel());
        const menu = this.createPauseMenuButton(400, 385, 'Main Menu', () => this.returnToMenu());

        this.pauseMenu = this.add.container(0, 0, [
            shade,
            panel,
            title,
            ...restart,
            ...menu
        ]);
    }

    createPauseMenuButton(x, y, label, onClick) {
        const button = this.add.rectangle(x, y, 210, 44, 0x2f7d32, 0.95)
            .setStrokeStyle(2, 0xd6ffd1, 0.75)
            .setInteractive({ useHandCursor: true });
        const text = this.add.text(x, y, label, {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        button.on('pointerover', () => button.setFillStyle(0x4d8f45, 1));
        button.on('pointerout', () => button.setFillStyle(0x2f7d32, 0.95));
        button.on('pointerdown', onClick);

        return [button, text];
    }

    resumeGame() {
        this.isPaused = false;
        this.pauseText.setText('Pause');
        this.pauseMenu?.destroy(true);
        this.pauseMenu = null;
        this.scene.resume('PlayScene');
    }

    restartLevel() {
        this.pauseMenu?.destroy(true);
        this.pauseMenu = null;
        this.scene.stop('PlayScene');
        this.scene.start('PlayScene', { level: this.level });
        this.scene.restart({ level: this.level });
    }

    returnToMenu() {
        this.pauseMenu?.destroy(true);
        this.pauseMenu = null;
        this.scene.stop('PlayScene');
        this.scene.stop();
        this.scene.start('MenuScene');
    }
}
