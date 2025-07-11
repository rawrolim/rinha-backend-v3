import { Request, Response } from "express";
import { removeToQueue, addToQueue, getValue } from "../configs/db";

export async function createPayment(req: Request, res: Response) {
    try {
        console.log("Inicio do processamento do pagamento");
        const data = {
            ...req.body,
            requestedAt: new Date()
        }
        await addToQueue('pending', data);
        console.log("Pagamento enfileirado com sucesso");
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
            successDefault = successDefault.filter(item => from > item.requestedAt && item.requestedAt < to);
            successFallback = successFallback.filter(item => from > item.requestedAt && item.requestedAt < to);
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