import { W as WhatsappMessage } from './types-C_BnhUPh.js';

/**
 * # Store Message in History JSON (Mock)
 *
 * Mock version of Debug_StoreWhatsMsgHistoryInJson for the browser environment.
 * Logs the message to the console instead of writing to the Node.js filesystem.
 *
 * @param filePath - The path to the JSON file where history would be stored.
 * @param rawMsg - The raw WhatsApp message object to log.
 *
 * @example
 * ```typescript
 * Debug_StoreWhatsMsgHistoryInJson("./debug_history.json", rawMsg);
 * ```
 */
declare function Debug_StoreWhatsMsgHistoryInJson(filePath: string, rawMsg: WhatsappMessage): void;

export { Debug_StoreWhatsMsgHistoryInJson };
