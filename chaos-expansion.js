/* Shiba Chaos: free roaming, collectibles, progression and new rooms.
 * Original game engine remains intact. WUMETAX Lab.
 */
(function () {
  'use strict';
  const core = window.ShibaChaosEngine;
  if (!core) throw new Error('Shiba Chaos engine must load first');
  const { Game, SaveManager, LevelManager, ShibaPlayer, OwnerAI, DestructibleObject, LEVEL_CONFIGS } = core;
  const MAX_LEVEL = 5;
  const LOOKS = [
    { id: 'classic', name: '經典橘柴', description: '咖呲的招牌橘色毛毛與紅色項圈', cost: 0, swatch: '#e08e36' },
    { id: 'cream', name: '奶油白柴', description: '溫暖淺奶油色，搭配湖水綠項圈', cost: 12, swatch: '#ead4a7' },
    { id: 'black', name: '黑柴偵探', description: '深灰黑毛色，配上藍色項圈', cost: 24, swatch: '#5c5362' },
    { id: 'captain', name: '咖呲隊長', description: '亮橘毛色與特製藍色小隊長帽', cost: 36, swatch: '#4580bb' }
  ];

  // Two complete extra stages: all objects use the existing physical interaction system.
  LEVEL_CONFIGS[4] = {
    id: 4, name: '第四關：陽台花園風暴', subtitle: '從陽光花園一路奔跑，撞翻花盆、推走玩具，再躲開主人！',
    worldWidth: 1550, floorY: 470, timeLimit: 145, targetScore: 870,
    starThresholds: [870, 1180, 1530],
    theme: { wallTop: '#d9eee0', wallBottom: '#c6e7cf', floor: '#b98d64', baseboard: '#6b8e59' },
    shibaStart: { x: 85, y: 420 }, dogBed: { x: 1400, y: 438, w: 82, h: 32 },
    owner: { startX: 980, minX: 300, maxX: 1360, patrolSpeed: 93, chaseSpeed: 175, visionRange: 240 },
    platforms: [
      { x: 230, y: 392, w: 150, h: 16, type: 'table', label: '藤編長椅' },
      { x: 470, y: 338, w: 190, h: 16, type: 'table', label: '花架' },
      { x: 730, y: 390, w: 170, h: 16, type: 'counter', label: '園藝工作檯' },
      { x: 1000, y: 320, w: 190, h: 16, type: 'shelf', label: '陽台層架' },
      { x: 1210, y: 392, w: 120, h: 16, type: 'table', label: '茶桌' }
    ],
    hidingSpots: [
      { x: 250, y: 410, w: 78, h: 60, type: 'box', name: '園藝紙箱' },
      { x: 520, y: 410, w: 110, h: 60, type: 'under_table', name: '花架下方' },
      { x: 815, y: 406, w: 85, h: 64, type: 'cabinet', name: '園藝櫃' },
      { x: 1130, y: 410, w: 78, h: 60, type: 'box', name: '工具箱' }
    ],
    objects: [
      { id: 'g01', type: 'vase', name: '薄荷盆栽', x: 500, y: 312, w: 22, h: 26, score: 180, color: '#70a673' },
      { id: 'g02', type: 'vase', name: '向日葵花盆', x: 560, y: 312, w: 22, h: 26, score: 200, color: '#e9a54c' },
      { id: 'g03', type: 'vase', name: '多肉植物花器', x: 620, y: 312, w: 22, h: 26, score: 175, color: '#89b7a1' },
      { id: 'g04', type: 'vase', name: '綠植花盆', x: 1060, y: 294, w: 22, h: 26, score: 210, color: '#82a879' },
      { id: 'g05', type: 'vase', name: '白釉大花瓶', x: 1130, y: 294, w: 22, h: 26, score: 230, color: '#f5e2cf' },
      { id: 'g06', type: 'cup', name: '主人手沖茶杯', x: 1250, y: 372, w: 16, h: 20, score: 140 },
      { id: 'g07', type: 'jar', name: '狗狗零食桶', x: 775, y: 367, w: 20, h: 23, score: 185 },
      { id: 'g08', type: 'jar', name: '園藝種子罐', x: 850, y: 367, w: 20, h: 23, score: 170 },
      { id: 'g09', type: 'slipper', name: '花園防滑拖鞋', x: 405, y: 458, w: 26, h: 12, score: 165, color: '#82a8c9' },
      { id: 'g10', type: 'toy_ball', name: '戶外彈力球', x: 945, y: 450, w: 20, h: 20, score: 95 },
      { id: 'g11', type: 'plate', name: '陽台點心盤', x: 1275, y: 384, w: 26, h: 8, score: 135 }
    ]
  };

  LEVEL_CONFIGS[5] = {
    id: 5, name: '第五關：洗衣間大暴走', subtitle: '衝過晾衣架，把衣物與紙捲弄得亂七八糟，打造最終狗狗拆家傳說！',
    worldWidth: 1640, floorY: 470, timeLimit: 155, targetScore: 1280,
    starThresholds: [1280, 1660, 2050],
    theme: { wallTop: '#e6eaf6', wallBottom: '#d0dbef', floor: '#a2b8c7', baseboard: '#52778d' },
    shibaStart: { x: 85, y: 420 }, dogBed: { x: 1490, y: 438, w: 82, h: 32 },
    owner: { startX: 1060, minX: 260, maxX: 1470, patrolSpeed: 105, chaseSpeed: 189, visionRange: 260 },
    platforms: [
      { x: 230, y: 392, w: 150, h: 16, type: 'counter', label: '洗衣機上蓋' },
      { x: 440, y: 335, w: 210, h: 16, type: 'table', label: '折衣桌' },
      { x: 720, y: 390, w: 185, h: 16, type: 'counter', label: '烘衣機上蓋' },
      { x: 990, y: 325, w: 190, h: 16, type: 'shelf', label: '洗衣用品架' },
      { x: 1270, y: 380, w: 150, h: 16, type: 'table', label: '收納長桌' }
    ],
    hidingSpots: [
      { x: 260, y: 406, w: 85, h: 64, type: 'cabinet', name: '洗衣機旁' },
      { x: 495, y: 412, w: 110, h: 58, type: 'under_table', name: '折衣桌下' },
      { x: 830, y: 410, w: 78, h: 60, type: 'box', name: '衣物紙箱' },
      { x: 1160, y: 410, w: 78, h: 60, type: 'box', name: '收納紙箱' }
    ],
    objects: [
      { id: 'l01', type: 'tp_roll', name: '整袋抽取紙巾', x: 685, y: 448, w: 24, h: 22, score: 290 },
      { id: 'l02', type: 'curtain', name: '陽台晾衣簾', x: 1155, y: 190, w: 55, h: 135, score: 310, color: '#98a8cf' },
      { id: 'l03', type: 'slipper', name: '洗澡拖鞋', x: 395, y: 458, w: 26, h: 12, score: 170, color: '#ff9fbe' },
      { id: 'l04', type: 'toy_ball', name: '滾來滾去的球', x: 930, y: 450, w: 20, h: 20, score: 120 },
      { id: 'l05', type: 'book', name: '洗衣小百科', x: 460, y: 309, w: 16, h: 26, score: 130, color: '#58a6a6' },
      { id: 'l06', type: 'book', name: '摺衣教學手冊', x: 488, y: 309, w: 16, h: 26, score: 135, color: '#dc8097' },
      { id: 'l07', type: 'book', name: '洗衣機說明書', x: 520, y: 309, w: 16, h: 26, score: 130, color: '#8296cf' },
      { id: 'l08', type: 'jar', name: '洗衣香氛瓶', x: 1020, y: 302, w: 20, h: 23, score: 170 },
      { id: 'l09', type: 'jar', name: '香氛備用瓶', x: 1080, y: 302, w: 20, h: 23, score: 170 },
      { id: 'l10', type: 'cup', name: '主人水杯', x: 1310, y: 360, w: 16, h: 20, score: 135 },
      { id: 'l11', type: 'vase', name: '花形置物瓶', x: 1360, y: 354, w: 18, h: 26, score: 200, color: '#b4a5d6' },
      { id: 'l12', type: 'plate', name: '置物托盤', x: 580, y: 327, w: 26, h: 8, score: 140 }
    ]
  };

  // Preserve old saves and provide all 5 stage records and persistent treat currency.
  const oldDefault = SaveManager.prototype.getDefaultData;
  SaveManager.prototype.getDefaultData = function () {
    const data = oldDefault.call(this);
    for (let i = 4; i <= MAX_LEVEL; i++) data.levels[i] = { highScore: 0, stars: 0, cleared: false };
    data.chaos = { treats: 0, totalTreats: 0, completedJobs: 0, selectedLook: 'classic', ownedLooks: ['classic'], patrol: false, lastX: 85 };
    return data;
  };
  const oldLoad = SaveManager.prototype.load;
  SaveManager.prototype.load = function () {
    const data = oldLoad.call(this);
    const defaults = this.getDefaultData();
    let parsed = {};
    try {
      parsed = JSON.parse(localStorage.getItem('wumetax_shibachaos_v1') || localStorage.getItem('wumetax_catchaos_v1') || '{}') || {};
    } catch (_) { parsed = {}; }
    for (let i = 4; i <= MAX_LEVEL; i++) data.levels[i] = Object.assign({}, defaults.levels[i], parsed.levels && parsed.levels[i]);
    data.unlockedLevel = Math.max(1, Math.min(MAX_LEVEL, Math.floor(Number(parsed.unlockedLevel) || data.unlockedLevel)));
    data.chaos = Object.assign({}, defaults.chaos, parsed.chaos || {});
    const wallet = data.chaos;
    wallet.treats = Math.max(0, Math.floor(Number(wallet.treats) || 0));
    wallet.totalTreats = Math.max(0, Math.floor(Number(wallet.totalTreats) || 0));
    wallet.completedJobs = Math.max(0, Math.floor(Number(wallet.completedJobs) || 0));
    wallet.ownedLooks = Array.isArray(wallet.ownedLooks) ? wallet.ownedLooks.filter(id => LOOKS.some(l => l.id === id)) : ['classic'];
    if (!wallet.ownedLooks.includes('classic')) wallet.ownedLooks.unshift('classic');
    if (!wallet.ownedLooks.includes(wallet.selectedLook)) wallet.selectedLook = 'classic';
    wallet.patrol = wallet.patrol === true;
    wallet.lastX = Math.max(20, Math.min(7980, Number(wallet.lastX) || 85));
    return data;
  };
  const oldRecord = SaveManager.prototype.recordLevelClear;
  SaveManager.prototype.recordLevelClear = function (id, score, stars) {
    let msg = oldRecord.call(this, id, score, stars) || '';
    if (id >= 3 && id < MAX_LEVEL && this.data.unlockedLevel < id + 1) {
      this.data.unlockedLevel = id + 1;
      msg += (msg ? ' ' : '') + '解鎖第 ' + (id + 1) + ' 關！';
    }
    this.save();
    return msg;
  };

  function buildSandboxConfig() {
    const zones = [];
    const platforms = [], hidingSpots = [], objects = [], puddles = [], ownerConfigs = [];
    let offset = 0;
    for (let id = 1; id <= MAX_LEVEL; id++) {
      const cfg = LEVEL_CONFIGS[id];
      zones.push({ id, name: cfg.name.replace(/^第.+?關：/, ''), offset, width: cfg.worldWidth, theme: cfg.theme });
      for (const p of cfg.platforms) platforms.push(Object.assign({}, p, { x: p.x + offset }));
      for (const h of cfg.hidingSpots) hidingSpots.push(Object.assign({}, h, { x: h.x + offset }));
      for (const o of cfg.objects) objects.push(Object.assign({}, o, { id: 'free_' + id + '_' + o.id, x: o.x + offset }));
      for (const p of cfg.InitialPuddles || []) puddles.push(Object.assign({}, p, { x: p.x + offset }));
      ownerConfigs.push(Object.assign({ floorY: 470 }, cfg.owner, {
        startX: cfg.owner.startX + offset,
        minX: cfg.owner.minX + offset,
        maxX: cfg.owner.maxX + offset
      }));
      offset += cfg.worldWidth;
    }
    return {
      id: 0, sandbox: true, name: '自由拆家：咖呲的五間房間', subtitle: '沒有時間與生命限制，自由穿越五個場景',
      worldWidth: offset, floorY: 470, timeLimit: 999999, targetScore: 0,
      starThresholds: [0, 0, 0], theme: LEVEL_CONFIGS[1].theme,
      shibaStart: { x: 85, y: 420 }, dogBed: { x: 120, y: 438, w: 82, h: 32 },
      owner: ownerConfigs[0], ownerConfigs, zones, platforms, hidingSpots, objects, InitialPuddles: puddles
    };
  }

  // Dog outfit enhancement: original vector dog remains the artwork source.
  const oldDogDraw = ShibaPlayer.prototype.renderShibaSprite;
  ShibaPlayer.prototype.renderShibaSprite = function (ctx) {
    oldDogDraw.call(this, ctx);
    if (this.look !== 'captain' || this.state === 'hide') return;
    const cx = Math.round(this.x + this.w / 2);
    const headX = cx + (this.facing === 1 ? 1 : -17);
    const hatY = Math.round(this.y - 8 + ((this.state === 'walk' || this.state === 'run') ? Math.sin(this.animTimer * 15) * 2 : 0));
    ctx.save();
    ctx.fillStyle = '#315984';
    ctx.fillRect(headX, hatY, 21, 6);
    ctx.fillStyle = '#4a8cbe';
    ctx.fillRect(headX + 4, hatY - 7, 13, 8);
    ctx.fillStyle = '#f9ce68';
    ctx.fillRect(headX + 9, hatY - 4, 4, 4);
    ctx.restore();
  };

  const oldObjective = LevelManager.prototype.getObjectivesStatus;
  LevelManager.prototype.getObjectivesStatus = function () {
    if (this.id === 0) {
      const task = this.sandboxTask || { label: '自由探索五間房間', key: 'destroyedCount', target: 1, baseline: 0 };
      const count = this.taskValue(task.key) - (task.baseline || 0);
      const done = count >= task.target;
      return { allPrimaryDone: false, list: [
        { text: '五間房間自由探索，物品會重新出現', done: false },
        { text: task.label + ' (' + Math.min(task.target, Math.max(0, count)) + '/' + task.target + ')', done },
        { text: '完成委託獲得骨頭，購買咖呲造型', done: false }
      ] };
    }
    if (this.id !== 4 && this.id !== 5) return oldObjective.call(this);
    const list = [{ text: '累積拆家分數 ' + this.cfg.targetScore + ' 分', done: this.score >= this.cfg.targetScore }];
    if (this.id === 4) {
      list.push({ text: '撞翻至少 2 個花瓶或花盆', done: this.vasesDestroyed >= 2 });
      list.push({ text: '完成 5 件拆家惡作劇 (' + Math.min(5, this.destroyedCount) + '/5)', done: this.destroyedCount >= 5 });
    } else {
      list.push({ text: '推倒至少 2 本雜誌或書本', done: this.booksDestroyed >= 2 });
      list.push({ text: '拉開紙捲或抓壞晾衣簾', done: this.tpUnrolled || this.curtainDestroyed });
    }
    const ready = list.every(item => item.done);
    list.push({ text: ready ? '返回右側狗窩完成本關！' : '完成以上條件後返回狗窩', done: false });
    return { list, allPrimaryDone: ready };
  };
  LevelManager.prototype.taskValue = function (key) {
    if (key === 'treats') return this.collectedTreats || 0;
    if (key === 'combo') return this.combo.maxCombo || 0;
    if (key === 'slippers') return this.slippersCompleted || 0;
    if (key === 'paper') return this.paperCompleted || 0;
    return this[key] || 0;
  };
  const SANDBOX_TASKS = [
    { label: '玩具大掃除：惡作劇 4 次', key: 'destroyedCount', target: 4 },
    { label: '嗅覺探險：收集 5 根骨頭', key: 'treats', target: 5 },
    { label: '花瓶危機：撞落 2 個花瓶', key: 'vasesDestroyed', target: 2 },
    { label: '搗蛋天王：達成 3 連擊', key: 'combo', target: 3 },
    { label: '狗狗搬運：咬走 1 雙拖鞋', key: 'slippers', target: 1 },
    { label: '書房風暴：推倒 3 本書', key: 'booksDestroyed', target: 3 },
    { label: '長長白紙：拉開 1 捲衛生紙', key: 'paper', target: 1 }
  ];
  LevelManager.prototype.nextSandboxTask = function () {
    const index = (this.saveManager.data.chaos.completedJobs || 0) % SANDBOX_TASKS.length;
    this.sandboxTask = Object.assign({}, SANDBOX_TASKS[index]);
    this.sandboxTask.baseline = this.taskValue(this.sandboxTask.key);
    // Max combo can be reset for its own mission, so its progress never gets stuck.
    if (this.sandboxTask.key === 'combo') {
      this.combo.reset();
      this.sandboxTask.baseline = 0;
    }
  };
  LevelManager.prototype.giveTreats = function (count, x, y, note) {
    const wallet = this.saveManager.data.chaos;
    wallet.treats += count;
    wallet.totalTreats += count;
    this.saveManager.save();
    if (this.particles && Number.isFinite(x) && Number.isFinite(y)) {
      this.particles.spawnText(x, y, (note || '找到骨頭') + ' +' + count, '#ffe09b', 1.15);
    }
  };
  LevelManager.prototype.setupExpansion = function () {
    this.playTime = 0;
    this.collectedTreats = 0;
    this.slippersCompleted = 0;
    this.paperCompleted = 0;
    this.bones = [];
    this.sniffTime = 0;
    this.sniffCooldown = 0;
    this.respawns = [];
    const zones = this.cfg.zones || [{ id: this.id, offset: 0, width: this.worldWidth }];
    for (const z of zones) {
      const cfg = LEVEL_CONFIGS[z.id];
      const base = z.offset;
      const ground = [140, 440, 690, 960, cfg.worldWidth - 195];
      for (const x of ground) this.bones.push({ x: base + x, y: 442, readyAt: 0, active: true });
      for (const p of cfg.platforms.slice(0, 3)) {
        this.bones.push({ x: base + p.x + p.w / 2, y: p.y - 18, readyAt: 0, active: true });
      }
    }
    if (this.id === 0) {
      this.owners = this.cfg.ownerConfigs.map(c => new OwnerAI(c));
      this.owner = this.owners[0];
      this.patrolMode = this.saveManager.data.chaos.patrol;
      this.shiba.skills = { dash: true, powerSlap: true, doubleJump: true };
      this.shiba.x = Math.max(20, Math.min(this.worldWidth - this.shiba.w - 20, Number(this.saveManager.data.chaos.lastX) || 85));
      this.shiba.y = this.floorY - this.shiba.h;
      this.nextSandboxTask();
    }
  };
  LevelManager.prototype.trySniff = function () {
    if (this.sniffCooldown > 0) return;
    this.sniffCooldown = 9;
    this.sniffTime = 4.5;
    this.audio.bark('short');
    this.particles.spawnText(this.shiba.x + 20, this.shiba.y - 30, '嗅嗅！發現骨頭的香味', '#ffe09b', 1.05);
  };
  LevelManager.prototype.updateBones = function (dt) {
    this.playTime += dt;
    if (this.id === 0 && Math.floor(this.playTime / 6) !== Math.floor((this.playTime - dt) / 6)) {
      this.saveManager.data.chaos.lastX = Math.round(this.shiba.x);
      this.saveManager.save();
    }
    this.sniffTime = Math.max(0, this.sniffTime - dt);
    this.sniffCooldown = Math.max(0, this.sniffCooldown - dt);
    const dog = this.shiba;
    for (const bone of this.bones) {
      if (!bone.active && this.playTime >= bone.readyAt && Math.abs(dog.x - bone.x) > 90) bone.active = true;
      if (!bone.active || dog.startledTimer > 0 || dog.isHidden) continue;
      if (Math.abs(dog.x + dog.w / 2 - bone.x) < 27 && Math.abs(dog.y + dog.h / 2 - bone.y) < 32) {
        bone.active = false;
        bone.readyAt = this.playTime + 28;
        this.collectedTreats++;
        this.giveTreats(1, bone.x, bone.y - 10, '撿到骨頭');
        this.audio.bark('happy');
        this.particles.spawnDust(bone.x, bone.y, 6, '#ffd166');
      }
    }
  };
  LevelManager.prototype.drawBones = function (ctx) {
    for (const bone of this.bones || []) {
      if (!bone.active || !this.isVisible(bone.x, 20)) continue;
      const bob = Math.sin(this.playTime * 3.5 + bone.x * 0.02) * 3.5;
      const x = Math.round(bone.x), y = Math.round(bone.y + bob);
      if (this.sniffTime > 0) {
        ctx.fillStyle = 'rgba(255,226,143,0.24)';
        ctx.beginPath(); ctx.arc(x, y, 23 + Math.sin(this.playTime * 8) * 3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(-0.2);
      ctx.fillStyle = '#8b552f';
      ctx.fillRect(-11, -5, 22, 11);
      ctx.fillStyle = '#fff2d1';
      ctx.fillRect(-10, -4, 20, 8);
      for (const sx of [-11, 11]) for (const sy of [-5, 5]) {
        ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }
  };
  LevelManager.prototype.isVisible = function (x, w) {
    const camera = this.cameraX || 0, width = this.cameraViewW || 960;
    return x + (w || 0) >= camera - 120 && x <= camera + width + 120;
  };
  LevelManager.prototype.currentZone = function () {
    const mid = this.shiba.x + this.shiba.w / 2;
    return (this.cfg.zones || []).find(z => mid >= z.offset && mid < z.offset + z.width) ||
      { offset: 0, name: this.cfg.name, id: this.id };
  };

  const oldBreak = LevelManager.prototype.onObjectBroken;
  LevelManager.prototype.onObjectBroken = function (obj) {
    oldBreak.call(this, obj);
    if (this.id !== 0) return;
    if (obj.type === 'slipper') this.slippersCompleted++;
    if (obj.type === 'tp_roll') this.paperCompleted++;
    const original = this.cfg.objects.find(o => o.id === obj.id);
    if (original) this.respawns.push({ object: obj, original, at: this.playTime + 18 + Math.random() * 10 });
    if (this.patrolMode) {
      for (const owner of this.owners.slice(1)) {
        if (Math.abs(owner.x - obj.x) < 330) owner.hearNoise(obj.x);
      }
    }
  };
  const oldCaught = LevelManager.prototype.onShibaCaught;
  LevelManager.prototype.onShibaCaught = function () {
    if (this.id !== 0) return oldCaught.call(this);
    if (this.shiba.startledTimer > 0 || this.shiba.invulnTimer > 0) return;
    this.timesCaught++;
    this.score = Math.max(0, this.score - 75);
    this.combo.onCaughtPenalty();
    this.shiba.startledTimer = 0.7;
    this.audio.bark('whine');
    this.particles.spawnText(this.shiba.x, this.shiba.y - 25, '被抓包！扣 75 分，沒有生命限制', '#ffb5a1', 1.05);
  };
  const oldExit = LevelManager.prototype.canExitAtBed;
  LevelManager.prototype.canExitAtBed = function (shiba) {
    return this.id === 0 ? false : oldExit.call(this, shiba);
  };
  const oldUpdate = LevelManager.prototype.update;
  LevelManager.prototype.update = function (dt, input, justPressed) {
    if (this.id !== 0) {
      oldUpdate.call(this, dt, input, justPressed);
      if (this.bones && !this.finished) {
        if (justPressed.sniff) this.trySniff();
        this.updateBones(dt);
      }
      return;
    }
    if (justPressed.sniff) this.trySniff();
    const zone = this.currentZone();
    this.shiba.spawnX = zone.offset + 75;
    this.shiba.spawnY = 420;
    this.shiba.update(dt, input, justPressed, this, this.audio, this.particles);
    if (this.patrolMode) this.owners.forEach(o => o.update(dt, this.shiba, this.audio, this));
    this.objects.forEach(o => o.update(dt, this));
    this.combo.update(dt);
    this.particles.update(dt);
    this.updateBones(dt);
    for (let i = this.respawns.length - 1; i >= 0; i--) {
      const entry = this.respawns[i];
      if (this.playTime >= entry.at && Math.abs(this.shiba.x - entry.original.x) > 160) {
        Object.assign(entry.object, new DestructibleObject(entry.original));
        this.respawns.splice(i, 1);
      }
    }
    if (this.sandboxTask && this.taskValue(this.sandboxTask.key) - this.sandboxTask.baseline >= this.sandboxTask.target) {
      this.saveManager.data.chaos.completedJobs++;
      this.giveTreats(6, this.shiba.x + 22, this.shiba.y - 36, '完成惡作劇委託');
      this.nextSandboxTask();
    }
  };
  const oldDraw = LevelManager.prototype.draw;
  LevelManager.prototype.draw = function (ctx) {
    oldDraw.call(this, ctx);
    this.drawBones(ctx);
    if (this.id === 0 && this.patrolMode) {
      for (const owner of this.owners.slice(1)) if (this.isVisible(owner.x, owner.w)) owner.draw(ctx);
    }
  };

  // Distinctive hand-painted-in-canvas set dressing, no third-party assets.
  LevelManager.prototype.drawRoomDetails = function (ctx) {
    const zones = this.cfg.zones || [{ id: this.id, offset: 0, width: this.worldWidth, name: this.cfg.name }];
    for (const zone of zones) {
      if (!this.isVisible(zone.offset, zone.width)) continue;
      const x = zone.offset;
      ctx.save();
      ctx.font = '800 14px "Noto Sans TC", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(44,38,35,0.75)';
      ctx.fillRect(x + 28, 46, 220, 35);
      ctx.strokeStyle = '#d4ad72'; ctx.lineWidth = 2; ctx.strokeRect(x + 28, 46, 220, 35);
      ctx.fillStyle = '#fff2cb';
      ctx.fillText(zone.name || LEVEL_CONFIGS[zone.id].name, x + 41, 69);
      if (zone.id === 1) {
        // Framed pet portrait and hanging lamp.
        ctx.fillStyle = '#9b623f'; ctx.fillRect(x + 510, 75, 95, 82);
        ctx.fillStyle = '#f2d7a7'; ctx.fillRect(x + 518, 83, 79, 66);
        ctx.fillStyle = '#d28b45'; ctx.fillRect(x + 546, 110, 27, 25);
        ctx.fillStyle = '#a85d36'; ctx.fillRect(x + 542, 101, 10, 14); ctx.fillRect(x + 568, 101, 10, 14);
        ctx.fillStyle = '#473022'; ctx.fillRect(x + 553, 119, 3, 3); ctx.fillRect(x + 564, 119, 3, 3);
        ctx.fillStyle = '#f6d48f'; ctx.fillRect(x + 1130, 54, 12, 58);
        ctx.beginPath(); ctx.moveTo(x + 1095, 112); ctx.lineTo(x + 1178, 112); ctx.lineTo(x + 1159, 139); ctx.lineTo(x + 1114, 139); ctx.fill();
      } else if (zone.id === 2) {
        // Kitchen tiles and utensil rack.
        ctx.fillStyle = 'rgba(255,255,255,0.38)'; ctx.fillRect(x + 1020, 110, 285, 125);
        ctx.strokeStyle = 'rgba(99,143,147,0.24)'; ctx.lineWidth = 1;
        for (let yy = 110; yy < 235; yy += 25) {
          ctx.beginPath(); ctx.moveTo(x + 1020, yy); ctx.lineTo(x + 1305, yy); ctx.stroke();
        }
        for (let xx = 1020; xx < 1310; xx += 40) {
          ctx.beginPath(); ctx.moveTo(x + xx, 110); ctx.lineTo(x + xx, 235); ctx.stroke();
        }
        ctx.fillStyle = '#5c7773'; ctx.fillRect(x + 235, 120, 130, 6);
        for (let n = 0; n < 4; n++) { ctx.fillRect(x + 247 + n * 27, 126, 4, 35 + n % 2 * 11); }
      } else if (zone.id === 3) {
        // Tall bookcase silhouette and gilded frames.
        ctx.fillStyle = '#533c3f'; ctx.fillRect(x + 350, 110, 170, 195);
        ctx.fillStyle = '#aa8055'; ctx.fillRect(x + 360, 165, 150, 7); ctx.fillRect(x + 360, 243, 150, 7);
        for (let n = 0; n < 18; n++) {
          ctx.fillStyle = ['#668aa0','#b65e62','#bba16b','#6c9b7f'][n % 4];
          ctx.fillRect(x + 367 + n * 8, 132 + (n % 3) * 2, 6, 32);
        }
        ctx.fillStyle = '#d2a15e'; ctx.fillRect(x + 1185, 75, 118, 82);
        ctx.fillStyle = '#342c44'; ctx.fillRect(x + 1193, 83, 102, 66);
        ctx.fillStyle = '#e6c0a6'; ctx.beginPath(); ctx.arc(x + 1244, 114, 19, 0, Math.PI * 2); ctx.fill();
      } else if (zone.id === 4) {
        // Vine trellis and potted green plants.
        ctx.strokeStyle = '#799d73'; ctx.lineWidth = 4;
        for (let n = 0; n < 8; n++) {
          const px = x + 85 + n * 143;
          ctx.beginPath(); ctx.moveTo(px, 112); ctx.lineTo(px, 240); ctx.stroke();
        }
        ctx.fillStyle = '#9b6747'; ctx.fillRect(x + 1160, 402, 68, 60);
        for (let n = 0; n < 5; n++) {
          ctx.fillStyle = n % 2 ? '#538d69' : '#7eaf6b';
          ctx.beginPath(); ctx.ellipse(x + 1185 + n * 5, 384 - n * 13, 18, 10, n * 0.5, 0, Math.PI * 2); ctx.fill();
        }
      } else if (zone.id === 5) {
        // Washing machine porthole and pinned laundry.
        ctx.fillStyle = '#f4f7ff'; ctx.fillRect(x + 120, 315, 110, 145);
        ctx.fillStyle = '#a5bdce'; ctx.beginPath(); ctx.arc(x + 175, 395, 41, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#5d90ab'; ctx.beginPath(); ctx.arc(x + 175, 395, 29, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(x + 164, 381, 12, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#7f889a'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x + 790, 115); ctx.lineTo(x + 1080, 128); ctx.stroke();
        for (let n = 0; n < 4; n++) {
          ctx.fillStyle = ['#f9b4bb','#fff1be','#9cbede','#c1afd8'][n];
          ctx.fillRect(x + 823 + n * 60, 121 + n * 2, 43, 65);
        }
      }
      ctx.restore();
    }
  };

  // Add one endlessly repeatable sandbox, persistent wardrobe and accessible mobile actions.
  function installMenu() {
    const start = document.getElementById('btn-start-game');
    if (!start) return;
    start.insertAdjacentHTML('afterend',
      '<button class="wood-btn sandbox-btn" id="btn-sandbox">自由拆家模式｜五間房間不限時探索</button>' +
      '<button class="wood-btn secondary" id="btn-open-wardrobe">咖呲造型衣櫃｜收集骨頭換造型</button>');
    const pause = document.getElementById('btn-restart-pause');
    pause.insertAdjacentHTML('afterend',
      '<button class="wood-btn secondary" id="btn-pause-wardrobe">造型衣櫃</button>' +
      '<button class="wood-btn secondary" id="btn-toggle-patrol">自由模式：主人巡邏開關</button>');
    document.getElementById('screen-levels').insertAdjacentHTML('afterend',
      '<div id="screen-wardrobe" class="overlay-screen hidden">' +
      '<div class="modal-panel">' +
      '<h2 class="game-title" style="font-size:26px">咖呲的造型衣櫃</h2>' +
      '<p class="game-subtitle">玩遊戲收集骨頭，就可以讓咖呲換上喜歡的造型</p>' +
      '<div class="wardrobe-balance">目前骨頭：<strong id="wardrobe-wallet">0</strong></div>' +
      '<div id="look-cards" class="look-grid"></div>' +
      '<button class="wood-btn secondary" id="btn-close-wardrobe" style="width:100%">返回</button>' +
      '</div></div>');
    const hudTop = document.querySelector('#hud-layer .hud-top-bar .hud-card:last-child');
    hudTop.insertAdjacentHTML('afterbegin',
      '<div class="hud-stat hud-collect"><span class="hud-label">骨頭／委託</span>' +
      '<span class="hud-value"><span id="hud-treats">0</span> / <span id="hud-jobs">0</span></span></div>' +
      '<div class="hud-divider"></div>');
    const target = document.getElementById('hud-target');
    target.parentNode.innerHTML = '<span id="hud-score">0</span><span id="hud-target-wrap"> / <span id="hud-target">550</span> 分</span>';
    // Existing score element is replaced above; id kept stable.
    const touchJump = document.querySelector('[data-action="jump"]');
    touchJump.removeAttribute('style');
    touchJump.insertAdjacentHTML('beforebegin',
      '<button class="t-btn small sniff-btn" data-action="sniff">聞香<span class="key-sub">F</span></button>');
    const help = document.querySelector('#screen-help .info-grid');
    help.insertAdjacentHTML('beforeend',
      '<p><span class="key-badge">F</span> 聞香尋骨頭（亮起附近骨頭的位置，有冷卻時間）</p>' +
      '<p><strong>自由拆家：</strong>全五間房間相連、沒有限時、可開關主人巡邏；物品重新出現，每完成循環委託可獲得骨頭</p>' +
      '<p><strong>骨頭與衣櫃：</strong>靠近骨頭自動收集，回到主選單或暫停畫面即可換造型</p>');
    const reset = document.querySelector('#screen-reset-confirm p');
    reset.textContent = '將清除所有關卡進度、星級、骨頭、完成委託次數與已購買的造型，此操作無法復原。';
  }
  installMenu();

  // Keyboard/touch input: add a sniff action while keeping all original controls.
  const originalBind = core.InputManager.prototype.bindEvents;
  core.InputManager.prototype.bindEvents = function () {
    originalBind.call(this);
    // The original .t-btn pointer listeners also cover the new sniff button.
    this.justPressed.sniff = false;
    this.touchActions.sniff = false;
    window.addEventListener('keydown', e => {
      if (e.code === 'KeyF' && !e.repeat) this.justPressed.sniff = true;
    });
  };

  const oldInit = Game.prototype.initUI;
  Game.prototype.initUI = function () {
    oldInit.call(this);
    this.previewShiba.look = this.saveManager.data.chaos.selectedLook;
    document.getElementById('btn-sandbox').addEventListener('click', () => {
      this.audio.initContext(); this.startLevel(0);
    });
    document.getElementById('btn-open-wardrobe').addEventListener('click', () => this.openWardrobe('screen-title'));
    document.getElementById('btn-pause-wardrobe').addEventListener('click', () => this.openWardrobe('screen-pause'));
    document.getElementById('btn-close-wardrobe').addEventListener('click', () => this.showOverlay(this.wardrobeReturn || 'screen-title'));
    const patrol = document.getElementById('btn-toggle-patrol');
    patrol.addEventListener('click', () => {
      const wallet = this.saveManager.data.chaos;
      wallet.patrol = !wallet.patrol; this.saveManager.save();
      if (this.level && this.level.id === 0) this.level.patrolMode = wallet.patrol;
      this.syncPatrol();
    });
    this.syncPatrol();
    // Replace next button, removing the original 3-stage-only listener.
    const oldNext = document.getElementById('btn-next-level');
    const newNext = oldNext.cloneNode(true);
    oldNext.replaceWith(newNext);
    newNext.addEventListener('click', () => this.startLevel(Math.min(MAX_LEVEL, this.currentLevelId + 1)));
  };
  Game.prototype.syncPatrol = function () {
    const button = document.getElementById('btn-toggle-patrol');
    button.textContent = this.saveManager.data.chaos.patrol
      ? '主人巡邏：開啟（點擊關閉）' : '主人巡邏：關閉（點擊開啟）';
    button.classList.toggle('hidden', !this.level || this.level.id !== 0);
  };
  Game.prototype.openWardrobe = function (returnScreen) {
    this.wardrobeReturn = returnScreen;
    this.populateWardrobe();
    this.showOverlay('screen-wardrobe');
  };
  Game.prototype.populateWardrobe = function () {
    const wallet = this.saveManager.data.chaos;
    document.getElementById('wardrobe-wallet').textContent = wallet.treats;
    const el = document.getElementById('look-cards');
    el.innerHTML = '';
    for (const look of LOOKS) {
      const owned = wallet.ownedLooks.includes(look.id);
      const equipped = wallet.selectedLook === look.id;
      const card = document.createElement('div');
      card.className = 'look-card' + (equipped ? ' equipped' : '');
      card.innerHTML = '<span class="look-swatch" style="background:' + look.swatch + '"></span>' +
        '<div><strong>' + look.name + '</strong><small>' + look.description + '</small></div>' +
        '<button class="wood-btn ' + (equipped ? 'secondary' : '') + '" ' +
        (owned || wallet.treats >= look.cost ? '' : 'disabled') + '>' +
        (equipped ? '穿戴中' : owned ? '穿戴' : look.cost + ' 根骨頭') + '</button>';
      card.querySelector('button').addEventListener('click', () => {
        if (equipped) return;
        if (!owned) {
          if (wallet.treats < look.cost) return;
          wallet.treats -= look.cost;
          wallet.ownedLooks.push(look.id);
        }
        wallet.selectedLook = look.id;
        this.previewShiba.look = look.id;
        if (this.level) this.level.shiba.look = look.id;
        this.saveManager.save();
        this.populateWardrobe();
      });
      el.appendChild(card);
    }
  };
  const oldStart = Game.prototype.startLevel;
  Game.prototype.startLevel = function (id) {
    if (id === 0) LEVEL_CONFIGS[0] = buildSandboxConfig();
    oldStart.call(this, id);
    this.level.setupExpansion();
    this.level.shiba.look = this.saveManager.data.chaos.selectedLook;
    this.previewShiba.look = this.saveManager.data.chaos.selectedLook;
    this.camera.x = id === 0 ? Math.max(0, Math.min(this.level.worldWidth - this.virtualW, this.level.shiba.x - this.virtualW * 0.42)) : 0;
    this.accumulator = 0;
    this.hudTimer = 0;
    this.syncPatrol();
    this.updateHUD();
  };
  const oldResize = Game.prototype.handleResize;
  Game.prototype.handleResize = function () {
    oldResize.call(this);
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1.4 : 1.75);
    this.canvas.width = Math.max(1, Math.round(rect.width * dpr));
    this.canvas.height = Math.max(1, Math.round(rect.height * dpr));
    // Never stretch 2D sprites in portrait mode.
    this.virtualW = Math.max(230, Math.round((rect.width / Math.max(1, rect.height)) * this.virtualH));
    this.camera.viewW = this.virtualW;
  };
  const oldHUD = Game.prototype.updateHUD;
  Game.prototype.updateHUD = function () {
    oldHUD.call(this);
    const lvl = this.level;
    const wallet = this.saveManager.data.chaos;
    document.getElementById('hud-treats').textContent = wallet.treats;
    document.getElementById('hud-jobs').textContent = wallet.completedJobs;
    document.getElementById('hud-target-wrap').classList.toggle('hidden', lvl.id === 0);
    if (lvl.id === 0) {
      document.getElementById('hud-timer').textContent = '不限時';
      document.getElementById('hud-level-name').textContent = '自由拆家｜' + lvl.currentZone().name;
      document.getElementById('hud-paws').textContent = '自由探索';
    }
    const badge = document.getElementById('badge-djump');
    if (lvl.id === 0) badge.classList.remove('locked');
    if (lvl.id === 0) document.getElementById('txt-djump').textContent = '已啟用';
    if (lvl.id === 0) document.getElementById('badge-power').classList.remove('locked');
    if (lvl.id === 0) document.getElementById('txt-power').textContent = lvl.shiba.powerCooldown > 0
      ? lvl.shiba.powerCooldown.toFixed(1) + 's' : '已啟用';
    const sniff = document.querySelector('.sniff-btn');
    if (sniff) sniff.classList.toggle('recharging', lvl.sniffCooldown > 0);
  };
  Game.prototype.populateLevelCards = function () {
    const container = document.getElementById('level-cards-container');
    container.innerHTML = '';
    for (let i = 1; i <= MAX_LEVEL; i++) {
      const cfg = LEVEL_CONFIGS[i];
      const saved = this.saveManager.data.levels[i];
      const unlocked = i <= this.saveManager.data.unlockedLevel;
      const card = document.createElement('div');
      card.className = 'level-card' + (unlocked ? '' : ' locked');
      card.innerHTML = '<div class="level-info"><h4>' + cfg.name + '</h4><p>' + cfg.subtitle +
        '</p><p style="margin-top:4px;font-weight:700;color:#9a5826">最高紀錄：' + saved.highScore +
        ' 分｜目標：' + cfg.targetScore + ' 分</p></div><div class="level-meta">' +
        '<div class="stars-row">' + this.getStarsHTML(saved.stars) + '</div>' +
        '<button class="wood-btn" style="padding:6px 14px;font-size:14px" ' +
        (unlocked ? '' : 'disabled') + '>' + (unlocked ? '進入房間' : '尚未解鎖') + '</button></div>';
      if (unlocked) card.querySelector('button').addEventListener('click', () => {
        this.audio.initContext(); this.startLevel(i);
      });
      container.appendChild(card);
    }
  };
  const oldResult = Game.prototype.onLevelEnded;
  Game.prototype.onLevelEnded = function (result) {
    oldResult.call(this, result);
    if (result.victory && result.levelId < MAX_LEVEL) {
      document.getElementById('btn-next-level').classList.remove('hidden');
    }
  };
  const oldOverlay = Game.prototype.showOverlay;
  Game.prototype.showOverlay = function (name) {
    oldOverlay.call(this, name);
    document.getElementById('screen-wardrobe').classList.toggle('hidden', name !== 'screen-wardrobe');
  };
  const oldMenu = Game.prototype.quitToMenu;
  Game.prototype.quitToMenu = function () {
    if (this.level && this.level.id === 0) {
      this.saveManager.data.chaos.lastX = Math.round(this.level.shiba.x);
      this.saveManager.save();
    }
    oldMenu.call(this);
    this.syncPatrol();
  };
})();
