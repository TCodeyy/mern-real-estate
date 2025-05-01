// We make the routes in different files and export them so that tehy can be used in index.js

import express from 'express';
import {
  test,
  updateUser,
  deleteUser,
  getUserListings,
  getUser,
} from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/test', test);
router.post('/update/:id', verifyToken, updateUser);
router.delete('/delete/:id', verifyToken, deleteUser);
router.get('/listings/:id', verifyToken, getUserListings);
router.get('/:id', verifyToken, getUser);

// we will put the logics in controllers folder and not here

export default router;
