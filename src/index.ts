import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import { productRouter } from './products/server';
import { loginRouter } from './login/server';

const app = express();
//const prisma = new PrismaClient();

require('dotenv').config()

app.use(cors());

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const PORT = process.env.PORT || 3001;

//routers
app.use('/product', productRouter);
app.use('/user', loginRouter);


app.listen(PORT, () => {
    console.log(`Marwa Inventory server listening on ${PORT}`)   
})
