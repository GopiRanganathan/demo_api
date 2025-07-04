import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

const mongoose = require('mongoose');
import PaymentRouter from './routers/payment';
import AccountRouter from './routers/account';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors())

// Connect to new MongoDB database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((err: any) => {
    console.error('❌ Connection error:', err);
  });

app.use('/api', PaymentRouter)
app.use('/api', AccountRouter)
console.log('ROUTER REGISTERED')

app.get('/', (req, res) => {
  res.send('Hello, Gopi’s  ggg Express + TS API!');
});


app.get('/health', (req, res) => {
  res.send('working fine')
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

