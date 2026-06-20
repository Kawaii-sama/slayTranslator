// ─── Language Data ────────────────────────────────────────────────────────────
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

// BCP-47 codes for Web Speech API
const SPEECH_LANG_MAP = {
  auto: 'en-US', en: 'en-US',    es: 'es-ES',  fr: 'fr-FR',
  de:   'de-DE', it: 'it-IT',    pt: 'pt-PT',  ru: 'ru-RU',
  ja:   'ja-JP', zh: 'zh-CN',    ko: 'ko-KR',  ar: 'ar-SA',
  hi:   'hi-IN', tr: 'tr-TR',    pl: 'pl-PL',  nl: 'nl-NL',
  sv:   'sv-SE', da: 'da-DK',    fi: 'fi-FI',  no: 'nb-NO',
  uk:   'uk-UA', cs: 'cs-CZ',    sk: 'sk-SK',  ro: 'ro-RO',
  hu:   'hu-HU', el: 'el-GR',    he: 'iw-IL',  th: 'th-TH',
  vi:   'vi-VN', id: 'id-ID',    ms: 'ms-MY',  bn: 'bn-BD',
  fa:   'fa-IR', ur: 'ur-PK',    ta: 'ta-IN',  te: 'te-IN',
  mr:   'mr-IN',
};

const QUICK_PHRASES = [
  'Hello, how are you?',
  'I love you ♡',
  'Thank you very much',
  'Where is the nearest café?',
  'You are beautiful',
  'Good morning!',
  'I need help',
  'What is your name?',
];

const MAX_CHARS = 1000;

// ─── State ────────────────────────────────────────────────────────────────────
let sourceLang    = 'en';
let targetLang    = 'es';
let debounceTimer = null;
let history       = JSON.parse(localStorage.getItem('lingo-history') || '[]');
let currentTheme  = localStorage.getItem('lingo-theme') || 'light';

// Voice
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition   = null;
let isRecording   = false;

// ─── DOM Refs ─────────────────────────────────────────────────────────────────
const $  = id => document.getElementById(id);
const sourceSelect   = $('source-select');
const targetSelect   = $('target-select');
const sourceFlagEl   = $('source-flag');
const targetFlagEl   = $('target-flag');
const swapBtn        = $('swap-btn');
const sourceTextarea = $('source-text');
const targetTextarea = $('target-text');
const charCount      = $('char-count');
const clearSourceBtn = $('clear-source-btn');
const copySrcBtn     = $('copy-src-btn');
const copyTgtBtn     = $('copy-tgt-btn');
const translateBtn   = $('translate-btn');
const statusPill     = $('status-pill');
const statusDot      = $('status-dot');
const statusText     = $('status-text');
const historyList    = $('history-list');
const clearHistoryBtn= $('clear-history-btn');
const toastContainer = $('toast-container');
const themeToggle    = $('theme-toggle');
const micBtn         = $('mic-btn');

// ─── Init ─────────────────────────────────────────────────────────────────────
function init() {
  initTheme();
  populateSelects();
  renderQuickPhrases();
  renderHistory();
  updateFlags();
  setStatus('idle', 'Ready to translate');
  initVoice();

  sourceSelect.addEventListener('change', onSourceLangChange);
  targetSelect.addEventListener('change', onTargetLangChange);
  swapBtn.addEventListener('click', swapLanguages);

  sourceTextarea.addEventListener('input', onSourceInput);
  clearSourceBtn.addEventListener('click', clearSource);
  copySrcBtn.addEventListener('click', () => copyText(sourceTextarea.value, '✿ Source text copied!'));
  copyTgtBtn.addEventListener('click', () => copyText(targetTextarea.value, '♡ Translation copied!'));
  translateBtn.addEventListener('click', () => doTranslate(sourceTextarea.value));
  clearHistoryBtn.addEventListener('click', clearHistory);
}

