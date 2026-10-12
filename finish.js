#!/usr/bin/env node
'use strict';
/*
 * TicketRush – הגשה ובדיקה.
 *   node finish.js              בודק את העבודה, מציג ציון, ודוחף את הענפים שלך ל-origin תחת השם שלך
 *   node finish.js --no-push    רק בדיקה, בלי דחיפה
 *   node finish.js --yes        בלי לשאול אישור לפני הדחיפה
 * אפשר להריץ כמה פעמים. ההגשה האחרונה היא זו שנספרת.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
const { execFileSync, spawn } = require('child_process');

const ROOT = __dirname;
const argv = process.argv.slice(2);
const has = function (f) { return argv.indexOf(f) !== -1; };
const SPEED_ENV = 1;

function git(args, extra) {
  return execFileSync('git', args, Object.assign({ cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }, extra || {})).trim();
}
function fail(msg) { console.error('\n✖ ' + msg + '\n'); process.exit(1); }
function ask(q) {
  return new Promise(function (resolve) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(q, function (a) { rl.close(); resolve(a.trim()); });
  });
}

try { git(['rev-parse', '--is-inside-work-tree']); } catch (e) { fail('Run this inside the exercise repository.'); }
const GIT_DIR = path.resolve(ROOT, git(['rev-parse', '--git-common-dir']));
const STATE_FILE = path.join(GIT_DIR, 'drill-state.json');

let state;
try { state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); }
catch (e) { fail('No exercise state found. Did you run "node start.js"?'); }

let payload;
try { payload = JSON.parse(Buffer.from(fs.readFileSync(path.join(ROOT, '.drill', 'drill.dat'), 'utf8'), 'base64').toString('utf8')); }
catch (e) { fail('Cannot read .drill/drill.dat'); }

const mod = { exports: {} };
new Function('module', 'exports', 'require', payload.checksSrc)(mod, mod.exports, require);

// ---------- בדיקה ----------
const result = mod.exports.grade({
  repo: ROOT,
  refs: { main: 'refs/heads/main', tag: 'refs/tags/v1.1', review: 'refs/heads/review/noa-refund', base: 'refs/remotes/origin/main' },
  monitor: { worktrees: state.worktrees || {}, maxConcurrent: state.maxConcurrent || 0 }
});

const finishedAt = Date.now();
const speed = Number(state.speed) || SPEED_ENV;
const elapsedMin = Math.round((finishedAt - state.startedAt) * speed / 600) / 100;
const report = {
  version: 1, id: state.id, startedAt: state.startedAt, finishedAt: finishedAt,
  elapsedMin: elapsedMin, overtime: elapsedMin > payload.durationMin + 0.5,
  score: result.score, max: result.max, items: result.items,
  monitor: { worktrees: state.worktrees || {}, maxConcurrent: state.maxConcurrent || 0 },
  hintsUsed: state.hints || [], alertsFired: Object.keys(state.fired || {}).map(Number)
};

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
const GROUPS = { feature: 'פיצ\'ר: מכירה מוקדמת', hotfix: 'שחזור: באג ₪0', waitlist: 'רשימת המתנה', conflict: 'מיזוג והתנגשות', review: 'סקירת קוד', cherry: 'cherry-pick', security: 'דליפת מפתח', release: 'גרסה ו-Worktrees', quality: 'איכות הקומיטים', general: 'כללי' };

function reportHtml() {
  const byGroup = {};
  result.items.forEach(function (i) { (byGroup[i.group] = byGroup[i.group] || []).push(i); });
  const rows = Object.keys(byGroup).map(function (g) {
    const its = byGroup[g];
    const got = its.reduce(function (s, i) { return s + i.got; }, 0), pts = its.reduce(function (s, i) { return s + i.pts; }, 0);
    return '<h3>' + esc(GROUPS[g] || g) + ' <span>' + got + '/' + pts + '</span></h3><ul>' + its.map(function (i) {
      return '<li class="' + (i.ok ? 'ok' : (i.got > 0 ? 'part' : 'no')) + '"><b>' + (i.ok ? '✓' : (i.got > 0 ? '◐' : '✗')) + '</b> ' + esc(i.he) +
        ' <em>(' + i.got + '/' + i.pts + ')</em>' + (i.note ? '<small> · ' + esc(i.note) + '</small>' : '') + '</li>';
    }).join('') + '</ul>';
  }).join('');
  return '<!DOCTYPE html><html lang="he" dir="rtl"><head><meta charset="UTF-8"><title>דוח הגשה – ' + esc(state.id) + '</title><style>' +
    'body{font-family:"Segoe UI",Arial,sans-serif;background:#0b0e1a;color:#eef0ff;max-width:760px;margin:30px auto;padding:0 16px}' +
    '.score{font-size:3.4rem;font-weight:800;color:#34d399}.meta{color:#8f97c2}h3{margin:22px 0 6px;border-bottom:1px solid #262d57;padding-bottom:4px}' +
    'h3 span{float:left;color:#8f97c2;font-weight:400}ul{list-style:none;padding:0;margin:0}li{padding:4px 0}li.ok b{color:#34d399}li.part b{color:#facc15}li.no b{color:#ff5c6c}' +
    'small,em{color:#8f97c2;font-style:normal}</style></head><body><div class="meta">' + esc(state.id) + ' · ' + elapsedMin + ' דקות' + (report.overtime ? ' (חריגה מהזמן)' : '') + '</div>' +
    '<div class="score">' + result.score + '<small>/' + result.max + '</small></div>' + rows + '</body></html>';
}

// ---------- הדפסה לטרמינל ----------
console.log('\n=== TicketRush – result for ' + state.id + ' ===');
result.items.forEach(function (i) {
  const mark = i.ok ? '[ ok ]' : (i.got > 0 ? '[part]' : '[ -- ]');
  console.log(mark + ' ' + i.id + '  ' + i.en + '  (' + i.got + '/' + i.pts + ')' + (i.note ? '  – ' + i.note : ''));
});
console.log('\nSCORE: ' + result.score + ' / ' + result.max + '    time: ' + elapsedMin + ' min' + (report.overtime ? ' (overtime)' : ''));
console.log('Worktrees detected: ' + Object.keys(state.worktrees || {}).length + '   hints used: ' + (state.hints || []).length);

try {
  fs.writeFileSync(path.join(GIT_DIR, 'drill-report.html'), reportHtml());
  fs.writeFileSync(path.join(GIT_DIR, 'drill-result.json'), JSON.stringify(report, null, 2));
} catch (e) { /* ignore */ }

