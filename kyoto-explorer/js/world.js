import * as THREE from 'three';

// === SPOT DATA ===
export const SPOTS = [
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
    { name: '嵐山竹灯り', desc: '幻想的なライトアップの道', icon: '🕯️', pos: [60, 0, -180], type: 'garden' },
];

export const MAPC = { torii: '#c41e3a', temple: '#8b6914', garden: '#2d7a4a', bridge: '#4a7acc', gion: '#cc6644' };

// === 3D HELPERS ===
export function box(w, h, d, c, o) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: c, ...(o || {}) })) }
export function cyl(rt, rb, h, s, c, o) { return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, s), new THREE.MeshStandardMaterial({ color: c, ...(o || {}) })) }
export function cone(r, h, s, c, o) { return new THREE.Mesh(new THREE.ConeGeometry(r, h, s), new THREE.MeshStandardMaterial({ color: c, ...(o || {}) })) }
export function sph(r, ws, hs, c, o) { return new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), new THREE.MeshStandardMaterial({ color: c, ...(o || {}) })) }
export function at(m, x, y, z) { m.position.set(x, y, z); return m }

// === WORLD BUILDER ===
export class WorldBuilder {
    constructor(scene) { this.scene = scene; this.water = null; }

    buildAll() {
        this.ground();
        this.landmarks();
        return { water: this.water };
    }

