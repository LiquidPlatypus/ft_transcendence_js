import { getMatchHistoryPong } from "../models/scoreModel.js";

export default async function scoreRoutes(fastify, options) {
	// Route pour récupérer l'historique des matchs
	fastify.post('/history/pong', async (request, reply) => {
		try {
			const matches = getMatchHistoryPong();
			return { success: true, matches };
		} catch (error) {
			fastify.log.error(error);
			reply.status(500).send({
				success: false,
				message: "Impossible de récupérer l\\'historique des matchs.",
			});
		}
	});
}