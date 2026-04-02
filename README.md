# anime-tracker

A beautiful and powerful tool to track your anime watching progress - available as both a **Desktop Application** and **CLI tool**.

## 🎯 Choose Your Version

### 🖥️ Desktop Application (NEW!)

**The modern way to track anime** - A native desktop application with a beautiful GUI and cloud sync capabilities.

- ✨ Beautiful modern UI with gradients and smooth animations
- ☁️ Optional Firebase cloud storage for cross-device sync
- 📊 Real-time statistics dashboard
- 🔍 Powerful search and filtering
- 📱 Available for Windows, macOS, and Linux

**[→ Desktop Application Documentation](README_DESKTOP.md)**

```bash
npm install
npm run electron
```

### 💻 CLI Tool (Original)

**For the terminal enthusiasts** - A feature-rich command-line interface with interactive menus.

- 🎨 Beautiful terminal UI with colors and ASCII art
- 📋 Fully interactive menu-driven interface
- ⚡ Fast and lightweight
- 💾 Local JSON storage

**[Continue reading below for CLI documentation](#cli-features)**

---

## 🖥️ Desktop Application Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the desktop app:**
   ```bash
   npm run electron
   ```

3. **(Optional) Configure Firebase for cloud storage:**
   - Create a Firebase project
   - Enable Realtime Database
   - Edit `src/firebase-config.js` with your credentials
   - See [Desktop App README](README_DESKTOP.md) for details

4. **Build installers:**
   ```bash
   npm run build        # Current platform
   npm run build:win    # Windows
   npm run build:mac    # macOS
   npm run build:linux  # Linux
   ```

**Note:** The desktop app can work with local storage (default) or Firebase cloud storage. No configuration is required to start using it!

---

## 💻 CLI Features

- 🎨 **Beautiful UI** - Colorful interface with gradients, boxes, and ASCII art
- 📋 **Interactive Mode** - Fully interactive menu-driven interface
- 📺 **Track Watching Status** - watching, completed, plan-to-watch, dropped, on-hold
- ⭐ **Rate Your Anime** - 0-10 scale with visual star ratings
- 📊 **Rich Statistics** - Visual progress bars and detailed analytics
- 🔍 **Smart Search** - Search by title or notes
- 🎯 **Progress Tracking** - Visual progress bars for episode tracking
- 💬 **Add Notes** - Keep personal notes about each anime
- 📱 **Two Modes** - Command-line mode OR interactive mode
- 🌈 **Color-Coded Status** - Each status has its own color and emoji
- 📈 **Table & Card Views** - View your list in different formats
- ⚡ **Loading Animations** - Beautiful spinners for better UX

## 📦 Installation

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

## 🚀 Usage

### Interactive Mode (Recommended)

Launch the interactive menu for the best experience:

```bash
node src/index.js interactive
# or
node src/index.js i
```

The interactive mode provides:
- ➕ Add Anime
- 📋 List All Anime
- 🔍 Search Anime
- ✏️ Update Anime
- 🗑️ Delete Anime
- 📊 View Statistics
- 🚪 Exit

### Command-Line Mode

#### Add an anime

Interactive add (prompts for all fields):
```bash
node src/index.js add
```

Quick add with arguments:
```bash
node src/index.js add --title "Attack on Titan" --status watching --episodes 25 --current 5 --rating 9.5 --notes "Amazing show!"
```

Options:
- `-t, --title <title>`: Anime title (required for CLI mode)
- `-s, --status <status>`: Status (default: plan-to-watch)
- `-e, --episodes <number>`: Total number of episodes
- `-c, --current <number>`: Current episode number (default: 0)
- `-r, --rating <number>`: Rating (0-10)
- `-n, --notes <text>`: Notes about the anime

#### List all anime

Default table view:
```bash
node src/index.js list
```

Card view with details:
```bash
node src/index.js list --view cards
```

Filter by status:
```bash
node src/index.js list --status watching
node src/index.js list --status completed
```

Options:
- `-s, --status <status>`: Filter by status
- `-v, --view <type>`: View type (table or cards, default: table)

#### Search for anime

Interactive search:
```bash
node src/index.js search
```

Quick search:
```bash
node src/index.js search "titan"
```

#### Update an anime

Interactive update (select from list):
```bash
node src/index.js update
```

Update specific anime with ID:
```bash
node src/index.js update <id>
```

Quick update with arguments:
```bash
node src/index.js update <id> --current 10
node src/index.js update <id> --status completed --rating 9
node src/index.js update <id> --notes "Best anime ever!"
```

Options:
- `-t, --title <title>`: Update title
- `-s, --status <status>`: Update status
- `-e, --episodes <number>`: Update total episodes
- `-c, --current <number>`: Update current episode
- `-r, --rating <number>`: Update rating
- `-n, --notes <text>`: Update notes

#### Delete an anime

Interactive delete (select from list):
```bash
node src/index.js delete
```

Delete specific anime:
```bash
node src/index.js delete <id>
```

Force delete (skip confirmation):
```bash
node src/index.js delete <id> --force
```

#### View statistics

See beautiful statistics with progress bars:
```bash
node src/index.js stats
```

Shows:
- Total anime count
- Total episodes watched
- Average rating
- Status breakdown with visual bars
- Percentage distribution

#### Get help

Display all available commands:
```bash
node src/index.js --help
```

Get help for a specific command:
```bash
node src/index.js add --help
node src/index.js list --help
```

## 📊 Status Values

The following status values are supported, each with unique colors and emojis:
- 📺 `watching` - Currently watching (Cyan)
- ✅ `completed` - Finished watching (Green)
- 📋 `plan-to-watch` - Planning to watch (Yellow)
- ⏸️ `on-hold` - Temporarily paused (Magenta)
- ❌ `dropped` - Stopped watching (Red)

## 💾 Data Storage

Your anime list is stored locally in `~/.anime-tracker/anime-list.json`. This file is created automatically when you add your first anime. All data is stored locally on your machine.

## 🎯 Examples

```bash
# Launch interactive mode for the best experience
node src/index.js interactive

# Quick add an anime you're planning to watch
node src/index.js add --title "One Piece" --status plan-to-watch --episodes 1000

# Start watching it (interactive mode)
node src/index.js update

# Update progress with CLI
node src/index.js update 1 --current 50

# Complete and rate it
node src/index.js update 1 --status completed --rating 9.5 --notes "Epic adventure!"

# View all completed anime in card format
node src/index.js list --status completed --view cards

# Search for anime
node src/index.js search "one piece"

# Check your beautiful statistics
node src/index.js stats
```

## 🎨 UI/UX Features

- **ASCII Art Banner** - Beautiful gradient header on every command
- **Color-Coded Display** - Different colors for different statuses
- **Progress Bars** - Visual representation of episode progress
- **Star Ratings** - Visual star display for ratings (★★★★★)
- **Loading Spinners** - Smooth animations during operations
- **Boxed Output** - Clean bordered displays for cards
- **Table View** - Professional table format for lists
- **Interactive Menus** - Easy-to-use selection menus
- **Confirmation Prompts** - Safety confirmations for destructive actions
- **Success/Error Messages** - Clear feedback with colored boxes

## 🛠️ Technologies Used

- **Node.js** - Runtime environment
- **Commander.js** - CLI framework
- **Inquirer.js** - Interactive prompts
- **Chalk** - Terminal colors
- **Boxen** - Bordered boxes
- **cli-table3** - Beautiful tables
- **Ora** - Loading spinners
- **Figlet** - ASCII art text
- **Gradient-string** - Gradient colors
- **cli-progress** - Progress bars

## 📝 License

ISC
