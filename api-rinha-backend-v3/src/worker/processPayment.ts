import { addToQueue } from "../configs/db";
import { setTimeout } from 'timers/promises';

export async function processPayment(payment: any) {
    if (payment) {
        const controller = new AbortController();
        setTimeout(100).then(() => controller.abort())
        try {
            console.log('Processando pagamento default');
            //await fetch(process.env.PAYMENT_PROCESSOR_URL_DEFAULT + '/payments', {
            await fetch('http://localhost:8001/payments', {
                method: 'POST',
                body: payment,
                signal: controller.signal,
            });
            //clearTimeout(id);
            await addToQueue('successDefault', payment)
            console.log('Pagamento processado com sucesso.');
        } catch (err) {
            try {
                console.log('Erro ao processar pagamento pela rota default:', err);
                console.log('Processando pagamento com a rota fallback');
                await fetch('http://localhost:8002/payments', {
                    method: 'POST',
                    body: payment,
                });
                await addToQueue('successFallback', payment);
                console.log('Pagamento processado com sucesso.');
            } catch (erro) {
                await addToQueue('pending',payment);
                console.log(`Pagamento não processado, retornou a fila id ${payment.correlationId}`);
            }
        }
    }
}