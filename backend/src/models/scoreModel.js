import db from '../db.js';

export const addScore = (player_id, score) => {
	const stmt = db.prepare('INSERT INTO scores (player_id, score) VALUES (?, ?)');
	return stmt.run(player_id, score);
};

export const getScores = () => {
	return db.prepare('SELECT * FROM scores ORDER BY score DESC LIMIT 10').all();
};

export const deleteScore = (scoreId) => {
	const deleteScoreStmt = db.prepare('DELETE FROM scores WHERE id = ?');
	const result = deleteScoreStmt.run(scoreId);
	return result.changes > 0; // Renvoie true si le score a été supprimé
};