// ---------- דחיפה ----------
function makeProofText() {
  const parts = [];
  const run = function (title, args) { let o = ''; try { o = git(args); } catch (e) { o = '(failed)'; } parts.push('### ' + title + '\n' + o + '\n'); };
  run('git worktree list', ['worktree', 'list']);
  run('git branch -a -vv', ['branch', '-a', '-vv']);
  run('git log --graph --oneline --all -n 80', ['log', '--graph', '--oneline', '--decorate', '--all', '-n', '80']);
  return parts.join('\n');
}

function commitResultBranch() {
  const env = Object.assign({}, process.env, {
    GIT_AUTHOR_NAME: state.id, GIT_AUTHOR_EMAIL: state.id + '@students.invalid',
    GIT_COMMITTER_NAME: state.id, GIT_COMMITTER_EMAIL: state.id + '@students.invalid'
  });
  const files = { 'result.json': JSON.stringify(report, null, 2), 'report.html': reportHtml(), 'proof.txt': makeProofText() };
  const lines = Object.keys(files).map(function (f) {
    const sha = git(['hash-object', '-w', '--stdin'], { input: files[f], env: env });
    return '100644 blob ' + sha + '\t' + f;
  }).join('\n') + '\n';
  const tree = git(['mktree'], { input: lines, env: env });
  return git(['commit-tree', tree, '-m', 'result ' + state.id + ' ' + result.score + '/' + result.max], { env: env });
}

async function push() {
  if (has('--no-push')) { console.log('\n(skipping push: --no-push)'); return; }
  const id = state.id;
  if (!has('--yes')) {
    const a = (await ask('\nPush your work to origin as "' + id + '/*" ? [Y/n] ')).toLowerCase();
    if (a === 'n' || a === 'no') { console.log('Not pushed. Run again with --yes when ready.'); return; }
  }
  const specs = [];
  git(['for-each-ref', '--format=%(refname:short)', 'refs/heads']).split('\n').filter(Boolean).forEach(function (b) {
    if (/^(dana|noa|ruth)\//.test(b)) return;           // ענפי העמיתות אינם חלק מההגשה
    specs.push('+refs/heads/' + b + ':refs/heads/' + id + '/' + b);
  });
  ['v1.1', 'v1.0.1'].forEach(function (t) {
    try { git(['rev-parse', '--verify', '--quiet', 'refs/tags/' + t]); specs.push('+refs/tags/' + t + ':refs/tags/' + id + '/' + t); } catch (e) { /* no such tag */ }
  });
  const resultSha = commitResultBranch();
  specs.push('+' + resultSha + ':refs/heads/' + id + '/result');
  try {
    const out = execFileSync('git', ['push', 'origin'].concat(specs), { cwd: ROOT, encoding: 'utf8', stdio: ['inherit', 'pipe', 'pipe'] });
    if (out) console.log(out.trim());
    console.log('\n✔ Submitted. Branches were pushed under "' + id + '/".');
  } catch (e) {
    console.error('\n✖ Push failed: ' + String(e.stderr || e.message).split('\n').slice(0, 6).join('\n'));
    console.error('Your score above is saved. Tell your instructor, or check you have write access to the repository, then run: node finish.js');
    process.exitCode = 2;
  }
}

(async function () {
  await push();
  if (!has('--no-open')) {
    const f = path.join(GIT_DIR, 'drill-report.html');
    try {
      if (process.platform === 'win32') require('child_process').exec('start "" "' + f + '"');
      else { const p = spawn(process.platform === 'darwin' ? 'open' : 'xdg-open', [f], { stdio: 'ignore', detached: true }); p.on('error', function () {}); p.unref(); }
    } catch (e) { /* ignore */ }
  }
})();
