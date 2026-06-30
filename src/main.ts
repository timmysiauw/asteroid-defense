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

const canvas = document.createElement('canvas');
canvas.width = CONFIG.width;
canvas.height = CONFIG.height;
canvas.setAttribute('aria-label', 'Asteroid Defense game canvas');

frame.append(canvas);
shell.append(frame);
app.append(shell);

const game = new Game(canvas);
game.start();
