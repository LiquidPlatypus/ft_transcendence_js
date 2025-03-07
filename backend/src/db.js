import Database from 'better-sqlite3';

const db = new Database('pong.db', { verbose: console.log });

db.exec(`
	CREATE TABLE IF NOT EXISTS tournaments (
	    id INTEGER PRIMARY KEY AUTOINCREMENT,
		status TEXT DEFAULT 'pending'
	);

	CREATE TABLE IF NOT EXISTS players (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		alias TEXT NOT NULL,
		tournament_id INTEGER REFERENCES tournaments(id)
	);

	CREATE TABLE IF NOT EXISTS scores (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		player_id INTEGER NOT NULL,
		match_id INTEGER NOT NULL,
		score INTEGER NOT NULL,
		FOREIGN KEY (player_id) REFERENCES players(id),
		FOREIGN KEY (match_id) REFERENCES matches(id)
	);

	CREATE TABLE IF NOT EXISTS matches (
	    id INTEGER PRIMARY KEY AUTOINCREMENT,
		tournament_id INTEGER,
		players TEXT, -- JSON: ["alias1", "alias2"]
		winner TEXT CHECK(winner IN ('player1', 'player2')),
		FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
	);
`);

console.log('Database Connected!');

export default db;