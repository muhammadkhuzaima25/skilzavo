import express from 'express'
import Message from '../models/Message.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/:projectId', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      projectId: req.params.projectId,
    }).sort('createdAt')
    res.json(messages)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router
