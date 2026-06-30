import './styles.css';
import { CONFIG } from './game/config';
import { Game } from './game/Game';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Expected #app root element to exist.');
}

const shell = document.createElement('main');
shell.className = 'app-shell';

const frame = document.createElement('section');
frame.className = 'game-frame';

const hud = document.createElement('div');
hud.className = 'game-hud';
hud.setAttribute('aria-label', 'Game HUD');

const canvas = document.createElement('canvas');
canvas.width = CONFIG.width;
canvas.height = CONFIG.height;
canvas.setAttribute('aria-label', 'Asteroid Defense game canvas');

const modal = document.createElement('div');
modal.setAttribute('aria-label', 'Game modal');

frame.append(hud, canvas, modal);
shell.append(frame);
app.append(shell);

const game = new Game(canvas, hud, modal);
game.start();
