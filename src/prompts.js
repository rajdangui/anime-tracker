const inquirer = require('inquirer');
const chalk = require('chalk');
const { validateStatus, validateRating } = require('./utils');

// Interactive add anime prompt
async function promptAddAnime() {
  console.log(chalk.cyan.bold('\n  ✨ Add New Anime\n'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Anime title:',
      validate: (input) => {
        if (!input.trim()) {
          return 'Title is required!';
        }
        return true;
      }
    },
    {
      type: 'list',
      name: 'status',
      message: 'Status:',
      choices: [
        { name: '📋 Plan to Watch', value: 'plan-to-watch' },
        { name: '📺 Watching', value: 'watching' },
        { name: '✅ Completed', value: 'completed' },
        { name: '⏸️  On Hold', value: 'on-hold' },
        { name: '❌ Dropped', value: 'dropped' }
      ],
      default: 'plan-to-watch'
    },
    {
      type: 'input',
      name: 'episodes',
      message: 'Total episodes (leave empty if unknown):',
      filter: (input) => {
        const num = parseInt(input);
        return isNaN(num) ? null : num;
      }
    },
    {
      type: 'input',
      name: 'currentEpisode',
      message: 'Current episode:',
      default: '0',
      validate: (input) => {
        const num = parseInt(input);
        if (isNaN(num) || num < 0) {
          return 'Please enter a valid episode number!';
        }
        return true;
      },
      filter: (input) => parseInt(input)
    },
    {
      type: 'input',
      name: 'rating',
      message: 'Rating (0-10, leave empty to skip):',
      validate: (input) => {
        if (!input.trim()) return true;
        if (!validateRating(input)) {
          return 'Please enter a number between 0 and 10!';
        }
        return true;
      },
      filter: (input) => {
        if (!input.trim()) return null;
        return parseFloat(input);
      }
    },
    {
      type: 'input',
      name: 'notes',
      message: 'Notes (optional):'
    }
  ]);

  return answers;
}

// Interactive update anime prompt
async function promptUpdateAnime(currentAnime) {
  console.log(chalk.cyan.bold(`\n  ✏️  Update: ${currentAnime.title}\n`));

  const choices = [
    { name: 'Title', value: 'title' },
    { name: 'Status', value: 'status' },
    { name: 'Total Episodes', value: 'episodes' },
    { name: 'Current Episode', value: 'currentEpisode' },
    { name: 'Rating', value: 'rating' },
    { name: 'Notes', value: 'notes' }
  ];

  const { fieldsToUpdate } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'fieldsToUpdate',
      message: 'What would you like to update?',
      choices: choices,
      validate: (answer) => {
        if (answer.length < 1) {
          return 'You must select at least one field to update!';
        }
        return true;
      }
    }
  ]);

  const updates = {};
  const questions = [];

  if (fieldsToUpdate.includes('title')) {
    questions.push({
      type: 'input',
      name: 'title',
      message: 'New title:',
      default: currentAnime.title,
      validate: (input) => input.trim() ? true : 'Title cannot be empty!'
    });
  }

  if (fieldsToUpdate.includes('status')) {
    questions.push({
      type: 'list',
      name: 'status',
      message: 'New status:',
      choices: [
        { name: '📋 Plan to Watch', value: 'plan-to-watch' },
        { name: '📺 Watching', value: 'watching' },
        { name: '✅ Completed', value: 'completed' },
        { name: '⏸️  On Hold', value: 'on-hold' },
        { name: '❌ Dropped', value: 'dropped' }
      ],
      default: currentAnime.status
    });
  }

  if (fieldsToUpdate.includes('episodes')) {
    questions.push({
      type: 'input',
      name: 'episodes',
      message: 'Total episodes:',
      default: currentAnime.episodes || '',
      filter: (input) => {
        const num = parseInt(input);
        return isNaN(num) ? null : num;
      }
    });
  }

  if (fieldsToUpdate.includes('currentEpisode')) {
    questions.push({
      type: 'input',
      name: 'currentEpisode',
      message: 'Current episode:',
      default: currentAnime.currentEpisode || 0,
      validate: (input) => {
        const num = parseInt(input);
        if (isNaN(num) || num < 0) {
          return 'Please enter a valid episode number!';
        }
        return true;
      },
      filter: (input) => parseInt(input)
    });
  }

  if (fieldsToUpdate.includes('rating')) {
    questions.push({
      type: 'input',
      name: 'rating',
      message: 'Rating (0-10):',
      default: currentAnime.rating || '',
      validate: (input) => {
        if (!input.toString().trim()) return true;
        if (!validateRating(input)) {
          return 'Please enter a number between 0 and 10!';
        }
        return true;
      },
      filter: (input) => {
        if (!input.toString().trim()) return null;
        return parseFloat(input);
      }
    });
  }

  if (fieldsToUpdate.includes('notes')) {
    questions.push({
      type: 'input',
      name: 'notes',
      message: 'Notes:',
      default: currentAnime.notes || ''
    });
  }

  const answers = await inquirer.prompt(questions);
  return answers;
}

