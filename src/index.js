#!/usr/bin/env node

const { Command } = require('commander');
const ora = require('ora');
const storage = require('./storage');
const { validateStatus, validateRating } = require('./utils');
const {
  displayBanner,
  formatAnimeCard,
  formatAnimeTable,
  displayStatistics,
  displaySuccess,
  displayError,
  displayWarning,
  displayInfo
} = require('./display');
const {
  promptAddAnime,
  promptUpdateAnime,
  confirmAction,
  selectAnimeFromList,
  showMainMenu,
  promptFilterStatus,
  promptSearch
} = require('./prompts');

const program = new Command();

program
  .name('anime-tracker')
  .description('A CLI tool to track your anime watching progress')
  .version('1.0.0')
  .hook('preAction', (thisCommand) => {
    // Display banner only for non-help commands
    const commandName = thisCommand.args[0];
    if (commandName && commandName !== 'help' && !process.argv.includes('--help')) {
      displayBanner();
    }
  });

program
  .command('add')
  .description('Add a new anime to your list (interactive mode)')
  .option('-t, --title <title>', 'Anime title (skip interactive mode)')
  .option('-s, --status <status>', 'Status (watching, completed, plan-to-watch, dropped, on-hold)', 'plan-to-watch')
  .option('-e, --episodes <number>', 'Total number of episodes')
  .option('-c, --current <number>', 'Current episode number', '0')
  .option('-r, --rating <number>', 'Rating (0-10)')
  .option('-n, --notes <text>', 'Notes about the anime')
  .action(async (options) => {
    const spinner = ora('Adding anime...').start();

    try {
      let anime;

      // Interactive mode if no title provided
      if (!options.title) {
        spinner.stop();
        const answers = await promptAddAnime();
        anime = answers;
      } else {
        // CLI mode with arguments
        if (!validateStatus(options.status)) {
          spinner.stop();
          displayError('Invalid status. Use: watching, completed, plan-to-watch, dropped, or on-hold');
          process.exit(1);
        }

        if (options.rating && !validateRating(options.rating)) {
          spinner.stop();
          displayError('Invalid rating. Must be a number between 0 and 10');
          process.exit(1);
        }

        anime = {
          title: options.title,
          status: options.status,
          episodes: options.episodes ? parseInt(options.episodes) : null,
          currentEpisode: parseInt(options.current),
          rating: options.rating ? parseFloat(options.rating) : null,
          notes: options.notes || ''
        };
      }

      const newAnime = storage.addAnime(anime);
      spinner.succeed('Anime added successfully!');
      console.log(formatAnimeCard(newAnime));
    } catch (error) {
      spinner.fail('Failed to add anime');
      displayError(error.message);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List all anime in your tracker')
  .option('-s, --status <status>', 'Filter by status')
  .option('-v, --view <type>', 'View type: table (default) or cards', 'table')
  .action(async (options) => {
    const spinner = ora('Loading anime list...').start();

    try {
      let animeList;

      if (options.status) {
        if (!validateStatus(options.status)) {
          spinner.stop();
          displayError('Invalid status. Use: watching, completed, plan-to-watch, dropped, or on-hold');
          process.exit(1);
        }
        animeList = storage.filterByStatus(options.status);
      } else {
        animeList = storage.getAnimeList();
      }

      spinner.stop();

      if (animeList.length === 0) {
        displayWarning('No anime found in your list.');
        return;
      }

      if (options.view === 'cards') {
        console.log(`\n  Found ${animeList.length} anime:\n`);
        animeList.forEach(anime => {
          console.log(formatAnimeCard(anime));
        });
      } else {
        console.log(formatAnimeTable(animeList));
      }
    } catch (error) {
      spinner.fail('Failed to load anime list');
      displayError(error.message);
      process.exit(1);
    }
  });

program
  .command('search [query]')
  .description('Search for anime by title or notes (interactive if no query)')
  .action(async (query) => {
    try {
      let searchQuery = query;

      if (!searchQuery) {
        searchQuery = await promptSearch();
      }

      const spinner = ora('Searching...').start();
      const results = storage.searchAnime(searchQuery);
      spinner.stop();

      if (results.length === 0) {
        displayWarning(`No anime found matching "${searchQuery}"`);
        return;
      }

      console.log(formatAnimeTable(results));
    } catch (error) {
      displayError(error.message);
      process.exit(1);
    }
  });

program
  .command('update [id]')
  .description('Update an anime entry (interactive mode if no options provided)')
  .option('-t, --title <title>', 'Update title')
  .option('-s, --status <status>', 'Update status')
  .option('-e, --episodes <number>', 'Update total episodes')
  .option('-c, --current <number>', 'Update current episode')
  .option('-r, --rating <number>', 'Update rating (0-10)')
  .option('-n, --notes <text>', 'Update notes')
  .action(async (id, options) => {
    const spinner = ora('Loading...').start();

    try {
      let animeId = id;

      // If no ID provided, let user select from list
      if (!animeId) {
        spinner.stop();
        const animeList = storage.getAnimeList();
        if (animeList.length === 0) {
          displayWarning('No anime in your list yet.');
          return;
        }
        animeId = await selectAnimeFromList(animeList, 'Select anime to update:');
      }

      const anime = storage.getAnimeById(animeId);

      if (!anime) {
        spinner.stop();
        displayError(`Anime with ID ${animeId} not found.`);
        process.exit(1);
      }

      spinner.stop();

      let updates = {};

      // Check if any CLI options provided
      const hasCliOptions = options.title || options.status || options.episodes ||
                           options.current || options.rating || options.notes;

      if (hasCliOptions) {
        // CLI mode with arguments
        if (options.title) updates.title = options.title;
        if (options.status) {
          if (!validateStatus(options.status)) {
            displayError('Invalid status. Use: watching, completed, plan-to-watch, dropped, or on-hold');
            process.exit(1);
          }
          updates.status = options.status;
        }
        if (options.episodes) updates.episodes = parseInt(options.episodes);
        if (options.current) updates.currentEpisode = parseInt(options.current);
        if (options.rating) {
          if (!validateRating(options.rating)) {
            displayError('Invalid rating. Must be a number between 0 and 10');
            process.exit(1);
          }
          updates.rating = parseFloat(options.rating);
        }
        if (options.notes) updates.notes = options.notes;
      } else {
        // Interactive mode
        updates = await promptUpdateAnime(anime);
      }

      const updateSpinner = ora('Updating anime...').start();
      const updatedAnime = storage.updateAnime(animeId, updates);
      updateSpinner.succeed('Anime updated successfully!');
      console.log(formatAnimeCard(updatedAnime));
    } catch (error) {
      spinner.stop();
      displayError(error.message);
      process.exit(1);
    }
  });

program
  .command('delete [id]')
  .description('Delete an anime from your list')
  .option('-f, --force', 'Skip confirmation prompt')
  .action(async (id, options) => {
    const spinner = ora('Loading...').start();

    try {
      let animeId = id;

      // If no ID provided, let user select from list
      if (!animeId) {
        spinner.stop();
        const animeList = storage.getAnimeList();
        if (animeList.length === 0) {
          displayWarning('No anime in your list yet.');
          return;
        }
        animeId = await selectAnimeFromList(animeList, 'Select anime to delete:');
      }

      const anime = storage.getAnimeById(animeId);

      if (!anime) {
        spinner.stop();
        displayError(`Anime with ID ${animeId} not found.`);
        process.exit(1);
      }

      spinner.stop();

      // Confirmation prompt unless --force flag is used
      if (!options.force) {
        const confirmed = await confirmAction(`Are you sure you want to delete "${anime.title}"?`);
        if (!confirmed) {
          displayInfo('Deletion cancelled.');
          return;
        }
      }

      const deleteSpinner = ora('Deleting anime...').start();
      const success = storage.deleteAnime(animeId);

      if (success) {
        deleteSpinner.succeed(`Deleted: ${anime.title}`);
      } else {
        deleteSpinner.fail('Failed to delete anime');
        process.exit(1);
      }
    } catch (error) {
      spinner.stop();
      displayError(error.message);
      process.exit(1);
    }
  });

program
  .command('stats')
  .description('Show statistics about your anime list')
  .action(() => {
    const spinner = ora('Calculating statistics...').start();

    try {
      const animeList = storage.getAnimeList();
      spinner.stop();

      displayStatistics(animeList);
    } catch (error) {
      spinner.stop();
      displayError(error.message);
      process.exit(1);
    }
  });

// Interactive mode command
program
  .command('interactive')
  .alias('i')
  .description('Run in interactive mode')
  .action(async () => {
    displayBanner();

    let running = true;

    while (running) {
      try {
        const action = await showMainMenu();

        switch (action) {
          case 'add':
            {
              const spinner = ora('Adding anime...').start();
              spinner.stop();
              const answers = await promptAddAnime();
              const addSpinner = ora('Saving...').start();
              const newAnime = storage.addAnime(answers);
              addSpinner.succeed('Anime added successfully!');
              console.log(formatAnimeCard(newAnime));
            }
            break;

          case 'list':
            {
              const status = await promptFilterStatus();
              const spinner = ora('Loading anime list...').start();
              let animeList;
              if (status) {
                animeList = storage.filterByStatus(status);
              } else {
                animeList = storage.getAnimeList();
              }
              spinner.stop();

              if (animeList.length === 0) {
                displayWarning('No anime found.');
              } else {
                console.log(formatAnimeTable(animeList));
              }
            }
            break;

          case 'search':
            {
              const query = await promptSearch();
              const spinner = ora('Searching...').start();
              const results = storage.searchAnime(query);
              spinner.stop();

              if (results.length === 0) {
                displayWarning(`No anime found matching "${query}"`);
              } else {
                console.log(formatAnimeTable(results));
              }
            }
            break;

          case 'update':
            {
              const animeList = storage.getAnimeList();
              if (animeList.length === 0) {
                displayWarning('No anime in your list yet.');
                break;
              }

              const animeId = await selectAnimeFromList(animeList, 'Select anime to update:');
              const anime = storage.getAnimeById(animeId);
              const updates = await promptUpdateAnime(anime);
              const spinner = ora('Updating...').start();
              const updatedAnime = storage.updateAnime(animeId, updates);
              spinner.succeed('Anime updated successfully!');
              console.log(formatAnimeCard(updatedAnime));
            }
            break;

          case 'delete':
            {
              const animeList = storage.getAnimeList();
              if (animeList.length === 0) {
                displayWarning('No anime in your list yet.');
                break;
              }

              const animeId = await selectAnimeFromList(animeList, 'Select anime to delete:');
              const anime = storage.getAnimeById(animeId);
              const confirmed = await confirmAction(`Are you sure you want to delete "${anime.title}"?`);

              if (confirmed) {
                const spinner = ora('Deleting...').start();
                storage.deleteAnime(animeId);
                spinner.succeed(`Deleted: ${anime.title}`);
              } else {
                displayInfo('Deletion cancelled.');
              }
            }
            break;

          case 'stats':
            {
              const spinner = ora('Calculating statistics...').start();
              const animeList = storage.getAnimeList();
              spinner.stop();
              displayStatistics(animeList);
            }
            break;

          case 'exit':
            displayInfo('Goodbye! Happy watching! 📺');
            running = false;
            break;
        }
      } catch (error) {
        if (error.isTtyError) {
          displayError('Interactive mode is not supported in this environment.');
          running = false;
        } else {
          displayError(error.message);
        }
      }
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  displayBanner();
  program.outputHelp();
  console.log('\n  💡 Tip: Run ' + require('chalk').cyan('anime-tracker interactive') + ' or ' + require('chalk').cyan('anime-tracker i') + ' for interactive mode!\n');
}
