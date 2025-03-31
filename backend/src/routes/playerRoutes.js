import { addPlayer, getPlayers, deletePlayer } from "../models/playerModel.js";
import db from "../db.js"

export default async function playerRoutes(fastify, options) {
	// Validation des données d'entrée pour la sécurité
	const playerSchema = {
		body: {
			type: 'object',
			required: ['name'],
			properties: {
				name: { type: 'string', minLength: 2, maxLength: 20 }
			}
		}
	};

	fastify.post('/', { schema: playerSchema }, async (request, reply) => {
		const { name } = request.body;
		try {
			const id = addPlayer(name);
			return { success: true, id };
		} catch (error) {
			fastify.log.error(error);
			return reply.status(400).send({
				success: false,
				message: 'Impossible d\'ajouter le joueur.'
			});
		}
	});

	fastify.get('/', async(request, reply) => {
		try {
			const players = getPlayers();
			return { success: true, players };
		} catch (error) {
			fastify.log.error(error);
			return reply.status(400).send({
				success: false,
				message: 'Impossible d\'ajouter le joueur.'
			});
		}
	});

	fastify.delete('/:id', async (request, reply) => {
		const { id } = request.params;
		try {
			const result = deletePlayer(id);
			if (result) {
				return { success: true, message: `Joueur avec l'ID ${id} supprimé` };
			} else {
				return reply.status(404).send({
					success: false,
					message: `Joueur avec l'ID ${id} non trouvé.`
				});
			}
		} catch (error) {
			fastify.log.error(error);
			return reply.status(500).send({
				success: false,
				message: 'Impossible de supprimer le joueur.'
			});
		}
	});

	fastify.post('/match', async (request, reply) => {
		const { player1Id, player2Id, gameType } = request.body;

		if (!player1Id || !player2Id || !gameType)
			return reply.status(400).send({ success: false, message: "IDs des joueurs et type de jeu requis." });

		try {
			const stmt = db.prepare(`
			INSERT INTO matches (player1_id, player2_id, game_type, status)
			VALUES (?, ?, ?, 'pending')
		`);
			const result = stmt.run(player1Id, player2Id, gameType);
			reply.send({ success: true, matchId: result.lastInsertRowid });
		} catch (error) {
			fastify.log.error(error);
			return reply.status(500).send({ success: false, message: "Erreur lors de la création du match." });
		}
	});

	fastify.post('/match/score', async (request, reply) => {
		console.log("✅ Route /match/score appelée !");
		console.log("🟢 Requête reçue :", request.body);
		const { matchId, player1Score, player2Score } = request.body;

		if (!matchId || player1Score === undefined || player2Score === undefined)
			return reply.status(400).send({ success: false, message: "ID du match et score requis."});

		try {
			let winnerId = null;
			const match = db.prepare("SELECT * FROM matches WHERE id = ?").get(matchId);

			if (!match)
				return reply.status(404).send({ success: false, message: "Match non trouvé." });

			if (player1Score > player2Score)
				winnerId = match.player1_id;
			else if (player2Score > player1Score)
				winnerId = match.player2_id;

			const updateMatch = db.prepare(`
				UPDATE matches
				SET player1_score = ?, player2_score = ?, winner_id = ?, status = 'completed'
				WHERE id = ?
			`);
			updateMatch.run(player1Score, player2Score, winnerId, matchId);

			reply.send({ success: true, message: "Score enregistré avec succès." });
		} catch (error) {
			fastify.log.error(error);
			return reply.status(500).send({ success: false, message: "Erreur lors de l'enregisrement du score." });
		}
	});
}