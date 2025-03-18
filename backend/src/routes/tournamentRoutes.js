import { createTournament, getTournaments, getTournamentById, updateTournamentStatus, addPlayerToTournament, getTournamentPlayers, createMatch, getTournamentMatches, updateMatchScore, updateMatchStatus } from "../models/tournamentModel.js";

export default async function tournamentRoutes(fastify, options) {
	const createTournamentSchema = {
		body: {
			type: 'object',
			properties: {}
		}
	};

	const addPlayerSchema = {
		body: {
			type: 'object',
			required: ['player_id'],
			properties: {
				player_id: {type: 'integer'}
			}
		}
	};

	const createMatchSchema = {
		body: {
			type: 'object',
			required: ['player1_id', 'player2_id'],
			properties: {
				player1_id: {type: 'integer'},
				player2_id: {type: 'integer'}
			}
		}
	};

	const updateScoreSchema = {
		body: {
			type: 'object',
			required: ['player1_score', 'player2_score'],
			properties: {
				player1_id: {type: 'integer', minimum: 0},
				player2_id: {type: 'integer', minimum: 0}
			}
		}
	};

	const updateTournamentStatusSchema = {
		body: {
			type: 'object',
			required: ['status'],
			properties: {
				status: {type: 'string', enum: ['pending', 'active', 'completed']}
			}
		}
	};


	fastify.post('/', createTournamentSchema, async (request, reply) => {
		try {
			const tournamentId = tournamentModel.createTournament();

			fastify.websocketServer.clients.forEach(client=> {
				if (client.readyState === 1) {
					client.send(JSON.stringify({
						type: 'TOURNAMENT_CREATED',
						payload: {id: tournamentId}
					}));
				}
			});
			return {success: true, id: tournamentId};
		} catch (error) {
			fastify.log.error(error);
			return reply.status(500).send({
				success: false,
				message: 'Impossible de créer le tournoi'
			});
		}
	});

	fastify.get('/', async (request, reply) => {
		try {
			const tournaments = tournamentModel.getTournaments();
			return {success: true, tournaments};
		} catch (error) {
			fastify.log.error(error);
			return reply.status(500).send({
				success: false,
				message: 'Impossible de récupérer les tournois'
			});
		}
	});

	fastify.get('/:id', async (request, reply) => {

	})
}