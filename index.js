// index.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const cors = require('cors');

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = require('twilio')(accountSid, authToken);


const app = express();
const port = 3001;

// Enable CORS for all origins
app.use(cors());

// Use body parser to handle JSON data
app.use(bodyParser.json());

// Sample grocery items
const groceries = [
  { id: 1, name: 'Milk' },
  { id: 2, name: 'Bread' },
  { id: 3, name: 'Eggs' },
  { id: 4, name: 'Butter' },
  { id: 5, name: 'Cheese' }
];

// Get grocery items
app.get('/groceries', (req, res) => {
  res.json(groceries);
});

// Check grocery items and send SMS
app.post('/check-items', (req, res) => {
  const { phoneNumber, items } = req.body;

  if (!phoneNumber || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).send('Phone number and list of items are required');
  }

  const selectedItems = groceries.filter(item => items.includes(item.id));

  if (selectedItems.length === 0) {
    return res.status(400).send('No valid items selected');
  }

  const itemNames = selectedItems.map(item => item.name).join(', ');

  // Send SMS using Twilio
  client.messages
    .create({
      body: `Your grocery items: ${itemNames}`,
      from: twilioPhoneNumber,
      to: phoneNumber
    })
    .then((message) => {
      res.status(200).send(`SMS sent successfully to ${phoneNumber}`);
    })
    .catch((error) => {
      res.status(500).send('Error sending SMS: ' + error.message);
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
