import Database from 'better-sqlite3';

const db = new Database('pong.db', { verbose: console.log });

db.exec(`
	CREATE TABLE IF NOT EXISTS players (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL
	);

	CREATE TABLE IF NOT EXISTS scores (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		player_id INTEGER NOT NULL,
		score INTEGER NOT NULL,
		FOREIGN KEY (player_id) REFERENCES players(id)
	);
`);

console.log('Database Connected!');

export default db;