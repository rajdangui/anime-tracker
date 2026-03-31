# anime-tracker

A simple and powerful CLI tool to track your anime watching progress.

## Features

- 📝 Add anime to your tracking list
- 📺 Track watching status (watching, completed, plan-to-watch, dropped, on-hold)
- ⭐ Rate your anime (0-10 scale)
- 📋 Add notes and comments
- 🔍 Search and filter your collection
- 📊 View statistics about your anime list

## Installation

1. Clone the repository:
```bash
git clone https://github.com/rajdangui/anime-tracker.git
cd anime-tracker
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Link the CLI globally:
```bash
npm link
```

## Usage

### Add an anime

Add a new anime to your tracking list:

```bash
node src/index.js add "Attack on Titan"
```

With additional options:

```bash
node src/index.js add "Attack on Titan" --status watching --episodes 25 --current 5 --rating 9.5 --notes "Amazing show!"
```

Options:
- `-s, --status <status>`: Status (watching, completed, plan-to-watch, dropped, on-hold)
- `-e, --episodes <number>`: Total number of episodes
- `-c, --current <number>`: Current episode number
- `-r, --rating <number>`: Rating (0-10)
- `-n, --notes <text>`: Notes about the anime

### List all anime

List all anime in your tracker:

```bash
node src/index.js list
```

Filter by status:

```bash
node src/index.js list --status watching
node src/index.js list --status completed
```

### Search for anime

Search by title or notes:

```bash
node src/index.js search "titan"
```

### Update an anime

Update an existing anime entry:

```bash
node src/index.js update <id> --current 10
node src/index.js update <id> --status completed --rating 9
node src/index.js update <id> --notes "Best anime ever!"
```

### Delete an anime

Remove an anime from your list:

```bash
node src/index.js delete <id>
```

### View statistics

See statistics about your anime collection:

```bash
node src/index.js stats
```

### Get help

Display all available commands:

```bash
node src/index.js --help
```

Get help for a specific command:

```bash
node src/index.js add --help
```

## Status Values

The following status values are supported:
- `watching` - Currently watching
- `completed` - Finished watching
- `plan-to-watch` - Planning to watch
- `dropped` - Stopped watching
- `on-hold` - Temporarily paused

## Data Storage

Your anime list is stored locally in `~/.anime-tracker/anime-list.json`. This file is created automatically when you add your first anime.

## Examples

```bash
# Add an anime you're planning to watch
node src/index.js add "One Piece" --status plan-to-watch --episodes 1000

# Start watching it
node src/index.js update 1 --status watching --current 1

# Update progress
node src/index.js update 1 --current 50

# Complete and rate it
node src/index.js update 1 --status completed --rating 9.5 --notes "Epic adventure!"

# View all completed anime
node src/index.js list --status completed

# Check your statistics
node src/index.js stats
```

## License

ISC
