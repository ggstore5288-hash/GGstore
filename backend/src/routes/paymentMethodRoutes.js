const express = require('express');
const router = express.Router();
const { getActivePaymentMethods } = require('../controllers/paymentMethodController');

router.get('/', getActivePaymentMethods);

module.exports = router;
