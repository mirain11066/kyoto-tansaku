/* Kyoto Explorer - Gamification System (Achievements, NPCs, Stats) */
(function () {
    'use strict';

    /* ========== ACHIEVEMENTS ========== */
    var ACHIEVEMENTS = [
        { id: 'first_stamp', name: '初めの一歩', desc: '最初の御朱印を獲得', icon: '🎌', condition: function (s) { return s.gosyuin >= 1; } },
        { id: 'five_stamps', name: '参拝の旅人', desc: '5箇所の御朱印を収集', icon: '⛩️', condition: function (s) { return s.gosyuin >= 5; } },
        { id: 'ten_stamps', name: '洛中洛外', desc: '10箇所の御朱印を収集', icon: '📿', condition: function (s) { return s.gosyuin >= 10; } },
        { id: 'all_stamps', name: '京都マスター', desc: '全15箇所の御朱印をコンプリート', icon: '👑', condition: function (s) { return s.gosyuin >= 15; } },
        { id: 'walk_1000', name: '千歩の巡礼', desc: '1000歩歩く', icon: '👣', condition: function (s) { return s.steps >= 1000; } },
        { id: 'walk_5000', name: '五千歩の修行', desc: '5000歩歩く', icon: '🏃', condition: function (s) { return s.steps >= 5000; } },
        { id: 'photo_5', name: '写真家見習い', desc: 'スクリーンショットを5枚撮影', icon: '📸', condition: function (s) { return s.photos >= 5; } },
        { id: 'night_walk', name: '夜の散策者', desc: '夜の京都を探索', icon: '🌙', condition: function (s) { return s.nightWalk; } },
        { id: 'rain_walk', name: '雨に唄えば', desc: '雨の中を散策', icon: '☔', condition: function (s) { return s.rainWalk; } },
        { id: 'speed_demon', name: '疾風迅雷', desc: 'ダッシュで500m走破', icon: '⚡', condition: function (s) { return s.sprintDist >= 500; } },
        { id: 'ai_chat', name: 'AI友達', desc: 'AIガイドと5回会話', icon: '🤖', condition: function (s) { return s.aiChats >= 5; } },
        { id: 'bell_ringer', name: '鐘の音', desc: '神社の鐘を鳴らす', icon: '🔔', condition: function (s) { return s.bellRung; } }
    ];

    /* ========== NPC DEFINITIONS ========== */
    var NPC_TYPES = [
        { name: '参拝者', color: 0x4466aa, height: 1.5, speed: 1.2 },
        { name: '僧侶', color: 0x8b4513, height: 1.6, speed: 0.8 },
        { name: '観光客', color: 0xcc6644, height: 1.4, speed: 1.5 },
        { name: '舞妓', color: 0xc41e3a, height: 1.3, speed: 0.6 },
        { name: '商人', color: 0x228b22, height: 1.5, speed: 1.0 }
    ];

    window.KyotoGameplay = {
        earned: {},
        stats: {
            gosyuin: 0, steps: 0, photos: 0, playTime: 0,
            distance: 0, sprintDist: 0, aiChats: 0,
            nightWalk: false, rainWalk: false, bellRung: false
        },
        npcs: [],
        bellCooldown: 0,

        /* Check all achievements */
        checkAchievements: function (toastFn) {
            for (var i = 0; i < ACHIEVEMENTS.length; i++) {
                var a = ACHIEVEMENTS[i];
                if (!this.earned[a.id] && a.condition(this.stats)) {
                    this.earned[a.id] = true;
                    if (toastFn) toastFn(a.icon, '実績解除: ' + a.name + '！');
                }
            }
        },

        /* Get achievement list for UI */
        getAchievements: function () {
            var list = [];
            for (var i = 0; i < ACHIEVEMENTS.length; i++) {
                var a = ACHIEVEMENTS[i];
                list.push({
                    id: a.id, name: a.name, desc: a.desc, icon: a.icon,
                    unlocked: !!this.earned[a.id]
                });
            }
            return list;
        },

        /* Format play time */
        formatTime: function (s) {
            var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
            return (h > 0 ? h + ':' : '') + (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
        },

        /* Create NPCs in scene */
        spawnNPCs: function (scene, spots) {
            this.npcs = [];
            for (var i = 0; i < 20; i++) {
                var type = NPC_TYPES[Math.floor(Math.random() * NPC_TYPES.length)];
                var spotIdx = Math.floor(Math.random() * spots.length);
                var sp = spots[spotIdx];
                var group = new THREE.Group();

                /* Body */
                var body = new THREE.Mesh(
                    new THREE.BoxGeometry(.4, .7, .25),
                    new THREE.MeshStandardMaterial({ color: type.color })
                );
                body.position.y = .85;
                group.add(body);

                /* Head */
                var head = new THREE.Mesh(
                    new THREE.SphereGeometry(.15, 8, 8),
                    new THREE.MeshStandardMaterial({ color: 0xffd4b2 })
                );
                head.position.y = 1.35;
                group.add(head);

                /* Hat/hair depending on type */
                if (type.name === '僧侶') {
                    var hat = new THREE.Mesh(
                        new THREE.SphereGeometry(.12, 8, 4),
                        new THREE.MeshStandardMaterial({ color: 0x333333 })
                    );
                    hat.position.y = 1.5; group.add(hat);
                } else if (type.name === '舞妓') {
                    var hair = new THREE.Mesh(
                        new THREE.SphereGeometry(.18, 8, 8),
                        new THREE.MeshStandardMaterial({ color: 0x111111 })
                    );
                    hair.position.y = 1.45; group.add(hair);
                    var kanzashi = new THREE.Mesh(
                        new THREE.CylinderGeometry(.01, .01, .2, 4),
                        new THREE.MeshStandardMaterial({ color: 0xff4466, emissive: 0xff2244, emissiveIntensity: .5 })
                    );
                    kanzashi.position.set(.1, 1.55, 0); kanzashi.rotation.z = .4; group.add(kanzashi);
                }

                /* Legs */
                var legL = new THREE.Mesh(
                    new THREE.BoxGeometry(.12, .4, .15),
                    new THREE.MeshStandardMaterial({ color: 0x333344 })
                );
                legL.position.set(-.1, .3, 0); group.add(legL);
                var legR = legL.clone(); legR.position.x = .1; group.add(legR);

                /* Position */
                var offX = (Math.random() - .5) * 20, offZ = (Math.random() - .5) * 20;
                group.position.set(sp.pos[0] + offX, 0, sp.pos[2] + offZ);

                /* Walk data */
                var npc = {
                    mesh: group,
                    type: type,
                    originX: group.position.x,
                    originZ: group.position.z,
                    angle: Math.random() * Math.PI * 2,
                    radius: 4 + Math.random() * 8,
                    phase: Math.random() * Math.PI * 2,
                    legL: legL,
                    legR: legR
                };
                this.npcs.push(npc);
                scene.add(group);
            }
        },

        /* Update NPC movement */
        updateNPCs: function (elapsed, dt) {
            for (var i = 0; i < this.npcs.length; i++) {
                var n = this.npcs[i];
                var sp = n.type.speed;
                var t = elapsed * sp * .3 + n.phase;
                n.mesh.position.x = n.originX + Math.sin(t) * n.radius;
                n.mesh.position.z = n.originZ + Math.cos(t) * n.radius;
                /* Face direction of movement */
                var fx = Math.cos(t) * n.radius * sp * .3;
                var fz = -Math.sin(t) * n.radius * sp * .3;
                n.mesh.rotation.y = Math.atan2(fx, fz);
                /* Leg animation */
                var legAngle = Math.sin(elapsed * sp * 4 + n.phase) * .4;
                n.legL.rotation.x = legAngle;
                n.legR.rotation.x = -legAngle;
            }
        },

        /* Ring bell effect */
        ringBell: function (audioCtx) {
            if (!audioCtx) return;
            var now = audioCtx.currentTime;
            /* Bell principal tone */
            var osc1 = audioCtx.createOscillator();
            var osc2 = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            osc1.type = 'sine'; osc1.frequency.value = 262;
            osc2.type = 'sine'; osc2.frequency.value = 523;
            gain.gain.setValueAtTime(.3, now);
            gain.gain.exponentialRampToValueAtTime(.001, now + 4);
            osc1.connect(gain); osc2.connect(gain); gain.connect(audioCtx.destination);
            osc1.start(now); osc2.start(now);
            osc1.stop(now + 4); osc2.stop(now + 4);
            /* Metallic overtone */
            var osc3 = audioCtx.createOscillator();
            var g2 = audioCtx.createGain();
            osc3.type = 'triangle'; osc3.frequency.value = 1047;
            g2.gain.setValueAtTime(.08, now);
            g2.gain.exponentialRampToValueAtTime(.001, now + 2.5);
            osc3.connect(g2); g2.connect(audioCtx.destination);
            osc3.start(now); osc3.stop(now + 3);
        }
    };
})();
