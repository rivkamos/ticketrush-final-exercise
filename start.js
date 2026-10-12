#!/usr/bin/env node
'use strict';
/*
 * TicketRush – מוקד ההתראות של התרגיל המסכם.
 *   node start.js            מתחיל (או ממשיך) את השעון ופותח את מוקד ההתראות בדפדפן
 *   node start.js --no-open  בלי לפתוח דפדפן אוטומטית
 * השאירי את החלון הזה פתוח עד סוף התרגיל.
 * הסקריפט רושם מקומית (בתוך .git) את זמני ההתראות ואילו worktrees נפתחו. finish.js שולח את זה למרצה.
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const readline = require('readline');
const { execFileSync, spawn } = require('child_process');

const ROOT = __dirname;
const argv = process.argv.slice(2);
const opt = function (name, dflt) {
  const hit = argv.find(function (a) { return a.indexOf('--' + name + '=') === 0; });
  if (hit) return hit.slice(name.length + 3);
  return argv.indexOf('--' + name) !== -1 ? true : dflt;
};
const SPEED = Number(opt('speed', 1)) || 1;   // להרצות ניסיון בלבד: --speed=60 מאיץ פי 60
let PORT = Number(opt('port', 4817)) || 4817;

function git(args, extra) {
  return execFileSync('git', args, Object.assign({
    cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']
  }, extra || {})).trim();
}

function fail(msg) { console.error('\n✖ ' + msg + '\n'); process.exit(1); }

// ---------- בדיקות מקדימות ----------
try { git(['rev-parse', '--is-inside-work-tree']); } catch (e) { fail('This folder is not a git repository. Run: git clone <repo-url>, then cd into it.'); }
const GIT_DIR = path.resolve(ROOT, git(['rev-parse', '--git-common-dir']));
const STATE_FILE = path.join(GIT_DIR, 'drill-state.json');

let payload;
try {
  payload = JSON.parse(Buffer.from(fs.readFileSync(path.join(ROOT, '.drill', 'drill.dat'), 'utf8'), 'base64').toString('utf8'));
} catch (e) { fail('Cannot read .drill/drill.dat – is the repository complete?'); }

try { git(['rev-parse', '--verify', '--quiet', 'refs/remotes/origin/main^{commit}']); }
catch (e) { fail('origin/main was not found. Did you use "git clone" of the exercise repository?'); }

// ---------- מצב ----------
let state = null;
try { state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch (e) { state = null; }
const saveState = function () { fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2)); };

function ask(q) {
  return new Promise(function (resolve) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(q, function (a) { rl.close(); resolve(a.trim()); });
  });
}

const validId = function (s) { return /^[a-z][a-z0-9-]{2,30}$/.test(s); };

// ---------- יצירת ענפי עמיתות (קומיטים אמיתיים, בלי רשת) ----------
function makeCommit(parent, files, msg, author, date) {
  const m = /^(.*) <(.*)>$/.exec(author);
  const idx = path.join(GIT_DIR, 'drill-index-' + process.pid + '-' + Date.now());
  const env = Object.assign({}, process.env, {
    GIT_INDEX_FILE: idx,
    GIT_AUTHOR_NAME: m[1], GIT_AUTHOR_EMAIL: m[2], GIT_AUTHOR_DATE: date,
    GIT_COMMITTER_NAME: m[1], GIT_COMMITTER_EMAIL: m[2], GIT_COMMITTER_DATE: date
  });
  try {
    git(['read-tree', parent], { env: env });
    Object.keys(files).forEach(function (f) {
      const sha = git(['hash-object', '-w', '--stdin'], { input: files[f], env: env });
      git(['update-index', '--add', '--cacheinfo', '100644,' + sha + ',' + f], { env: env });
    });
    const tree = git(['write-tree'], { env: env });
    return git(['commit-tree', tree, '-p', parent, '-m', msg], { env: env });
  } finally { try { fs.unlinkSync(idx); } catch (e) { /* ignore */ } }
}

function publishBranch(name) {
  const ref = 'refs/remotes/origin/' + name;
  try { git(['rev-parse', '--verify', '--quiet', ref]); return; } catch (e) { /* not there yet */ }
  let parent = git(['rev-parse', 'refs/remotes/origin/main^{commit}']);
  (payload.branches[name] || []).forEach(function (c) {
    parent = makeCommit(parent, c.files, c.msg, c.author, c.date);
  });
  git(['update-ref', ref, parent]);
}

// ---------- התראות ----------
function writeAlertFile(a) {
  const dir = path.join(ROOT, 'ALERTS');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'ALERT_' + a.id + '.md'),
    '# ' + a.title + '\n\n(התראה ' + a.id + ' · דקה ' + a.atMin + ')\n\n' + a.body + '\n');
}


// הפעלת תהליך עזר בלי להפיל את הסקריפט אם הכלי לא קיים (למשל notify-send)
function spawnQuiet(cmd, args) {
  try {
    const p = spawn(cmd, args, { stdio: 'ignore', detached: true });
    p.on('error', function () { /* הכלי לא קיים – מתעלמים */ });
    p.unref();
  } catch (e) { /* ignore */ }
}

function osNotify(title) {
  try {
    if (process.platform === 'darwin') {
      spawnQuiet('osascript', ['-e', 'display notification ' + JSON.stringify(title) + ' with title "TicketRush"']);
    } else if (process.platform === 'linux') {
      spawnQuiet('notify-send', ['TicketRush', title]);
    }
  } catch (e) { /* הדפדפן הוא ערוץ ההתראה העיקרי */ }
}

