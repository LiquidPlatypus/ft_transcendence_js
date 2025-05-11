import { t } from '../lang/i18n.js'

export function homePage() {
	// Page d'acceuil du site.
	return `
		<div class="fixed top-4 right-4 z-10">
			<!-- Boutons pour choisir sa langue. -->
			<div class="flex gap-2">
				<button class="transition rounded hover:brightness-110 focus:ring-2 focus:ring-accent" data-lang="fr">
					<img src="../static/fr.png" alt="français" class="w-8 h-6 rounded object-cover">
				</button>
				<button class="transition rounded hover:brightness-110 focus:ring-2 focus:ring-accent" data-lang="en">
					<img src="../static/en.png" alt="English" class="w-8 h-6 rounded object-cover">
				</button>
				<button class="transition rounded hover:brightness-110 focus:ring-2 focus:ring-accent" data-lang="es">
					<img src="../static/es.png" alt="español" class="w-8 h-6 rounded object-cover">
				</button>
			</div>
		</div>


		<!-- Div centrant les elements au centre. -->
		<div class="flex items-center justify-center min-h-screen">
			<div class="max-w-4xl mx-auto py-10 text-center">
				<h1 class="font-bold mb-4 text-4xl">Pong</h1>
				<div class="grid grid-cols-2 justify-center gap-10">
					<!-- Div de Pong. -->
					<div class="rounded-lg border p-4 shadow">
						<h2 class="mb-2 text-2xl font-semibold">Pong</h2>
						<div id="Pong" class="grid grid-cols-2 justify-center gap-4">
							<div class="flex justify-center">
								<button id="match-button" class="btn rounded-lg border p-4 shadow">${t("match")}</button>
							</div>
							<div class="flex justify-center">
								<button id="tournament-button" class="btn rounded-lg border shadow">${t("tournament")}</button>
							</div>
						</div>
					</div>
					<!-- Div de PFC. -->
					<div class="rounded-lg border p-4 shadow">
						<h2 class="mb-2 text-2xl font-semibold">${t("pfc")}</h2>
						<div id="pfc" class="grid grid-cols-1 justify-center gap-0">
							<div class="flex justify-center">
								<button id="pfc-button" class="btn rounded-lg border p-4 shadow">${t("play")}</button>
							</div>
						</div>
					</div>
				</div>
				<!-- Div des historiques. -->
				<div class="mt-4 grid grid-cols-2 justify-center gap-10 flex-shrink-0">
					<div id="history-pong" class="flex flex-cols items-center max-h-60 overflow-y-auto">
						<button id="pong-hist-btn" class="btn rounded-lg border p-1 pe-1 shadow">${t("history")}</button>
					</div>
					<div id="history-pfc" class="flex flex-cols items-center max-h-60 overflow-y-auto">
						<button id="pfc-hist-btn" class="btn rounded-lg border p-1 pe-1 shadow">${t("history")}</button>
					</div>
				</div>
			</div>
		</div>
	`;
}