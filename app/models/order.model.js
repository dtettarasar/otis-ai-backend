const mongoose = require("mongoose");

const OrderSch = new mongoose.Schema({
    stripeEventId: {type: String, required: true},
    stripeSessionId: {type: String, required: true},
    stripeCustomerId: {type: String, required: true}, 
    otisUserId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    crdQuantity: {type: Number, default: 0 },
    amountPaid: {type: Number, default: 0 }
});

const Order = mongoose.model(
    "Order", OrderSch
);

module.exports = Order;