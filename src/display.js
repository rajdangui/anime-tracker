const chalk = require('chalk');
const boxen = require('boxen');
const Table = require('cli-table3');
const gradient = require('gradient-string');
const figlet = require('figlet');
const cliProgress = require('cli-progress');

// Color scheme for different statuses
const STATUS_COLORS = {
  'watching': chalk.cyan,
  'completed': chalk.green,
  'plan-to-watch': chalk.yellow,
  'dropped': chalk.red,
  'on-hold': chalk.magenta
};

// Enhanced emoji set
const STATUS_EMOJI = {
  'watching': '📺',
  'completed': '✅',
  'plan-to-watch': '📋',
  'dropped': '❌',
  'on-hold': '⏸️'
};

// Display banner
function displayBanner() {
  const banner = figlet.textSync('ANIME TRACKER', {
    font: 'ANSI Shadow',
    horizontalLayout: 'default',
    verticalLayout: 'default'
  });
  console.log(gradient.pastel.multiline(banner));
  console.log(chalk.gray('  Track your anime journey with style!\n'));
}

// Format a single anime entry with rich UI
function formatAnimeCard(anime) {
  const statusColor = STATUS_COLORS[anime.status] || chalk.white;
  const emoji = STATUS_EMOJI[anime.status] || '📝';

  let content = '';
  content += chalk.bold.white(`${emoji} ${anime.title}\n\n`);
  content += chalk.gray('ID: ') + chalk.cyan(`#${anime.id}\n`);
  content += chalk.gray('Status: ') + statusColor.bold(anime.status) + '\n';

  if (anime.episodes) {
    const progress = ((anime.currentEpisode || 0) / anime.episodes * 100).toFixed(1);
    const progressBar = createProgressBar(anime.currentEpisode || 0, anime.episodes);
    content += chalk.gray('Progress: ') + chalk.white(`${anime.currentEpisode || 0}/${anime.episodes}`) +
               chalk.gray(` (${progress}%)\n`);
    content += progressBar + '\n';
  } else if (anime.currentEpisode) {
    content += chalk.gray('Current Episode: ') + chalk.white(anime.currentEpisode) + '\n';
  }

  if (anime.rating) {
    const stars = createStarRating(anime.rating);
    content += chalk.gray('Rating: ') + chalk.yellow(stars) + chalk.white(` ${anime.rating}/10\n`);
  }

  if (anime.notes) {
    content += chalk.gray('Notes: ') + chalk.italic.white(anime.notes) + '\n';
  }

  content += chalk.gray('Added: ') + chalk.white(new Date(anime.addedDate).toLocaleDateString());

  return boxen(content, {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: anime.status === 'watching' ? 'cyan' :
                 anime.status === 'completed' ? 'green' :
                 anime.status === 'plan-to-watch' ? 'yellow' :
                 anime.status === 'dropped' ? 'red' : 'magenta'
  });
}

// Create a visual progress bar
function createProgressBar(current, total) {
  const barLength = 20;
  const filledLength = Math.round((current / total) * barLength);
  const emptyLength = barLength - filledLength;

  const filled = chalk.cyan('█'.repeat(filledLength));
  const empty = chalk.gray('░'.repeat(emptyLength));

  return `${filled}${empty}`;
}

// Create star rating visualization
function createStarRating(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 10 - fullStars - halfStar;

  return '★'.repeat(fullStars) + (halfStar ? '⯨' : '') + '☆'.repeat(emptyStars);
}

// Format anime list as a table
function formatAnimeTable(animeList, showAll = true) {
  if (animeList.length === 0) {
    return chalk.yellow('\n  ⚠️  No anime found in your list.\n');
  }

  const table = new Table({
    head: [
      chalk.bold.cyan('ID'),
      chalk.bold.cyan('Title'),
      chalk.bold.cyan('Status'),
      chalk.bold.cyan('Progress'),
      chalk.bold.cyan('Rating'),
      chalk.bold.cyan('Added')
    ],
    style: {
      head: [],
      border: ['gray']
    },
    colWidths: [8, 30, 18, 15, 12, 12],
    wordWrap: true
  });

  animeList.forEach(anime => {
    const statusColor = STATUS_COLORS[anime.status] || chalk.white;
    const emoji = STATUS_EMOJI[anime.status] || '📝';

    let progress = '';
    if (anime.episodes) {
      progress = `${anime.currentEpisode || 0}/${anime.episodes}`;
    } else if (anime.currentEpisode) {
      progress = `Ep ${anime.currentEpisode}`;
    } else {
      progress = '-';
    }

    const rating = anime.rating ? chalk.yellow(`⭐ ${anime.rating}`) : chalk.gray('-');
    const addedDate = new Date(anime.addedDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit'
    });

    table.push([
      chalk.cyan(`#${anime.id}`),
      anime.title.length > 28 ? anime.title.substring(0, 25) + '...' : anime.title,
      statusColor(`${emoji} ${anime.status}`),
      chalk.white(progress),
      rating,
      chalk.gray(addedDate)
    ]);
  });

  let output = chalk.bold.white(`\n  Found ${animeList.length} anime:\n\n`);
  output += table.toString();
  output += '\n';

  return output;
}

