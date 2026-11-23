import { characterService, CharacterFilters } from '../services/characterService';

export const resolvers = {
  Query: {
    characters: async (_parent: unknown, args: CharacterFilters) => {
      return characterService.searchCharacters(args);
    },
  },
};
