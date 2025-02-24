import Fastify from 'fastify'
import cors from '@fastify/cors';
import { addPlayer, getPlayers, deletePlayer } from './src/models/playerModel.js';
import { addScore, getScores, deleteScore } from './src/models/scoreModel.js';

const fastify = Fastify({
	logger: true
});

fastify.register(cors);

fastify.post('/players', async (request, reply) => {
	const { name } = request.body;
	const id = addPlayer(name);
	return { id };
});

fastify.get('/players', async (request, reply) => {
	return getPlayers();
});

fastify.delete('/players/:id', async (request, reply) => {
	const { id } = request.params;
	const result = deletePlayer(id);
	if (result) {
		return { success: true, message: `Player with id ${id} deleted` };
	} else {
		return { success: false, message: `Player with id ${id} not found` };
	}
});

fastify.post('/scores', async (request, reply) => {
	const { player_id, score } = request.body;
	return addScore(player_id, score);
});

fastify.get('/scores', async (request, reply) => {
	return getScores();
})

fastify.delete('/scores/:id', async (request, reply) => {
	const { id } = request.params;
	const result = deleteScore(id);
	if (result) {
		return { success: true, message: `Score with id ${id} deleted` };
	} else {
		return { success: false, message: `Score with id ${id} not found` };
	}
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