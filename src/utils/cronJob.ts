import cron from 'node-cron';
import { characterService } from '../services/characterService';

export const startCronJob = () => {
  cron.schedule('0 */12 * * *', async () => {
    console.log('Running cron job to update characters...');
    try {
      const count = await characterService.syncFromApi();
      console.log(`Characters updated successfully (${count}).`);
    } catch (error) {
      console.error('Error updating characters:', error);
    }
  });
};

export const runCronJobManually = async () => {
  console.log('Running cron job manually...');
  const count = await characterService.syncFromApi();
  console.log(`Characters updated successfully (manual execution, ${count}).`);
  return count;
};
