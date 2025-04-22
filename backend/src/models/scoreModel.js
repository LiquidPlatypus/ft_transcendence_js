import db from '../db.js';

export const getMatchHistoryPong = () => {
	return db.prepare(`
	SELECT
		m.id,
		p1.name AS player1,
		p2.name AS player2,
		m.player1_score,
		m.player2_score,
		w.name AS winner
	FROM matches m
	JOIN players p1 ON m.player1_id = p1.id
	JOIN players p2 ON m.player2_id = p2.id
	LEFT JOIN players w ON m.winner_id = w.id
	WHERE m.status = 'completed' AND m.game_type = 'pong'
	ORDER BY m.id DESC
  `).all();
};