const { Order } = require('./Server/models');

async function check() {
    try {
        const order = await Order.findOne();
        if (order) {
            console.log('Order Keys:', Object.keys(order.toJSON()));
            console.log('created_at value:', order.toJSON().created_at);
            console.log('createdAt value:', order.toJSON().createdAt);
        } else {
            console.log('No orders found in DB');
        }
    } catch (error) {
        console.error(error);
    }
    process.exit(0);
}

check();
