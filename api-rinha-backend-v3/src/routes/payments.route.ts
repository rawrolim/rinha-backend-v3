import express from 'express';
import { createPayment, getPaymentsDetails } from '../controllers/payments.controller';

const paymentsRoutes = express.Router();

paymentsRoutes.post('/payments',createPayment);
paymentsRoutes.get('/payments-summary',getPaymentsDetails);

export default paymentsRoutes;