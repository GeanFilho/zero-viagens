import { State } from './state.js';

const DEVOS = [
  {
    title: 'Descansar na promessa',
    verse: 'Salmos 46:1',
    body: 'Em meio ao caos, Deus continua sendo refúgio. Tire um minuto para entregar o peso de hoje nas mãos Dele.',
    prayer: 'Senhor, acalma meu coração e me lembra que Tu estás comigo.',
  },
  {
    title: 'Luz na caminhada',
    verse: 'João 3:16',
    body: 'O amor de Deus transforma nossa forma de ver o mundo. Deixe esse amor guiar suas decisões hoje.',
    prayer: 'Jesus, que eu reflita o Teu amor nas minhas escolhas.',
  },
  {
    title: 'Nova oportunidade',
    verse: 'Gênesis 1:3',
    body: 'A mesma voz que disse “Haja luz” continua falando vida sobre nós. Há espaço para recomeços.',
    prayer: 'Cria em mim um coração renovado e disposto a obedecer.',
  },
];

export function getTodayDevotional() {
  const index = new Date().getDate() % DEVOS.length;
  return DEVOS[index];
}

export function registerStreakCompletion() {
  const today = new Date().toISOString().slice(0, 10);
  State.commit((draft) => {
    if (draft.streak.lastDate === today) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const keptStreak = draft.streak.lastDate === yesterday.toISOString().slice(0, 10);
    draft.streak.count = keptStreak ? draft.streak.count + 1 : 1;
    draft.streak.lastDate = today;
    updateBadges(draft);
  });
}

function updateBadges(draft) {
  const milestones = [7, 30, 100];
  draft.streak.badges = draft.streak.badges || [];
  milestones.forEach((m) => {
    if (draft.streak.count >= m && !draft.streak.badges.includes(m)) {
      draft.streak.badges.push(m);
    }
  });
}
