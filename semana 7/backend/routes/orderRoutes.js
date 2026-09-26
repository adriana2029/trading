const express = require('express');

const OrderController = require('../controllers/OrderController');

const router = express.Router();

const orderController = new OrderController();

router.post('/', orderController.createOrder);

module.exports = router;