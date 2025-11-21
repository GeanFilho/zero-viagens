import { State } from './state.js';

let cache;

async function loadBible() {
  if (cache) return cache;
  const response = await fetch('../data/bible-mini.json');
  cache = await response.json();
  return cache;
}

export async function listBooks() {
  const { books } = await loadBible();
  return books;
}

export async function getChapters(bookAbbrev) {
  const { books } = await loadBible();
  const book = books.find((b) => b.abbrev === bookAbbrev);
  return book ? book.chapters : [];
}

export async function getVerses(bookAbbrev, chapterNumber) {
  const chapters = await getChapters(bookAbbrev);
  const chapter = chapters.find((c) => c.number === Number(chapterNumber));
  return chapter ? chapter.verses : [];
}

export async function search(query) {
  const { books } = await loadBible();
  if (!query.trim()) return [];
  const lower = query.toLowerCase();
  const results = [];
  books.forEach((book) => {
    book.chapters.forEach((chapter) => {
      chapter.verses.forEach((verse, index) => {
        if (verse.toLowerCase().includes(lower)) {
          results.push({
            book: book.name,
            abbrev: book.abbrev,
            chapter: chapter.number,
            number: index + 1,
            text: verse,
          });
        }
      });
    });
  });
  return results;
}

export function toggleHighlight(key) {
  State.commit((draft) => {
    if (draft.highlights[key]) {
      delete draft.highlights[key];
    } else {
      draft.highlights[key] = true;
    }
  });
}

export function toggleFavorite(key, verse) {
  State.commit((draft) => {
    if (draft.favorites[key]) {
      delete draft.favorites[key];
    } else {
      draft.favorites[key] = verse;
    }
  });
}

export function setLastReading(bookAbbrev, chapter) {
  State.commit((draft) => {
    draft.lastReading = { bookAbbrev, chapter, savedAt: new Date().toISOString() };
  });
}
