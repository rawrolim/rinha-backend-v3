import { addToQueue } from "../configs/db";
import { getHeathInfo } from "./worker";

export async function processPayment(payment: any) {
    if (payment) {
        try {
            const healthDefault = await getHeathInfo('healthDefault');
            if (healthDefault.failing)
                throw new Error("Error to proccess on default queue");
            await sendPaymentDefault(payment, healthDefault.minResponseTime + 100);
        } catch (err) {
            try {
                const healthFallback = await getHeathInfo('healthFallback');
                if(healthFallback.failing)
                    throw new Error("Error to proccess on fallback queue");
                await sendPaymentFallback(payment, healthFallback.minResponseTime + 100);
            } catch (erro) {
                await addToQueue('pending', payment);
            }
        }
    }
}

async function sendPaymentDefault(payment: any, responseTime: number) {
    const controller = new AbortController();
    const id = setTimeout(() => { controller.abort() }, responseTime)
    await fetch(process.env.PAYMENT_PROCESSOR_URL_DEFAULT + '/payments', {
        method: 'POST',
        body: payment,
        signal: controller.signal,
    });
    clearTimeout(id);
    await addToQueue('successDefault', payment)
}

async function sendPaymentFallback(payment: any, responseTime: number) {
    const controller = new AbortController();
    const id = setTimeout(() => { controller.abort() }, responseTime)
    await fetch(process.env.PAYMENT_PROCESSOR_URL_FALLBACK + '/payments', {
        method: 'POST',
        body: payment,
        signal: controller.signal,
    });
    await addToQueue('successFallback', payment);
    clearTimeout(id);
}

