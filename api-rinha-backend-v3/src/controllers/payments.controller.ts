import { Request, Response } from "express";
import { removeToQueue, addToQueue, getValue } from "../configs/db";

export async function createPayment(req: Request, res: Response) {
    try {
        const data = {
            ...req.body,
            requestedAt: new Date()
        }
        await addToQueue('pending', data);
        res.status(202).send({ message: 'Pagamento recebido e enfileirado.' });
    } catch (err: any) {
        console.log("Erro ao enfileirar pagamento")
        console.log(err.toString())
        res.status(500).send({ message: 'Erro ao enfileirar pagamento.', error: err });
    }
}

export async function getPaymentsDetails(req: Request, res: Response) {
    try {
        const { from, to } = req.query;
        let successDefault = await getValue('successDefault');
        let successFallback = await getValue('successFallback');
        if(from && to){
            if(typeof from == 'string' && typeof to == 'string'){
                const dateFrom = new Date(from).valueOf();
                const dateTo = new Date(from).valueOf();
                successDefault = successDefault.filter(item => (new Date(item.requestedAt).valueOf() - dateFrom) > 0 && item.requestedAt < dateTo);
                successFallback = successFallback.filter(item => from > item.requestedAt && item.requestedAt < dateTo);
            }
        }
        const amountDefault = successDefault.reduce((total, current) => total + current.amount, 0);
        const amountFallback = successFallback.reduce((total, current) => total + current.amount, 0);

        res.status(200).json({
            "default": {
                "totalRequests": successDefault.length,
                "totalAmount": amountDefault
            },
            "fallback": {
                "totalRequests": successFallback.length,
                "totalAmount": amountFallback
            }
        });
    } catch (err) {
        console.log("ERRO PARA BUSCAR DADOS", err)
        res.status(500).json({ message: err })
    }
}