import * as Tone from 'tone';

class AudioEngine {
  private synth: Tone.PolySynth;
  private subSynth: Tone.PolySynth;
  private sparkleSynth: Tone.PolySynth;
  private filter: Tone.Filter;
  private vibrato: Tone.Vibrato;
  private chorus: Tone.Chorus;
  private reverb: Tone.Reverb;
  private limiter: Tone.Limiter;
  private initialized: boolean = false;

  constructor() {
    // Limiter at the very end to prevent "glitch" clipping
    this.limiter = new Tone.Limiter(-1).toDestination();

    // Reverb for that "space/cave" atmosphere
    this.reverb = new Tone.Reverb({
      decay: 3.5,
      wet: 0.4
    }).connect(this.limiter);

    // Chorus adds that "shimmering/organic" quality
    this.chorus = new Tone.Chorus(4, 2.5, 0.5).connect(this.reverb).start();

    // Vibrato adds the "warble" characteristic of Rocky's voice
    this.vibrato = new Tone.Vibrato(4, 0.1).connect(this.chorus);
    
    // A warm filter to keep it soft and organic
    this.filter = new Tone.Filter({
      type: "lowpass",
      frequency: 1100,
      rolloff: -12
    }).connect(this.vibrato);

    // Main melodic synth
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.2, decay: 0.3, sustain: 0.5, release: 1.2 },
    }).connect(this.filter);

    // Sub synth for that deep whale-like resonance
    this.subSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.3, decay: 0.4, sustain: 0.6, release: 1.5 },
    }).connect(this.filter);

    // High-frequency "sparkle" synth for emotions
    // Now also connected to the filter for consistency
    this.sparkleSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' }, // Switched to sine for cleaner high frequencies
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.8 },
    }).connect(this.filter);
    
    // Balanced volumes to prevent clipping even before the limiter
    this.synth.volume.value = -15;
    this.subSynth.volume.value = -18;
    this.sparkleSynth.volume.value = -22;
  }

  async init() {
    if (this.initialized) return;
    await Tone.start();
    this.initialized = true;
    console.log('Audio engine initialized');
  }

  playChord(chordCode: string, isEmotional: boolean = false) {
    // Parse [C4-E4-G4]
    const notes = chordCode
      .replace('[', '')
      .replace(']', '')
      .split('-')
      .map(note => note.trim());

    if (notes.length > 0) {
      // Play main notes
      this.synth.triggerAttackRelease(notes, '0.8');
      
      // Play sub-octave for whale effect
      const subNotes = notes.map(n => {
        const match = n.match(/([A-G][#b]?)(\d)/);
        if (match) {
          const octave = parseInt(match[2]);
          return `${match[1]}${octave - 1}`;
        }
        return n;
      });
      this.subSynth.triggerAttackRelease(subNotes, '1.0');

      // If emotional, add high-frequency sparkle
      if (isEmotional) {
        const sparkleNotes = notes.map(n => {
          const match = n.match(/([A-G][#b]?)(\d)/);
          if (match) {
            const octave = parseInt(match[2]);
            return `${match[1]}${octave + 1}`;
          }
          return n;
        });
        this.sparkleSynth.triggerAttackRelease(sparkleNotes, '0.6');
      }
    }
  }

  parseAndPlay(text: string) {
    const chordMatches = text.match(/\[([A-G][#b]?\d(-[A-G][#b]?\d)*)\]/g);
    
    // Detect emotion keywords
    const emotionalKeywords = ['amaze', 'happy', 'laugh', 'excited', 'joy', 'wow', 'fist-bump', '!', 'haha'];
    const isEmotional = emotionalKeywords.some(word => text.toLowerCase().includes(word));

    if (chordMatches) {
      chordMatches.forEach((chord, index) => {
        setTimeout(() => {
          this.playChord(chord, isEmotional);
        }, index * 600);
      });
    }
  }
}

export const audioEngine = new AudioEngine();
