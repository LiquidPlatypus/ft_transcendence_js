import { getMatchHistoryPong } from "../models/scoreModel.js";

export default async function scoreRoutes(fastify, options) {
	// Route pour récupérer l'historique des matchs
	fastify.get('/history/pong', async (request, reply) => {
		try {
			const matches = getMatchHistoryPong();
			console.log(matches);
			reply.send({ success: true, matches });
		} catch (error) {
			fastify.log.error(error);
			reply.status(500).send({
				success: false,
				message: "Erreur lors de la récupération de l'historique.",
			});
		}
	});
}