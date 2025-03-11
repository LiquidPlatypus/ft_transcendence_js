export default function setupWebsockets(fastify) {
	fastify.register(async function (fastify) {
		fastify.get('/ws/game', { websocket: true }, (connection, req) => {
			connection.socket.on('message', message => {
				const data = JSON.parse(message.toString());

				// Gestion des différents types de messages
				switch (data.type) {
					case 'join':
						handlePlayerJoin(connection, data);
						break;
					case 'move':
						handlePlayerMove(connection, data);
						break;
					case 'matchmaking':
						handleMatchmaking(connection, data);
					default:
						connection.socket.send(JSON.stringify({
							type: 'error',
							message: 'Type de message inconnu'
						}));
				}
			});

			connection.socket.on('close', () => {
				handlePlayerDisconnect(connection);
			});
		});
	});
};

function handlePlayerJoin(connection, data) {

}

function handlePlayerMove(connection, data) {

}

function handleMatchmaking(connection, data) {

}

function handlePlayerDisconnect(connection) {

}