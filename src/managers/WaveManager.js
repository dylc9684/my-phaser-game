export default class WaveManager {
    constructor(scene, { waves }) {
        this.scene = scene;
        this.waves = waves;
        this.pendingEvents = waves.reduce((total, wave) => total + wave.spawns.length, 0);
        this.timers = [];
    }

    start() {
        let waveStartTime = 0;

        this.waves.forEach((wave, index) => {
            waveStartTime += wave.delayBefore ?? 0;
            this.scheduleWaveStart(wave, index + 1, waveStartTime);

            wave.spawns.forEach((spawn) => {
                this.scheduleSpawn(waveStartTime + spawn.at, spawn, index + 1);
            });

            const waveDuration = Math.max(...wave.spawns.map((spawn) => spawn.at), 0);
            waveStartTime += waveDuration + (wave.breakAfter ?? 0);
        });
    }

    scheduleWaveStart(wave, waveNumber, time) {
        const timer = this.scene.time.delayedCall(time, () => {
            this.scene.events.emit('wave-started', {
                wave,
                waveNumber
            });
        });

        this.timers.push(timer);
    }

    scheduleSpawn(time, spawn, waveNumber) {
        const timer = this.scene.time.delayedCall(time, () => {
            this.pendingEvents -= 1;
            this.scene.events.emit('spawn_zombie', {
                ...spawn,
                waveNumber
            });
        });

        this.timers.push(timer);
    }

    stop() {
        this.timers.forEach((timer) => timer.remove(false));
        this.timers = [];
        this.pendingEvents = 0;
    }

    hasPendingSpawns() {
        return this.pendingEvents > 0;
    }
}
