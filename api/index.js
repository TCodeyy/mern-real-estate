import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js'

dotenv.config()


mongoose.connect(process.env.MONGO).then(() => {
    console.log('connected to db');
}).catch((err) => {
    console.log('err', err)
})
const app = express()

app.listen(3000,()=> {
    console.log('Server is running on port 3000!')
});

//we are index.js to use these routes when this api is hit
app.use("/api/user" , userRouter)