// Display statistics with visual elements
function displayStatistics(animeList) {
  if (animeList.length === 0) {
    console.log(chalk.yellow('\n  ⚠️  No anime in your list yet.\n'));
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

  // Calculate total episodes watched
  const totalEpisodesWatched = animeList.reduce((sum, a) => sum + (a.currentEpisode || 0), 0);

  // Header
  console.log('\n' + gradient.pastel('═'.repeat(60)));
  console.log(gradient.pastel.center('📊  YOUR ANIME STATISTICS  📊'));
  console.log(gradient.pastel('═'.repeat(60)) + '\n');

  // Overall stats
  const overallBox = boxen(
    chalk.bold.white(`Total Anime: `) + chalk.cyan.bold(stats.total) + '\n' +
    chalk.bold.white(`Total Episodes Watched: `) + chalk.cyan.bold(totalEpisodesWatched) + '\n' +
    chalk.bold.white(`Average Rating: `) + (avgRating !== 'N/A' ? chalk.yellow.bold(`⭐ ${avgRating}/10`) : chalk.gray('N/A')),
    {
      padding: 1,
      margin: { top: 0, bottom: 1, left: 2, right: 2 },
      borderStyle: 'double',
      borderColor: 'cyan',
      title: chalk.bold.cyan('Overall'),
      titleAlignment: 'center'
    }
  );
  console.log(overallBox);

  // Status breakdown with visual bars
  console.log(chalk.bold.white('  Status Breakdown:\n'));

  const maxCount = Math.max(stats.watching, stats.completed, stats.planToWatch, stats.dropped, stats.onHold, 1);

  displayStatBar('📺 Watching', stats.watching, stats.total, maxCount, 'cyan');
  displayStatBar('✅ Completed', stats.completed, stats.total, maxCount, 'green');
  displayStatBar('📋 Plan to Watch', stats.planToWatch, stats.total, maxCount, 'yellow');
  displayStatBar('⏸️  On Hold', stats.onHold, stats.total, maxCount, 'magenta');
  displayStatBar('❌ Dropped', stats.dropped, stats.total, maxCount, 'red');

  console.log('\n' + chalk.gray('═'.repeat(60)) + '\n');
}

// Display a stat bar with percentage
function displayStatBar(label, count, total, maxCount, color) {
  const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
  const barLength = 30;
  const filledLength = Math.round((count / maxCount) * barLength);

  const colorFn = chalk[color] || chalk.white;
  const bar = colorFn('█'.repeat(filledLength)) + chalk.gray('░'.repeat(barLength - filledLength));

  console.log(`  ${label.padEnd(20)} ${bar} ${colorFn.bold(count.toString().padStart(3))} ${chalk.gray(`(${percentage}%)`)}`);
}

// Success message
function displaySuccess(message) {
  console.log('\n' + boxen(chalk.green.bold(`✨ ${message}`), {
    padding: { top: 0, bottom: 0, left: 2, right: 2 },
    margin: 1,
    borderStyle: 'round',
    borderColor: 'green'
  }));
}

// Error message
function displayError(message) {
  console.log('\n' + boxen(chalk.red.bold(`❌ ${message}`), {
    padding: { top: 0, bottom: 0, left: 2, right: 2 },
    margin: 1,
    borderStyle: 'round',
    borderColor: 'red'
  }));
}

// Warning message
function displayWarning(message) {
  console.log('\n' + boxen(chalk.yellow.bold(`⚠️  ${message}`), {
    padding: { top: 0, bottom: 0, left: 2, right: 2 },
    margin: 1,
    borderStyle: 'round',
    borderColor: 'yellow'
  }));
}

// Info message
function displayInfo(message) {
  console.log('\n' + boxen(chalk.blue.bold(`ℹ️  ${message}`), {
    padding: { top: 0, bottom: 0, left: 2, right: 2 },
    margin: 1,
    borderStyle: 'round',
    borderColor: 'blue'
  }));
}

module.exports = {
  displayBanner,
  formatAnimeCard,
  formatAnimeTable,
  displayStatistics,
  displaySuccess,
  displayError,
  displayWarning,
  displayInfo,
  STATUS_COLORS,
  STATUS_EMOJI
};
