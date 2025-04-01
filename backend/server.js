import Fastify from 'fastify'
import cors from '@fastify/cors';
import fastifyWebsocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static';
import fastifySession from '@fastify/session';
import fastifyCookie from '@fastify/cookie';
import path from 'path';
import { fileURLToPath } from 'url';
import playerRoutes from "./src/routes/playerRoutes.js";
import scoreRoutes from './src/routes/scoreRoutes.js';
import tournamentRoutes from './src/routes/tournamentRoutes.js';
// import gameRoutes from './src/routes/gameRoutes.ts';
import setupWebsockets from './src/websockets/index.js';
import fs from 'fs';
import db, { setupDatabase } from './src/db.js';

// Pour obtenir le __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

setupDatabase();

const fastify = Fastify({
	logger: true,
	https: {
		key: fs.readFileSync(path.join(__dirname, 'ssl', 'key.pem')),
		cert: fs.readFileSync(path.join(__dirname, 'ssl', 'cert.pem'))
	}
});

fastify.setErrorHandler((error, request, reply) => {
	fastify.log.error(error);
	reply.status(500).send({
		success: false,
		message: 'Une erreur est survenue sur le serveur'
	});
});

fastify.register(cors, {
	origin: (origin, cb) => {
		// !!!!!!!!!!!!!!!!!!!!!!!!   RESTREINDRE LORS DE LA PROD
		cb(null, true);
	},
	credentials: true
});

fastify.register(fastifyCookie);
fastify.register(fastifySession, {
	secret: '32323232323232323232323232323232',
	cookie: { secure: false} // Changer en "true" en prod
});

fastify.register(fastifyWebsocket);
fastify.register(fastifyStatic, {
	root: path.join(__dirname, '../frontend'),
	prefix: '/'
});

// Routes
fastify.register(playerRoutes, { prefix: '/api/players' });
fastify.register(scoreRoutes, { prefix: '/api/scores' });
fastify.register(tournamentRoutes, { prefix: '/api/tournaments' });
//fastify.register(gameRoutes, { prefix: '/api/games' });

// Config WebSockets
setupWebsockets(fastify);

// Route par défaut SPA
/*fastify.get('*', (request, reply) => {
	reply.sendFile('index.html', path.join(__dirname, 'public'));
});*/

fastify.get('/', async (request, reply) => {
	return reply.sendFile('index.html');
});

fastify.ready(() => {
	console.log(fastify.printRoutes());
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
