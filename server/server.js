import express from "express";
import "dotenv/config";
import {
    ApiError,
    CheckoutPaymentIntent,
    Client,
    Environment,
    LogLevel,
    OrdersController,
    PaymentsController,
} from "@paypal/paypal-server-sdk";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const {
    PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET,
    PORT = 8080,
} = process.env;

const client = new Client({
    clientCredentialsAuthCredentials: {
        oAuthClientId: PAYPAL_CLIENT_ID,
        oAuthClientSecret: PAYPAL_CLIENT_SECRET,
    },
    timeout: 0,
    environment: Environment.Sandbox,
    logging: {
        logLevel: LogLevel.Info,
        logRequest: { logBody: true },
        logResponse: { logHeaders: true },
    },
}); 
const ordersController = new OrdersController(client);
const paymentsController = new PaymentsController(client);
const products = {
  hoodie: { id: "hoodie", name: "Hoodie", price: "40.00", currency: "USD" },
  cap: { id: "cap", name: "Cap", price: "15.00", currency: "USD" },
  teeshirt: { id: "teeshirt", name: "Tee-Shirt", price: "20.00", currency: "USD" },
};

/**
 * Create an order to start the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_create
 */
const createOrder = async (productId) => {
  const product = products[productId];
  if (!product) {
      throw new Error("Product not found.");
  }

  const collect = {
      body: {
          intent: "CAPTURE",
          purchaseUnits: [
              {
                  amount: {
                      currencyCode: product.currency,
                      value: product.price,
                  },
              },
          ],
      },
      prefer: "return=minimal",
  };

  try {
      const { body, ...httpResponse } = await ordersController.ordersCreate(collect);
      return {
          jsonResponse: JSON.parse(body),
          httpStatusCode: httpResponse.statusCode,
      };
  } catch (error) {
      if (error instanceof ApiError) {
          throw new Error(error.message);
      }
  }
};


// createOrder route
app.post("/api/orders", async (req, res) => {
  try {
      const { productId } = req.body;
      if (!productId) {
          return res.status(400).json({ error: "Product ID is required." });
      }

      const { jsonResponse, httpStatusCode } = await createOrder(productId);
      res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
      console.error("Failed to create order:", error);
      res.status(500).json({ error: error.message || "Failed to create order." });
  }
});




/**
 * Capture payment for the created order to complete the transaction.
 * @see https://developer.paypal.com/docs/api/orders/v2/#orders_capture
 */
const captureOrder = async (orderID) => {
    const collect = {
        id: orderID,
        prefer: "return=minimal",
    };

    try {
        const { body, ...httpResponse } = await ordersController.ordersCapture(
            collect
        );
        // Get more response info...
        // const { statusCode, headers } = httpResponse;
        return {
            jsonResponse: JSON.parse(body),
            httpStatusCode: httpResponse.statusCode,
        };
    } catch (error) {
        if (error instanceof ApiError) {
            // const { statusCode, headers } = error;
            throw new Error(error.message);
        }
    }
};

// captureOrder route
app.post("/api/orders/:orderID/capture", async (req, res) => {
    try {
        const { orderID } = req.params;
        const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
        res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
        console.error("Failed to create order:", error);
        res.status(500).json({ error: "Failed to capture order." });
    }
});


app.listen(PORT, () => {
    console.log(`Node server listening at http://localhost:${PORT}/`);
}); 