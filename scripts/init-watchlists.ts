// Initialize watchlists.json file if it doesn't exist
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const WATCHLISTS_FILE = path.join(DATA_DIR, 'watchlists.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log('✅ Created data directory');
}

// Initialize watchlists file if it doesn't exist
if (!fs.existsSync(WATCHLISTS_FILE)) {
  fs.writeFileSync(WATCHLISTS_FILE, JSON.stringify([], null, 2));
  console.log('✅ Created watchlists.json');
} else {
  console.log('ℹ️  watchlists.json already exists');
}

console.log('✅ Initialization complete');
