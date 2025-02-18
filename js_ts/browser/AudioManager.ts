import { getLogger } from "./utils/logging.js";

const { log } = getLogger('AudioManager', { color: 'red', enabled: false });

export async function playSound(id) {
    await AudioManager.play(id);
}

class _AudioManager {
    private context: AudioContext;
    private sounds: Map<string, { filePath: string; buffer?: AudioBuffer }> = new Map();

    constructor() {
        //this.init();
    }

    private async init(): Promise<void> {
        log('init');
        // Initialize the AudioContext
        this.context = new AudioContext();
    }

    // Register a sound file by ID without loading it
    public register(id: string, filePath: string): void {
        log('register', id, filePath);
        this.sounds.set(id, { filePath });
    }

    // Load a sound into memory
    public async load(id: string): Promise<void> {
        if (!this.context) throw new Error(`No audio context.`);

        log('load', id);
        const sound = this.sounds.get(id);
        if (!sound) throw new Error(`Sound with id ${id} not registered`);

        if (!sound.buffer) {
            const response = await fetch(sound.filePath);
            const arrayBuffer = await response.arrayBuffer();
            sound.buffer = await this.context.decodeAudioData(arrayBuffer);
        }
    }

    // Play a sound by ID, loading it if not already loaded
    public async play(id: string): Promise<void> {
        if (!this.context) await this.init();
        if (!this.context) throw new Error(`No audio context.`);

        log('play', id);
        const sound = this.sounds.get(id);
        if (!sound) throw new Error(`Sound with id ${id} not registered. Must first call AudioManager.register(id, filePath).`);
        if (!sound.buffer) await this.load(id);

        // Create a buffer source node
        const source = this.context.createBufferSource();
        source.buffer = sound.buffer;
        source.connect(this.context.destination);
        source.start();
    }
}

const AudioManager = new _AudioManager();
export default AudioManager;