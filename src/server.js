const express = require('express')
const bodyParser = require('body-parser')
const connectDB = require('./configs/db')
const dotenv = require('dotenv').config()
const {errorHandler} = require('./api/v1/middlewares/errorHandler')
const PORT = process.env.PORT || 4000

const app = express()
// auth routes
const authRouter = require('./api/v1/routes/authRoute')
const cookieParser = require('cookie-parser')
connectDB();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(errorHandler);
app.use(cookieParser());


app.use('/api/user', authRouter);

app.listen(PORT, () =>{
    console.log(`Server listening on ${PORT}`)
})


