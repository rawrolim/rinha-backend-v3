import { Request, Response } from "express";

export async function createPayment(req: Request, res: Response) {
    try {
        console.log("Inicio do processamento do pagamento");
        await fetch(process.env.PAYMENT_PROCESSOR_URL_DEFAULT + '/payments/service-health', {
            method: 'POST',
            body: req.body
        });
        console.log("Pagamento processado com sucesso");
    } catch (err: any) {
        console.log("Erro ao realizar pagamento")
        console.log(err.toString())
    }
}

export async function getPaymentsDetails(req: Request, res: Response) {
    return {
        "default": {
            "totalRequests": 43236,
            "totalAmount": 415542345.98
        },
        "fallback": {
            "totalRequests": 423545,
            "totalAmount": 329347.34
        }
    }
}