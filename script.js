// ─── Language Data ───────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'auto', name: 'Detect Language', flag: '🌐' },
  { code: 'en',   name: 'English',          flag: '🇬🇧' },
  { code: 'es',   name: 'Spanish',          flag: '🇪🇸' },
  { code: 'fr',   name: 'French',           flag: '🇫🇷' },
  { code: 'de',   name: 'German',           flag: '🇩🇪' },
  { code: 'it',   name: 'Italian',          flag: '🇮🇹' },
  { code: 'pt',   name: 'Portuguese',       flag: '🇵🇹' },
  { code: 'ru',   name: 'Russian',          flag: '🇷🇺' },
  { code: 'ja',   name: 'Japanese',         flag: '🇯🇵' },
  { code: 'zh',   name: 'Chinese',          flag: '🇨🇳' },
  { code: 'ko',   name: 'Korean',           flag: '🇰🇷' },
  { code: 'ar',   name: 'Arabic',           flag: '🇸🇦' },
  { code: 'hi',   name: 'Hindi',            flag: '🇮🇳' },
  { code: 'tr',   name: 'Turkish',          flag: '🇹🇷' },
  { code: 'pl',   name: 'Polish',           flag: '🇵🇱' },
  { code: 'nl',   name: 'Dutch',            flag: '🇳🇱' },
  { code: 'sv',   name: 'Swedish',          flag: '🇸🇪' },
  { code: 'da',   name: 'Danish',           flag: '🇩🇰' },
  { code: 'fi',   name: 'Finnish',          flag: '🇫🇮' },
  { code: 'no',   name: 'Norwegian',        flag: '🇳🇴' },
  { code: 'uk',   name: 'Ukrainian',        flag: '🇺🇦' },
  { code: 'cs',   name: 'Czech',            flag: '🇨🇿' },
  { code: 'sk',   name: 'Slovak',           flag: '🇸🇰' },
  { code: 'ro',   name: 'Romanian',         flag: '🇷🇴' },
  { code: 'hu',   name: 'Hungarian',        flag: '🇭🇺' },
  { code: 'el',   name: 'Greek',            flag: '🇬🇷' },
  { code: 'he',   name: 'Hebrew',           flag: '🇮🇱' },
  { code: 'th',   name: 'Thai',             flag: '🇹🇭' },
  { code: 'vi',   name: 'Vietnamese',       flag: '🇻🇳' },
  { code: 'id',   name: 'Indonesian',       flag: '🇮🇩' },
  { code: 'ms',   name: 'Malay',            flag: '🇲🇾' },
  { code: 'bn',   name: 'Bengali',          flag: '🇧🇩' },
  { code: 'fa',   name: 'Persian',          flag: '🇮🇷' },
  { code: 'ur',   name: 'Urdu',             flag: '🇵🇰' },
  { code: 'ta',   name: 'Tamil',            flag: '🇮🇳' },
  { code: 'te',   name: 'Telugu',           flag: '🇮🇳' },
  { code: 'mr',   name: 'Marathi',          flag: '🇮🇳' },
];
const QUICK_PHRASES = [
  'Hello, how are you?',
  'Thank you very much',
  'Where is the nearest hotel?',
  'I love you',
  'Good morning!',
  'I need help',
];
const MAX_CHARS = 1000;
// ─── State ────────────────────────────────────────────────────────────────────
let sourceLang = 'en';
let targetLang = 'es';
let debounceTimer = null;
let history = JSON.parse(localStorage.getItem('lingo-history') || '[]');
// ─── DOM Refs ─────────────────────────────────────────────────────────────────
const sourceSelect    = document.getElementById('source-select');
const targetSelect    = document.getElementById('target-select');
const sourceFlagEl    = document.getElementById('source-flag');
const targetFlagEl    = document.getElementById('target-flag');
const swapBtn         = document.getElementById('swap-btn');
const sourceTextarea  = document.getElementById('source-text');
const targetTextarea  = document.getElementById('target-text');
const charCount       = document.getElementById('char-count');
const clearSourceBtn  = document.getElementById('clear-source-btn');
const copySrcBtn      = document.getElementById('copy-src-btn');
const copyTgtBtn      = document.getElementById('copy-tgt-btn');
const translateBtn    = document.getElementById('translate-btn');
const statusPill      = document.getElementById('status-pill');
const statusDot       = document.getElementById('status-dot');
const statusText      = document.getElementById('status-text');
const historyList     = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const toastContainer  = document.getElementById('toast-container');
// ─── Init ─────────────────────────────────────────────────────────────────────
function init() {
  populateSelects();
  renderQuickPhrases();
  renderHistory();
  updateFlags();
  setStatus('idle', 'Ready to translate');
  sourceSelect.addEventListener('change', onSourceLangChange);
  targetSelect.addEventListener('change', onTargetLangChange);
  swapBtn.addEventListener('click', swapLanguages);
  sourceTextarea.addEventListener('input', onSourceInput);
  clearSourceBtn.addEventListener('click', clearSource);
  copySrcBtn.addEventListener('click', () => copyText(sourceTextarea.value, 'Source text copied!'));
  copyTgtBtn.addEventListener('click', () => copyText(targetTextarea.value, 'Translation copied!'));
  translateBtn.addEventListener('click', () => doTranslate(sourceTextarea.value));
  clearHistoryBtn.addEventListener('click', clearHistory);
}
// ─── Populate Selects ─────────────────────────────────────────────────────────
function populateSelects() {
  // Source: includes "Detect Language"
  LANGUAGES.forEach(lang => {
    const opt = document.createElement('option');
    opt.value = lang.code;
    opt.textContent = `${lang.flag}  ${lang.name}`;
    if (lang.code === sourceLang) opt.selected = true;
    sourceSelect.appendChild(opt);
  });
  // Target: excludes "auto"
  LANGUAGES.filter(l => l.code !== 'auto').forEach(lang => {
    const opt = document.createElement('option');
    opt.value = lang.code;
    opt.textContent = `${lang.flag}  ${lang.name}`;
    if (lang.code === targetLang) opt.selected = true;
    targetSelect.appendChild(opt);
  });
}
// ─── Language Events ──────────────────────────────────────────────────────────
function onSourceLangChange() {
  sourceLang = sourceSelect.value;
  updateFlags();
  if (sourceTextarea.value.trim()) scheduleTranslate();
}
function onTargetLangChange() {
  targetLang = targetSelect.value;
  updateFlags();
  if (sourceTextarea.value.trim()) scheduleTranslate();
}
function swapLanguages() {
  if (sourceLang === 'auto') return showToast('Cannot swap "Detect Language"', 'error');
  // Swap values
  [sourceLang, targetLang] = [targetLang, sourceLang];
  sourceSelect.value = sourceLang;
  targetSelect.value = targetLang;
  updateFlags();
  // Swap text
  const currentTarget = targetTextarea.value;
  if (currentTarget) {
    sourceTextarea.value = currentTarget;
    targetTextarea.value = '';
    onSourceInput();
    scheduleTranslate();
  }
}
function updateFlags() {
  const src = LANGUAGES.find(l => l.code === sourceLang);
  const tgt = LANGUAGES.find(l => l.code === targetLang);
  if (src) sourceFlagEl.textContent = src.flag;
  if (tgt) targetFlagEl.textContent = tgt.flag;
}
// ─── Input Handling ───────────────────────────────────────────────────────────
function onSourceInput() {
  const val = sourceTextarea.value;
  const len = val.length;
  // Update char count
  charCount.textContent = `${len} / ${MAX_CHARS}`;
  charCount.className = 'char-count';
  if (len > MAX_CHARS * 0.8) charCount.classList.add('warn');
  if (len > MAX_CHARS)       charCount.classList.add('over');
  // Truncate if over limit
  if (len > MAX_CHARS) {
    sourceTextarea.value = val.slice(0, MAX_CHARS);
    return;
  }
  if (!val.trim()) {
    targetTextarea.value = '';
    setStatus('idle', 'Ready to translate');
    return;
  }
  scheduleTranslate();
}
function scheduleTranslate() {
  clearTimeout(debounceTimer);
  setStatus('loading', 'Translating…');
  debounceTimer = setTimeout(() => doTranslate(sourceTextarea.value), 700);
}
function clearSource() {
  sourceTextarea.value = '';
  targetTextarea.value = '';
  charCount.textContent = `0 / ${MAX_CHARS}`;
  charCount.className = 'char-count';
  setStatus('idle', 'Ready to translate');
}
// ─── Translation API ──────────────────────────────────────────────────────────
async function doTranslate(text) {
  if (!text.trim()) return;
  setStatus('loading', 'Translating…');
  translateBtn.disabled = true;
  translateBtn.classList.add('loading');
  const langPair = `${sourceLang === 'auto' ? 'autodetect' : sourceLang}|${targetLang}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    if (data.responseStatus === 200) {
      const translated = data.responseData.translatedText;
      targetTextarea.value = translated;
      setStatus('ready', 'Translation complete');
      addToHistory(text, translated, sourceLang, targetLang);
    } else {
      throw new Error(data.responseDetails || 'Translation failed');
    }
  } catch (err) {
    console.error(err);
    setStatus('error', 'Translation failed');
    showToast('⚠️ Translation failed. Check your connection.', 'error');
    targetTextarea.value = '';
  } finally {
    translateBtn.disabled = false;
    translateBtn.classList.remove('loading');
  }
}
// ─── Status ───────────────────────────────────────────────────────────────────
function setStatus(state, message) {
  statusPill.className = `status-pill ${state === 'idle' ? '' : state}`;
  statusText.textContent = message;
}
// ─── Copy ─────────────────────────────────────────────────────────────────────
async function copyText(text, msg) {
  if (!text.trim()) return;
  try {
    await navigator.clipboard.writeText(text);
    showToast('✅ ' + msg, 'success');
  } catch {
    showToast('❌ Could not copy', 'error');
  }
}
// ─── History ──────────────────────────────────────────────────────────────────
function addToHistory(source, target, srcLang, tgtLang) {
  // Avoid duplicate consecutive
  if (history.length > 0 && history[0].source === source) return;
  const srcLangObj = LANGUAGES.find(l => l.code === srcLang) || {};
  const tgtLangObj = LANGUAGES.find(l => l.code === tgtLang) || {};
  history.unshift({ source, target, srcLang, tgtLang, srcFlag: srcLangObj.flag, tgtFlag: tgtLangObj.flag, ts: Date.now() });
  if (history.length > 8) history.pop();
  localStorage.setItem('lingo-history', JSON.stringify(history));
  renderHistory();
}
function renderHistory() {
  historyList.innerHTML = '';
  if (history.length === 0) {
    historyList.innerHTML = `<div class="history-empty">Your recent translations will appear here ✨</div>`;
    return;
  }
  history.forEach((item, idx) => {
    const el = document.createElement('div');
    el.className = 'history-item';
    el.style.animationDelay = `${idx * 40}ms`;
    el.innerHTML = `
      <span class="history-text source">${truncate(item.source, 50)}</span>
      <span class="history-arrow"><svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg></span>
      <span class="history-text target">${truncate(item.target, 50)}</span>
    `;
    el.addEventListener('click', () => {
      sourceTextarea.value = item.source;
      targetTextarea.value = item.target;
      sourceLang = item.srcLang;
      targetLang = item.tgtLang;
      sourceSelect.value = sourceLang;
      targetSelect.value = targetLang;
      updateFlags();
      onSourceInput();
    });
    historyList.appendChild(el);
  });
}
function clearHistory() {
  history = [];
  localStorage.removeItem('lingo-history');
  renderHistory();
  showToast('🗑️ History cleared', 'success');
}
function truncate(str, max) {
  return str.length > max ? str.slice(0, max) + '…' : str;
}
// ─── Quick Phrases ────────────────────────────────────────────────────────────
function renderQuickPhrases() {
  const grid = document.getElementById('phrases-grid');
  QUICK_PHRASES.forEach(phrase => {
    const chip = document.createElement('button');
    chip.className = 'phrase-chip';
    chip.textContent = phrase;
    chip.addEventListener('click', () => {
      sourceTextarea.value = phrase;
      onSourceInput();
      scheduleTranslate();
    });
    grid.appendChild(chip);
  });
}
// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast--out');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, 3000);
}
// ─── Run ──────────────────────────────────────────────────────────────────────
init();
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
/* ─── Reset & Base ─── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg-deep:       #05070f;
  --bg-card:       rgba(255,255,255,0.04);
  --bg-panel:      rgba(255,255,255,0.055);
  --border:        rgba(255,255,255,0.10);
  --border-focus:  rgba(139,92,246,0.6);
  --accent-1:      #8b5cf6;   /* violet */
  --accent-2:      #ec4899;   /* pink   */
  --accent-3:      #06b6d4;   /* cyan   */
  --text-primary:  #f1f5f9;
  --text-secondary:#94a3b8;
  --text-muted:    #475569;
  --success:       #10b981;
  --error:         #f43f5e;
  --radius-lg:     20px;
  --radius-md:     14px;
  --radius-sm:     10px;
  --shadow:        0 25px 60px rgba(0,0,0,0.5);
  --transition:    0.25s cubic-bezier(0.4,0,0.2,1);
}
html { scroll-behavior: smooth; }
body {
  font-family: 'Inter', sans-serif;
  background: var(--bg-deep);
  color: var(--text-primary);
  min-height: 100vh;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}
/* ─── Aurora Background ─── */
.aurora {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
.aurora__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.35;
  animation: drift 20s ease-in-out infinite;
}
.aurora__orb:nth-child(1) {
  width: 600px; height: 600px;
  background: radial-gradient(circle, #7c3aed, transparent 70%);
  top: -200px; left: -100px;
  animation-duration: 22s;
}
.aurora__orb:nth-child(2) {
  width: 500px; height: 500px;
  background: radial-gradient(circle, #0891b2, transparent 70%);
  top: 30%; right: -150px;
  animation-duration: 18s;
  animation-delay: -6s;
}
.aurora__orb:nth-child(3) {
  width: 450px; height: 450px;
  background: radial-gradient(circle, #be185d, transparent 70%);
  bottom: -150px; left: 30%;
  animation-duration: 25s;
  animation-delay: -12s;
}
.aurora__orb:nth-child(4) {
  width: 300px; height: 300px;
  background: radial-gradient(circle, #0d9488, transparent 70%);
  top: 60%; left: 10%;
  animation-duration: 20s;
  animation-delay: -4s;
  opacity: 0.2;
}
@keyframes drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%       { transform: translate(30px, -40px) scale(1.05); }
  66%       { transform: translate(-20px, 30px) scale(0.95); }
}
/* ─── Noise overlay ─── */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 0;
  opacity: 0.5;
}
/* ─── Layout ─── */
.app-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 980px;
  padding: 40px 24px 60px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
/* ─── Header ─── */
.header {
  text-align: center;
  animation: fadeDown 0.6s ease both;
}
.header__logo {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  text-decoration: none;
}
.logo-icon {
  width: 42px; height: 42px;
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 20px;
  box-shadow: 0 0 20px rgba(139,92,246,0.5);
}
.logo-text {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 30%, var(--accent-1));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}
.header__title {
  font-size: clamp(28px, 5vw, 44px);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -1.5px;
  background: linear-gradient(135deg, #fff 0%, #c4b5fd 50%, var(--accent-2) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 10px;
}
.header__subtitle {
  font-size: 15px;
  color: var(--text-secondary);
  font-weight: 400;
}
/* ─── Language Bar ─── */
.lang-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  animation: fadeUp 0.5s 0.1s ease both;
}
.lang-select-wrapper {
  position: relative;
  flex: 1;
  max-width: 300px;
}
.lang-select-wrapper select {
  width: 100%;
  appearance: none;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  padding: 12px 40px 12px 44px;
  cursor: pointer;
  transition: border-color var(--transition), box-shadow var(--transition), background var(--transition);
  outline: none;
  backdrop-filter: blur(12px);
}
.lang-select-wrapper select:focus,
.lang-select-wrapper select:hover {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(139,92,246,0.15), 0 0 20px rgba(139,92,246,0.1);
  background: rgba(255,255,255,0.08);
}
.lang-select-wrapper select option {
  background: #1e1b4b;
  color: var(--text-primary);
}
.lang-flag {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  pointer-events: none;
}
.lang-arrow {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--text-muted);
  display: flex;
}
.lang-arrow svg { width: 14px; height: 14px; }
/* Swap button */
.swap-btn {
  width: 46px; height: 46px;
  border-radius: 50%;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: all var(--transition);
  backdrop-filter: blur(12px);
  flex-shrink: 0;
}
.swap-btn:hover {
  background: rgba(139,92,246,0.2);
  border-color: var(--accent-1);
  color: var(--accent-1);
  transform: rotate(180deg);
  box-shadow: 0 0 20px rgba(139,92,246,0.3);
}
.swap-btn svg { width: 18px; height: 18px; }
/* ─── Main Card ─── */
.translator-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: var(--shadow), 0 0 0 1px rgba(255,255,255,0.02) inset;
  overflow: hidden;
  animation: fadeUp 0.5s 0.2s ease both;
  transition: box-shadow var(--transition);
}
.translator-card:hover {
  box-shadow: var(--shadow), 0 0 60px rgba(139,92,246,0.08), 0 0 0 1px rgba(255,255,255,0.02) inset;
}
/* ─── Panels ─── */
.panels {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  min-height: 280px;
}
.panel {
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 12px;
}
.panel--source { border-right: none; }
.panel--target { border-left: none; }
.panel-divider {
  width: 1px;
  background: var(--border);
  position: relative;
}
.panel-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--text-muted);
}
.panel textarea {
  flex: 1;
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Inter', sans-serif;
  font-size: 17px;
  font-weight: 400;
  line-height: 1.65;
  color: var(--text-primary);
  caret-color: var(--accent-1);
  transition: color var(--transition);
  min-height: 180px;
}
.panel textarea::placeholder { color: var(--text-muted); }
.panel--target textarea {
  color: #c4b5fd;
  cursor: default;
}
/* ─── Panel Footer ─── */
.panel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.char-count {
  font-size: 12px;
  color: var(--text-muted);
  transition: color var(--transition);
}
.char-count.warn { color: #f59e0b; }
.char-count.over { color: var(--error); }
.icon-btn {
  width: 34px; height: 34px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: all var(--transition);
}
.icon-btn:hover {
  background: rgba(255,255,255,0.06);
  border-color: var(--border);
  color: var(--text-primary);
}
.icon-btn:active { transform: scale(0.92); }
.icon-btn svg { width: 16px; height: 16px; }
.icon-btn.copied {
  color: var(--success);
  border-color: var(--success);
  background: rgba(16,185,129,0.1);
}
/* ─── Translate Button Strip ─── */
.action-strip {
  padding: 16px 24px;
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: rgba(0,0,0,0.15);
}
.translate-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 32px;
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  border: none;
  border-radius: 50px;
  color: #fff;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
  box-shadow: 0 4px 20px rgba(139,92,246,0.4);
  position: relative;
  overflow: hidden;
  letter-spacing: 0.3px;
}
.translate-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
  opacity: 0;
  transition: opacity var(--transition);
}
.translate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(139,92,246,0.55);
}
.translate-btn:hover::before { opacity: 1; }
.translate-btn:active {
  transform: translateY(0);
  box-shadow: 0 4px 20px rgba(139,92,246,0.4);
}
.translate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
.translate-btn svg { width: 16px; height: 16px; transition: transform 0.4s; }
.translate-btn.loading svg { animation: spin 1s linear infinite; }
/* Status indicator */
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  padding: 6px 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  border-radius: 50px;
  transition: all var(--transition);
  min-width: 120px;
  justify-content: center;
}
.status-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--text-muted);
  transition: all var(--transition);
  flex-shrink: 0;
}
.status-pill.ready { color: var(--success); border-color: rgba(16,185,129,0.3); }
.status-pill.ready .status-dot { background: var(--success); box-shadow: 0 0 8px var(--success); }
.status-pill.loading { color: var(--accent-1); border-color: rgba(139,92,246,0.3); }
.status-pill.loading .status-dot { background: var(--accent-1); animation: pulse-dot 1s ease infinite; }
.status-pill.error { color: var(--error); border-color: rgba(244,63,94,0.3); }
.status-pill.error .status-dot { background: var(--error); }
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(1.4); }
}
/* ─── Recent History ─── */
.history-section {
  animation: fadeUp 0.5s 0.3s ease both;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
}
.clear-btn {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  background: none;
  border: none;
  cursor: pointer;
  transition: color var(--transition);
  font-family: 'Inter', sans-serif;
}
.clear-btn:hover { color: var(--error); }
.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.history-item {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  cursor: pointer;
  transition: all var(--transition);
  backdrop-filter: blur(12px);
  animation: fadeUp 0.3s ease both;
}
.history-item:hover {
  border-color: rgba(139,92,246,0.4);
  background: rgba(139,92,246,0.08);
  transform: translateX(4px);
}
.history-text { font-size: 13px; line-height: 1.4; }
.history-text.source { color: var(--text-secondary); }
.history-text.target { color: #c4b5fd; text-align: right; }
.history-arrow {
  color: var(--text-muted);
  display: flex;
  flex-shrink: 0;
}
.history-arrow svg { width: 14px; height: 14px; }
.history-empty {
  text-align: center;
  padding: 24px;
  color: var(--text-muted);
  font-size: 13px;
  background: var(--bg-panel);
  border: 1px dashed var(--border);
  border-radius: var(--radius-md);
}
/* ─── Quick Phrases ─── */
.phrases-section {
  animation: fadeUp 0.5s 0.35s ease both;
}
.phrases-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.phrase-chip {
  padding: 8px 16px;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 50px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition);
  backdrop-filter: blur(12px);
  font-family: 'Inter', sans-serif;
}
.phrase-chip:hover {
  background: rgba(139,92,246,0.15);
  border-color: rgba(139,92,246,0.4);
  color: #c4b5fd;
  transform: translateY(-1px);
}
/* ─── Toast ─── */
.toast-container {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}
.toast {
  padding: 12px 22px;
  background: rgba(30,27,75,0.95);
  border: 1px solid var(--border);
  border-radius: 50px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.4);
  animation: toastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  display: flex;
  align-items: center;
  gap: 8px;
}
.toast.success { border-color: rgba(16,185,129,0.4); }
.toast.error   { border-color: rgba(244,63,94,0.4); color: #fda4af; }
.toast--out { animation: toastOut 0.3s ease forwards; }
@keyframes toastIn  { from { opacity: 0; transform: translateY(16px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes toastOut { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(-10px) scale(0.9); } }
/* ─── Footer ─── */
.footer {
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  animation: fadeUp 0.5s 0.4s ease both;
}
.footer a { color: var(--accent-1); text-decoration: none; }
.footer a:hover { text-decoration: underline; }
/* ─── Animations ─── */
@keyframes fadeDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeUp   { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes spin     { to { transform: rotate(360deg); } }
/* ─── Responsive ─── */
@media (max-width: 640px) {
  .panels {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }
  .panel-divider {
    width: 100%;
    height: 1px;
  }
  .panel--target textarea { color: #c4b5fd; }
  .lang-bar { flex-wrap: wrap; }
  .lang-select-wrapper { max-width: 100%; }
  .action-strip { flex-direction: column; }
  .history-item {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    text-align: left;
  }
  .history-text.target { text-align: left; }
  .history-arrow { display: none; }
}
/* ─── Scrollbar ─── */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 100px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
/* Highlight active lang */
.lang-select-wrapper.active select {
  border-color: rgba(139,92,246,0.5);
  box-shadow: 0 0 0 3px rgba(139,92,246,0.12);
}
