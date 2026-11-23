export interface RickAndMortyCharacter {
  id: number;
  name: string;
  status: string;
  species: string;
  gender: string;
  origin: string;
}

interface CharacterPage {
  info?: {
    next?: string | null;
    pages?: number;
  };
  results?: Array<{
    id: number;
    name: string;
    status: string;
    species: string;
    gender: string;
    origin?: {
      name?: string;
    };
  }>;
}

const API_URL = 'https://rickandmortyapi.com/api/character';
const PAGE_DELAY_MS = 400;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchPage = async (url: string): Promise<CharacterPage> => {
  let waitMs = 1500;

  for (let attempt = 1; attempt <= 8; attempt += 1) {
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (response.ok) {
      return (await response.json()) as CharacterPage;
    }

    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt === 8) {
      throw new Error(`Rick and Morty API responded with ${response.status} for ${url}`);
    }

    const retryAfterSeconds = Number(response.headers.get('retry-after'));
    const delay = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0 ? retryAfterSeconds * 1000 : waitMs;
    console.warn(`Rick and Morty API ${response.status} for ${url}. Waiting ${delay}ms (attempt ${attempt}/8).`);
    await sleep(delay);
    waitMs = Math.min(waitMs * 2, 20000);
  }

  throw new Error(`Rick and Morty API failed after retries for ${url}`);
};

export const fetchAllCharacters = async (): Promise<RickAndMortyCharacter[]> => {
  const characters: RickAndMortyCharacter[] = [];
  const seenUrls = new Set<string>();
  let nextUrl: string | null = API_URL;
  let pages = 0;

  while (nextUrl && !seenUrls.has(nextUrl) && pages < 100) {
    seenUrls.add(nextUrl);
    pages += 1;

    const page = await fetchPage(nextUrl);
    const totalPages = page.info?.pages;
    console.log(`Fetched character page ${pages}${totalPages ? `/${totalPages}` : ''}`);

    for (const character of page.results ?? []) {
      characters.push({
        id: character.id,
        name: character.name,
        status: character.status,
        species: character.species,
        gender: character.gender,
        origin: character.origin?.name || 'unknown',
      });
    }

    nextUrl = page.info?.next ?? null;
    if (nextUrl) {
      await sleep(PAGE_DELAY_MS);
    }
  }

  if (characters.length === 0) {
    throw new Error('Rick and Morty API returned no characters');
  }

  return characters;
};
