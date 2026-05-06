import Attacker from '../entities/Attacker';
import Bomb from '../entities/Bomb';
import Defender from '../entities/Defender';
import EntityState from '../systems/EntityState';
import Producer from '../entities/Producer';

export default class PlantManager {
    constructor(scene, { grid, levelConfig, zombieManager, projectileManager, economyManager, sunManager }) {
        this.scene = scene;
        this.grid = grid;
        this.levelConfig = levelConfig;
        this.zombieManager = zombieManager;
        this.projectileManager = projectileManager;
        this.economyManager = economyManager;
        this.sunManager = sunManager;
        this.selectedSeed = levelConfig.defaultSeed;
        this.groupsByRow = Array.from({ length: grid.rows }, () => scene.physics.add.staticGroup());
    }

    selectSeed(seedKey) {
        if (!this.levelConfig.plants[seedKey]) {
            return;
        }

        this.selectedSeed = seedKey;
        this.scene.events.emit('seed-selected', seedKey);
    }

    canPlace(seedKey, cell) {
        const plantConfig = this.levelConfig.plants[seedKey];

        if (!cell || !plantConfig || !this.economyManager.canAfford(plantConfig.cost)) {
            return false;
        }

        if (plantConfig.role === 'producerUpgrade') {
            const occupant = this.grid.getOccupant(cell.row, cell.col);
            return Boolean(
                occupant &&
                occupant.active &&
                occupant.plantKey === plantConfig.upgrade.targetPlant
            );
        }

        return Boolean(
            !this.grid.isOccupied(cell.row, cell.col)
        );
    }

    placeSelectedPlant(cell) {
        return this.placePlant(this.selectedSeed, cell);
    }

    placePlant(plantKey, cell) {
        const plantConfig = this.levelConfig.plants[plantKey];

        if (!this.canPlace(plantKey, cell) || !this.economyManager.spend(plantConfig.cost)) {
            return null;
        }

        if (plantConfig.role === 'producerUpgrade') {
            this.removePlantForUpgrade(cell);
        }

        const PlantClass = this.getPlantClass(plantConfig.role);
        const plant = new PlantClass(this.scene, cell.x, cell.y, plantConfig);

        plant.row = cell.row;
        plant.col = cell.col;
        plant.plantKey = plantKey;
        this.getLaneGroup(cell.row).add(plant);
        this.grid.occupy(cell.row, cell.col, plant);
        this.scene.events.emit('plant-placed', { plant, plantKey, cell });

        if (plant instanceof Producer) {
            plant.startProduction((producer, production) => this.sunManager.spawnFromProducer(producer, production));
        }

        if (plant instanceof Bomb) {
            plant.startFuse((bomb, bombConfig) => this.detonateBomb(bomb, bombConfig));
        }

        return plant;
    }

    getPlantClass(role) {
        if (role === 'producer' || role === 'producerUpgrade') {
            return Producer;
        }

        if (role === 'bomb') {
            return Bomb;
        }

        if (role === 'defender') {
            return Defender;
        }

        return Attacker;
    }

    removePlantForUpgrade(cell) {
        const plant = this.grid.getOccupant(cell.row, cell.col);

        if (!plant) {
            return;
        }

        if (plant instanceof Producer) {
            plant.stopProduction();
        }

        this.grid.vacate(cell.row, cell.col);
        plant.destroy();
    }

    detonateBomb(bomb, bombConfig) {
        if (!bomb.active || bomb.state === EntityState.DYING || bomb.state === EntityState.DEAD) {
            return;
        }

        this.zombieManager.damageZombiesInArea(
            {
                row: bomb.row,
                col: bomb.col
            },
            bombConfig
        );
        this.scene.events.emit('bomb-exploded', { bomb });
        this.killPlant(bomb);
    }

    update(time) {
        this.groupsByRow.forEach((group, row) => {
            const zombieLane = this.zombieManager.getLaneGroup(row);

            group.getChildren().forEach((plant) => {
                if (!plant.active || plant.state === EntityState.DYING || plant.state === EntityState.DEAD) {
                    return;
                }

                if (plant instanceof Attacker) {
                    const hasTarget = (
                        zombieLane.countActive(true) > 0 &&
                        this.zombieManager.hasTargetInLane(row, plant.x)
                    );

                    plant.updateCombat(
                        time,
                        hasTarget,
                        (attacker) => this.projectileManager.fireFromPlant(attacker)
                    );
                }
            });
        });
    }

    damagePlant(plant, damage) {
        if (!plant.active || plant.state === EntityState.DYING || plant.state === EntityState.DEAD) {
            return;
        }

        plant.health -= damage;

        if (plant.health <= 0) {
            this.killPlant(plant);
        }
    }

    killPlant(plant) {
        this.grid.vacate(plant.row, plant.col);
        plant.die(() => this.scene.events.emit('plant-died', { plant }));
    }

    getPlantAt(row, col) {
        const plant = this.grid.getOccupant(row, col);

        if (!plant || !plant.active || plant.state === EntityState.DYING || plant.state === EntityState.DEAD) {
            return null;
        }

        return plant;
    }

    stopAll() {
        this.groupsByRow.forEach((group) => {
            group.getChildren().forEach((plant) => {
                if (plant instanceof Producer) {
                    plant.stopProduction();
                }

                if (plant instanceof Bomb) {
                    plant.stopFuse();
                }
            });
        });
    }

    getLaneGroup(row) {
        return this.groupsByRow[row];
    }

    getLaneGroups() {
        return this.groupsByRow;
    }
}
