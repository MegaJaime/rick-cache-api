import { Op } from 'sequelize';
import { Character, CharacterAttributes } from '../models/character';
import { getCachedCharacters, invalidateCharactersCache, setCachedCharacters } from './cacheService';
import { fetchAllCharacters } from './rickAndMortyApi';

export interface CharacterFilters {
  status?: string | null;
  species?: string | null;
  gender?: string | null;
  name?: string | null;
  origin?: string | null;
}

const cacheExpiration = () => {
  const configured = Number(process.env.CACHE_EXPIRATION);
  return Number.isFinite(configured) && configured > 0 ? configured : 3600;
};

const normalize = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export const characterService = {
  async searchCharacters(filters: CharacterFilters): Promise<CharacterAttributes[]> {
    const normalized: CharacterFilters = {
      status: normalize(filters.status),
      species: normalize(filters.species),
      gender: normalize(filters.gender),
      name: normalize(filters.name),
      origin: normalize(filters.origin),
    };
    const cacheKey = `characters:${JSON.stringify(normalized)}`;

    try {
      const cachedResult = await getCachedCharacters(cacheKey);
      if (cachedResult) {
        return JSON.parse(cachedResult) as CharacterAttributes[];
      }
    } catch (error) {
      console.error('Cache read failed:', error);
    }

    const characters = await Character.findAll({
      where: {
        ...(normalized.status && { status: normalized.status }),
        ...(normalized.species && { species: normalized.species }),
        ...(normalized.gender && { gender: normalized.gender }),
        ...(normalized.name && { name: { [Op.like]: `%${normalized.name}%` } }),
        ...(normalized.origin && { origin: { [Op.like]: `%${normalized.origin}%` } }),
      },
      order: [['id', 'ASC']],
    });

    const records = characters.map((character) => character.get({ plain: true }));

    try {
      await setCachedCharacters(cacheKey, JSON.stringify(records), cacheExpiration());
    } catch (error) {
      console.error('Cache write failed:', error);
    }

    return records;
  },

  async syncFromApi(): Promise<number> {
    const characters = await fetchAllCharacters();

    await Character.bulkCreate(characters, {
      updateOnDuplicate: ['name', 'status', 'species', 'gender', 'origin'],
    });

    try {
      await invalidateCharactersCache();
    } catch (error) {
      console.error('Cache invalidation failed:', error);
    }

    return characters.length;
  },
};
