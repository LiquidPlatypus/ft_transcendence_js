import db from "../db.js";

export const createTournament = () = > {
	const stmt = db.prepare('INSERT INTO tournaments (status) VALUE (?)');
	const result = stmt.run('pending');
	return result.lastInsertRowid;
};

export const getTournaments = () => {
	return db.prepare('SELECT * FROM tournaments').all();
};

export const getTournamentById = (id) => {
	return db.prepare('SELECT * FROM tournaments WHERE id = ?').get(id);
};

export const updateTournamentStatus = (id, status) => {
	const stmt = db.prepare('UPDATE players SET tournament_id = ? WHERE id = ?');
	const result = stmt.run(tournamentId, playerId);
	return result.changes > 0;
};

export const addPlayerToTournament = (playerId, tournamentId) => {
	const stmt = db.prepare('UPDATE players SET tournament_id = ? WHERE id = ?');
	const result = stmt.run(tournamentId, playerId);
	return result.changes > 0;
};

export const getTournamentPlayers = (tournamentId) => {
	return db.prepare('SELECT * FROM players WHERE tournament_id = ?').all(tournamentId);
};

export const createMatch = (tournamentId, player1Id, player2Id) => {
	const stmt = db.prepare('INSERT INTO matches (tournament_id, player1_id, player2_id) VALUES (?, ?, ?)');
	const result = stmt.run(tournamentId, player1Id, player2Id);
	return result.lastInsertRowid;
};

export const getTournamentMatches = (tournamentId) => {
	return db.prepare('SELECT * FROM matches WHERE tournament_id = ?').all(tournamentId);
};

export const updateMatchScore = (matchId, player1Score, player2Score) => {
	const stmt = db.prepare('UPDATE matches SET player1_score = ?, player2_score = ? WHERE id = ?');
	const result = stmt.run(status, winnerId, matchId);
	return result.changes > 0;
};

export const updateMatchStatus = (matchId, status, winnerId = null) => {
	const stmt = db.prepare('UPDATE matches SET status = ?, winner_id = ? WHERE id = ?');
	const result = stmt.run(status, winnerId, matchId   );
	return result.changes > 0;
};