require('dotenv').config();
console.log('Stripe key:', process.env.STRIPE_SECRET_KEY ? 'Loaded' : 'Not loaded');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const app = express();
app.use(express.static('public'));
app.use(express.json());

const YOUR_DOMAIN = 'http://127.0.0.1:5501/StageFright';

app.post('/create-checkout-session', async (req, res) => {
    console.log('Received POST request:', req.body);

    try {
      const { priceId } = req.body;
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${YOUR_DOMAIN}/success.html`,
        cancel_url: `${YOUR_DOMAIN}/cancel.html`,
        automatic_tax: { enabled: true },
      });
  
      res.json({ url: session.url });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: 'An error occurred while creating the checkout session' });
    }
  });
app.listen(4242, () => console.log('Running on port 4242'));
