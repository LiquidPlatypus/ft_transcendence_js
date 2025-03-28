import { getMatchHistory } from "../models/scoreModel.js";

export default async function scoreRoutes(fastify, options) {
	fastify.get('/history', async (request, reply) => {
		try {
			const matches = getMatchHistory();
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