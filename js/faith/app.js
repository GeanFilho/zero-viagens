import { State } from './state.js';
import { getVerseOfTheDay } from './verseService.js';
import { PRAYER_STATUS, createPrayer, cycleStatus, listPrayers, removePrayer } from './prayerService.js';
import { getTodayDevotional, registerStreakCompletion } from './devotionalService.js';
import { listBooks, getChapters, getVerses, search, toggleHighlight, toggleFavorite, setLastReading } from './bibleService.js';
import { el, showToast } from './ui.js';

const tabs = ['home', 'prayers', 'bible', 'devotional', 'settings'];

async function init() {
  wireTabs();
  renderHero();
  await renderVerseCard();
  renderPrayerArea();
  await renderBible();
  renderDevotional();
  renderSettings();
}

function wireTabs() {
  tabs.forEach((tab) => {
    document.querySelectorAll(`[data-tab="${tab}"]`).forEach((btn) => {
      btn.addEventListener('click', () => switchTab(tab));
    });
  });
  switchTab('home');
}

function switchTab(tab) {
  document.querySelectorAll('[data-view]').forEach((panel) => {
    panel.hidden = panel.dataset.view !== tab;
  });
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
}

function renderHero() {
  const streak = State.data.streak;
  document.querySelector('#streakCount').innerText = `${streak.count} dias ativos`;
  const badges = streak.badges?.length ? streak.badges.map((b) => `🏅 ${b}d`).join(' · ') : 'Sem badges ainda';
  document.querySelector('#badgeList').innerText = badges;
}

async function renderVerseCard() {
  const container = document.querySelector('#verseCard');
  container.innerHTML = '<p class="muted">Buscando versículo...</p>';
  const verse = await getVerseOfTheDay();
  const box = el('div', 'verse-box');
  box.append(el('div', 'verse-ref', verse.ref));
  box.append(el('p', '', verse.text));
  if (verse.offline) box.append(el('span', 'small', 'Usando fallback offline.'));
  const actions = el('div', 'actions');
  const copyBtn = el('button', 'btn secondary', 'Copiar');
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(`${verse.text} — ${verse.ref}`);
    showToast('Versículo copiado');
  });
  const shareBtn = el('button', 'btn secondary', 'Compartilhar');
  shareBtn.addEventListener('click', async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Versículo do dia', text: `${verse.text} — ${verse.ref}` });
    }
    showToast('Versículo pronto para compartilhar');
  });
  actions.append(copyBtn, shareBtn);
  box.append(actions);
  container.innerHTML = '';
  container.append(box);
}

function renderPrayerArea() {
  const form = document.querySelector('#prayerForm');
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const data = new FormData(form);
    const title = data.get('title')?.toString().trim();
    const body = data.get('body')?.toString().trim();
    const tags = data.get('tags')?.split(',').map((t) => t.trim()).filter(Boolean) ?? [];
    if (!title || !body) return;
    createPrayer({ title, body, tags });
    form.reset();
    renderPrayerLists();
    showToast('Oração salva no dispositivo');
  });
  document.querySelectorAll('[data-prayer-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-prayer-filter]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderPrayerLists(btn.dataset.prayerFilter);
    });
  });
  renderPrayerLists('all');
}

function renderPrayerLists(filter = 'all') {
  const listNode = document.querySelector('#prayerList');
  const prayers = listPrayers(filter);
  listNode.innerHTML = '';
  if (!prayers.length) {
    listNode.append(el('p', 'empty', 'Nenhuma oração registrada ainda.'));
    return;
  }
  prayers.forEach((p) => {
    const card = el('div', 'list-item');
    const header = el('div', 'status-row');
    header.append(el('strong', '', p.title));
    const badge = el('span', `status ${p.status}`, statusLabel(p.status));
    header.append(badge);
    card.append(header);
    card.append(el('p', 'muted', p.body));
    if (p.tags?.length) card.append(el('div', 'small', `Tags: ${p.tags.join(', ')}`));
    const actions = el('div', 'actions');
    const statusBtn = el('button', 'btn secondary', 'Avançar status');
    statusBtn.addEventListener('click', () => {
      cycleStatus(p.id);
      renderPrayerLists(filter);
    });
    const deleteBtn = el('button', 'btn secondary', 'Excluir');
    deleteBtn.addEventListener('click', () => {
      removePrayer(p.id);
      renderPrayerLists(filter);
    });
    actions.append(statusBtn, deleteBtn);
    card.append(actions);
    listNode.append(card);
  });
}

function statusLabel(status) {
  if (status === PRAYER_STATUS.WAITING) return 'Aguardando resposta';
  if (status === PRAYER_STATUS.ANSWERED) return 'Atendida ✨';
  return 'Registrada';
}