// ─── Theme ────────────────────────────────────────────────────────────────────
function initTheme() {
  applyTheme(currentTheme);
  themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
    localStorage.setItem('lingo-theme', currentTheme);
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

// ─── Voice / Speech Recognition ───────────────────────────────────────────────
function initVoice() {
  if (!SpeechRecognition) {
    micBtn.title = 'Voice input not supported in this browser';
    micBtn.style.opacity = '0.4';
    micBtn.style.cursor  = 'not-allowed';
    micBtn.disabled      = true;
    return;
  }
  micBtn.addEventListener('click', toggleRecording);
}

function toggleRecording() {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
}

function startRecording() {
  // Always create a fresh instance
  recognition = new SpeechRecognition();
  recognition.lang            = SPEECH_LANG_MAP[sourceLang] || 'en-US';
  recognition.continuous      = false;
  recognition.interimResults  = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    isRecording = true;
    micBtn.classList.add('recording');
    micBtn.title = 'Click to stop listening';
    setStatus('loading', '🎙 Listening…');
    sourceTextarea.classList.add('listening');
  };

  recognition.onresult = (event) => {
    let interimTranscript  = '';
    let finalTranscript    = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const text = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += text;
      } else {
        interimTranscript += text;
      }
    }

    // Show interim live, final on commit
    sourceTextarea.value = finalTranscript || interimTranscript;
    updateCharCount();

    if (finalTranscript) {
      sourceTextarea.classList.remove('listening');
      scheduleTranslate();
    }
  };

  recognition.onend = () => {
    isRecording = false;
    micBtn.classList.remove('recording');
    micBtn.title = 'Voice input';
    sourceTextarea.classList.remove('listening');
    if (statusText.textContent.includes('Listening')) {
      setStatus('idle', 'Ready to translate');
    }
  };

  recognition.onerror = (event) => {
    isRecording = false;
    micBtn.classList.remove('recording');
    micBtn.title = 'Voice input';
    sourceTextarea.classList.remove('listening');

    const messages = {
      'not-allowed'  : '❌ Microphone access denied.',
      'no-speech'    : '🤫 No speech detected. Try again!',
      'network'      : '❌ Network error during voice input.',
      'audio-capture': '❌ No microphone found.',
    };
    showToast(messages[event.error] || `❌ Voice error: ${event.error}`, 'error');
    setStatus('error', 'Voice error');
  };

  recognition.start();
}

function stopRecording() {
  if (recognition) {
    recognition.stop();
  }
}

// ─── Selects ─────────────────────────────────────────────────────────────────
function populateSelects() {
  LANGUAGES.forEach(lang => {
    const opt = document.createElement('option');
    opt.value       = lang.code;
    opt.textContent = `${lang.flag}  ${lang.name}`;
    if (lang.code === sourceLang) opt.selected = true;
    sourceSelect.appendChild(opt);
  });

  LANGUAGES.filter(l => l.code !== 'auto').forEach(lang => {
    const opt = document.createElement('option');
    opt.value       = lang.code;
    opt.textContent = `${lang.flag}  ${lang.name}`;
    if (lang.code === targetLang) opt.selected = true;
    targetSelect.appendChild(opt);
  });
}

// ─── Language Events ──────────────────────────────────────────────────────────
function onSourceLangChange() {
  sourceLang = sourceSelect.value;
  updateFlags();
  // Update recognition lang if actively recording
  if (recognition && isRecording) {
    stopRecording();
    showToast('♡ Language changed — tap mic to listen again', 'success');
  }
  if (sourceTextarea.value.trim()) scheduleTranslate();
}

function onTargetLangChange() {
  targetLang = targetSelect.value;
  updateFlags();
  if (sourceTextarea.value.trim()) scheduleTranslate();
}

