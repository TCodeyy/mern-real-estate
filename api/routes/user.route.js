// We make the routes in different files and export them so that tehy can be used in index.js


import express from 'express';
import { test } from '../controllers/user.controller.js';


const router = express.Router()


router.get('/test', test)


// we will put the logics in controllers folder and not here


export default router;