import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        this.playerProgress = this.loadProgress();
        this.settings = this.loadSettings();

        this.add.image(400, 300, 'background').setAlpha(0.45);
        this.add.rectangle(400, 300, 800, 600, 0x07110a, 0.42);

        this.titleText = this.add.text(400, 112, 'Garden Defense', {
            fontSize: '48px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.subtitleText = this.add.text(400, 158, 'Hold the lanes. Grow the answer.', {
            fontSize: '18px',
            color: '#d6ffd1'
        }).setOrigin(0.5);

        this.panel = this.add.container(0, 0);
        this.showMainMenu();
    }

    loadProgress() {
        const savedProgress = localStorage.getItem('garden-defense-progress');

        if (!savedProgress) {
            return {
                unlockedLevel: 4,
                selectedLevel: 1
            };
        }

        return JSON.parse(savedProgress);
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('garden-defense-settings');

        if (!savedSettings) {
            return {
                soundEnabled: true
            };
        }

        return JSON.parse(savedSettings);
    }

    saveSettings() {
        localStorage.setItem('garden-defense-settings', JSON.stringify(this.settings));
    }

    showMainMenu() {
        this.resetPanel();
        this.addMenuButton(400, 236, 'Start Stage 1', () => this.startLevel(1));
        this.addMenuButton(400, 304, 'Stage Select', () => this.showLevelSelect());
        this.addMenuButton(400, 372, 'Options', () => this.showOptions());
    }

    showLevelSelect() {
        this.resetPanel();

        this.panel.add(this.add.text(400, 238, 'Select Level', {
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5));

        this.addMenuButton(400, 270, 'Stage 1', () => this.startLevel(1));
        this.addMenuButton(400, 328, 'Stage 2', () => this.startLevel(2));
        this.addMenuButton(400, 386, 'Stage 3', () => this.startLevel(3));
        this.addMenuButton(400, 444, 'Stage 4', () => this.startLevel(4));
        this.addMenuButton(400, 510, 'Back', () => this.showMainMenu(), {
            width: 180,
            fill: 0x27313f
        });
    }

    showOptions() {
        this.resetPanel();

        this.panel.add(this.add.text(400, 238, 'Options', {
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5));

        this.addMenuButton(400, 315, `Sound: ${this.settings.soundEnabled ? 'On' : 'Off'}`, () => {
            this.settings.soundEnabled = !this.settings.soundEnabled;
            this.saveSettings();
            this.showOptions();
        });

        this.addMenuButton(400, 408, 'Back', () => this.showMainMenu(), {
            width: 180,
            fill: 0x27313f
        });
    }

    resetPanel() {
        this.panel.removeAll(true);
    }

    addMenuButton(x, y, label, onClick, options = {}) {
        const width = options.width ?? 260;
        const height = options.height ?? 56;
        const fill = options.fill ?? 0x2f7d32;
        const button = this.add.rectangle(x, y, width, height, fill, 0.95)
            .setStrokeStyle(2, 0xd6ffd1, 0.75)
            .setInteractive({ useHandCursor: true });
        const text = this.add.text(x, y, label, {
            fontSize: '22px',
            color: '#ffffff'
        }).setOrigin(0.5);

        button.on('pointerover', () => button.setFillStyle(0x4d8f45, 1));
        button.on('pointerout', () => button.setFillStyle(fill, 0.95));
        button.on('pointerdown', onClick);

        this.panel.add([button, text]);
        return button;
    }

    startLevel(level) {
        this.scene.stop('UIScene');
        this.scene.start('PlayScene', { level });
        this.scene.launch('UIScene', { level });
    }
}
