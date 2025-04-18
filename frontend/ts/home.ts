import { t } from '../lang/i18n.js'

export function homePage() {
	return `
		<div class="container">
			<div class="grid grid-cols-3 gap-2">
				<button class="btn border p-4 shadow">fr</button>
				<button class="btn border p-4 shadow">en</button>
				<button class="btn border p-4 shadow">es</button>
			</div>
		</div>
		<div class="container mx-auto py-10 text-center">
			<h1 class="font-bold mb-4 text-4xl">Pong</h1>
			<div class="grid grid-cols-2 justify-center gap-10">
				<div class="rounded-lg border p-4 shadow">
					<h2 class="mb-2 text-2xl font-semibold">Pong</h2>
					<div id="Pong" class="grid grid-cols-2 justify-center gap-4">
						<div class="flex justify-center">
							<button id="match-button" class="btn rounded-lg border p-4 shadow">${t("match")}</button>
						</div>
						<div class="flex justify-center">
							<button id="tournament-button" class="btn rounded-lg border p-4 shadow">${t("tournament")}</button>
						</div>
					</div>
				</div>
				<div class="rounded-lg border p-4 shadow">
					<h2 class="mb-2 text-2xl font-semibold">${t("pfc")}</h2>
					<div class="grid grid-cols-1 justify-center gap-0">
						<div class="flex justify-center">
							<button id="pfc-button" class="btn rounded-lg border p-4 shadow">${t("play")}</button>
						</div>
					</div>
				</div>
			</div>
			<div class="mt-4 grid grid-cols-2 justify-center gap-10 flex-shrink-0">
				<div id="history-pong" class="fle flex-cols items-center max-h-60 overflow-y-auto">
					<button id="pong-hist-btn" class="btn rounded-lg border p-1 pe-1 shadow">${t("history")}</button>
				</div>
				<div id="history-pfc" class="flex flex-cols items-center max-h-60 overflow-y-auto">
					<button id="pfc-hist-btn" class="btn rounded-lg border p-1 pe-1 shadow">${t("history")}</button>
				</div>
			</div>
		</div>
	`;
}