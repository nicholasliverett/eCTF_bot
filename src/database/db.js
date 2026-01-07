import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get database path from environment or use default
const dbPath = process.env.DATABASE_PATH || join(__dirname, '../../data/boards.db');

// Ensure data directory exists
const dbDir = dirname(dbPath);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS boards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS checkouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    board_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    custom_message TEXT,
    checked_out_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    checked_in_at DATETIME,
    FOREIGN KEY (board_id) REFERENCES boards(id)
  );

  CREATE INDEX IF NOT EXISTS idx_checkouts_user_id ON checkouts(user_id);
  CREATE INDEX IF NOT EXISTS idx_checkouts_board_id ON checkouts(board_id);
  CREATE INDEX IF NOT EXISTS idx_checkouts_checked_in ON checkouts(checked_in_at);

  CREATE TABLE IF NOT EXISTS panel_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL UNIQUE,
    channel_id TEXT NOT NULL,
    message_id TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Initialize default boards if none exist
const boardCount = db.prepare('SELECT COUNT(*) as count FROM boards').get();
if (boardCount.count === 0) {
  const insertBoard = db.prepare('INSERT INTO boards (name, description) VALUES (?, ?)');
  const boards = [
    ['Board 01', 'Board number 1'],
    ['Board 02', 'Board number 2'],
    ['Board 03', 'Board number 3'],
    ['Board 04', 'Board number 4'],
    ['Board 05', 'Board number 5'],
    ['Board 06', 'Board number 6'],
    ['Board 07', 'Board number 7'],
    ['Board 08', 'Board number 8'],
    ['Board 09', 'Board number 9'],
    ['Board 10', 'Board number 10'],
    ['USB Debugger 1', 'USB Debugger 1'],
    ['USB Debugger 2', 'USB Debugger 2'],
    ['USB Debugger 3', 'USB Debugger 3'],
    ['USB Debugger 4', 'USB Debugger 4'],
    ['Design Phase Board 1', 'Design Phase Board 1'],
    ['Design Phase Board 2', 'Design Phase Board 2'],
    ['Design Phase Board 3', 'Design Phase Board 3'],
    ['Attack Phase Board 1', 'Attack Phase Board 1'],
    ['Attack Phase Board 2', 'Attack Phase Board 2'],
    ['Attack Phase Board 3', 'Attack Phase Board 3']
  ];
  
  const insertMany = db.transaction((boards) => {
    for (const board of boards) {
      insertBoard.run(board[0], board[1]);
    }
  });
  
  insertMany(boards);
  console.log('Initialized 20 default boards');
}

export default db;