function fire(a) {
  state.fired[a.id] = { at: Date.now() };
  try { writeAlertFile(a); } catch (e) { /* ignore */ }
  if (a.publish) {
    try { publishBranch(a.publish); }
    catch (e) { console.error('! could not create branch ' + a.publish + ': ' + e.message.split('\n')[0]); }
  }
  saveState();
  process.stdout.write('\x07');
  console.log('\n🔔 ALERT #' + a.id + ' – ' + a.title + '   (details: browser tab "TicketRush Ops")');
  osNotify(a.title);
}

function tick() {
  const simMin = (Date.now() - state.startedAt) * SPEED / 60000;
  payload.alerts.forEach(function (a) {
    if (!state.fired[a.id] && simMin >= a.atMin) fire(a);
  });
}

// ---------- ניטור worktrees ----------
function pollWorktrees() {
  let out;
  try { out = git(['worktree', 'list', '--porcelain']); } catch (e) { return; }
  const blocks = out.split(/\n\s*\n/).filter(Boolean);
  let changed = false;
  blocks.slice(1).forEach(function (b) {
    const wt = (/^worktree (.+)$/m.exec(b) || [])[1];
    const br = (/^branch refs\/heads\/(.+)$/m.exec(b) || [])[1];
    const head = (/^HEAD (\w+)/m.exec(b) || [])[1] || '';
    const key = br || ('detached@' + path.basename(wt || head));
    if (!state.worktrees[key]) { state.worktrees[key] = { path: wt, firstSeen: Date.now() }; changed = true; }
  });
  const concurrent = blocks.length - 1;
  if (concurrent > (state.maxConcurrent || 0)) { state.maxConcurrent = concurrent; changed = true; }
  state.currentWorktrees = concurrent;
  if (changed) saveState();
}

// ---------- שרת מקומי ----------
function publicState() {
  const fired = payload.alerts.filter(function (a) { return state.fired[a.id]; }).map(function (a) {
    return { id: a.id, atMin: a.atMin, kind: a.kind, title: a.title, body: a.body, hasHint: !!a.hint, firedAt: state.fired[a.id].at };
  });
  return {
    id: state.id, now: Date.now(), startedAt: state.startedAt, speed: SPEED, durationMin: payload.durationMin,
    alerts: fired, hintsUsed: state.hints.length,
    worktreesSeen: Object.keys(state.worktrees).length, worktreesNow: state.currentWorktrees || 0
  };
}

function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const json = function (obj, code) {
    res.writeHead(code || 200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(obj));
  };
  if (url.pathname === '/api/state') return json(publicState());
  if (url.pathname === '/api/hint') {
    const id = Number(url.searchParams.get('id'));
    const a = payload.alerts.filter(function (x) { return x.id === id && state.fired[x.id]; })[0];
    if (!a || !a.hint) return json({ hint: null }, 404);
    if (state.hints.indexOf(id) === -1) { state.hints.push(id); saveState(); }
    return json({ hint: a.hint });
  }
  if (url.pathname === '/' || url.pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(fs.readFileSync(path.join(ROOT, '.drill', 'ui.html')));
  }
  res.writeHead(404); res.end('not found');
}

function listen(cb) {
  const server = http.createServer(handler);
  server.on('error', function (e) {
    if (e.code === 'EADDRINUSE' && PORT < 4830) { PORT++; return listen(cb); }
    fail('Cannot start local server: ' + e.message);
  });
  server.listen(PORT, '127.0.0.1', cb);
}

function openBrowser(url) {
  try {
    if (process.platform === 'win32') require('child_process').exec('start "" "' + url + '"');
    else spawnQuiet(process.platform === 'darwin' ? 'open' : 'xdg-open', [url]);
  } catch (e) { /* ignore */ }
}

// ---------- main ----------
(async function main() {
  if (!state) {
    let id = opt('name', '');
    while (!validId(id)) {
      id = (await ask('Your name in English, lowercase, e.g. rachel-cohen: ')).toLowerCase();
      if (!validId(id)) console.log('Use only a-z, 0-9 and "-" (3-31 chars, starting with a letter).');
    }
    state = { id: id, startedAt: Date.now(), speed: SPEED, fired: {}, hints: [], worktrees: {}, maxConcurrent: 0 };
    saveState();
    // כדי ש-ALERTS/ לא יופיע כקובץ לא-מעקב בכל worktree
    try {
      const ex = path.join(GIT_DIR, 'info', 'exclude');
      fs.mkdirSync(path.dirname(ex), { recursive: true });
      const cur = fs.existsSync(ex) ? fs.readFileSync(ex, 'utf8') : '';
      if (cur.indexOf('ALERTS/') === -1) fs.appendFileSync(ex, (cur && !cur.endsWith('\n') ? '\n' : '') + 'ALERTS/\n');
    } catch (e) { /* ignore */ }
    console.log('\n▶ Clock started. You have ' + payload.durationMin + ' minutes.');
  } else {
    const mins = Math.floor((Date.now() - state.startedAt) * SPEED / 60000);
    console.log('\n▶ Resuming the exercise as "' + state.id + '" (' + mins + ' minutes elapsed). The clock never stops.');
  }

  listen(function () {
    const url = 'http://localhost:' + PORT + '/';
    console.log('▶ Ops center: ' + url);
    console.log('▶ Keep this window open until you finish. Work in another terminal.');
    console.log('▶ (Alerts appear in the browser tab, in this window, and as files in ./ALERTS/)\n');
    if (!opt('no-open', false)) openBrowser(url);
    tick();
    setInterval(tick, 1000);
    setInterval(pollWorktrees, 1000);
    pollWorktrees();
  });

  process.on('SIGINT', function () { saveState(); console.log('\nStopped. Run "node start.js" again to continue – the clock kept running.'); process.exit(0); });
})();
