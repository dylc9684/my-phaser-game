export default class ProjectileManager {
    constructor(scene, { grid, registry }) {
        this.scene = scene;
        this.grid = grid;
        this.registry = registry;
        this.groupsByRow = Array.from({ length: grid.rows }, () => (
            scene.physics.add.group({
                maxSize: 24,
                runChildUpdate: false
            })
        ));
    }

    fireFromPlant(plant) {
        const attackConfig = plant.config.attack;
        const projectileConfig = this.registry.projectiles[attackConfig.projectile];
        const muzzleOffset = attackConfig.muzzleOffset;
        const x = plant.x + muzzleOffset.x;
        const y = plant.y + muzzleOffset.y;
        const projectile = this.getLaneGroup(plant.row).get(x, y, projectileConfig.texture);

        if (!projectile) {
            return;
        }

        projectile.setTexture(projectileConfig.texture);
        projectile.setActive(true);
        projectile.setVisible(true);
        projectile.body.enable = true;
        projectile.body.reset(x, y);
        projectile.row = plant.row;
        projectile.damage = projectileConfig.damage;
        projectile.cleanupX = projectileConfig.cleanupX;
        projectile.setCircle(projectileConfig.radius);
        projectile.setVelocityX(projectileConfig.speed);
        this.scene.events.emit('projectile-fired');
    }

    release(projectile) {
        projectile.setActive(false);
        projectile.setVisible(false);
        projectile.setVelocity(0, 0);
        projectile.body.enable = false;
    }

    update() {
        this.groupsByRow.forEach((group) => {
            group.getChildren().forEach((projectile) => {
                if (projectile.active && projectile.x > projectile.cleanupX) {
                    this.release(projectile);
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
