// We make the routes in different files and export them so that tehy can be used in index.js


import express from 'express';
import { test, updateUser } from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';


const router = express.Router()

router.get('/test', test)
router.post('/update/:id', verifyToken , updateUser)


// we will put the logics in controllers folder and not here


export default router;