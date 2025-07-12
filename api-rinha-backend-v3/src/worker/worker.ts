import { addToQueue, getRedisClientConnection, getValue, removeToQueue } from "../configs/db";
import { processPayment } from "./processPayment";
import cluster from 'cluster';

export async function startWorker() {
    console.log('Worker iniciado...');
    while (true) {
        const payment = await removeToQueue('pending');
        await processPayment(payment);
    }
}

export async function getHeathInfo(key: string) {
    const defaultHealtArr = await getValue(key);
    return defaultHealtArr[0];
}

export async function updateHealthCheck() {
    if (cluster.isPrimary)
        setInterval(async () => {
            let dateDiffDefault = 5000;
            let dateDiffFallback = 5000;
            try {
                const healthDefault = await getHeathInfo('healthDefault');
                if (healthDefault)
                    dateDiffDefault = new Date().valueOf() - new Date(healthDefault.date).valueOf();
                if (dateDiffDefault >= 5000) {
                    const responseDefault = await fetch(`${process.env.PAYMENT_PROCESSOR_URL_DEFAULT}/payments/service-health`, { 'cache': 'no-cache' });
                    const dataDefault = await responseDefault.json();
                    dataDefault.date = new Date();
                    await addToQueue('healthDefault', dataDefault);
                }
                const healthFallback = await getHeathInfo('healthFallback');
                if (healthFallback)
                    dateDiffFallback = new Date().valueOf() - new Date(healthFallback.date).valueOf()
                if (dateDiffFallback >= 5000) {
                    const responseFallback = await fetch(`${process.env.PAYMENT_PROCESSOR_URL_FALLBACK}/payments/service-health`, { 'cache': 'no-cache' });
                    const dataFallback = await responseFallback.json();
                    dataFallback.date = new Date();
                    await addToQueue('fallbackHealth', dataFallback);
                }
            } catch (err) {
                //console.log("Erro ao salvar health", err)
            }
        }, 5000);
}