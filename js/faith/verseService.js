const FALLBACK_VERSES = [
  { text: 'O Senhor é meu pastor; nada me faltará.', ref: 'Salmos 23:1' },
  { text: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito...', ref: 'João 3:16' },
  { text: 'Tudo posso naquele que me fortalece.', ref: 'Filipenses 4:13' },
];

export async function getVerseOfTheDay() {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const response = await fetch(`https://www.abibliadigital.com.br/api/verses/nvi/random`);
    if (!response.ok) throw new Error('Falha ao buscar versículo');
    const data = await response.json();
    return {
      text: `${data.text}`,
      ref: `${data.book.name} ${data.chapter}:${data.number}`,
      date: today,
    };
  } catch (err) {
    const fallback = FALLBACK_VERSES[today.length % FALLBACK_VERSES.length];
    return { ...fallback, date: today, offline: true };
  }
}
