/* Kyoto Explorer 3D - Self-contained (no addon dependencies, Three.js r128) */
(function () {
    'use strict';
    var SPOTS = [
        { name: '千本鳥居', desc: '伏見稲荷大社の朱色の鳥居が連なる参道', icon: '⛩️', pos: [0, 0, -20], type: 'torii' },
        { name: '五重塔', desc: '東寺に建つ日本最大の木造塔', icon: '🏯', pos: [25, 0, -40], type: 'temple' },
        { name: '金閣寺', desc: '鹿苑寺の金色の舎利殿', icon: '✨', pos: [-30, 0, -60], type: 'temple' },
        { name: '竹林の道', desc: '嵯峨野の幻想的な竹の小径', icon: '🎋', pos: [40, 0, -80], type: 'garden' },
        { name: '石庭', desc: '龍安寺の枯山水庭園', icon: '🪨', pos: [-20, 0, -100], type: 'garden' },
        { name: '清水の舞台', desc: '清水寺の懸造の舞台', icon: '🏛️', pos: [0, 0, -130], type: 'temple' },
        { name: '渡月橋', desc: '嵐山の桂川に架かる橋', icon: '🌉', pos: [60, 0, -50], type: 'bridge' },
        { name: '祇園花見小路', desc: '舞妓さんが行き交う花街', icon: '🏮', pos: [-50, 0, -30], type: 'gion' },
        { name: '哲学の道', desc: '疏水沿いの桜並木の散歩道', icon: '🍂', pos: [-60, 0, -160], type: 'garden' },
        { name: '二条城', desc: '徳川家康が築いた世界遺産', icon: '🏰', pos: [50, 0, -160], type: 'temple' },
        { name: '平安神宮', desc: '高さ24mの大鳥居', icon: '🎌', pos: [0, 0, -200], type: 'torii' },
        { name: '銀閣寺', desc: '東山文化を代表する寺院', icon: '🏠', pos: [-70, 0, -120], type: 'temple' },
        { name: '伏見酒蔵', desc: '日本酒の名産地の蔵元通り', icon: '🍶', pos: [70, 0, -120], type: 'gion' },
        { name: '南禅寺水路閣', desc: 'レンガ造りのアーチ水路', icon: '🧱', pos: [-40, 0, -180], type: 'temple' },
        { name: '嵐山竹灯り', desc: '幻想的なライトアップの道', icon: '🕯️', pos: [60, 0, -180], type: 'garden' }
    ];
    var TIMES = {
        dawn: { bg: 0x2a1a2e, fog: 0x2a1a2e, fd: .012, ai: 1.2, ac: 0x886688, si: 1.5, sc: 0xffaa66, sp: [80, 30, 100] },
        day: { bg: 0x87ceeb, fog: 0x87ceeb, fd: .008, ai: 2.0, ac: 0x8899aa, si: 2.5, sc: 0xffffff, sp: [100, 150, 100] },
        dusk: { bg: 0x0a0a1a, fog: 0x0a0a1a, fd: .013, ai: 1.5, ac: 0x443344, si: 1.8, sc: 0xff8844, sp: [120, 40, 80] },
        night: { bg: 0x050510, fog: 0x050510, fd: .018, ai: .6, ac: 0x111133, si: .3, sc: 0x334466, sp: [50, 80, 50] }
    };
    var MC = { torii: '#c41e3a', temple: '#8b6914', garden: '#2d7a4a', bridge: '#4a7acc', gion: '#cc6644' };
    function B(w, h, d, c, o) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial(Object.assign({ color: c }, o || {}))) }
    function Cy(rt, rb, h, s, c, o) { return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, s), new THREE.MeshStandardMaterial(Object.assign({ color: c }, o || {}))) }
    function Co(r, h, s, c, o) { return new THREE.Mesh(new THREE.ConeGeometry(r, h, s), new THREE.MeshStandardMaterial(Object.assign({ color: c }, o || {}))) }
    function Sp(r, ws, hs, c, o) { return new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), new THREE.MeshStandardMaterial(Object.assign({ color: c }, o || {}))) }

    function Game() {
        this.cv = document.getElementById('game-canvas');
        this.clock = new THREE.Clock();
        this.keys = { w: false, a: false, s: false, d: false };
        this.vel = new THREE.Vector3(); this.dir = new THREE.Vector3();
        this.sakura = null; this.stars = null; this.flies = null; this.rain = null; this.snow = null;
        this.water = null; this.flash = null; this.amb = null; this.sun = null;
        this.gosyuin = new Set(); this.sTimer = 0; this.adT = 0; this.adShown = false;
        this.fc = 0; this.ft = 0; this.steps = 0; this.lastPos = new THREE.Vector3();
        this.bobT = 0; this.bobOn = true; this.bloomOn = false;
        this.joyOn = false; this.joyV = { x: 0, y: 0 };
        this.lookOn = false; this.lastTch = { x: 0, y: 0 };
        this.weather = 'clear'; this.timeKey = 'dusk';
        this.locked = false; this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        this.soundOn = true; this.stepSoundT = 0;
        this.sprint = false; this.stamina = 100; this.autoCycle = false; this.cycleT = 0;
        this.photoFilter = 'none'; this.timeOrder = ['dawn', 'day', 'dusk', 'night'];
        this.autoPilot = false; this.aiTipT = 0; this.aiNavOn = false;
        this.photoCount = 0; this.bellNear = false; this.totalDist = 0;
        var pc = document.getElementById('s-particles');
        if (pc) for (var i = 0; i < 20; i++) { var p = document.createElement('i'); p.style.left = Math.random() * 100 + '%'; p.style.animationDelay = Math.random() * 6 + 's'; p.style.animationDuration = (4 + Math.random() * 4) + 's'; pc.appendChild(p); }
        if (window.KyotoAudio) window.KyotoAudio.init();
        var self = this;
        document.getElementById('btn-start').addEventListener('click', function () { self.onStart(); });
        document.addEventListener('touchstart', function () { if (window.KyotoAudio) window.KyotoAudio.unlock(); }, { passive: true });
    }
    Game.prototype.onStart = function () {
        if (window.KyotoAudio) window.KyotoAudio.unlock();
        var s = document.getElementById('start'); s.style.opacity = '0'; s.style.transition = 'opacity .8s';
        var self = this;
        setTimeout(function () { s.style.display = 'none'; document.getElementById('loading').classList.remove('hide'); self.init(); }, 800);
    };
    Game.prototype.prog = function (m, p) { var e = document.getElementById('ld-msg'), f = document.getElementById('ld-fill'); if (e) e.textContent = m; if (f) f.style.width = p + '%'; };

    Game.prototype.init = function () {
        var self = this;
        try {
            this.prog('レンダラー初期化...', 5);
            this.scene = new THREE.Scene();
            this.ren = new THREE.WebGLRenderer({ canvas: this.cv, antialias: true, preserveDrawingBuffer: true });
            this.ren.setSize(window.innerWidth, window.innerHeight);
            this.ren.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            this.ren.shadowMap.enabled = true; this.ren.shadowMap.type = THREE.PCFSoftShadowMap;
            this.ren.toneMapping = THREE.ACESFilmicToneMapping; this.ren.toneMappingExposure = 1.2;
            this.cam = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, .1, 500);
            this.cam.position.set(0, 1.7, 10);
            this.scene.add(this.cam);
            this.flash = new THREE.SpotLight(0xffffee, 0, 30, Math.PI / 6, .5, 2);
            this.cam.add(this.flash); var ft = new THREE.Object3D(); ft.position.set(0, 0, -1); this.cam.add(ft); this.flash.target = ft;
            /* Pointer lock (inline, no addon) */
            this.cv.addEventListener('click', function () {
                if (!self.locked) document.body.requestPointerLock();
            });
            document.addEventListener('pointerlockchange', function () { self.locked = !!document.pointerLockElement; });
            document.addEventListener('mousemove', function (e) {
                if (!self.locked) return;
                self.euler.setFromQuaternion(self.cam.quaternion);
                self.euler.y -= e.movementX * .002; self.euler.x -= e.movementY * .002;
                self.euler.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, self.euler.x));
                self.cam.quaternion.setFromEuler(self.euler);
            });
            this.prog('ライティング...', 10); this.setTime('dusk');
            this.prog('地面と通路...', 20); this.buildGround();
            this.prog('ランドマーク構築...', 40); this.buildLandmarks();
            this.prog('環境エフェクト...', 60); this.buildEnv();
            this.prog('天候システム...', 75); this.buildWeather();
            this.prog('UI初期化...', 85); this.bindUI(); this.bindKeys(); this.bindTouch(); this.fillGosyuin();
            this.lastPos.copy(this.cam.position);
            this.prog('サウンド...', 92);
            if (window.KyotoAudio) { window.KyotoAudio.startBGM(this.timeKey); window.KyotoAudio.startBGS(this.timeKey); }
            this.prog('NPC配置...', 96);
            if (window.KyotoGameplay) window.KyotoGameplay.spawnNPCs(this.scene, SPOTS);
            this.prog('完了！', 100);
            setTimeout(function () {
                var l = document.getElementById('loading'); l.style.opacity = '0'; l.style.transition = 'opacity .8s';
                setTimeout(function () { l.classList.add('hide'); setTimeout(function () { document.getElementById('ad-bar').classList.remove('hide'); }, 8000); }, 800);
            }, 400);
            window.addEventListener('resize', function () { self.cam.aspect = window.innerWidth / window.innerHeight; self.cam.updateProjectionMatrix(); self.ren.setSize(window.innerWidth, window.innerHeight); });
            this.animate();
        } catch (err) {
            console.error('Init error:', err);
            document.getElementById('loading').classList.add('hide');
            document.getElementById('err-scr').classList.remove('hide');
            document.getElementById('err-msg').textContent = 'エラー: ' + err.message;
        }
    };

    Game.prototype.setTime = function (k) {
        this.timeKey = k; var c = TIMES[k];
        this.scene.background = new THREE.Color(c.bg); this.scene.fog = new THREE.FogExp2(c.fog, c.fd);
        if (this.amb) this.scene.remove(this.amb); this.amb = new THREE.AmbientLight(c.ac, c.ai); this.scene.add(this.amb);
        if (this.sun) this.scene.remove(this.sun); this.sun = new THREE.DirectionalLight(c.sc, c.si);
        this.sun.position.set(c.sp[0], c.sp[1], c.sp[2]); this.sun.castShadow = true; this.sun.shadow.mapSize.set(1024, 1024);
        var sc = this.sun.shadow.camera; sc.near = .5; sc.far = 300; sc.left = -80; sc.right = 80; sc.top = 80; sc.bottom = -80;
        this.scene.add(this.sun);
        if (this.stars) this.stars.visible = (k === 'night' || k === 'dusk');
        var d = document.getElementById('time-pill'); if (d) d.textContent = { dawn: '朝焼け', day: '昼間', dusk: '黄昏', night: '夜' }[k];
        if (window.KyotoAudio) { window.KyotoAudio.startBGM(k); window.KyotoAudio.stopBGS(); window.KyotoAudio.startBGS(k); }
    };

    Game.prototype.buildGround = function () {
        var g = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ color: 0x2a2520, roughness: .95 }));
        g.rotation.x = -Math.PI / 2; g.receiveShadow = true; this.scene.add(g);
        for (var i = 0; i < 30; i++) { var gp = new THREE.Mesh(new THREE.CircleGeometry(12 + Math.random() * 25, 12), new THREE.MeshStandardMaterial({ color: 0x2a3a1a, roughness: 1 })); gp.rotation.x = -Math.PI / 2; gp.position.set((Math.random() - .5) * 400, .01, -Math.random() * 250); this.scene.add(gp); }
        this.mkPath(0, 0, 0, -230, 5);
        var br = [[0, -50, 60, -50, 3], [0, -30, -50, -30, 3], [0, -60, -30, -60, 3], [0, -80, 40, -80, 3], [0, -130, -60, -160, 3], [0, -130, 50, -160, 3], [0, -160, 0, -200, 3], [0, -120, -70, -120, 3], [0, -120, 70, -120, 3], [0, -180, -40, -180, 3], [0, -180, 60, -180, 3]];
        for (i = 0; i < br.length; i++)this.mkPath(br[i][0], br[i][1], br[i][2], br[i][3], br[i][4]);
        for (i = 0; i < 18; i++) { this.machiya(-12, 0, -i * 12 - 5, Math.PI / 2); this.machiya(12, 0, -i * 12 - 5, -Math.PI / 2); }
        for (i = -10; i < 230; i += 9) { this.lantern(-3.5, 0, -i); this.lantern(3.5, 0, -i); }
        for (i = 0; i < 150; i++) { var x = (Math.random() - .5) * 400, z = -Math.random() * 250; if (Math.abs(x) > 16) this.tree(x, 0, z); }
    };
    Game.prototype.mkPath = function (x1, z1, x2, z2, w) { var dx = x2 - x1, dz = z2 - z1, len = Math.sqrt(dx * dx + dz * dz), ang = Math.atan2(dx, dz); var m = new THREE.Mesh(new THREE.PlaneGeometry(w, len), new THREE.MeshStandardMaterial({ color: 0x555550, roughness: .9 })); m.rotation.x = -Math.PI / 2; m.rotation.z = -ang; m.position.set((x1 + x2) / 2, .02, (z1 + z2) / 2); m.receiveShadow = true; this.scene.add(m); };
    Game.prototype.machiya = function (x, y, z, ry) {
        var g = new THREE.Group(), h = 4 + Math.random() * 2, w = 9 + Math.random() * 2, d = 6 + Math.random() * 3;
        var wl = B(w, h, d, 0x3b2a1a, { roughness: .85 }); wl.position.y = h / 2; wl.castShadow = true; g.add(wl);
        g.add(B(w + 1.5, .4, d + 2, 0x1a1a1a)); g.children[1].position.y = h + .2;
        var wg = new THREE.Mesh(new THREE.PlaneGeometry(w * .3, h * .25), new THREE.MeshStandardMaterial({ color: 0xffcc66, emissive: 0xffaa44, emissiveIntensity: .4, transparent: true, opacity: .3, side: THREE.DoubleSide })); wg.position.set(w * .2, h * .4, d / 2 + .06); g.add(wg);
        g.position.set(x, y, z); g.rotation.y = ry; this.scene.add(g);
    };
    Game.prototype.lantern = function (x, y, z) {
        var g = new THREE.Group();
        g.add(Cy(.07, .07, 2.5, 6, 0x222222)); g.children[0].position.y = 1.25;
        g.add(Cy(.28, .22, .6, 8, 0xfff8e7, { emissive: 0xffaa44, emissiveIntensity: 2, transparent: true, opacity: .85 })); g.children[1].position.y = 2.7;
        g.add(Co(.32, .25, 8, 0x1a1a1a)); g.children[2].position.y = 3.1;
        var l = new THREE.PointLight(0xffaa44, 3, 12, 2); l.position.y = 2.7; g.add(l);
        g.position.set(x, y, z); this.scene.add(g);
    };
    Game.prototype.tree = function (x, y, z) {
        var g = new THREE.Group(), h = 3 + Math.random() * 4;
        g.add(Cy(.15, .22, h, 5, 0x3a2a15)); g.children[0].position.y = h / 2;
        var s = Math.random() > .55; var cr = Sp(1.5 + Math.random(), 7, 7, s ? 0xffaacc : 0x2a5a1a, { transparent: true, opacity: .85 }); cr.position.y = h; g.add(cr);
        g.position.set(x, y, z); this.scene.add(g);
    };

    Game.prototype.buildLandmarks = function () {
        this.mkTorii(0, 0, -10); this.mkPagoda(25, 0, -40); this.mkKinkaku(-30, 0, -60);
        this.mkBamboo(40, 0, -80); this.mkRockGarden(-20, 0, -100); this.mkKiyomizu(0, 0, -130);
        this.mkBridge(60, 0, -50); this.mkGion(-50, 0, -30); this.mkPhilo(-60, 0, -160);
        this.mkNijo(50, 0, -160); this.mkHeian(0, 0, -200); this.mkGinkaku(-70, 0, -120);
        this.mkSakagura(70, 0, -120); this.mkSuirokaku(-40, 0, -180); this.mkTakeakari(60, 0, -180);
    };
    Game.prototype.mkTorii = function (x, y, z) {
        var tm = new THREE.MeshStandardMaterial({ color: 0xc41e3a, roughness: .5 });
        for (var i = 0; i < 12; i++) {
            var g = new THREE.Group(), ph = 6 + Math.sin(i * .3) * .5;
            var p1 = Cy(.3, .35, ph, 8, 0); p1.material = tm; p1.position.set(-2.5, ph / 2, 0); p1.castShadow = true; g.add(p1);
            var p2 = Cy(.3, .35, ph, 8, 0); p2.material = tm; p2.position.set(2.5, ph / 2, 0); p2.castShadow = true; g.add(p2);
            var k = B(7, .5, .5, 0); k.material = tm; k.position.y = ph; g.add(k);
            g.position.set(x, y, z - i * 3); this.scene.add(g);
        }
    };
    Game.prototype.mkPagoda = function (x, y, z) {
        var g = new THREE.Group();
        for (var i = 0; i < 5; i++) { var s = i * .8, w = 8 - s, h = 3, yo = i * (h + 1.2); g.add(B(w, h, w, i < 2 ? 0x3b2a1a : 0x4a3828)); g.children[g.children.length - 1].position.y = yo + h / 2; g.children[g.children.length - 1].castShadow = true; g.add(B(w + 2, .3, w + 2, 0x111111)); g.children[g.children.length - 1].position.y = yo + h; }
        g.add(Cy(.15, .2, 5, 8, 0x888888, { metalness: .8 })); g.children[g.children.length - 1].position.y = 5 * 4.2 + 2.5; g.position.set(x, y, z); this.scene.add(g);
    };
    Game.prototype.mkKinkaku = function (x, y, z) {
        var g = new THREE.Group(), gm = { color: 0xd4a843, metalness: .7, roughness: .3 };
        var pond = new THREE.Mesh(new THREE.CircleGeometry(14, 32), new THREE.MeshStandardMaterial({ color: 0x1a3a4a, metalness: .6, roughness: .2, transparent: true, opacity: .8 })); pond.rotation.x = -Math.PI / 2; pond.position.y = .05; this.water = pond; g.add(pond);
        g.add(B(10, 3, 7, 0x4a3828)); g.children[1].position.y = 2; g.add(B(9, 3, 6, 0, gm)); g.children[2].position.y = 5; g.add(B(7, 2.5, 5, 0, gm)); g.children[3].position.y = 7.75;
        g.add(Co(.3, 1.5, 4, 0xffd700, { metalness: .9 })); g.children[4].position.y = 10.5; g.position.set(x, y, z); this.scene.add(g);
    };
    Game.prototype.mkBamboo = function (x, y, z) {
        for (var i = 0; i < 50; i++) {
            var bx = x + (Math.random() - .5) * 20, bz = z + (Math.random() - .5) * 20, h = 10 + Math.random() * 8;
            this.scene.add(Cy(.12, .14, h, 6, 0x4a7a3a)); this.scene.children[this.scene.children.length - 1].position.set(bx, h / 2, bz);
            var lv = Sp(1.2 + Math.random(), 6, 6, 0x3a6a2a, { transparent: true, opacity: .7 }); lv.position.set(bx, h - 1, bz); this.scene.add(lv);
        }
    };
    Game.prototype.mkRockGarden = function (x, y, z) {
        var g = new THREE.Group(); var sand = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ color: 0xd4c8a8, roughness: 1 })); sand.rotation.x = -Math.PI / 2; sand.position.y = .02; g.add(sand);
        var rr = [[2, 3], [-4, -2], [5, -3], [-1, 5], [-6, 1], [3, -5]]; for (var i = 0; i < rr.length; i++) { var r = new THREE.Mesh(new THREE.DodecahedronGeometry(.5 + Math.random() * .5, 1), new THREE.MeshStandardMaterial({ color: 0x555555, roughness: .9 })); r.position.set(rr[i][0], .4, rr[i][1]); r.castShadow = true; g.add(r); } g.position.set(x, y, z); this.scene.add(g);
    };
    Game.prototype.mkKiyomizu = function (x, y, z) {
        var g = new THREE.Group(), wm = { color: 0x5a3a1a, roughness: .8 }; g.add(B(16, .5, 12, 0, wm)); g.children[0].position.y = 8;
        for (var px = -6; px <= 6; px += 3)for (var pz = -4; pz <= 4; pz += 4) { var p = Cy(.25, .3, 8, 6, 0, wm); p.position.set(px, 4, pz); g.add(p); }
        g.add(B(14, 5, 10, 0, wm)); g.children[g.children.length - 1].position.y = 10.5; g.add(B(18, .6, 14, 0x1a1a1a)); g.children[g.children.length - 1].position.y = 13.5; g.position.set(x, y, z); this.scene.add(g);
    };
    Game.prototype.mkBridge = function (x, y, z) {
        var g = new THREE.Group(), wm = { color: 0x5a3a1a, roughness: .7 }; g.add(B(30, .5, 5, 0, wm)); g.children[0].position.y = 3;
        for (var i = -10; i <= 10; i += 5) { var p = Cy(.6, .8, 3, 8, 0x666660); p.position.set(i, 1.5, 0); g.add(p); }
        var rv = new THREE.Mesh(new THREE.PlaneGeometry(40, 14), new THREE.MeshStandardMaterial({ color: 0x1a4a6a, metalness: .5, roughness: .2, transparent: true, opacity: .7 })); rv.rotation.x = -Math.PI / 2; rv.position.y = .08; g.add(rv); g.position.set(x, y, z); this.scene.add(g);
    };
    Game.prototype.mkGion = function (x, y, z) {
        var g = new THREE.Group();
        for (var i = 0; i < 8; i++)for (var s = -1; s <= 1; s += 2) {
            var h = 4.5 + Math.random(), w = 4 + Math.random(), d = 5 + Math.random(); var hg = new THREE.Group(); hg.add(B(w, h, d, 0x2a2018)); hg.children[0].position.y = h / 2; hg.children[0].castShadow = true;
            var ch = Sp(.4, 8, 8, 0xff6644, { emissive: 0xff4422, emissiveIntensity: 1.5, transparent: true, opacity: .9 }); ch.position.set(w * .3 * s, 3.5, s > 0 ? -d / 2 - .5 : d / 2 + .5); hg.add(ch);
            var cl = new THREE.PointLight(0xff6644, 3, 8, 2); cl.position.copy(ch.position); hg.add(cl); hg.position.set(s * 6, 0, -i * 5); g.add(hg);
        }
        g.position.set(x, y, z); this.scene.add(g);
    };
    Game.prototype.mkPhilo = function (x, y, z) {
        var g = new THREE.Group();
        var canal = new THREE.Mesh(new THREE.PlaneGeometry(3, 50), new THREE.MeshStandardMaterial({ color: 0x2a5a7a, metalness: .4, transparent: true, opacity: .7 })); canal.rotation.x = -Math.PI / 2; canal.position.set(-3, .06, -25); g.add(canal);
        for (var i = 0; i < 12; i++) {
            var tg = new THREE.Group(), th = 4 + Math.random() * 3; tg.add(Cy(.15, .2, th, 5, 0x4a2a15)); tg.children[0].position.y = th / 2;
            var cr = Sp(2 + Math.random(), 6, 6, 0xffaacc, { transparent: true, opacity: .8 }); cr.position.y = th; tg.add(cr); tg.position.set(i % 2 === 0 ? 5 : -6, 0, -i * 3.5); g.add(tg);
        }
        g.position.set(x, y, z); this.scene.add(g);
    };
    Game.prototype.mkNijo = function (x, y, z) {
        var g = new THREE.Group();
        var moat = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), new THREE.MeshStandardMaterial({ color: 0x1a3a5a, metalness: .5, transparent: true, opacity: .6 })); moat.rotation.x = -Math.PI / 2; moat.position.y = .04; g.add(moat);
        var ws = 34; g.add(B(ws, 4, 2, 0x555555)); g.children[1].position.set(0, 2, -ws / 2); g.add(B(ws, 4, 2, 0x555555)); g.children[2].position.set(0, 2, ws / 2);
        g.add(B(20, 5, 14, 0xe8e0d0)); g.children[3].position.y = 6.5; g.position.set(x, y, z); this.scene.add(g);
    };
    Game.prototype.mkHeian = function (x, y, z) {
        var g = new THREE.Group(), vm = new THREE.MeshStandardMaterial({ color: 0xc41e3a, roughness: .5 });
        for (var s = -1; s <= 1; s += 2) { var p = Cy(.8, 1, 22, 10, 0); p.material = vm; p.position.set(s * 8, 11, 28); p.castShadow = true; g.add(p); }
        var k = B(22, 1.2, 1.2, 0); k.material = vm; k.position.set(0, 22, 28); g.add(k);
        g.add(B(20, 8, 12, 0xe8e0d0)); g.children[3].position.y = 5; g.position.set(x, y, z); this.scene.add(g);
    };
    Game.prototype.mkGinkaku = function (x, y, z) { var g = new THREE.Group(); g.add(B(8, 4, 6, 0x3b2a1a)); g.children[0].position.y = 2; g.add(B(6, 3, 5, 0x3b2a1a)); g.children[1].position.y = 5.5; g.add(Co(2.5, 3, 12, 0xe0d8c0)); g.children[2].position.set(8, 1.5, 0); g.position.set(x, y, z); this.scene.add(g); };
    Game.prototype.mkSakagura = function (x, y, z) { var g = new THREE.Group(); for (var i = 0; i < 5; i++) { g.add(B(8, 5, 10, 0x2a2018)); g.children[g.children.length - 1].position.set(0, 2.5, -i * 12); g.add(Sp(.8, 8, 8, 0x3a5a2a)); g.children[g.children.length - 1].position.set(0, 3, -i * 12 + 5.1); } g.position.set(x, y, z); this.scene.add(g); };
    Game.prototype.mkSuirokaku = function (x, y, z) { var g = new THREE.Group(), bm = { color: 0x8b4513, roughness: .7 }; for (var i = 0; i < 8; i++) { g.add(B(1.5, 8, 1.5, 0, bm)); g.children[g.children.length - 1].position.set(0, 4, -i * 4); if (i < 7) { g.add(B(1, 2, 4, 0, bm)); g.children[g.children.length - 1].position.set(0, 7, -i * 4 - 2); } } g.position.set(x, y, z); this.scene.add(g); };
    Game.prototype.mkTakeakari = function (x, y, z) {
        for (var i = 0; i < 20; i++) {
            var bx = x + (Math.random() - .5) * 16, bz = z + (Math.random() - .5) * 16, h = 1 + Math.random() * 2;
            this.scene.add(Cy(.12, .12, h, 6, 0x4a7a3a)); this.scene.children[this.scene.children.length - 1].position.set(bx, h / 2, bz);
            var gl = Sp(.2, 6, 6, 0xffdd88, { emissive: 0xffcc44, emissiveIntensity: 2, transparent: true, opacity: .8 }); gl.position.set(bx, h * .3, bz); this.scene.add(gl);
            var lt = new THREE.PointLight(0xffcc44, 2, 6, 2); lt.position.set(bx, h * .3, bz); this.scene.add(lt);
        }
    };

    /* === ENVIRONMENT === */
    Game.prototype.buildEnv = function () {
        var sg = new THREE.BufferGeometry(), sv = [], i;
        for (i = 0; i < 5000; i++)sv.push((Math.random() - .5) * 400, Math.random() * 28, (Math.random() - .5) * 400);
        sg.setAttribute('position', new THREE.Float32BufferAttribute(sv, 3));
        this.sakura = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffb7c5, size: .13, transparent: true, opacity: .8 })); this.scene.add(this.sakura);
        var stg = new THREE.BufferGeometry(), stv = [];
        for (i = 0; i < 3000; i++) { var th = Math.random() * Math.PI * 2, ph = Math.random() * Math.PI * .4, r = 200; stv.push(r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) + 20, r * Math.sin(ph) * Math.sin(th)); }
        stg.setAttribute('position', new THREE.Float32BufferAttribute(stv, 3));
        this.stars = new THREE.Points(stg, new THREE.PointsMaterial({ color: 0xffffff, size: .5, transparent: true, opacity: .7 })); this.scene.add(this.stars);
        var fg = new THREE.BufferGeometry(), fv = []; for (i = 0; i < 200; i++)fv.push((Math.random() - .5) * 300, .5 + Math.random() * 4, (Math.random() - .5) * 300);
        fg.setAttribute('position', new THREE.Float32BufferAttribute(fv, 3));
        this.flies = new THREE.Points(fg, new THREE.PointsMaterial({ color: 0xaaff44, size: .25, transparent: true, opacity: .6 })); this.scene.add(this.flies);
        var rp = [[80, 10], [55, -15], [35, -40], [25, -75], [5, -120], [-15, -150], [-35, -180], [-55, -210]];
        for (i = 0; i < rp.length - 1; i++) {
            var x1 = rp[i][0], z1 = rp[i][1], x2 = rp[i + 1][0], z2 = rp[i + 1][1], dx = x2 - x1, dz = z2 - z1, len = Math.sqrt(dx * dx + dz * dz), ang = Math.atan2(dx, dz);
            var seg = new THREE.Mesh(new THREE.PlaneGeometry(6, len), new THREE.MeshStandardMaterial({ color: 0x1a3a5a, metalness: .5, roughness: .2, transparent: true, opacity: .65 })); seg.rotation.x = -Math.PI / 2; seg.rotation.z = -ang; seg.position.set((x1 + x2) / 2, .06, (z1 + z2) / 2); this.scene.add(seg);
        }
    };

    Game.prototype.buildWeather = function () {
        var rg = new THREE.BufferGeometry(), rv = [], i;
        for (i = 0; i < 4000; i++)rv.push((Math.random() - .5) * 200, Math.random() * 35, (Math.random() - .5) * 200);
        rg.setAttribute('position', new THREE.Float32BufferAttribute(rv, 3));
        this.rain = new THREE.Points(rg, new THREE.PointsMaterial({ color: 0x8899bb, size: .06, transparent: true, opacity: .5 })); this.rain.visible = false; this.scene.add(this.rain);
        var sng = new THREE.BufferGeometry(), snv = []; for (i = 0; i < 2500; i++)snv.push((Math.random() - .5) * 200, Math.random() * 28, (Math.random() - .5) * 200);
        sng.setAttribute('position', new THREE.Float32BufferAttribute(snv, 3));
        this.snow = new THREE.Points(sng, new THREE.PointsMaterial({ color: 0xffffff, size: .15, transparent: true, opacity: .7 })); this.snow.visible = false; this.scene.add(this.snow);
    };

    Game.prototype.setWeather = function (w) {
        this.weather = w; if (this.rain) this.rain.visible = (w === 'rain'); if (this.snow) this.snow.visible = (w === 'snow');
        if (w === 'fog') this.scene.fog.density = .03; else { var c = TIMES[this.timeKey]; this.scene.fog.density = c.fd; }
        var wp = document.getElementById('weather-pill'); if (wp) wp.textContent = { clear: '☀️ 晴', rain: '🌧️ 雨', snow: '❄️ 雪', fog: '🌫️ 霧' }[w];
        if (window.KyotoAudio) { window.KyotoAudio.stopBGS(); window.KyotoAudio.startBGS(this.timeKey); if (w === 'rain') window.KyotoAudio.startRain(); }
    };

    /* === CONTROLS === */
    Game.prototype.bindKeys = function () {
        var self = this;
        document.addEventListener('keydown', function (e) {
            if (e.code === 'KeyW' || e.code === 'ArrowUp') self.keys.w = true;
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') self.keys.a = true;
            if (e.code === 'KeyS' || e.code === 'ArrowDown') self.keys.s = true;
            if (e.code === 'KeyD' || e.code === 'ArrowRight') self.keys.d = true;
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') self.sprint = true;
            if (e.code === 'KeyE') self.tryBell();
        });
        document.addEventListener('keyup', function (e) {
            if (e.code === 'KeyW' || e.code === 'ArrowUp') self.keys.w = false;
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') self.keys.a = false;
            if (e.code === 'KeyS' || e.code === 'ArrowDown') self.keys.s = false;
            if (e.code === 'KeyD' || e.code === 'ArrowRight') self.keys.d = false;
            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') self.sprint = false;
        });
    };

    Game.prototype.bindTouch = function () {
        var self = this, jb = document.getElementById('joy-base'), jk = document.getElementById('joy-knob'), lz = document.getElementById('look-zone'); if (!jb) return;
        jb.addEventListener('touchstart', function (e) { e.preventDefault(); self.joyOn = true; }, { passive: false });
        jb.addEventListener('touchmove', function (e) { e.preventDefault(); if (!self.joyOn) return; var r = jb.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, t = e.targetTouches[0]; var dx = t.clientX - cx, dy = t.clientY - cy; var mx = r.width / 2 - 21, d = Math.sqrt(dx * dx + dy * dy); if (d > mx) { dx *= mx / d; dy *= mx / d; } jk.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; self.joyV = { x: dx / mx, y: dy / mx }; }, { passive: false });
        var rst = function () { self.joyOn = false; jk.style.transform = 'translate(0,0)'; self.joyV = { x: 0, y: 0 }; }; jb.addEventListener('touchend', rst); jb.addEventListener('touchcancel', rst);
        lz.addEventListener('touchstart', function (e) { e.preventDefault(); self.lookOn = true; self.lastTch = { x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY }; }, { passive: false });
        lz.addEventListener('touchmove', function (e) { e.preventDefault(); if (!self.lookOn) return; var t = e.targetTouches[0], dx = t.clientX - self.lastTch.x, dy = t.clientY - self.lastTch.y; self.euler.y -= dx * .004; self.euler.x -= dy * .004; self.euler.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, self.euler.x)); self.cam.quaternion.setFromEuler(self.euler); self.lastTch = { x: t.clientX, y: t.clientY }; }, { passive: false });
        lz.addEventListener('touchend', function () { self.lookOn = false; });
    };

    /* === UI === */
    Game.prototype.bindUI = function () {
        var self = this;
        document.getElementById('ab-x').addEventListener('click', function () { document.getElementById('ad-bar').classList.add('hide'); });
        document.getElementById('ad-skip').addEventListener('click', function () { document.getElementById('m-ad').classList.add('hide'); });
        var modal = function (b, m) { document.getElementById(b).addEventListener('click', function () { document.exitPointerLock(); document.getElementById(m).classList.remove('hide'); if (m === 'm-map') self.drawMap(); }); };
        modal('btn-cfg', 'm-cfg'); modal('btn-map', 'm-map'); modal('btn-book', 'm-book'); modal('btn-trophy', 'm-trophy');
        document.getElementById('btn-trophy').addEventListener('click', function () { self.renderTrophy(); });
        document.getElementById('btn-cam').addEventListener('click', function () { self.snap(); });
        document.getElementById('p-save').addEventListener('click', function () { var c = document.getElementById('photo-cv'), a = document.createElement('a'); a.download = 'kyoto_' + Date.now() + '.png'; a.href = c.toDataURL(); a.click(); });
        document.getElementById('p-close').addEventListener('click', function () { document.getElementById('m-photo').classList.add('hide'); });
        var mx = document.querySelectorAll('.mx'); for (var i = 0; i < mx.length; i++) { mx[i].addEventListener('click', function (e) { e.target.closest('.mf').classList.add('hide'); }); }
        document.getElementById('opt-time').addEventListener('change', function (e) { self.setTime(e.target.value); });
        document.getElementById('opt-weather').addEventListener('change', function (e) { self.setWeather(e.target.value); });
        document.getElementById('opt-flash').addEventListener('change', function (e) { self.flash.intensity = e.target.checked ? 15 : 0; });
        document.getElementById('opt-sakura').addEventListener('change', function (e) { if (self.sakura) self.sakura.visible = e.target.checked; });
        document.getElementById('opt-bloom').addEventListener('change', function (e) { self.bloomOn = e.target.checked; });
        document.getElementById('opt-autocycle').addEventListener('change', function (e) { self.autoCycle = e.target.checked; });
        document.getElementById('opt-bob').addEventListener('change', function (e) { self.bobOn = e.target.checked; });
        document.getElementById('opt-bgm').addEventListener('input', function (e) { if (window.KyotoAudio) window.KyotoAudio.setVolume('bgm', e.target.value / 100); });
        document.getElementById('opt-se').addEventListener('input', function (e) { if (window.KyotoAudio) window.KyotoAudio.setVolume('se', e.target.value / 100); });
        document.getElementById('opt-bgs').addEventListener('input', function (e) { if (window.KyotoAudio) window.KyotoAudio.setVolume('bgs', e.target.value / 100); });
        document.getElementById('sound-pill').addEventListener('click', function () { self.soundOn = !self.soundOn; this.textContent = self.soundOn ? '🔊' : '🔇'; if (window.KyotoAudio) window.KyotoAudio.setVolume('master', self.soundOn ? .6 : 0); });
        /* Photo filters */
        var fbs = document.querySelectorAll('.filter-btn'); for (i = 0; i < fbs.length; i++) { fbs[i].addEventListener('click', function () { for (var j = 0; j < fbs.length; j++) fbs[j].classList.remove('active'); this.classList.add('active'); self.photoFilter = this.getAttribute('data-filter'); self.applyFilter(); }); }
        /* AI Chat */
        modal('btn-ai', 'm-ai');
        document.getElementById('ai-send').addEventListener('click', function () { self.aiSendMsg(); });
        document.getElementById('ai-input').addEventListener('keydown', function (e) { if (e.key === 'Enter') self.aiSendMsg(); });
        var sugs = document.querySelectorAll('.ai-sug'); for (i = 0; i < sugs.length; i++) { sugs[i].addEventListener('click', function () { document.getElementById('ai-input').value = this.getAttribute('data-q'); self.aiSendMsg(); }); }
        /* AI Nav + Pilot */
        document.getElementById('ai-pilot').addEventListener('click', function () {
            self.autoPilot = !self.autoPilot; this.classList.toggle('active');
            this.textContent = self.autoPilot ? '🤖 停止' : '🤖 オートパイロット';
            if (self.autoPilot) { self.aiNavOn = true; document.getElementById('ai-nav').classList.remove('hide'); self.toast('🤖', 'オートパイロット起動！次のスポットへ自動移動します'); }
            else { self.toast('🤖', 'オートパイロット停止'); }
        });
        document.getElementById('btn-ai').addEventListener('click', function () {
            self.aiNavOn = !self.aiNavOn;
            var nav = document.getElementById('ai-nav');
            nav.classList.toggle('hide', !self.aiNavOn);
        });
        var nbs = document.querySelectorAll('.nb'); for (i = 0; i < nbs.length; i++) { nbs[i].addEventListener('click', function () { if (window.KyotoAudio) window.KyotoAudio.playClick(); for (var j = 0; j < nbs.length; j++)nbs[j].classList.remove('active'); this.classList.add('active'); }); }
    };

    Game.prototype.snap = function () {
        this.ren.render(this.scene, this.cam); var sc = this.cv, pc = document.getElementById('photo-cv');
        pc.width = sc.width; pc.height = sc.height; var ctx = pc.getContext('2d'); ctx.drawImage(sc, 0, 0);
        ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.font = '14px "Noto Serif JP",serif'; ctx.fillText('京都 EXPLORER 3D', 16, pc.height - 14);
        this.photoFilter = 'none'; document.exitPointerLock();
        var fbs = document.querySelectorAll('.filter-btn'); for (var j = 0; j < fbs.length; j++) fbs[j].classList.remove('active');
        fbs[0].classList.add('active');
        document.getElementById('m-photo').classList.remove('hide');
        this.photoCount++;
        if (window.KyotoGameplay) { window.KyotoGameplay.stats.photos = this.photoCount; }
    };
    Game.prototype.applyFilter = function () {
        var pc = document.getElementById('photo-cv'), ctx = pc.getContext('2d');
        this.ren.render(this.scene, this.cam); ctx.drawImage(this.cv, 0, 0);
        if (this.photoFilter === 'none') { ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.font = '14px "Noto Serif JP",serif'; ctx.fillText('京都 EXPLORER 3D', 16, pc.height - 14); return; }
        var img = ctx.getImageData(0, 0, pc.width, pc.height), d = img.data;
        for (var i = 0; i < d.length; i += 4) {
            if (this.photoFilter === 'sepia') { var r = d[i], g = d[i + 1], b = d[i + 2]; d[i] = Math.min(255, r * .393 + g * .769 + b * .189); d[i + 1] = Math.min(255, r * .349 + g * .686 + b * .168); d[i + 2] = Math.min(255, r * .272 + g * .534 + b * .131); }
            else if (this.photoFilter === 'mono') { var v = d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11; d[i] = d[i + 1] = d[i + 2] = v; }
            else if (this.photoFilter === 'vintage') { var rv = d[i], gv = d[i + 1], bv = d[i + 2]; d[i] = Math.min(255, rv * .6 + gv * .3 + bv * .1 + 40); d[i + 1] = Math.min(255, rv * .2 + gv * .5 + bv * .1 + 20); d[i + 2] = Math.min(255, rv * .1 + gv * .2 + bv * .5); }
        }
        ctx.putImageData(img, 0, 0);
        ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.font = '14px "Noto Serif JP",serif'; ctx.fillText('京都 EXPLORER 3D', 16, pc.height - 14);
    };
    /* Toast notification */
    Game.prototype.toast = function (icon, msg) {
        var tc = document.getElementById('toast-container'), t = document.createElement('div');
        t.className = 'toast'; t.innerHTML = '<span class="toast-ico">' + icon + '</span><span class="toast-msg">' + msg + '</span>';
        tc.appendChild(t); setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 3200);
    };

    Game.prototype.fillGosyuin = function () {
        var g = document.getElementById('gs-grid'); g.innerHTML = '';
        for (var i = 0; i < SPOTS.length; i++) { var s = SPOTS[i], d = document.createElement('div'); d.className = 'gs-stamp' + (this.gosyuin.has(i) ? ' got' : ''); d.innerHTML = '<div class="si">' + (this.gosyuin.has(i) ? s.icon : '❓') + '</div><span>' + (this.gosyuin.has(i) ? s.name : '未踏') + '</span>'; g.appendChild(d); }
        var ct = document.getElementById('gs-count'); if (ct) ct.textContent = this.gosyuin.size;
    };

    /* === MAP (fixed scale + centered) === */
    Game.prototype.drawMap = function () {
        var cv = document.getElementById('map-cv'); if (!cv) return;
        var ctx = cv.getContext('2d'), w = cv.width, h = cv.height, cx = w / 2, cy = h / 2, sc = 1.5, oz = -100;
        ctx.fillStyle = '#1a1814'; ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = 'rgba(255,255,255,.04)'; for (var i = 0; i < w; i += 20) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke(); } for (i = 0; i < h; i += 20) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke(); }
        /* Draw paths */
        ctx.strokeStyle = 'rgba(200,180,140,.15)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy - oz * sc); ctx.lineTo(cx, cy - (-230 - oz) * sc); ctx.stroke();
        /* Draw river */
        ctx.strokeStyle = 'rgba(60,120,180,.3)'; ctx.lineWidth = 3; ctx.beginPath();
        var rp = [[80, 10], [55, -15], [35, -40], [25, -75], [5, -120], [-15, -150], [-35, -180], [-55, -210]];
        for (i = 0; i < rp.length; i++) { var rx = cx + rp[i][0] * sc, ry = cy - (rp[i][1] - oz) * sc; if (i === 0) ctx.moveTo(rx, ry); else ctx.lineTo(rx, ry); } ctx.stroke();
        /* Draw spots */
        for (i = 0; i < SPOTS.length; i++) {
            var s = SPOTS[i], mx = cx + s.pos[0] * sc, my = cy - (s.pos[2] - oz) * sc;
            mx = Math.max(14, Math.min(w - 14, mx)); my = Math.max(14, Math.min(h - 14, my));
            ctx.fillStyle = MC[s.type] || '#888'; ctx.beginPath(); ctx.arc(mx, my, 5, 0, Math.PI * 2); ctx.fill();
            if (this.gosyuin.has(i)) { ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2; ctx.stroke(); }
            ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(s.name, mx, my + 15);
        }
        /* Player pos */
        var px = cx + this.cam.position.x * sc, py = cy - (this.cam.position.z - oz) * sc;
        px = Math.max(5, Math.min(w - 5, px)); py = Math.max(5, Math.min(h - 5, py));
        ctx.fillStyle = '#4a9eff'; ctx.shadowColor = '#4a9eff'; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    };

    Game.prototype.drawMini = function () {
        var cv = document.getElementById('mm-cv'); if (!cv) return; var ctx = cv.getContext('2d'), sz = cv.width;
        ctx.fillStyle = 'rgba(0,0,0,.85)'; ctx.fillRect(0, 0, sz, sz); var cx = sz / 2, cy = sz / 2, sc = .55;
        for (var i = 0; i < SPOTS.length; i++) {
            var sp = SPOTS[i], dx = (sp.pos[0] - this.cam.position.x) * sc, dz = (sp.pos[2] - this.cam.position.z) * sc, mx = cx + dx, my = cy - dz;
            if (mx > 4 && mx < sz - 4 && my > 4 && my < sz - 4) { ctx.fillStyle = MC[sp.type] || '#888'; ctx.beginPath(); ctx.arc(mx, my, 3, 0, Math.PI * 2); ctx.fill(); }
        }
    };

    Game.prototype.drawCompass = function () {
        var cv = document.getElementById('compass-cv'); if (!cv) return; var ctx = cv.getContext('2d'), sz = cv.width, c = sz / 2; ctx.clearRect(0, 0, sz, sz);
        var ang = this.euler.y; ctx.save(); ctx.translate(c, c); ctx.rotate(-ang);
        ctx.fillStyle = '#c41e3a'; ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(-5, 6); ctx.lineTo(5, 6); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.beginPath(); ctx.moveTo(0, 16); ctx.lineTo(-5, -6); ctx.lineTo(5, -6); ctx.closePath(); ctx.fill(); ctx.restore();
        ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('N', c, 8);
    };

    Game.prototype.checkSpots = function () {
        var cp = this.cam.position, near = null, nd = Infinity;
        for (var i = 0; i < SPOTS.length; i++) { var s = SPOTS[i], dx = cp.x - s.pos[0], dz = cp.z - s.pos[2], d = Math.sqrt(dx * dx + dz * dz); if (d < nd) { nd = d; near = { s: s, i: i }; } }
        var el = document.getElementById('spot-popup');
        if (near && nd < 15) {
            document.getElementById('sp-name').textContent = near.s.name;
            document.getElementById('sp-desc').textContent = near.s.desc;
            document.getElementById('sp-ico').textContent = near.s.icon;
            document.getElementById('sp-tag').textContent = this.gosyuin.has(near.i) ? '済' : 'NEW';
            document.getElementById('sp-dist').textContent = Math.round(nd) + 'm';
            el.classList.remove('hide');
            if (nd < 5 && !this.gosyuin.has(near.i)) {
                this.gosyuin.add(near.i); this.fillGosyuin();
                if (window.KyotoAudio) window.KyotoAudio.playCollect();
                this.toast(near.s.icon, near.s.name + ' の御朱印を獲得！ (' + this.gosyuin.size + '/15)');
            }
        } else { el.classList.add('hide'); }
    };

    Game.prototype.showAd = function () {
        if (this.adShown) return; this.adShown = true; document.exitPointerLock(); document.getElementById('m-ad').classList.remove('hide');
        var t = 5, te = document.getElementById('ad-t'), sk = document.getElementById('ad-skip'); te.textContent = t;
        var iv = setInterval(function () { t--; te.textContent = t; if (t <= 0) { clearInterval(iv); sk.classList.remove('hide'); } }, 1000);
    };

    /* === MAIN LOOP === */
    Game.prototype.animate = function () {
        var self = this; requestAnimationFrame(function () { self.animate(); });
        var dt = this.clock.getDelta(), el = this.clock.getElapsedTime();
        this.fc++; this.ft += dt; if (this.ft >= 1) { var fp = document.getElementById('fps-pill'); if (fp) fp.textContent = this.fc + 'FPS'; this.fc = 0; this.ft = 0; }
        /* Sprint + Stamina */
        var sprinting = this.sprint && this.stamina > 0;
        var stBar = document.getElementById('stamina-bar'), stWrap = document.getElementById('stamina-wrap');
        if (sprinting && (this.keys.w || this.keys.a || this.keys.s || this.keys.d)) { this.stamina = Math.max(0, this.stamina - 30 * dt); } else { this.stamina = Math.min(100, this.stamina + 15 * dt); }
        if (stBar) stBar.style.width = this.stamina + '%';
        if (stWrap) { if (this.stamina < 99.5) stWrap.classList.remove('hide'); else stWrap.classList.add('hide'); }
        /* Weather speed modifier */
        var wSpd = this.weather === 'rain' ? .75 : this.weather === 'snow' ? .6 : this.weather === 'fog' ? .85 : 1;
        /* Movement via quaternion-based forward/right */
        var moving = this.keys.w || this.keys.a || this.keys.s || this.keys.d || this.joyOn;
        if (this.locked) {
            var fwd = new THREE.Vector3(0, 0, -1); fwd.applyQuaternion(this.cam.quaternion); fwd.y = 0; fwd.normalize();
            var right = new THREE.Vector3(1, 0, 0); right.applyQuaternion(this.cam.quaternion); right.y = 0; right.normalize();
            var spd = (sprinting ? 22 : 12) * wSpd * dt;
            if (this.keys.w) this.cam.position.addScaledVector(fwd, spd);
            if (this.keys.s) this.cam.position.addScaledVector(fwd, -spd);
            if (this.keys.d) this.cam.position.addScaledVector(right, spd);
            if (this.keys.a) this.cam.position.addScaledVector(right, -spd);
        }
        if (this.joyOn) {
            var jfwd = new THREE.Vector3(0, 0, -1); jfwd.applyQuaternion(this.cam.quaternion); jfwd.y = 0; jfwd.normalize();
            var jrt = new THREE.Vector3(1, 0, 0); jrt.applyQuaternion(this.cam.quaternion); jrt.y = 0; jrt.normalize();
            this.cam.position.addScaledVector(jfwd, -this.joyV.y * 5 * wSpd * dt); this.cam.position.addScaledVector(jrt, this.joyV.x * 5 * wSpd * dt);
        }
        var bobY = 1.7; var bobSpd = sprinting ? 12 : 8;
        if (this.bobOn && moving) { this.bobT += dt * bobSpd; bobY += Math.sin(this.bobT) * (sprinting ? .1 : .06); } this.cam.position.y = bobY;
        /* Step counter */
        var dx = this.cam.position.x - this.lastPos.x, dz = this.cam.position.z - this.lastPos.z, dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > .5) {
            this.steps += Math.floor(dist / .7); this.lastPos.copy(this.cam.position); var se = document.getElementById('steps-num'); if (se) se.textContent = this.steps;
            this.stepSoundT += dist; if (this.stepSoundT > 1.5 && window.KyotoAudio) { window.KyotoAudio.playFootstep(); this.stepSoundT = 0; }
            this.totalDist += dist;
        }
        /* Sakura */
        if (this.sakura && this.sakura.visible) { var p = this.sakura.geometry.attributes.position.array; for (var i = 0; i < p.length; i += 3) { p[i + 1] -= .04; p[i] += Math.sin(el * .8 + i) * .015; if (p[i + 1] < 0) p[i + 1] = 25 + Math.random() * 5; } this.sakura.geometry.attributes.position.needsUpdate = true; }
        /* Rain */
        if (this.rain && this.rain.visible) { var rp = this.rain.geometry.attributes.position.array; for (i = 0; i < rp.length; i += 3) { rp[i + 1] -= .6; if (rp[i + 1] < 0) rp[i + 1] = 30 + Math.random() * 5; } this.rain.geometry.attributes.position.needsUpdate = true; }
        /* Snow */
        if (this.snow && this.snow.visible) { var sp = this.snow.geometry.attributes.position.array; for (i = 0; i < sp.length; i += 3) { sp[i + 1] -= .025; sp[i] += Math.sin(el + i) * .01; if (sp[i + 1] < 0) sp[i + 1] = 25 + Math.random() * 5; } this.snow.geometry.attributes.position.needsUpdate = true; }
        /* Water */
        if (this.water) this.water.material.opacity = .75 + Math.sin(el * 2) * .05;
        /* Fireflies */
        if (this.flies) { var ff = this.flies.geometry.attributes.position.array; for (i = 0; i < ff.length; i += 3) { ff[i] += Math.sin(el * 1.5 + i * .3) * .02; ff[i + 1] += Math.sin(el * 2 + i * .5) * .008; ff[i + 2] += Math.cos(el * 1.2 + i * .4) * .02; if (ff[i + 1] < .3) ff[i + 1] = .5; if (ff[i + 1] > 5) ff[i + 1] = 4; } this.flies.geometry.attributes.position.needsUpdate = true; this.flies.material.opacity = .3 + Math.sin(el * 3) * .3; }
        /* Stars */
        if (this.stars && this.stars.visible) { this.stars.material.opacity = .5 + Math.sin(el * .5) * .2; this.stars.rotation.y += dt * .005; }
        /* NPCs */
        if (window.KyotoGameplay) window.KyotoGameplay.updateNPCs(el, dt);
        /* Stats sync */
        if (window.KyotoGameplay) {
            var gp = window.KyotoGameplay;
            gp.stats.gosyuin = this.gosyuin.size;
            gp.stats.steps = this.steps;
            gp.stats.playTime += dt;
            gp.stats.distance = this.totalDist;
            if (sprinting && moving) gp.stats.sprintDist += spd / dt * dt;
            if (this.timeKey === 'night' && moving) gp.stats.nightWalk = true;
            if (this.weather === 'rain' && moving) gp.stats.rainWalk = true;
            gp.bellCooldown -= dt;
        }
        /* Achievement check every 2s */
        if (window.KyotoGameplay && this.sTimer > .4) {
            var self2 = this;
            window.KyotoGameplay.checkAchievements(function (i, m) { self2.toast(i, m); });
        }
        /* Bell proximity hint */
        var bellSpots = [0, 5, 10, 14]; /* torii/temple spots */
        this.bellNear = false;
        for (var bi = 0; bi < bellSpots.length; bi++) {
            var bs = SPOTS[bellSpots[bi]], bdx = this.cam.position.x - bs.pos[0], bdz = this.cam.position.z - bs.pos[2];
            if (Math.sqrt(bdx * bdx + bdz * bdz) < 10) { this.bellNear = true; break; }
        }
        var bh = document.getElementById('bell-hint');
        if (bh) { if (this.bellNear && this.locked) bh.classList.remove('hide'); else bh.classList.add('hide'); }
        /* Auto day-night cycle */
        if (this.autoCycle) { this.cycleT += dt; if (this.cycleT > 60) { this.cycleT = 0; var ci = (this.timeOrder.indexOf(this.timeKey) + 1) % 4; this.setTime(this.timeOrder[ci]); var ts = document.getElementById('opt-time'); if (ts) ts.value = this.timeOrder[ci]; } }
        /* Periodic */
        this.sTimer += dt; if (this.sTimer > .5) { this.sTimer = 0; this.checkSpots(); this.drawMini(); this.drawCompass(); this.updateAiNav(); }
        /* AI Autopilot */
        if (this.autoPilot && window.KyotoAI) {
            var target = window.KyotoAI.getRouteAdvice(this.cam.position, SPOTS, this.gosyuin);
            if (target) {
                var tdx = target.spot.pos[0] - this.cam.position.x, tdz = target.spot.pos[2] - this.cam.position.z;
                var tlen = Math.sqrt(tdx * tdx + tdz * tdz);
                if (tlen > 3) {
                    tdx /= tlen; tdz /= tlen;
                    this.cam.position.x += tdx * 10 * dt; this.cam.position.z += tdz * 10 * dt;
                    var targetAngle = Math.atan2(-tdx, -tdz);
                    this.euler.y = this.euler.y + (targetAngle - this.euler.y) * 2 * dt;
                    this.cam.quaternion.setFromEuler(this.euler);
                }
            } else { this.autoPilot = false; var pb = document.getElementById('ai-pilot'); if (pb) { pb.classList.remove('active'); pb.textContent = '🤖 オートパイロット'; } this.toast('🎉', '全スポットの御朱印をコンプリート！'); }
        }
        /* AI Context Tips */
        this.aiTipT += dt; if (this.aiTipT > 45 && window.KyotoAI) { this.aiTipT = 0; var tip = window.KyotoAI.getContextTip(this.timeKey, this.weather); if (tip) this.toast('👘', tip); }
        this.adT += dt; if (this.adT > 90 && !this.adShown) this.showAd();
        this.ren.render(this.scene, this.cam);
    };
    /* AI Chat */
    Game.prototype.aiSendMsg = function () {
        var inp = document.getElementById('ai-input'), msg = inp.value.trim(); if (!msg) return; inp.value = '';
        if (window.KyotoGameplay) window.KyotoGameplay.stats.aiChats++;
        var msgs = document.getElementById('ai-msgs');
        /* User bubble */
        var um = document.createElement('div'); um.className = 'ai-msg ai-user';
        um.innerHTML = '<span class="ai-avatar">🙋</span><div class="ai-bubble">' + msg + '</div>';
        msgs.appendChild(um);
        /* Typing indicator */
        var ty = document.createElement('div'); ty.className = 'ai-msg ai-bot';
        ty.innerHTML = '<span class="ai-avatar">👘</span><div class="ai-bubble ai-typing"><span></span><span></span><span></span></div>';
        msgs.appendChild(ty); msgs.scrollTop = msgs.scrollHeight;
        var self = this;
        setTimeout(function () {
            msgs.removeChild(ty);
            var reply = window.KyotoAI ? window.KyotoAI.respond(msg) : 'AIシステムが読み込まれていません。';
            var bm = document.createElement('div'); bm.className = 'ai-msg ai-bot';
            bm.innerHTML = '<span class="ai-avatar">👘</span><div class="ai-bubble">' + reply + '</div>';
            msgs.appendChild(bm); msgs.scrollTop = msgs.scrollHeight;
        }, 600 + Math.random() * 400);
    };
    /* AI Nav Update */
    Game.prototype.updateAiNav = function () {
        if (!this.aiNavOn || !window.KyotoAI) return;
        var target = window.KyotoAI.getRouteAdvice(this.cam.position, SPOTS, this.gosyuin);
        var nameEl = document.getElementById('ai-nav-name'), distEl = document.getElementById('ai-nav-dist'), arrowEl = document.getElementById('ai-nav-arrow');
        if (target) {
            nameEl.textContent = target.spot.name;
            distEl.textContent = Math.round(target.dist) + 'm';
            var dx = target.spot.pos[0] - this.cam.position.x, dz = target.spot.pos[2] - this.cam.position.z;
            var angle = Math.atan2(dx, -dz); var camRot = this.euler.y;
            var relAngle = (angle - camRot) * (180 / Math.PI);
            arrowEl.style.transform = 'rotate(' + relAngle + 'deg)';
        } else {
            nameEl.textContent = '全収集済'; distEl.textContent = '✔'; arrowEl.style.transform = 'rotate(0)';
        }
    };
    /* Bell interaction */
    Game.prototype.tryBell = function () {
        if (!this.bellNear) return;
        var gp = window.KyotoGameplay; if (!gp || gp.bellCooldown > 0) return;
        gp.bellCooldown = 3;
        gp.stats.bellRung = true;
        /* Play bell sound */
        try {
            var ctx = new (window.AudioContext || window.webkitAudioContext)();
            gp.ringBell(ctx);
        } catch (e) { }
        this.toast('🔔', '鐘の音が京都の空に響き渡りました');
    };
    /* Render trophy/achievements panel */
    Game.prototype.renderTrophy = function () {
        if (!window.KyotoGameplay) return;
        var gp = window.KyotoGameplay, grid = document.getElementById('trophy-grid');
        grid.innerHTML = '';
        var achs = gp.getAchievements();
        for (var i = 0; i < achs.length; i++) {
            var a = achs[i], d = document.createElement('div');
            d.className = 'badge ' + (a.unlocked ? 'unlocked' : 'locked');
            d.innerHTML = '<span class="badge-ico">' + a.icon + '</span><span class="badge-name">' + a.name + '</span><span class="badge-desc">' + a.desc + '</span>';
            grid.appendChild(d);
        }
        /* Update stats */
        var s = gp.stats;
        document.getElementById('stat-time').textContent = gp.formatTime(s.playTime);
        document.getElementById('stat-steps').textContent = s.steps.toLocaleString();
        document.getElementById('stat-dist').textContent = Math.round(s.distance) + 'm';
        document.getElementById('stat-sprint').textContent = Math.round(s.sprintDist) + 'm';
        document.getElementById('stat-photos').textContent = s.photos;
        document.getElementById('stat-gosyuin').textContent = s.gosyuin + '/15';
        document.getElementById('stat-aichat').textContent = s.aiChats;
    };
    new Game();
})();
