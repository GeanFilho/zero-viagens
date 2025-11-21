import { State } from './state.js';

export const PRAYER_STATUS = {
  PENDING: 'pending',
  WAITING: 'waiting',
  ANSWERED: 'answered',
};

const nextId = () => crypto.randomUUID();

export function listPrayers(filter = 'all') {
  const all = State.data.prayers ?? [];
  if (filter === 'all') return all;
  return all.filter((p) => p.status === filter);
}

export function createPrayer(payload) {
  const prayer = {
    id: nextId(),
    title: payload.title,
    body: payload.body,
    tags: payload.tags ?? [],
    status: PRAYER_STATUS.PENDING,
    createdAt: new Date().toISOString(),
  };
  State.commit((draft) => {
    draft.prayers = [prayer, ...draft.prayers];
  });
  return prayer;
}

export function cycleStatus(id) {
  const order = [PRAYER_STATUS.PENDING, PRAYER_STATUS.WAITING, PRAYER_STATUS.ANSWERED];
  State.commit((draft) => {
    draft.prayers = draft.prayers.map((p) => {
      if (p.id !== id) return p;
      const nextIndex = (order.indexOf(p.status) + 1) % order.length;
      return { ...p, status: order[nextIndex] };
    });
  });
}

export function removePrayer(id) {
  State.commit((draft) => {
    draft.prayers = draft.prayers.filter((p) => p.id !== id);
  });
}
