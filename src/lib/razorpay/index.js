"use server"

import Razorpay from "razorpay";
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a new order with Razorpay
 * @param {Object} order
 * @param {number} order.amount - amount of the order
 * @param {string} order.currency - currency of the order (INR, USD, etc)
 * @param {string} order.receipt - unique receipt for the order
 * @param {Object} order.notes - additional notes for the order
 * @returns {Object} created order or error
 */
export async function createOrder(order) {

    const options = {
        amount: order.amount * 100,
        currency: order.currency,
        receipt: order.receipt,
        notes: order.notes,
    };
    try {
        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        console.error(error);
        return {
            error: 'Error creating order'
        }
    }
}

export async function verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    try {
        const isValidSignature = validateWebhookSignature(body, razorpay_signature, secret);
        if (isValidSignature) {
            return { status: 'ok', orderId: razorpay_order_id, paymentId: razorpay_payment_id };
        } else {
            return { status: 'verification_failed' };
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        return { status: 'error', message: 'Error verifying payment' };
    }
}