import { default as handler } from '../dist/server/index.js';
import { toNodeListener } from 'h3';

export default toNodeListener(handler);