async function renderBible() {
  const books = await listBooks();
  const bookList = document.querySelector('#bookList');
  bookList.innerHTML = '';
  books.forEach((book) => {
    const node = el('button', 'book', book.name);
    node.dataset.abbrev = book.abbrev;
    node.addEventListener('click', () => selectBook(book.abbrev));
    bookList.append(node);
  });
  const last = State.data.lastReading;
  if (last) {
    selectBook(last.bookAbbrev, last.chapter);
  } else {
    selectBook(books[0].abbrev, books[0].chapters[0].number);
  }
  document.querySelector('#bibleSearch').addEventListener('input', handleSearch);
}

async function selectBook(abbrev, chapterNumber) {
  const chapters = await getChapters(abbrev);
  const chapterList = document.querySelector('#chapterList');
  chapterList.innerHTML = '';
  chapters.forEach((c) => {
    const node = el('button', 'chapter', `Capítulo ${c.number}`);
    node.dataset.chapter = c.number;
    node.addEventListener('click', () => selectChapter(abbrev, c.number));
    if (c.number === Number(chapterNumber)) node.classList.add('active');
    chapterList.append(node);
  });
  document.querySelectorAll('.book').forEach((b) => b.classList.toggle('active', b.dataset.abbrev === abbrev));
  await selectChapter(abbrev, chapterNumber ?? chapters[0].number);
}

async function selectChapter(abbrev, chapterNumber) {
  const verses = await getVerses(abbrev, chapterNumber);
  const verseArea = document.querySelector('#verseArea');
  verseArea.innerHTML = '';
  verses.forEach((text, idx) => {
    const key = `${abbrev}-${chapterNumber}-${idx + 1}`;
    const verseNode = el('div', 'verse');
    const meta = el('div', 'verse__meta');
    meta.append(el('strong', '', `${abbrev.toUpperCase()} ${chapterNumber}:${idx + 1}`));
    const actions = el('div', 'verse__actions');
    const highlightBtn = el('button', 'btn secondary', State.data.highlights?.[key] ? 'Remover destaque' : 'Destacar');
    highlightBtn.addEventListener('click', () => {
      toggleHighlight(key);
      selectChapter(abbrev, chapterNumber);
    });
    const favBtn = el('button', 'btn secondary', State.data.favorites?.[key] ? 'Remover favorito' : 'Favoritar');
    favBtn.addEventListener('click', () => {
      toggleFavorite(key, { abbrev, chapter: chapterNumber, number: idx + 1, text });
      selectChapter(abbrev, chapterNumber);
    });
    actions.append(highlightBtn, favBtn);
    meta.append(actions);
    verseNode.append(meta);
    verseNode.append(el('p', '', text));
    if (State.data.highlights?.[key]) verseNode.style.borderColor = 'rgba(124,58,237,.7)';
    verseArea.append(verseNode);
  });
  setLastReading(abbrev, chapterNumber);
}

async function handleSearch(ev) {
  const query = ev.target.value;
  const results = await search(query);
  const target = document.querySelector('#searchResults');
  target.innerHTML = '';
  if (!results.length) {
    target.append(el('p', 'empty', 'Nenhum resultado para a busca.'));
    return;
  }
  results.forEach((r) => {
    const item = el('div', 'verse');
    item.append(el('strong', '', `${r.book} ${r.chapter}:${r.number}`));
    item.append(el('p', '', r.text));
    const jump = el('button', 'btn secondary', 'Ler no contexto');
    jump.addEventListener('click', () => selectBook(r.abbrev, r.chapter));
    item.append(jump);
    target.append(item);
  });
}

function renderDevotional() {
  const devo = getTodayDevotional();
  document.querySelector('#devoTitle').innerText = devo.title;
  document.querySelector('#devoVerse').innerText = devo.verse;
  document.querySelector('#devoBody').innerText = devo.body;
  document.querySelector('#devoPrayer').innerText = devo.prayer;
  document.querySelector('#completeDevo').addEventListener('click', () => {
    registerStreakCompletion();
    renderHero();
    showToast('Devocional concluído! Streak atualizado.');
  });
}

function renderSettings() {
  const notifToggle = document.querySelector('#prayerReminder');
  const notifHour = document.querySelector('#reminderHour');
  const verseToggle = document.querySelector('#verseAlert');
  notifToggle.checked = State.data.notifications.prayerReminder;
  notifHour.value = State.data.notifications.reminderHour;
  verseToggle.checked = State.data.notifications.verseAlert;

  notifToggle.addEventListener('change', (ev) => {
    State.commit((draft) => { draft.notifications.prayerReminder = ev.target.checked; });
    showToast(ev.target.checked ? 'Lembrete diário ativado' : 'Lembrete desativado');
  });
  notifHour.addEventListener('change', (ev) => {
    State.commit((draft) => { draft.notifications.reminderHour = ev.target.value; });
    showToast('Horário atualizado');
  });
  verseToggle.addEventListener('change', (ev) => {
    State.commit((draft) => { draft.notifications.verseAlert = ev.target.checked; });
  });
}

document.addEventListener('DOMContentLoaded', init);
