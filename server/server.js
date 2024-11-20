// This is your test secret API key.
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const app = express();
app.use(express.static('public'));

const YOUR_DOMAIN = 'http://localhost:4242';

app.post('/create-checkout-session', async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: 'price_1QMuQ6DKtEoZ5pU2DVEAkc9I',
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${"http://localhost:4242"}/success.html`,
    cancel_url: `${"http://localhost:4242"}/cancel.html`,
    automatic_tax: {enabled: true},
});

  res.redirect(303, session.url);
});

app.listen(4242, () => console.log('Running on port 4242'));