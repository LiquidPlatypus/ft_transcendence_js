import { showAliasInputs, showHistory, showHome, showPlayerCountSelection } from "./script.js";
import { matchTypeChoice } from "./Utilities.js";
import {showPFCMatch} from "./chifoumi.js";

type RouteHandler = () => void;

const routes: Record<string, RouteHandler> = {
    '/home': () => {
        console.log("Navigating to Home");
        showHome();
    },

    '/pong/history/two': () => {
        console.log("Navigating to Two Players Pong History");
        showHistory('pong');
    },
    '/pong/history/four': () => {
        console.log("Navigating to Four Players Pong History");
        showHistory('fourpong');
    },

    '/pong/select/type': () => {
        console.log("Navigating to Pong Type Selection");
        matchTypeChoice('match', 'pong');
    },

    '/pong/normal/playerSize': () => {
        console.log("Navigating to Pong Player Count Selection");
        showPlayerCountSelection('match', 'normal');
    },

    '/pong/bonus/playerSize': () => {
        console.log("Navigating to Pong Player Count Selection");
        showPlayerCountSelection('match', 'bonus');
    },

    '/pong/normal/select/players/two': () => {
        console.log("Navigating to Pong Name Selection for Two Players");
        showAliasInputs(2, 'match', 'normal', 'pong');
    },

    '/pong/normal/select/players/four': () => {
        console.log("Navigating to Pong Name Selection for Four Players");
        showAliasInputs(4, 'match', 'normal', 'pong');
    },

    '/pong/bonus/select/players/two': () => {
        console.log("Navigating to Pong Bonus Name Selection for Two Players");
        showAliasInputs(2, 'match', 'bonus', 'pong');
    },

    '/pong/bonus/select/players/four': () => {
        console.log("Navigating to Pong Bonus Name Selection for Four Players");
        showAliasInputs(4, 'match', 'bonus', 'pong');
    },

    '/chifoumi/history': () => {
        console.log("Navigating to Chifoumi History");
        showHistory('pfc');
    },

    '/chifoumi/select/type': () => {
        console.log("Navigating to Chifoumi Type Selection");
        matchTypeChoice('match', 'pfc');
    },

    '/chifoumi/select/players': () => {
        console.log("Navigating to Chifoumi Name Selection");
        showAliasInputs(2, 'match', 'normal', 'pfc');
    },

    '/chifoumi/game/normal': () => {
        console.log("Navigating to Chifoumi Normal Game");
        showPFCMatch('normal');
    },

    '/chifoumi/game/bonus': () => {
        console.log("Navigating to Chifoumi Bonus Game");
        showPFCMatch('bonus');
    },
};
export function navigate(path: string) {
    if (path === '/home') {
        history.replaceState({ path }, '', window.location.pathname); // pas de retour possible
    } else {
        history.pushState({ path }, '', window.location.pathname); // ajoute une entrée
    }
    // Déclenchez les écouteurs *avant* d'appeler handleRoute, car handleRoute change le contenu
    navigateListeners.forEach(listener => listener()); // NOUVEAU LIGNE
    handleRoute(path);
}
type NavigateListener = () => void;
const navigateListeners: NavigateListener[] = [];

export function onNavigate(listener: NavigateListener): () => void {
    navigateListeners.push(listener);
    return () => {
        // Fonction de désabonnement
        const index = navigateListeners.indexOf(listener);
        if (index > -1) {
            navigateListeners.splice(index, 1);
        }
    };
}

function handleRoute(path: string) {
    const handler = routes[path];
    if (handler) {
        handler();
    } else {
        console.error(`No route handler found for ${path}`);
        navigate('/home');
        showHome();
    }
}

window.addEventListener('popstate', (event) => {
    const state = event.state as { path?: string } | null;
    if (state?.path) {
        handleRoute(state.path);
    } else {
        navigate('/home');
    }
});

if (history.state?.path) {
    handleRoute(history.state.path);
} else {
    navigate('/home');
}
