import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route.js'
import authRouter from './routes/auth.route.js'

dotenv.config()


mongoose.connect(process.env.MONGO).then(() => {
}).catch((err) => {
})
const app = express()

app.use(express.json())
 
app.listen(3000,()=> {
});

//we are index.js to use these routes when this api is hit
app.use("/api/user" , userRouter)
app.use("/api/auth", authRouter)


//create middleware to catch errors
app.use((err, req , res , next) => {
   const statusCode = err.statusCode || 500
   const message = err.message || "Internal server error"
   return res.status(statusCode).json({
    success:false,message,statusCode
   })
})