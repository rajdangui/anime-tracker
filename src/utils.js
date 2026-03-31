function formatAnime(anime) {
  const statusEmoji = {
    'watching': '📺',
    'completed': '✅',
    'plan-to-watch': '📋',
    'dropped': '❌',
    'on-hold': '⏸️'
  };

  const emoji = statusEmoji[anime.status] || '📝';
  let output = `\n${emoji} ID: ${anime.id}`;
  output += `\n  Title: ${anime.title}`;
  output += `\n  Status: ${anime.status}`;

  if (anime.episodes) {
    output += `\n  Episodes: ${anime.currentEpisode || 0}/${anime.episodes}`;
  } else if (anime.currentEpisode) {
    output += `\n  Current Episode: ${anime.currentEpisode}`;
  }

  if (anime.rating) {
    output += `\n  Rating: ${anime.rating}/10`;
  }

  if (anime.notes) {
    output += `\n  Notes: ${anime.notes}`;
  }

  output += `\n  Added: ${new Date(anime.addedDate).toLocaleDateString()}`;

  return output;
}

function formatAnimeList(animeList) {
  if (animeList.length === 0) {
    return 'No anime found in your list.';
  }

  let output = `\nFound ${animeList.length} anime:`;
  animeList.forEach(anime => {
    output += formatAnime(anime);
    output += '\n';
  });

  return output;
}

function validateStatus(status) {
  const validStatuses = ['watching', 'completed', 'plan-to-watch', 'dropped', 'on-hold'];
  return validStatuses.includes(status);
}

function validateRating(rating) {
  const num = parseFloat(rating);
  return !isNaN(num) && num >= 0 && num <= 10;
}

module.exports = {
  formatAnime,
  formatAnimeList,
  validateStatus,
  validateRating
};