// Confirmation prompt
async function confirmAction(message) {
  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: message,
      default: false
    }
  ]);

  return confirmed;
}

// Select anime from list
async function selectAnimeFromList(animeList, message = 'Select an anime:') {
  if (animeList.length === 0) {
    return null;
  }

  const choices = animeList.map(anime => {
    const emoji = anime.status === 'watching' ? '📺' :
                  anime.status === 'completed' ? '✅' :
                  anime.status === 'plan-to-watch' ? '📋' :
                  anime.status === 'dropped' ? '❌' : '⏸️';

    const progress = anime.episodes ? ` (${anime.currentEpisode || 0}/${anime.episodes})` : '';
    const rating = anime.rating ? ` ⭐${anime.rating}` : '';

    return {
      name: `${emoji} ${anime.title}${progress}${rating}`,
      value: anime.id,
      short: anime.title
    };
  });

  const { selectedId } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedId',
      message: message,
      choices: choices,
      pageSize: 15
    }
  ]);

  return selectedId;
}

// Interactive mode menu
async function showMainMenu() {
  console.log('\n');
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '➕ Add Anime', value: 'add' },
        { name: '📋 List All Anime', value: 'list' },
        { name: '🔍 Search Anime', value: 'search' },
        { name: '✏️  Update Anime', value: 'update' },
        { name: '🗑️  Delete Anime', value: 'delete' },
        { name: '📊 View Statistics', value: 'stats' },
        { name: '🚪 Exit', value: 'exit' }
      ],
      pageSize: 10
    }
  ]);

  return action;
}

// Filter by status prompt
async function promptFilterStatus() {
  const { status } = await inquirer.prompt([
    {
      type: 'list',
      name: 'status',
      message: 'Filter by status:',
      choices: [
        { name: '📋 All', value: 'all' },
        { name: '📺 Watching', value: 'watching' },
        { name: '✅ Completed', value: 'completed' },
        { name: '📋 Plan to Watch', value: 'plan-to-watch' },
        { name: '⏸️  On Hold', value: 'on-hold' },
        { name: '❌ Dropped', value: 'dropped' }
      ]
    }
  ]);

  return status === 'all' ? null : status;
}

// Search prompt
async function promptSearch() {
  const { query } = await inquirer.prompt([
    {
      type: 'input',
      name: 'query',
      message: 'Search query:',
      validate: (input) => {
        if (!input.trim()) {
          return 'Please enter a search query!';
        }
        return true;
      }
    }
  ]);

  return query;
}

module.exports = {
  promptAddAnime,
  promptUpdateAnime,
  confirmAction,
  selectAnimeFromList,
  showMainMenu,
  promptFilterStatus,
  promptSearch
};
