const express = require('express');
const router = express.Router();
// Chat is handled via socket.io in server.js
// This route provides room ID generation
router.get('/room/:productId', (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.session.buyerId || req.session.sellerId;
    if (!userId) return res.status(403).json({ message: 'Login required.' });
    const roomId = `room_${productId}`;
    res.json({ roomId });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;
