import Phaser from 'phaser';
import AudioManager from '../managers/AudioManager';
import EconomyManager from '../managers/EconomyManager';
import PlantManager from '../managers/PlantManager';
import ProjectileManager from '../managers/ProjectileManager';
import SunManager from '../managers/SunManager';
import WaveManager from '../managers/WaveManager';
import ZombieManager from '../managers/ZombieManager';
import GridSystem from '../systems/GridSystem';

const PlayPhase = {
    SETUP: 'SETUP',
    WAVE: 'WAVE',
    LEVEL_COMPLETE: 'LEVEL_COMPLETE',
    GAME_OVER: 'GAME_OVER'
};

export default class PlayScene extends Phaser.Scene {
    constructor() {
        super('PlayScene');
    }

    create(data) {
        this.level = data.level ?? 1;
        this.levelConfig = this.cache.json.get(`level${this.level}`);
        this.phase = PlayPhase.SETUP;
        this.placement = null;

        this.add.image(400, 300, 'background');
        this.createWorldSystems();
        this.audioManager = new AudioManager(this);
        this.audioManager.start();
        this.registerEvents();
        this.registerInput();
        this.selectedSeed = this.plantManager.selectedSeed;

        this.economyManager.emitChange();
        this.events.emit('seed-selected', this.selectedSeed);
        this.sunManager.startSkyDrops();
        this.waveManager.start();
    }

    createWorldSystems() {
        this.grid = new GridSystem(this.levelConfig.grid);
        this.grid.draw(this);

        this.economyManager = new EconomyManager(this, {
            startingSun: this.levelConfig.startingSun
        });

        this.sunManager = new SunManager(this, {
            economyManager: this.economyManager,
            config: this.levelConfig
        });

        this.projectileManager = new ProjectileManager(this, {
            grid: this.grid,
            registry: this.levelConfig
        });

        this.zombieManager = new ZombieManager(this, {
            grid: this.grid,
            levelConfig: this.levelConfig
        });

        this.plantManager = new PlantManager(this, {
            grid: this.grid,
            levelConfig: this.levelConfig,
            zombieManager: this.zombieManager,
            projectileManager: this.projectileManager,
            economyManager: this.economyManager,
            sunManager: this.sunManager
        });

        this.waveManager = new WaveManager(this, {
            waves: this.levelConfig.waves
        });

        this.registerLaneOverlaps();
    }

    registerLaneOverlaps() {
        for (let row = 0; row < this.grid.rows; row++) {
            this.physics.add.overlap(
                this.projectileManager.getLaneGroup(row),
                this.zombieManager.getLaneGroup(row),
                this.handleProjectileHit,
                null,
                this
            );
        }
    }

    registerEvents() {
        this.events.on('begin-placement', (seedKey) => {
            if (this.phase === PlayPhase.GAME_OVER || this.phase === PlayPhase.LEVEL_COMPLETE) {
                return;
            }

            this.beginPlacement(seedKey);
        });

        this.events.on('spawn_zombie', (entry) => {
            this.phase = PlayPhase.WAVE;
            this.zombieManager.spawnZombie(entry);
        });

        this.events.on('wave-started', ({ waveNumber }) => {
            this.showWaveBanner(`Wave ${waveNumber}`);
        });

        this.events.once('house_reached', () => this.triggerGameOver());
    }

    registerInput() {
        this.input.on('pointermove', (pointer) => this.updatePlacementGhost(pointer));
        this.input.on('pointerdown', (pointer) => this.confirmPlacement(pointer));
    }

    beginPlacement(seedKey) {
        this.plantManager.selectSeed(seedKey);
        this.selectedSeed = this.plantManager.selectedSeed;
        const plantConfig = this.levelConfig.plants[this.selectedSeed];

        if (this.placement?.ghost) {
            this.placement.ghost.destroy();
        }

        this.placement = {
            seedKey: this.selectedSeed,
            cell: null,
            ghost: this.add.image(0, 0, plantConfig.texture)
                .setScale(plantConfig.scale)
                .setAlpha(0.5)
                .setVisible(false)
        };
    }

    updatePlacementGhost(pointer) {
        if (!this.placement) {
            return;
        }

        const cell = this.grid.getSnap(pointer.worldX, pointer.worldY);
        const canPlace = this.plantManager.canPlace(this.placement.seedKey, cell);

        this.placement.cell = cell;
        this.placement.ghost
            .setVisible(Boolean(cell))
            .setTint(canPlace ? 0xffffff : 0xff4444);

        if (cell) {
            this.placement.ghost.setPosition(cell.x, cell.y);
        }
    }

    confirmPlacement(pointer) {
        if (!this.placement) {
            return;
        }

        const cell = this.grid.getSnap(pointer.worldX, pointer.worldY);

        if (!cell) {
            return;
        }

        if (this.plantManager.canPlace(this.placement.seedKey, cell)) {
            this.plantManager.placeSelectedPlant(cell);
            this.clearPlacement();
            return;
        }

        this.events.emit('invalid-placement');
    }

    clearPlacement() {
        this.placement?.ghost.destroy();
        this.placement = null;
    }

    showWaveBanner(label) {
        const banner = this.add.text(400, 92, label, {
            fontSize: '34px',
            color: '#fff3b0'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: banner,
            alpha: 1,
            yoyo: true,
            hold: 900,
            duration: 220,
            onComplete: () => banner.destroy()
        });
    }

    handleProjectileHit(projectile, zombie) {
        this.projectileManager.release(projectile);
        this.zombieManager.damageZombie(zombie, projectile.damage);
        this.events.emit('projectile-hit');
    }

    triggerGameOver() {
        if (this.phase === PlayPhase.GAME_OVER || this.phase === PlayPhase.LEVEL_COMPLETE) {
            return;
        }

        this.phase = PlayPhase.GAME_OVER;
        this.haltLevel();
        this.events.emit('game-over');
        this.add.text(400, 300, 'Game Over', {
            fontSize: '48px',
            color: '#ffdddd'
        }).setOrigin(0.5);
    }

    triggerLevelComplete() {
        if (this.phase === PlayPhase.GAME_OVER || this.phase === PlayPhase.LEVEL_COMPLETE) {
            return;
        }

        this.phase = PlayPhase.LEVEL_COMPLETE;
        this.haltLevel();
        this.events.emit('level-complete');
        this.add.text(400, 300, 'Level Complete', {
            fontSize: '44px',
            color: '#d6ffd1'
        }).setOrigin(0.5);
    }

    haltLevel() {
        this.clearPlacement();
        this.waveManager.stop();
        this.sunManager.stopAll();
        this.plantManager.stopAll();
        this.zombieManager.stopAll();
        this.time.removeAllEvents();
        this.input.enabled = false;
    }

    checkResolution() {
        if (
            this.phase !== PlayPhase.GAME_OVER &&
            this.phase !== PlayPhase.LEVEL_COMPLETE &&
            !this.waveManager.hasPendingSpawns() &&
            !this.zombieManager.hasActiveZombies()
        ) {
            this.triggerLevelComplete();
        }
    }

    update(time) {
        if (this.phase === PlayPhase.GAME_OVER || this.phase === PlayPhase.LEVEL_COMPLETE) {
            return;
        }

        this.plantManager.update(time);
        this.zombieManager.update(time, this.plantManager);
        this.projectileManager.update();
        this.checkResolution();
    }
}
