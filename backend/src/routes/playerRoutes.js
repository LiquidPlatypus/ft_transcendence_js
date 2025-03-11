import { addPlayer, getPlayers, deletePlayer } from "../models/playerModel.js";

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
}