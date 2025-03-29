export default function setupWebsockets(fastify) {
	fastify.register(async function (fastify) {
		fastify.get('/ws/game', { websocket: true }, (connection, req) => {
			connection.socket.on('message', message => {
				const data = JSON.parse(message.toString());

				try {
					const data = JSON.parse(message.toString());
					// Gestion des différents types de messages
					switch (data.type) {
						case 'join':
							console.log(`Joueur ${data.alias} a rejoint.`);
							connection.socket.send(JSON.stringify({
								type: 'join_ack',
								message: `Bienvenue ${data.alias}.`
							}));
							break;
						case 'move':
							console.log(`Mouvement du joueur ${data.alias}.`);
							break;
						case 'matchmaking':
							console.log(`Matchmaking demandé par ${data.alias}.`);
							break;
						default:
							connection.socket.send(JSON.stringify({
								type: 'error',
								message: 'Type de message inconnu.'
							}));
					}
				} catch (error) {
					connection.socket.send(JSON.stringify({
						type: 'error',
						message: 'Données invalides.'
					}));
				}
			});

			connection.socket.on('close', () => {
				console.log("Un joueur s'est déconnecté.");
			});
		});
	});
};
