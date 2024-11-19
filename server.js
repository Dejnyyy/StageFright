require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const app = express();
app.use(express.static('public'));
app.use(express.json()); // Parse JSON body

const YOUR_DOMAIN = 'http://localhost:4242';

app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: 'price_1QMuQ6DKtEoZ5pU2DVEAkc9I',
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}/success.html`,
      cancel_url: `${YOUR_DOMAIN}/cancel.html`,
      automatic_tax: { enabled: true },
    });

    res.redirect(303, session.url);
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).send('An error occurred while creating the checkout session');
  }
});

app.listen(4242, () => console.log('Running on port 4242'));
