export default class EconomyManager {
    constructor(scene, { startingSun }) {
        this.scene = scene;
        this.sun = startingSun;
    }

    canAfford(cost) {
        return this.sun >= cost;
    }

    spend(cost) {
        if (!this.canAfford(cost)) {
            return false;
        }

        this.sun -= cost;
        this.emitChange();
        return true;
    }

    add(amount) {
        this.sun += amount;
        this.emitChange();
    }

    emitChange() {
        this.scene.events.emit('sun-changed', this.sun);
    }
}
