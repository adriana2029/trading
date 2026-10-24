const express = require('express');

const OrderController = require('../controllers/OrderController');

const router = express.Router();

const orderController = new OrderController();

router.post('/', orderController.createOrder);

router.get('/', orderController.history);

router.get('/portfolio', orderController.portfolio);

router.get('/account', orderController.account);

router.get('/price', orderController.price);

router.get('/assets', orderController.assets);

router.post('/pending/process', orderController.processPending);

module.exports = router;
