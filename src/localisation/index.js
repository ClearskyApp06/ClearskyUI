// @ts-check

/**
 * @param {string} english
 * @param {{ [lang: string]: string}=} languageMap
 */
export function localise(english, languageMap) {
  return english;
}

/**
 * @param {string} word
 * @param {number} num
 */
export function localiseNumberSuffix(word, num) {
  return localise(localiseNumberSuffixEnglish(word, num), {
    uk: localiseNumberSuffixUkrainian(word, num),
  });
}

/**
 * @param {string} word
 * @param {number} num
 */
function localiseNumberSuffixEnglish(word, num) {
  if (num === 1) return word;
  if (enWordPluralisations[word]) return enWordPluralisations[word];
  if (word.endsWith('y')) return word.slice(0, -1) + 'ies';
  if (word.endsWith('s') || word.endsWith('x')) return word + 'es';
  return word + 's';
}

/** @type {Record<string, string | undefined>} */
const enWordPluralisations = {
  fish: 'fish',
  sheep: 'sheep',
  child: 'children',
};

/**
 * @param {string} word
 * @param {number} num
 */
function localiseNumberSuffixUkrainian(word, num) {
  if (num % 10 === 1) return word;
  if (ukWordPluralisations[word]) return ukWordPluralisations[word];
  if (word.endsWith('а') || word.endsWith('я')) return word.slice(0, -1) + 'і';
  return word + 'и';
}

/** @type {Record<string, string | undefined>} */
const ukWordPluralisations = {
  списку: 'списків',
};