    ground() {
        const g = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ color: 0x2a2520, roughness: .95 }));
        g.rotation.x = -Math.PI / 2; g.receiveShadow = true; this.scene.add(g);
        for (let i = 0; i < 35; i++) {
            const gp = new THREE.Mesh(new THREE.CircleGeometry(12 + Math.random() * 25, 16), new THREE.MeshStandardMaterial({ color: 0x2a3a1a, roughness: 1 }));
            gp.rotation.x = -Math.PI / 2; gp.position.set((Math.random() - .5) * 500, .01, -Math.random() * 300); this.scene.add(gp);
        }
        this.path(0, 0, 0, 0, -230, 5);
        [[0, -50, 60, -50, 3], [0, -30, -50, -30, 3], [0, -60, -30, -60, 3], [0, -80, 40, -80, 3],
        [0, -130, -60, -160, 3], [0, -130, 50, -160, 3], [0, -160, 0, -200, 3],
        [0, -120, -70, -120, 3], [0, -120, 70, -120, 3], [0, -180, -40, -180, 3], [0, -180, 60, -180, 3]].forEach(p => this.path(...p));
        for (let i = 0; i < 20; i++) { this.machiya(-12, 0, -i * 11 - 5, Math.PI / 2); this.machiya(12, 0, -i * 11 - 5, -Math.PI / 2); }
        for (let i = -10; i < 230; i += 8) { this.lantern(-3.5, 0, -i); this.lantern(3.5, 0, -i); }
        for (let i = 0; i < 200; i++) { const x = (Math.random() - .5) * 450, z = -Math.random() * 300; if (Math.abs(x) > 18) this.tree(x, 0, z); }
    }

    path(x1, z1, x2, z2, w) {
        const dx = x2 - x1, dz = z2 - z1, len = Math.sqrt(dx * dx + dz * dz), ang = Math.atan2(dx, dz);
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, len), new THREE.MeshStandardMaterial({ color: 0x555550, roughness: .9 }));
        m.rotation.x = -Math.PI / 2; m.rotation.z = -ang; m.position.set((x1 + x2) / 2, .02, (z1 + z2) / 2); m.receiveShadow = true; this.scene.add(m);
    }

    machiya(x, y, z, ry) {
        const g = new THREE.Group(), cs = [0x3b2a1a, 0x4a3828, 0x2e2018], h = 4 + Math.random() * 2, w = 9 + Math.random() * 3, d = 7 + Math.random() * 4;
        const wall = box(w, h, d, cs[Math.floor(Math.random() * 3)], { roughness: .85 }); wall.position.y = h / 2; wall.castShadow = true; wall.receiveShadow = true; g.add(wall);
        const nc = [0xc41e3a, 0x1e3a8a, 0x2d5a27, 0x8b6914];
        const n = new THREE.Mesh(new THREE.PlaneGeometry(w * .5, h * .3), new THREE.MeshStandardMaterial({ color: nc[Math.floor(Math.random() * 4)], side: THREE.DoubleSide }));
        n.position.set(0, h * .65, d / 2 + .05); g.add(n);
        const r = box(w + 1.5, .4, d + 2, 0x1a1a1a); r.position.y = h + .2; r.castShadow = true; g.add(r);
        // Window glow
        const wg = new THREE.Mesh(new THREE.PlaneGeometry(w * .3, h * .25), new THREE.MeshStandardMaterial({ color: 0xffcc66, emissive: 0xffaa44, emissiveIntensity: .4, transparent: true, opacity: .3, side: THREE.DoubleSide }));
        wg.position.set(w * .2, h * .4, d / 2 + .06); g.add(wg);
        g.position.set(x, y, z); g.rotation.y = ry; this.scene.add(g);
    }

    lantern(x, y, z) {
        const g = new THREE.Group();
        g.add(at(cyl(.07, .07, 2.5, 6, 0x222222), 0, 1.25, 0));
        g.add(at(cyl(.28, .22, .6, 8, 0xfff8e7, { emissive: 0xffaa44, emissiveIntensity: 2, transparent: true, opacity: .85 }), 0, 2.7, 0));
        g.add(at(cone(.32, .25, 8, 0x1a1a1a), 0, 3.1, 0));
        const l = new THREE.PointLight(0xffaa44, 5, 14, 2); l.position.y = 2.7; g.add(l);
        g.position.set(x, y, z); this.scene.add(g);
    }

    tree(x, y, z) {
        const g = new THREE.Group(), h = 3 + Math.random() * 5;
        g.add(at(cyl(.15, .22, h, 5, 0x3a2a15), 0, h / 2, 0));
        const isSak = Math.random() > .55;
        const cr = sph(1.8 + Math.random() * 1.5, 7, 7, isSak ? 0xffaacc : 0x2a5a1a, { transparent: true, opacity: .85 });
        cr.position.y = h; cr.castShadow = true; g.add(cr);
        g.position.set(x, y, z); this.scene.add(g);
    }

    landmarks() {
        this.torii(0, 0, -10); this.pagoda(25, 0, -40); this.kinkaku(-30, 0, -60);
        this.bamboo(40, 0, -80); this.rockGarden(-20, 0, -100); this.kiyomizu(0, 0, -130);
        this.bridge(60, 0, -50); this.gion(-50, 0, -30); this.philoPath(-60, 0, -160);
        this.nijo(50, 0, -160); this.heian(0, 0, -200); this.ginkaku(-70, 0, -120);
        this.sakagura(70, 0, -120); this.suirokaku(-40, 0, -180); this.takeakari(60, 0, -180);
    }

    torii(x, y, z) {
        const tm = new THREE.MeshStandardMaterial({ color: 0xc41e3a, roughness: .5 });
        for (let i = 0; i < 15; i++) {
            const g = new THREE.Group(), ph = 6 + Math.sin(i * .3) * .5, pw = 5;
            for (let s = -1; s <= 1; s += 2) { const p = cyl(.3, .35, ph, 8, 0); p.material = tm; p.position.set(s * pw / 2, ph / 2, 0); p.castShadow = true; g.add(p); }
            const k = box(pw + 2, .5, .5, 0); k.material = tm; k.position.y = ph; k.castShadow = true; g.add(k);
            const n2 = box(pw + .5, .3, .3, 0x1a1a1a); n2.position.y = ph * .75; g.add(n2);
            g.position.set(x, y, z - i * 3); this.scene.add(g);
        }
    }

    pagoda(x, y, z) {
        const g = new THREE.Group();
        for (let i = 0; i < 5; i++) {
            const s = i * .8, w = 8 - s, h = 3, yo = i * (h + 1.2);
            const w2 = box(w, h, w, i < 2 ? 0x3b2a1a : 0x4a3828, { roughness: .8 }); w2.position.y = yo + h / 2; w2.castShadow = true; g.add(w2);
            const e = box(w + 2, .3, w + 2, 0x111111); e.position.y = yo + h; e.castShadow = true; g.add(e);
        }
        g.add(at(cyl(.15, .2, 5, 8, 0x888888, { metalness: .8, roughness: .3 }), 0, 5 * 4.2 + 2.5, 0));
        g.position.set(x, y, z); this.scene.add(g);
    }

    kinkaku(x, y, z) {
        const g = new THREE.Group(), gm = { color: 0xd4a843, metalness: .7, roughness: .3 };
        g.add(at(cyl(12, 13, .5, 32, 0x2a3a2a, { roughness: 1 }), 0, .25, 0));
        const pond = new THREE.Mesh(new THREE.CircleGeometry(16, 32), new THREE.MeshStandardMaterial({ color: 0x1a3a4a, metalness: .6, roughness: .2, transparent: true, opacity: .8 }));
        pond.rotation.x = -Math.PI / 2; pond.position.set(x, .05, z); this.water = pond; this.scene.add(pond);
        const f1 = box(10, 3, 7, 0x4a3828); f1.position.y = 2; f1.castShadow = true; g.add(f1);
        const f2 = box(9, 3, 6, 0, gm); f2.position.y = 5; f2.castShadow = true; g.add(f2);
        const f3 = box(7, 2.5, 5, 0, gm); f3.position.y = 7.75; f3.castShadow = true; g.add(f3);
        [3.5, 6.5, 9].forEach((ry, i) => { const r = box(12 - i * 1.5, .4, (12 - i * 1.5) * .7, 0x111111); r.position.y = ry; r.castShadow = true; g.add(r); });
        g.add(at(cone(.3, 1.5, 4, 0xffd700, { metalness: .9, roughness: .1 }), 0, 10.5, 0));
        g.position.set(x, y, z); this.scene.add(g);
    }

    bamboo(x, y, z) {
        for (let i = 0; i < 65; i++) {
            const bx = x + (Math.random() - .5) * 22, bz = z + (Math.random() - .5) * 22, h = 12 + Math.random() * 10, r = .12 + Math.random() * .08;
            const b = cyl(r, r * 1.1, h, 6, 0x4a7a3a, { roughness: .6 }); b.position.set(bx, h / 2, bz); b.castShadow = true; this.scene.add(b);
            const lv = sph(1.5 + Math.random(), 7, 7, 0x3a6a2a, { transparent: true, opacity: .7 }); lv.position.set(bx, h - 1, bz); this.scene.add(lv);
            // Bamboo joint rings
            for (let j = 2; j < h; j += 2) { const ring = cyl(r + .04, r + .04, .08, 8, 0x3a5a2a); ring.position.set(bx, j, bz); this.scene.add(ring); }
        }
    }

    rockGarden(x, y, z) {
        const g = new THREE.Group();
        const sand = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ color: 0xd4c8a8, roughness: 1 }));
        sand.rotation.x = -Math.PI / 2; sand.position.y = .02; sand.receiveShadow = true; g.add(sand);
        [[-10, 0, .3, .5, 20], [10, 0, .3, .5, 20], [0, -10, 20, .5, .3], [0, 10, 20, .5, .3]].forEach(([bx, bz, bw, bh, bd]) => {
            const b = box(bw, bh, bd, 0x3b2a1a); b.position.set(bx, bh / 2, bz); g.add(b);
        });
        [[2, 3], [-4, -2], [5, -3], [-1, 5], [-6, 1], [3, -5], [7, 2]].forEach(([rx, rz]) => {
            const r = new THREE.Mesh(new THREE.DodecahedronGeometry(.5 + Math.random() * .6, 1), new THREE.MeshStandardMaterial({ color: 0x555555, roughness: .9 }));
            r.position.set(rx, .4, rz); r.rotation.set(Math.random(), Math.random(), Math.random()); r.castShadow = true; g.add(r);
        });
        // Sand wave lines
        for (let i = -9; i <= 9; i += 1.5) {
            const line = new THREE.Mesh(new THREE.PlaneGeometry(18, .03), new THREE.MeshStandardMaterial({ color: 0xc0b898 }));
            line.rotation.x = -Math.PI / 2; line.position.set(0, .025, i); g.add(line);
        }
        g.position.set(x, y, z); this.scene.add(g);
    }

    kiyomizu(x, y, z) {
        const g = new THREE.Group(), wm = { color: 0x5a3a1a, roughness: .8 };
        const plat = box(16, .5, 12, 0, wm); plat.position.y = 8; plat.castShadow = true; g.add(plat);
        for (let px = -6; px <= 6; px += 3)for (let pz = -4; pz <= 4; pz += 4) { const p = cyl(.25, .3, 8, 6, 0, wm); p.position.set(px, 4, pz); p.castShadow = true; g.add(p); }
        const h = box(14, 5, 10, 0, wm); h.position.y = 10.5; h.castShadow = true; g.add(h);
        const r = box(18, .6, 14, 0x1a1a1a); r.position.y = 13.5; r.castShadow = true; g.add(r);
        // Railing
        for (let i = -7; i <= 7; i += 1.5) { const p = cyl(.06, .06, 1.2, 4, 0, wm); p.position.set(i, 8.85, -6); g.add(p); }
        const rail = box(15, .08, .08, 0, wm); rail.position.set(0, 9.5, -6); g.add(rail);
        g.position.set(x, y, z); this.scene.add(g);
    }

    bridge(x, y, z) {
        const g = new THREE.Group(), wm = { color: 0x5a3a1a, roughness: .7 };
        const deck = box(30, .5, 5, 0, wm); deck.position.y = 3; deck.castShadow = true; g.add(deck);
        for (let s = -1; s <= 1; s += 2) {
            for (let i = -14; i <= 14; i += 2) { const p = cyl(.1, .1, 1.5, 6, 0, wm); p.position.set(i, 4, s * 2.3); g.add(p); }
            const rl = box(30, .12, .12, 0, wm); rl.position.set(0, 4.8, s * 2.3); g.add(rl);
        }
        for (let i = -10; i <= 10; i += 5) { const p = cyl(.6, .8, 3, 8, 0x666660, { roughness: .9 }); p.position.set(i, 1.5, 0); p.castShadow = true; g.add(p); }
        const rv = new THREE.Mesh(new THREE.PlaneGeometry(40, 14), new THREE.MeshStandardMaterial({ color: 0x1a4a6a, metalness: .5, roughness: .2, transparent: true, opacity: .75 }));
        rv.rotation.x = -Math.PI / 2; rv.position.y = .08; g.add(rv);
        g.position.set(x, y, z); this.scene.add(g);
    }

    gion(x, y, z) {
        const g = new THREE.Group();
        const st = new THREE.Mesh(new THREE.PlaneGeometry(6, 42), new THREE.MeshStandardMaterial({ color: 0x555550, roughness: .85 }));
        st.rotation.x = -Math.PI / 2; st.position.y = .02; g.add(st);
        for (let i = 0; i < 8; i++)for (let s = -1; s <= 1; s += 2) {
            const h = 4.5 + Math.random(), w = 4 + Math.random() * 2, d = 5 + Math.random() * 2, hg = new THREE.Group();
            const wl = box(w, h, d, 0x2a2018, { roughness: .9 }); wl.position.y = h / 2; wl.castShadow = true; hg.add(wl);
            const ch = sph(.4, 8, 8, 0xff6644, { emissive: 0xff4422, emissiveIntensity: 1.5, transparent: true, opacity: .9 });
            ch.position.set(w * .3 * s, 3.5, s > 0 ? -d / 2 - .5 : d / 2 + .5); hg.add(ch);
            const cl = new THREE.PointLight(0xff6644, 4, 10, 2); cl.position.copy(ch.position); hg.add(cl);
            const rf = box(w + 1, .3, d + 1, 0x111111); rf.position.y = h + .15; rf.castShadow = true; hg.add(rf);
            // Window
            const wg = new THREE.Mesh(new THREE.PlaneGeometry(w * .3, h * .2), new THREE.MeshStandardMaterial({ color: 0xffcc66, emissive: 0xffaa44, emissiveIntensity: .6, transparent: true, opacity: .4, side: THREE.DoubleSide }));
            wg.position.set(0, h * .4, s > 0 ? -d / 2 - .06 : d / 2 + .06); hg.add(wg);
            hg.position.set(s * 6, 0, -i * 5); g.add(hg);
        }
        g.position.set(x, y, z); this.scene.add(g);
    }

    philoPath(x, y, z) {
        const g = new THREE.Group();
        const canal = new THREE.Mesh(new THREE.PlaneGeometry(3, 55), new THREE.MeshStandardMaterial({ color: 0x2a5a7a, metalness: .4, roughness: .3, transparent: true, opacity: .7 }));
        canal.rotation.x = -Math.PI / 2; canal.position.set(-3, .06, -27); g.add(canal);
        const pw = new THREE.Mesh(new THREE.PlaneGeometry(3, 55), new THREE.MeshStandardMaterial({ color: 0x6a6050, roughness: .95 }));
        pw.rotation.x = -Math.PI / 2; pw.position.set(2, .02, -27); g.add(pw);
        for (let i = 0; i < 18; i++) {
            const tg = new THREE.Group(), th = 4 + Math.random() * 3;
            tg.add(at(cyl(.15, .2, th, 5, 0x4a2a15), 0, th / 2, 0));
            const pk = [0xffaacc, 0xffbbdd, 0xff99bb, 0xffccdd];
            const cr = sph(2 + Math.random() * 1.5, 7, 7, pk[Math.floor(Math.random() * 4)], { transparent: true, opacity: .8 });
            cr.position.y = th + .5; cr.castShadow = true; tg.add(cr);
            tg.position.set((i % 2 === 0 ? 5 : -6) + (Math.random() - .5) * 2, 0, -i * 3); g.add(tg);
        }
        g.position.set(x, y, z); this.scene.add(g);
    }

    nijo(x, y, z) {
        const g = new THREE.Group(), wm = { color: 0xe8e0d0, roughness: .7 }, sm = { color: 0x555555, roughness: .9 };
        const moat = new THREE.Mesh(new THREE.PlaneGeometry(52, 52), new THREE.MeshStandardMaterial({ color: 0x1a3a5a, metalness: .5, roughness: .2, transparent: true, opacity: .6 }));
        moat.rotation.x = -Math.PI / 2; moat.position.y = .04; g.add(moat);
        const ws = 36, wh = 4;
        [[0, wh / 2, -ws / 2, ws, wh, 2], [0, wh / 2, ws / 2, ws, wh, 2], [-ws / 2, wh / 2, 0, 2, wh, ws], [ws / 2, wh / 2, 0, 2, wh, ws]].forEach(([wx, wy, wz, ww, whh, wd]) => {
            const w = box(ww, whh, wd, 0, sm); w.position.set(wx, wy, wz); w.castShadow = true; g.add(w);
        });
        const pal = box(20, 5, 14, 0, wm); pal.position.y = wh + 2.5; pal.castShadow = true; g.add(pal);
        for (let i = 0; i < 3; i++) {
            const rw = 22 - i * 3, rd = 16 - i * 2;
            const rf = box(rw, .4, rd, 0x1a1a1a); rf.position.y = wh + 5 + i * 2.5; rf.castShadow = true; g.add(rf);
            if (i < 2) { const st = box(rw - 3, 2, rd - 3, 0, wm); st.position.y = wh + 6.2 + i * 2.5; st.castShadow = true; g.add(st); }
        }
        [[-ws / 2, -ws / 2], [ws / 2, -ws / 2], [-ws / 2, ws / 2], [ws / 2, ws / 2]].forEach(([tx, tz]) => {
            const t = box(4, 6, 4, 0, wm); t.position.set(tx, wh + 3, tz); t.castShadow = true; g.add(t);
            g.add(at(box(5, .3, 5, 0x1a1a1a), tx, wh + 6.5, tz));
        });
        g.position.set(x, y, z); this.scene.add(g);
    }

    heian(x, y, z) {
        const g = new THREE.Group(), vm = { color: 0xc41e3a, roughness: .5 }, wm2 = { color: 0xe8e0d0, roughness: .6 }, rm = { color: 0x2a6a3a, roughness: .6 };
        for (let s = -1; s <= 1; s += 2) { const p = cyl(.8, 1, 24, 12, 0); p.material = new THREE.MeshStandardMaterial(vm); p.position.set(s * 8, 12, 30); p.castShadow = true; g.add(p); }
        const k = box(22, 1.2, 1.2, 0); k.material = new THREE.MeshStandardMaterial(vm); k.position.set(0, 24, 30); k.castShadow = true; g.add(k);
        g.add(at(box(26, 1, 18, 0xd4c8a8, { roughness: .9 }), 0, .5, 0));
        const hall = box(22, 8, 14, 0, wm2); hall.position.y = 5; hall.castShadow = true; g.add(hall);
        for (let i = -10; i <= 10; i += 2.5) { const fp = cyl(.25, .25, 8, 8, 0); fp.material = new THREE.MeshStandardMaterial(vm); fp.position.set(i, 5, 7.1); g.add(fp); }
        g.add(at(box(26, .6, 18, 0, rm), 0, 9.3, 0));
        for (let s = -1; s <= 1; s += 2) {
            const co = box(3, 4, 30, 0); co.material = new THREE.MeshStandardMaterial(vm); co.position.set(s * 15, 2, -8); co.castShadow = true; g.add(co);
            g.add(at(box(4, .3, 32, 0, rm), s * 15, 4.2, -8));
        }
        const pond = new THREE.Mesh(new THREE.CircleGeometry(10, 32), new THREE.MeshStandardMaterial({ color: 0x1a5a4a, metalness: .5, roughness: .2, transparent: true, opacity: .7 }));
        pond.rotation.x = -Math.PI / 2; pond.position.set(0, .05, -25); g.add(pond);
        g.position.set(x, y, z); this.scene.add(g);
    }

    ginkaku(x, y, z) {
        const g = new THREE.Group(), wm = { color: 0x3b2a1a, roughness: .8 };
        g.add(at(box(8, 4, 6, 0, wm), 0, 2, 0)); g.add(at(box(6, 3, 5, 0, wm), 0, 5.5, 0));
        g.add(at(box(10, .3, 8, 0x1a1a1a), 0, 4, 0)); g.add(at(box(8, .3, 7, 0x1a1a1a), 0, 7, 0));
        const sand = new THREE.Mesh(new THREE.CircleGeometry(7, 32), new THREE.MeshStandardMaterial({ color: 0xe0d8c0, roughness: 1 }));
        sand.rotation.x = -Math.PI / 2; sand.position.set(9, .02, 0); g.add(sand);
        g.add(at(cone(2.5, 3.5, 16, 0xe0d8c0, { roughness: 1 }), 9, 1.75, 0));
        g.position.set(x, y, z); this.scene.add(g);
    }

    sakagura(x, y, z) {
        const g = new THREE.Group();
        for (let i = 0; i < 6; i++) {
            const wh = 5 + Math.random(), ww = 8 + Math.random() * 3;
            g.add(at(box(ww, wh, 10, 0x2a2018, { roughness: .9 }), 0, wh / 2, -i * 12));
            g.add(at(box(ww + 1, .4, 12, 0x1a1a1a), 0, wh + .2, -i * 12));
            g.add(at(sph(.8, 8, 8, 0x3a5a2a), 0, 3, -i * 12 + 5.1));
        }
        g.position.set(x, y, z); this.scene.add(g);
    }

    suirokaku(x, y, z) {
        const g = new THREE.Group(), bm = { color: 0x8b4513, roughness: .7 };
        for (let i = 0; i < 8; i++) {
            g.add(at(box(1.5, 8, 1.5, 0, bm), 0, 4, -i * 4));
            if (i < 7) {
                // Arch shape using a scaled sphere cutout look
                const arch = box(1, 2, 4, 0, bm); arch.position.set(0, 7, -i * 4 - 2); g.add(arch);
                const archBot = cyl(.5, 1, 3, 8, 0, bm); archBot.position.set(0, 5, -i * 4 - 2); g.add(archBot);
            }
        }
        const ch = new THREE.Mesh(new THREE.PlaneGeometry(2, 34), new THREE.MeshStandardMaterial({ color: 0x2a5a7a, metalness: .4, roughness: .3, transparent: true, opacity: .7 }));
        ch.rotation.x = -Math.PI / 2; ch.position.set(0, 8.1, -14); g.add(ch);
        g.position.set(x, y, z); this.scene.add(g);
    }

    takeakari(x, y, z) {
        for (let i = 0; i < 25; i++) {
            const bx = x + (Math.random() - .5) * 18, bz = z + (Math.random() - .5) * 18, h = 1 + Math.random() * 2;
            const b = cyl(.15, .15, h, 6, 0x4a7a3a, { roughness: .6 }); b.position.set(bx, h / 2, bz); this.scene.add(b);
            const gl = sph(.2, 6, 6, 0xffdd88, { emissive: 0xffcc44, emissiveIntensity: 2, transparent: true, opacity: .8 });
            gl.position.set(bx, h * .3, bz); this.scene.add(gl);
            const lt = new THREE.PointLight(0xffcc44, 2, 7, 2); lt.position.set(bx, h * .3, bz); this.scene.add(lt);
        }
    }
}