function swapLanguages() {
  if (sourceLang === 'auto') {
    showToast('✦ Cannot swap "Detect Language"', 'error');
    return;
  }

  [sourceLang, targetLang] = [targetLang, sourceLang];
  sourceSelect.value = sourceLang;
  targetSelect.value = targetLang;
  updateFlags();

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

// ─── Input ────────────────────────────────────────────────────────────────────
function onSourceInput() {
  updateCharCount();
  const val = sourceTextarea.value;
  if (val.length > MAX_CHARS) {
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

function updateCharCount() {
  const len = sourceTextarea.value.length;
  charCount.textContent = `${len} / ${MAX_CHARS}`;
  charCount.className   = 'char-count';
  if (len > MAX_CHARS * 0.8) charCount.classList.add('warn');
  if (len > MAX_CHARS)       charCount.classList.add('over');
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
  charCount.className   = 'char-count';
  if (isRecording) stopRecording();
  setStatus('idle', 'Ready to translate');
}

// ─── Translation ──────────────────────────────────────────────────────────────
async function doTranslate(text) {
  if (!text.trim()) return;

  setStatus('loading', 'Translating…');
  translateBtn.disabled = true;
  translateBtn.classList.add('loading');

  const pair = `${sourceLang === 'auto' ? 'autodetect' : sourceLang}|${targetLang}`;
  const url  = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${pair}`;

  try {
    const res  = await fetch(url);
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();

    if (data.responseStatus === 200) {
      const translated = data.responseData.translatedText;
      targetTextarea.value = translated;
      setStatus('ready', 'Translation complete ♡');
      addToHistory(text, translated);
    } else {
      throw new Error(data.responseDetails || 'Translation failed');
    }
  } catch (err) {
    console.error(err);
    setStatus('error', 'Translation failed');
    showToast('❌ Translation failed. Check your connection.', 'error');
    targetTextarea.value = '';
  } finally {
    translateBtn.disabled = false;
    translateBtn.classList.remove('loading');
  }
}

// ─── Status ───────────────────────────────────────────────────────────────────
function setStatus(state, message) {
  statusPill.className = `status-pill ${state === 'idle' ? '' : state}`.trim();
  statusText.textContent = message;
}

// ─── Copy ─────────────────────────────────────────────────────────────────────
async function copyText(text, msg) {
  if (!text.trim()) return;
  try {
    await navigator.clipboard.writeText(text);
    showToast(msg, 'success');
  } catch {
    showToast('❌ Could not copy', 'error');
  }
}

// ─── History ──────────────────────────────────────────────────────────────────
function addToHistory(source, target) {
  if (history.length > 0 && history[0].source === source) return;
  const srcObj = LANGUAGES.find(l => l.code === sourceLang) || {};
  const tgtObj = LANGUAGES.find(l => l.code === targetLang) || {};
  history.unshift({ source, target, srcLang: sourceLang, tgtLang: targetLang, srcFlag: srcObj.flag, tgtFlag: tgtObj.flag, ts: Date.now() });
  if (history.length > 8) history.pop();
  localStorage.setItem('lingo-history', JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = '';

  if (history.length === 0) {
    historyList.innerHTML = `<div class="history-empty">Your translations will appear here ♡</div>`;
    return;
  }

  history.forEach((item, idx) => {
    const el = document.createElement('div');
    el.className = 'history-item';
    el.style.animationDelay = `${idx * 35}ms`;
    el.innerHTML = `
      <span class="history-text source">${truncate(item.source, 50)}</span>
      <span class="history-arrow">
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
        </svg>
      </span>
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
      updateCharCount();
      setStatus('ready', 'Translation complete ♡');
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
  const grid = $('phrases-grid');
  QUICK_PHRASES.forEach(phrase => {
    const chip = document.createElement('button');
    chip.className   = 'phrase-chip';
    chip.textContent = phrase;
    chip.addEventListener('click', () => {
      sourceTextarea.value = phrase;
      updateCharCount();
      scheduleTranslate();
    });
    grid.appendChild(chip);
  });
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className   = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast--out');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, 3200);
}

// ─── Run ──────────────────────────────────────────────────────────────────────
init();
