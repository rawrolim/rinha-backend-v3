import { getRedisClientConnection, removeToQueue } from "../configs/db";
import { processPayment } from "./processPayment";

export async function startWorker() {
    console.log('Worker iniciado...');
    while (true) {
        const payment = await removeToQueue('pending'); // bloqueia até ter item
        await processPayment(payment);
    }
}