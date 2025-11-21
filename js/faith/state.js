const STORAGE_KEY = 'faith-app-state';
const defaultState = {
  prayers: [],
  highlights: {},
  favorites: {},
  lastReading: null,
  streak: { count: 0, lastDate: null, badges: [] },
  notifications: { prayerReminder: false, reminderHour: '07:00', verseAlert: true },
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    return { ...structuredClone(defaultState), ...JSON.parse(raw) };
  } catch (err) {
    console.warn('Erro ao carregar estado', err);
    return structuredClone(defaultState);
  }
}

function saveState(next) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (err) {
    console.warn('Erro ao salvar estado', err);
  }
}

export const State = {
  data: loadState(),
  commit(mutator) {
    mutator(this.data);
    saveState(this.data);
    return this.data;
  },
};
