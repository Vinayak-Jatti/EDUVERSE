import { EventEmitter } from "events";

const eventBus = new EventEmitter();

/**
 * Global Event Bus
 * Used for cross-module communication without direct coupling.
 * 
 * @example
 *   eventBus.emit('auth:signup', { userId: '...' });
 *   eventBus.on('auth:signup', (payload) => { ... });
 */
export default eventBus;
