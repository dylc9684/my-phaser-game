export default class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.context = null;
        this.enabled = this.loadSoundSetting();
        this.volume = 0.35;
    }

    loadSoundSetting() {
        const savedSettings = localStorage.getItem('garden-defense-settings');

        if (!savedSettings) {
            return true;
        }

        return JSON.parse(savedSettings).soundEnabled !== false;
    }

    start() {
        this.scene.input.once('pointerdown', () => this.unlock());

        this.scene.events.on('seed-selected', () => this.playBlip(440, 0.05));
        this.scene.events.on('plant-placed', () => this.playChord([330, 495], 0.12));
        this.scene.events.on('invalid-placement', () => this.playBuzz());
        this.scene.events.on('projectile-fired', () => this.playBlip(780, 0.04));
        this.scene.events.on('projectile-hit', () => this.playNoise(0.08, 700));
        this.scene.events.on('zombie-spawned', () => this.playBlip(150, 0.14, 'sawtooth'));
        this.scene.events.on('sun-spawned', () => this.playBlip(620, 0.08));
        this.scene.events.on('sun-collected', () => this.playChord([660, 880, 990], 0.12));
        this.scene.events.on('plant-died', () => this.playNoise(0.16, 260));
        this.scene.events.on('zombie-died', () => this.playNoise(0.14, 180));
        this.scene.events.on('bomb-exploded', () => this.playNoise(0.32, 520));
        this.scene.events.on('wave-started', () => this.playChord([196, 247], 0.2, 'sawtooth'));
        this.scene.events.on('level-complete', () => this.playChord([523, 659, 784], 0.45));
        this.scene.events.on('game-over', () => this.playChord([220, 185, 147], 0.55, 'triangle'));
    }

    unlock() {
        this.getContext()?.resume();
    }

    getContext() {
        if (!this.enabled) {
            return null;
        }

        if (!this.context) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;

            if (!AudioContext) {
                this.enabled = false;
                return null;
            }

            this.context = new AudioContext();
        }

        return this.context;
    }

    playBlip(frequency, duration, type = 'sine') {
        const context = this.getContext();

        if (!context) {
            return;
        }

        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const now = context.currentTime;

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(this.volume, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(now);
        oscillator.stop(now + duration + 0.02);
    }

    playChord(frequencies, duration, type = 'sine') {
        frequencies.forEach((frequency, index) => {
            this.scene.time.delayedCall(index * 55, () => this.playBlip(frequency, duration, type));
        });
    }

    playBuzz() {
        const context = this.getContext();

        if (!context) {
            return;
        }

        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const now = context.currentTime;

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(120, now);
        oscillator.frequency.exponentialRampToValueAtTime(80, now + 0.16);
        gain.gain.setValueAtTime(this.volume * 0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.18);
    }

    playNoise(duration, cutoff) {
        const context = this.getContext();

        if (!context) {
            return;
        }

        const sampleCount = Math.floor(context.sampleRate * duration);
        const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
        const data = buffer.getChannelData(0);

        for (let index = 0; index < sampleCount; index++) {
            data[index] = (Math.random() * 2 - 1) * (1 - index / sampleCount);
        }

        const source = context.createBufferSource();
        const filter = context.createBiquadFilter();
        const gain = context.createGain();
        const now = context.currentTime;

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(cutoff, now);
        gain.gain.setValueAtTime(this.volume * 0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        source.buffer = buffer;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(context.destination);
        source.start(now);
    }
}
