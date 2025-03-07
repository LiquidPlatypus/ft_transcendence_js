import Fastify from 'fastify'
import cors from '@fastify/cors';
import { addPlayer, getPlayers, deletePlayer } from './src/models/playerModel.js';
import { addScore, getScores, deleteScore } from './src/models/scoreModel.js';
import db from './src/db.js';

const fastify = Fastify({
	logger: true
});

fastify.register(cors);

/**
 * @brief Ajoute un joueur dans la DB.
 *
 * @param
 * @return
 */
fastify.post('/players', async (request, reply) => {
	const { name } = request.body;
	const id = addPlayer(name);
	return { id };
});

/**
 * @brief Affiche un joueur de la DB.
 *
 * @param
 * @return
 */
fastify.get('/players', async (request, reply) => {
	return getPlayers();
});

/**
 * @brief Supprime un joueur de la DB et son score associe.
 *
 * @param
 * @return
 */
fastify.delete('/players/:id', async (request, reply) => {
	const { id } = request.params;
	const result = deletePlayer(id);
	if (result) {
		return { success: true, message: `Player with id ${id} deleted` };
	} else {
		return { success: false, message: `Player with id ${id} not found` };
	}
});

/**
 * @brief Lie un score a un joueur dans la DB.
 *
 * @param
 * @brief
 */
fastify.post('/scores', async (request, reply) => {
	const { player_id, score } = request.body;
	return addScore(player_id, score);
});

/**
 * @brief Affiche le score d'un joueur.
 *
 * @param
 * @return
 */
fastify.get('/scores', async (request, reply) => {
	return getScores();
})

/**
 * @brief Supprime le score d'un joueur.
 *
 * @param
 * @brief
 */
fastify.delete('/scores/:id', async (request, reply) => {
	const { id } = request.params;
	const result = deleteScore(id);
	if (result) {
		return { success: true, message: `Score with id ${id} deleted` };
	} else {
		return { success: false, message: `Score with id ${id} not found` };
	}
});

fastify.post('/tournaments', {
	schema: {
		body: {
			type: 'object',
			required: ['players'],
			properties: {
				players: {
					type: 'array',
					items: { type: 'string', maxLength: 20 },
					minItems: 2, // Max 2 joueurs.
					maxItems: 8, // Max 8 joueurs.
				}
			}
		}
	}
}, async (request, reply) => {
	const {players } = request.body;

	const tournament = db.prepare('INSERT INTO tournaments DEFAULT VALUES').run();

	const insertPlayer = db.prepare(`
	INSERT INTO players (alias, tournament_id)
	VALUES (?, ?)
	`);

	players.forEach(alias => {
		insertPLayer.run(alias, tournament.lastInsertRowid);
	});

	return {
		tournamentId: tournament.lastInsertRowid,
		message: "Tournoi créé avec succès. Alias des joueurs : " + players.join(', ')
	};
});

fastify.get('/tournaments/:id', async (request) => {
	return db.prepare(`
	SELECT t.status,
		json_group_array(p.alias) as players,
		json_group_array(m) as matches
	FROM tournaments t
	LEFT JOIN players p ON p.tournament_id = t.id
	LEFT JOIN matches m ON m.tournament_id = t.id
	WHERE t.id = ?
	`).get(request.params.id);
});

const start = async () => {
	try {
		await fastify.listen({ port: 3000, host: '0.0.0.0' });
		console.log('Listening on port 3000');
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};
start();