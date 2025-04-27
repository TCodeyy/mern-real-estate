import express from 'express'
import { signup } from '../controllers/auth.controller.js'


const router = express.Router()
console.log('auth route')
router.post("/signup",signup)

export default router