import Fastify from 'fastify'
import firstRoute from './our-first-route.js'

const fastify = Fastify({
	logger: true
});

fastify.register(firstRoute);

fastify.listen({ port: 3000 }, function (err, address) {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
});