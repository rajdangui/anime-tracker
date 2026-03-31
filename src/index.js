#!/usr/bin/env node

const { Command } = require('commander');
const storage = require('./storage');
const { formatAnime, formatAnimeList, validateStatus, validateRating } = require('./utils');

const program = new Command();

program
  .name('anime-tracker')
  .description('A CLI tool to track your anime watching progress')
  .version('1.0.0');

program
  .command('add <title>')
  .description('Add a new anime to your list')
  .option('-s, --status <status>', 'Status (watching, completed, plan-to-watch, dropped, on-hold)', 'plan-to-watch')
  .option('-e, --episodes <number>', 'Total number of episodes')
  .option('-c, --current <number>', 'Current episode number', '0')
  .option('-r, --rating <number>', 'Rating (0-10)')
  .option('-n, --notes <text>', 'Notes about the anime')
  .action((title, options) => {
    if (!validateStatus(options.status)) {
      console.error('Invalid status. Use: watching, completed, plan-to-watch, dropped, or on-hold');
      process.exit(1);
    }

    if (options.rating && !validateRating(options.rating)) {
      console.error('Invalid rating. Must be a number between 0 and 10');
      process.exit(1);
    }

    const anime = {
      title,
      status: options.status,
      episodes: options.episodes ? parseInt(options.episodes) : null,
      currentEpisode: parseInt(options.current),
      rating: options.rating ? parseFloat(options.rating) : null,
      notes: options.notes || ''
    };

    const newAnime = storage.addAnime(anime);
    console.log('\n✨ Anime added successfully!');
    console.log(formatAnime(newAnime));
  });

program
  .command('list')
  .description('List all anime in your tracker')
  .option('-s, --status <status>', 'Filter by status')
  .action((options) => {
    let animeList;

    if (options.status) {
      if (!validateStatus(options.status)) {
        console.error('Invalid status. Use: watching, completed, plan-to-watch, dropped, or on-hold');
        process.exit(1);
      }
      animeList = storage.filterByStatus(options.status);
    } else {
      animeList = storage.getAnimeList();
    }

    console.log(formatAnimeList(animeList));
  });

program
  .command('search <query>')
  .description('Search for anime by title or notes')
  .action((query) => {
    const results = storage.searchAnime(query);
    console.log(formatAnimeList(results));
  });

program
  .command('update <id>')
  .description('Update an anime entry')
  .option('-t, --title <title>', 'Update title')
  .option('-s, --status <status>', 'Update status')
  .option('-e, --episodes <number>', 'Update total episodes')
  .option('-c, --current <number>', 'Update current episode')
  .option('-r, --rating <number>', 'Update rating (0-10)')
  .option('-n, --notes <text>', 'Update notes')
  .action((id, options) => {
    const anime = storage.getAnimeById(id);

    if (!anime) {
      console.error(`Anime with ID ${id} not found.`);
      process.exit(1);
    }

    const updates = {};

    if (options.title) updates.title = options.title;
    if (options.status) {
      if (!validateStatus(options.status)) {
        console.error('Invalid status. Use: watching, completed, plan-to-watch, dropped, or on-hold');
        process.exit(1);
      }
      updates.status = options.status;
    }
    if (options.episodes) updates.episodes = parseInt(options.episodes);
    if (options.current) updates.currentEpisode = parseInt(options.current);
    if (options.rating) {
      if (!validateRating(options.rating)) {
        console.error('Invalid rating. Must be a number between 0 and 10');
        process.exit(1);
      }
      updates.rating = parseFloat(options.rating);
    }
    if (options.notes) updates.notes = options.notes;

    const updatedAnime = storage.updateAnime(id, updates);
    console.log('\n✨ Anime updated successfully!');
    console.log(formatAnime(updatedAnime));
  });

program
  .command('delete <id>')
  .description('Delete an anime from your list')
  .action((id) => {
    const anime = storage.getAnimeById(id);

    if (!anime) {
      console.error(`Anime with ID ${id} not found.`);
      process.exit(1);
    }

    const success = storage.deleteAnime(id);

    if (success) {
      console.log(`\n🗑️  Deleted: ${anime.title}`);
    } else {
      console.error('Failed to delete anime.');
      process.exit(1);
    }
  });

program
  .command('stats')
  .description('Show statistics about your anime list')
  .action(() => {
    const animeList = storage.getAnimeList();

    if (animeList.length === 0) {
      console.log('No anime in your list yet.');
      return;
    }

    const stats = {
      total: animeList.length,
      watching: animeList.filter(a => a.status === 'watching').length,
      completed: animeList.filter(a => a.status === 'completed').length,
      planToWatch: animeList.filter(a => a.status === 'plan-to-watch').length,
      dropped: animeList.filter(a => a.status === 'dropped').length,
      onHold: animeList.filter(a => a.status === 'on-hold').length
    };

    const rated = animeList.filter(a => a.rating);
    const avgRating = rated.length > 0
      ? (rated.reduce((sum, a) => sum + a.rating, 0) / rated.length).toFixed(2)
      : 'N/A';

    console.log('\n📊 Your Anime Statistics:');
    console.log(`\n  Total Anime: ${stats.total}`);
    console.log(`  📺 Watching: ${stats.watching}`);
    console.log(`  ✅ Completed: ${stats.completed}`);
    console.log(`  📋 Plan to Watch: ${stats.planToWatch}`);
    console.log(`  ⏸️  On Hold: ${stats.onHold}`);
    console.log(`  ❌ Dropped: ${stats.dropped}`);
    console.log(`\n  Average Rating: ${avgRating}`);
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
