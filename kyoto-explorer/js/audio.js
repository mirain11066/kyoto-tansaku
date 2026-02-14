/* Kyoto Audio System - Web Audio API synthesized BGM/SE/BGS */
(function () {
    'use strict';

    var AudioCtx = window.AudioContext || window.webkitAudioContext;

    window.KyotoAudio = {
        ctx: null,
        master: null,
        bgmGain: null,
        seGain: null,
        bgsGain: null,
        bgmPlaying: false,
        bgsNodes: [],
        bgmInterval: null,
        currentScene: 'dusk',
        unlocked: false,

        init: function () {
            try {
                this.ctx = new AudioCtx();
                this.master = this.ctx.createGain();
                this.master.gain.value = 0.6;
                this.master.connect(this.ctx.destination);
                this.bgmGain = this.ctx.createGain();
                this.bgmGain.gain.value = 0.25;
                this.bgmGain.connect(this.master);
                this.seGain = this.ctx.createGain();
                this.seGain.gain.value = 0.5;
                this.seGain.connect(this.master);
                this.bgsGain = this.ctx.createGain();
                this.bgsGain.gain.value = 0.15;
                this.bgsGain.connect(this.master);
            } catch (e) { console.warn('Audio init failed:', e); }
        },

        unlock: function () {
            if (this.unlocked || !this.ctx) return;
            var self = this;
            if (this.ctx.state === 'suspended') {
                this.ctx.resume().then(function () { self.unlocked = true; });
            } else { this.unlocked = true; }
        },

        /* === BGM: Miyako-bushi scale pentatonic melody === */
        /* Scales per scene - frequencies in Hz */
        scales: {
            dawn: [261.6, 293.7, 311.1, 392.0, 415.3, 523.3, 587.3],  /* C D Eb G Ab */
            day: [293.7, 329.6, 349.2, 392.0, 440.0, 523.3, 587.3],  /* D E F G A */
            dusk: [261.6, 277.2, 329.6, 392.0, 415.3, 523.3, 554.4],  /* C Db E G Ab */
            night: [220.0, 233.1, 277.2, 329.6, 349.2, 440.0, 466.2]   /* A Bb Db E F */
        },

        startBGM: function (scene) {
            if (!this.ctx) return;
            this.stopBGM();
            this.currentScene = scene || this.currentScene;
            this.bgmPlaying = true;
            var self = this;
            var scale = this.scales[this.currentScene] || this.scales.dusk;
            var noteI = 0;
            var patLen = 8;
            var pattern = [];
            /* Generate a calm repeating melody pattern */
            for (var i = 0; i < patLen; i++) {
                pattern.push(Math.floor(Math.random() * scale.length));
            }

            function playNote() {
                if (!self.bgmPlaying || !self.ctx) return;
                var freq = scale[pattern[noteI % patLen]];
                /* Koto-like sound: sine + triangle with fast attack, medium decay */
                var osc1 = self.ctx.createOscillator();
                var osc2 = self.ctx.createOscillator();
                var gain = self.ctx.createGain();
                osc1.type = 'sine';
                osc1.frequency.value = freq;
                osc2.type = 'triangle';
                osc2.frequency.value = freq * 2.01; /* slight detune for shimmer */
                osc2.connect(gain);
                osc1.connect(gain);
                gain.connect(self.bgmGain);
                var now = self.ctx.currentTime;
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.15, now + 0.02); /* fast pluck */
                gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5); /* long decay */
                osc1.start(now);
                osc2.start(now);
                osc1.stop(now + 2.5);
                osc2.stop(now + 2.5);

                /* Occasional harmony note */
                if (noteI % 3 === 0) {
                    var hFreq = scale[(pattern[noteI % patLen] + 2) % scale.length] * 0.5;
                    var ho = self.ctx.createOscillator();
                    var hg = self.ctx.createGain();
                    ho.type = 'sine';
                    ho.frequency.value = hFreq;
                    ho.connect(hg);
                    hg.connect(self.bgmGain);
                    hg.gain.setValueAtTime(0, now);
                    hg.gain.linearRampToValueAtTime(0.06, now + 0.05);
                    hg.gain.exponentialRampToValueAtTime(0.001, now + 3);
                    ho.start(now + 0.1);
                    ho.stop(now + 3.1);
                }
                noteI++;
                /* Regenerate pattern with slight variation every cycle */
                if (noteI % (patLen * 4) === 0) {
                    var idx = Math.floor(Math.random() * patLen);
                    pattern[idx] = Math.floor(Math.random() * scale.length);
                }
            }

            /* Variable timing for organic feel */
            var tempos = { dawn: 1800, day: 1400, dusk: 2000, night: 2400 };
            var baseT = tempos[this.currentScene] || 2000;

            function scheduleNext() {
                if (!self.bgmPlaying) return;
                playNote();
                var delay = baseT + (Math.random() - 0.5) * 600;
                self.bgmInterval = setTimeout(scheduleNext, delay);
            }
            scheduleNext();
        },

        stopBGM: function () {
            this.bgmPlaying = false;
            if (this.bgmInterval) { clearTimeout(this.bgmInterval); this.bgmInterval = null; }
        },

        /* === SE: Sound Effects === */
        playFootstep: function () {
            if (!this.ctx || !this.unlocked) return;
            var o = this.ctx.createOscillator();
            var g = this.ctx.createGain();
            var f = this.ctx.createBiquadFilter();
            o.type = 'square';
            o.frequency.value = 80 + Math.random() * 40;
            f.type = 'lowpass';
            f.frequency.value = 300;
            o.connect(f);
            f.connect(g);
            g.connect(this.seGain);
            var n = this.ctx.currentTime;
            g.gain.setValueAtTime(0, n);
            g.gain.linearRampToValueAtTime(0.08, n + 0.01);
            g.gain.exponentialRampToValueAtTime(0.001, n + 0.12);
            o.start(n);
            o.stop(n + 0.15);
        },

        playCollect: function () {
            if (!this.ctx || !this.unlocked) return;
            var freqs = [523, 659, 784, 1047]; /* C5 E5 G5 C6 */
            var self = this;
            freqs.forEach(function (f, i) {
                var o = self.ctx.createOscillator();
                var g = self.ctx.createGain();
                o.type = 'sine';
                o.frequency.value = f;
                o.connect(g);
                g.connect(self.seGain);
                var n = self.ctx.currentTime + i * 0.12;
                g.gain.setValueAtTime(0, n);
                g.gain.linearRampToValueAtTime(0.2, n + 0.02);
                g.gain.exponentialRampToValueAtTime(0.001, n + 0.5);
                o.start(n);
                o.stop(n + 0.6);
            });
        },

        playClick: function () {
            if (!this.ctx || !this.unlocked) return;
            var o = this.ctx.createOscillator();
            var g = this.ctx.createGain();
            o.type = 'sine';
            o.frequency.value = 800;
            o.connect(g);
            g.connect(this.seGain);
            var n = this.ctx.currentTime;
            g.gain.setValueAtTime(0.15, n);
            g.gain.exponentialRampToValueAtTime(0.001, n + 0.06);
            o.start(n);
            o.stop(n + 0.08);
        },

        /* === BGS: Background sounds === */
        startBGS: function (scene) {
            this.stopBGS();
            if (!this.ctx || !this.unlocked) return;
            var self = this;

            /* Wind - always present, volume varies by scene */
            var windVol = { dawn: 0.06, day: 0.04, dusk: 0.05, night: 0.03 };
            this._startWind(windVol[scene] || 0.04);

            /* Water */
            this._startWater(0.04);

            /* Night crickets */
            if (scene === 'night' || scene === 'dusk') {
                this._startCrickets(scene === 'night' ? 0.06 : 0.03);
            }
        },

        _startWind: function (vol) {
            if (!this.ctx) return;
            var bufSize = this.ctx.sampleRate * 2;
            var buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
            var data = buf.getChannelData(0);
            for (var i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
            var src = this.ctx.createBufferSource();
            src.buffer = buf;
            src.loop = true;
            var f = this.ctx.createBiquadFilter();
            f.type = 'lowpass';
            f.frequency.value = 400;
            f.Q.value = 0.5;
            var g = this.ctx.createGain();
            g.gain.value = vol;
            src.connect(f);
            f.connect(g);
            g.connect(this.bgsGain);
            src.start();
            /* LFO for wind gusts */
            var lfo = this.ctx.createOscillator();
            var lfoG = this.ctx.createGain();
            lfo.type = 'sine';
            lfo.frequency.value = 0.15;
            lfoG.gain.value = vol * 0.5;
            lfo.connect(lfoG);
            lfoG.connect(g.gain);
            lfo.start();
            this.bgsNodes.push(src, lfo);
        },

        _startWater: function (vol) {
            if (!this.ctx) return;
            var bufSize = this.ctx.sampleRate * 2;
            var buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
            var data = buf.getChannelData(0);
            for (var i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
            var src = this.ctx.createBufferSource();
            src.buffer = buf;
            src.loop = true;
            var f1 = this.ctx.createBiquadFilter();
            f1.type = 'bandpass';
            f1.frequency.value = 800;
            f1.Q.value = 2;
            var f2 = this.ctx.createBiquadFilter();
            f2.type = 'lowpass';
            f2.frequency.value = 1200;
            var g = this.ctx.createGain();
            g.gain.value = vol;
            src.connect(f1);
            f1.connect(f2);
            f2.connect(g);
            g.connect(this.bgsGain);
            src.start();
            this.bgsNodes.push(src);
        },

        _startCrickets: function (vol) {
            if (!this.ctx) return;
            var self = this;
            function chirp() {
                if (!self.ctx || self.bgsNodes.length === 0) return;
                var o = self.ctx.createOscillator();
                var g = self.ctx.createGain();
                o.type = 'sine';
                o.frequency.value = 4000 + Math.random() * 1000;
                o.connect(g);
                g.connect(self.bgsGain);
                var n = self.ctx.currentTime;
                g.gain.setValueAtTime(0, n);
                /* Rapid on-off chirps */
                for (var i = 0; i < 6; i++) {
                    var t = n + i * 0.06;
                    g.gain.setValueAtTime(vol, t);
                    g.gain.setValueAtTime(0, t + 0.03);
                }
                g.gain.setValueAtTime(0, n + 0.4);
                o.start(n);
                o.stop(n + 0.5);
                setTimeout(chirp, 2000 + Math.random() * 4000);
            }
            setTimeout(chirp, 1000);
            /* Store a dummy so length check works */
            this.bgsNodes.push({ stop: function () { } });
        },

        stopBGS: function () {
            for (var i = 0; i < this.bgsNodes.length; i++) {
                try { this.bgsNodes[i].stop(); } catch (e) { }
            }
            this.bgsNodes = [];
        },

        /* Rain BGS */
        startRain: function () {
            if (!this.ctx || !this.unlocked) return;
            var bufSize = this.ctx.sampleRate * 2;
            var buf = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
            var data = buf.getChannelData(0);
            for (var i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
            var src = this.ctx.createBufferSource();
            src.buffer = buf;
            src.loop = true;
            var f = this.ctx.createBiquadFilter();
            f.type = 'bandpass';
            f.frequency.value = 3000;
            f.Q.value = 0.3;
            var g = this.ctx.createGain();
            g.gain.value = 0.08;
            src.connect(f);
            f.connect(g);
            g.connect(this.bgsGain);
            src.start();
            this.bgsNodes.push(src);
        },

        setVolume: function (type, val) {
            if (type === 'bgm' && this.bgmGain) this.bgmGain.gain.value = val;
            if (type === 'se' && this.seGain) this.seGain.gain.value = val;
            if (type === 'bgs' && this.bgsGain) this.bgsGain.gain.value = val;
            if (type === 'master' && this.master) this.master.gain.value = val;
        },

        /* === Festival BGM: Gion Bayashi (flute + taiko) === */
        festivalInterval: null,
        festivalPlaying: false,
        startFestivalBGM: function () {
            if (!this.ctx || !this.unlocked) return;
            this.stopFestivalBGM();
            this.festivalPlaying = true;
            var self = this;
            /* Gion bayashi melody - pentatonic flute */
            var fluteScale = [587.3, 659.3, 784.0, 880.0, 1046.5]; /* D5 E5 G5 A5 C6 */
            var noteI = 0;
            var pattern = [0, 2, 4, 3, 1, 2, 3, 0, 4, 2, 1, 3, 0, 0, 2, 4];

            function playFestival() {
                if (!self.festivalPlaying || !self.ctx) return;
                var n = self.ctx.currentTime;
                /* Flute (high sine + slight vibrato) */
                var freq = fluteScale[pattern[noteI % pattern.length]];
                var osc = self.ctx.createOscillator();
                var g = self.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                /* Vibrato LFO */
                var vib = self.ctx.createOscillator();
                var vibG = self.ctx.createGain();
                vib.type = 'sine';
                vib.frequency.value = 5;
                vibG.gain.value = 4;
                vib.connect(vibG);
                vibG.connect(osc.frequency);
                osc.connect(g);
                g.connect(self.bgmGain);
                g.gain.setValueAtTime(0, n);
                g.gain.linearRampToValueAtTime(0.1, n + 0.05);
                g.gain.setValueAtTime(0.1, n + 0.2);
                g.gain.exponentialRampToValueAtTime(0.001, n + 0.5);
                osc.start(n); osc.stop(n + 0.55);
                vib.start(n); vib.stop(n + 0.55);

                /* Taiko drum every 2nd beat */
                if (noteI % 2 === 0) {
                    var drum = self.ctx.createOscillator();
                    var dg = self.ctx.createGain();
                    var df = self.ctx.createBiquadFilter();
                    drum.type = 'sine';
                    drum.frequency.setValueAtTime(120, n);
                    drum.frequency.exponentialRampToValueAtTime(40, n + 0.15);
                    df.type = 'lowpass';
                    df.frequency.value = 200;
                    drum.connect(df);
                    df.connect(dg);
                    dg.connect(self.bgmGain);
                    dg.gain.setValueAtTime(0.2, n);
                    dg.gain.exponentialRampToValueAtTime(0.001, n + 0.3);
                    drum.start(n); drum.stop(n + 0.35);
                }
                /* Kane (bell) every 4th beat */
                if (noteI % 4 === 0) {
                    var kane = self.ctx.createOscillator();
                    var kg = self.ctx.createGain();
                    kane.type = 'triangle';
                    kane.frequency.value = 1200;
                    kane.connect(kg);
                    kg.connect(self.bgmGain);
                    kg.gain.setValueAtTime(0.05, n);
                    kg.gain.exponentialRampToValueAtTime(0.001, n + 0.8);
                    kane.start(n); kane.stop(n + 0.85);
                }
                noteI++;
                self.festivalInterval = setTimeout(playFestival, 280);
            }
            playFestival();
        },
        stopFestivalBGM: function () {
            this.festivalPlaying = false;
            if (this.festivalInterval) { clearTimeout(this.festivalInterval); this.festivalInterval = null; }
        },

        /* === Wind Chime SE === */
        playWindChime: function () {
            if (!this.ctx || !this.unlocked) return;
            var self = this;
            var freqs = [2093, 2637, 3136, 3520]; /* C7 E7 G7 A7 - metallic ring */
            var n = this.ctx.currentTime;
            for (var i = 0; i < freqs.length; i++) {
                var o = this.ctx.createOscillator();
                var g = this.ctx.createGain();
                var f = this.ctx.createBiquadFilter();
                o.type = 'sine';
                o.frequency.value = freqs[i] * (1 + Math.random() * 0.01);
                f.type = 'highpass';
                f.frequency.value = 1500;
                o.connect(f);
                f.connect(g);
                g.connect(this.seGain);
                var t = n + i * 0.08;
                g.gain.setValueAtTime(0, t);
                g.gain.linearRampToValueAtTime(0.08 - i * 0.015, t + 0.01);
                g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
                o.start(t);
                o.stop(t + 1.6);
            }
        }
    };

})();
