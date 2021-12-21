const express = require("express");
const serverless = require("serverless-http");
const starkbank = require("starkbank");
const dotenv = require("dotenv");
const cors = require("cors");
const fs = require("fs").promises;

// Express init
const app = express();
// const port = process.env.PORT || 5000;
const router = express.Router();
app.use(cors());
app.use(express.json());

// Dotenv
dotenv.config();

const privateKey = process.env.STARKBANK_PRIVATE_KEY;

const project = new starkbank.Project({
  environment: "sandbox",
  id: "5533243717713920",
  privateKey,
});

// Setting up StarkBank's default user
starkbank.user = project;
// Setting up StarkBank's error language
starkbank.language = "en-US";

// List invoices
router.get("/invoices", async (req, res) => {
  const { after, before } = req.body;
  let allInvoices = [];

  try {
    const response = await starkbank.invoice.query({
      after: after || "",
      // before: new Date().toLocaleDateString().split(" ")[0],
      before: before || "",
    });

    for await (invoice of response) {
      allInvoices.push(invoice);
    }

    res.status(200).send({ response: allInvoices });
  } catch (error) {
    return res.status(400).send({ error });
  }
});

// Create new invoice
router.post("/invoices/create", async (req, res) => {
  const {
    amount,
    taxId,
    name,
    due,
    fine,
    interest,
    expiration,
    discounts,
    descriptions,
    tags,
  } = req.body;

  try {
    const response = await starkbank.invoice.create([
      {
        amount,
        taxId,
        name,
        due,
        fine,
        interest,
        expiration,
        discounts,
        descriptions,
        tags,
      },
    ]);

    res.status(200).send({ response });
  } catch (error) {
    res.status(400).send({ error });
  }
});

// Get Invoice By ID
router.get("/invoices/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const response = await starkbank.invoice.get(id);

    res.status(200).send({ response });
  } catch (error) {
    res.status(400).send({ error });
  }
});

app.use("/.netlify/functions/app", router);

// app.listen(port, () => console.log("App is live and running"));

module.exports.handler = serverless(app);
