import Enemy from '../entities/Enemy';
import EntityState from '../systems/EntityState';

export default class ZombieManager {
    constructor(scene, { grid, levelConfig }) {
        this.scene = scene;
        this.grid = grid;
        this.levelConfig = levelConfig;
        this.groupsByRow = Array.from({ length: grid.rows }, () => scene.physics.add.group());
    }

    spawnZombie({ enemy = 'basicZombie', row = 0 }) {
        const enemyConfig = this.levelConfig.enemies[enemy];
        const { y } = this.grid.getCellCenter(row, this.grid.cols - 1);
        const zombie = this.getFromPool(row, enemyConfig);

        zombie.spawn(enemyConfig.spawnX, y, row);
        this.scene.events.emit('zombie-spawned', { zombie, row, enemy });
        return zombie;
    }

    getFromPool(row, enemyConfig) {
        const laneGroup = this.getLaneGroup(row);
        const pooledZombie = laneGroup.getChildren().find((zombie) => !zombie.active);

        if (pooledZombie) {
            pooledZombie.config = enemyConfig;
            return pooledZombie;
        }

        const zombie = new Enemy(this.scene, enemyConfig.spawnX, 0, enemyConfig);
        laneGroup.add(zombie);
        return zombie;
    }

    hasTargetInLane(row, x) {
        return this.getLaneGroup(row).getChildren().some((zombie) => (
            zombie.active &&
            zombie.x > x &&
            zombie.x < 820
        ));
    }

    update(time, plantManager) {
        this.groupsByRow.forEach((group) => {
            group.getChildren().forEach((zombie) => {
                if (!zombie.active || zombie.state === EntityState.DYING || zombie.state === EntityState.DEAD) {
                    return;
                }

                if (zombie.x < zombie.config.loseX) {
                    this.scene.events.emit('house_reached');
                    return;
                }

                const target = this.scanForPlantInFront(zombie, plantManager);

                if (target) {
                    zombie.attack(target, time, (plant, damage) => plantManager.damagePlant(plant, damage));
                    return;
                }

                zombie.walk();
            });
        });
    }

    scanForPlantInFront(zombie, plantManager) {
        const scanX = zombie.x - (this.grid.cellWidth * 0.5);
        const cell = this.grid.getSnap(scanX, zombie.y);

        if (!cell || cell.row !== zombie.row) {
            return null;
        }

        return plantManager.getPlantAt(cell.row, cell.col);
    }

    damageZombie(zombie, damage) {
        if (!zombie.active || zombie.state === EntityState.DYING || zombie.state === EntityState.DEAD) {
            return;
        }

        zombie.health -= damage;
        zombie.setTint(0x88ff88);
        this.scene.time.delayedCall(90, () => {
            if (zombie.active) {
                zombie.clearTint();
            }
        });

        if (zombie.health <= 0) {
            zombie.die(() => this.scene.events.emit('zombie-died', { zombie }));
        }
    }

    damageZombiesInArea(centerCell, bombConfig) {
        const minRow = Math.max(0, centerCell.row - bombConfig.radiusRows);
        const maxRow = Math.min(this.grid.rows - 1, centerCell.row + bombConfig.radiusRows);
        const minCol = Math.max(0, centerCell.col - bombConfig.radiusCols);
        const maxCol = Math.min(this.grid.cols - 1, centerCell.col + bombConfig.radiusCols);

        for (let row = minRow; row <= maxRow; row++) {
            this.getLaneGroup(row).getChildren().forEach((zombie) => {
                if (!zombie.active || zombie.state === EntityState.DYING || zombie.state === EntityState.DEAD) {
                    return;
                }

                const zombieCell = this.grid.getSnap(zombie.x, zombie.y);

                if (!zombieCell || zombieCell.col < minCol || zombieCell.col > maxCol) {
                    return;
                }

                this.damageZombie(zombie, bombConfig.damage);
            });
        }
    }

    stopAll() {
        this.groupsByRow.forEach((group) => {
            group.getChildren().forEach((zombie) => {
                if (zombie.active) {
                    zombie.body.setVelocityX(0);
                }
            });
        });
    }

    hasActiveZombies() {
        return this.groupsByRow.some((group) => group.countActive(true) > 0);
    }

    getLaneGroup(row) {
        return this.groupsByRow[row];
    }

    getLaneGroups() {
        return this.groupsByRow;
    }
}
