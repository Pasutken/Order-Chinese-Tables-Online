const express = require('express');
const router = express.Router();
const ContactMessage = require('../../model/ContactMessageModel'); // (Import Schema ของคุณ)


/**
 * @swagger
 * /api/contact:
 *    get:
 *        summary: Get all contact messages
 *        tags: [Contact]
 *        description: Retrieve all contact messages, sorted with unread first and newest first
 *        responses:
 *            200:
 *               description: Successfully retrieved messages
 *               content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              type: object
 *                              properties:
 *                                  _id:
 *                                      type: string
 *                                  name:
 *                                      type: string
 *                                  email:
 *                                      type: string
 *                                  message:
 *                                      type: string
 *                                  isRead:
 *                                      type: boolean
 *                                  createdAt:
 *                                      type: string
 *                                      format: date-time
 *                                  updatedAt:
 *                                      type: string
 *                                      format: date-time
 *            500:
 *               description: Cannot load messages
 */
// 1. GET (Read) - ดึงข้อความทั้งหมด
router.get('/messages', async (req, res) => {
  try {
    // (เรียงจาก "ยังไม่อ่าน" ขึ้นก่อน, และ "ใหม่สุด" ขึ้นก่อน)
    const messages = await ContactMessage.find({})
      .sort({ isRead: 1, createdAt: -1 });
      
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "ไม่สามารถโหลดข้อความได้", error: err.message });
  }
});


/**
 * @swagger
 * /api/contact/message/{id}/read:
 *    put:
 *        summary: Mark a contact message as read
 *        tags: [Contact]
 *        description: Update the `isRead` status of a contact message to true
 *        parameters:
 *          - name: id
 *            in: path
 *            required: true
 *            description: ID of the contact message to update
 *            schema:
 *              type: string
 *        responses:
 *            200:
 *               description: Message marked as read successfully
 *               content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              _id:
 *                                  type: string
 *                              name:
 *                                  type: string
 *                              email:
 *                                  type: string
 *                              message:
 *                                  type: string
 *                              isRead:
 *                                  type: boolean
 *                              createdAt:
 *                                  type: string
 *                                  format: date-time
 *                              updatedAt:
 *                                  type: string
 *                                  format: date-time
 *            404:
 *               description: Message not found
 *            500:
 *               description: Failed to update message
 */

// 2. PUT (Update) - มาร์คว่าอ่านแล้ว
router.put('/message/:id/read', async (req, res) => {
  try {
    const updatedMessage = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true } // (ส่งข้อมูลที่อัปเดตแล้วกลับไป)
    );
    if (!updatedMessage) return res.status(404).json({ message: "ไม่พบข้อความ" });
    res.json(updatedMessage);
  } catch (err) {
    res.status(500).json({ message: "อัปเดตล้มเหลว", error: err.message });
  }
});


/**
 * @swagger
 * /api/contact/message/{id}:
 *    delete:
 *        summary: Delete a contact message
 *        tags: [Contact]
 *        description: Delete a specific contact message by its ID
 *        parameters:
 *          - name: id
 *            in: path
 *            required: true
 *            description: ID of the contact message to delete
 *            schema:
 *              type: string
 *        responses:
 *            200:
 *               description: Message deleted successfully
 *               content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  example: "ลบข้อความสำเร็จ"
 *            404:
 *               description: Message not found
 *               content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  example: "ไม่พบข้อความ"
 *            500:
 *               description: Failed to delete message
 *               content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              message:
 *                                  type: string
 *                                  example: "ลบล้มเหลว"
 *                              error:
 *                                  type: string
 */
// 3. DELETE (Delete) - ลบข้อความ
router.delete('/message/:id', async (req, res) => {
  try {
    const deletedMessage = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!deletedMessage) return res.status(404).json({ message: "ไม่พบข้อความ" });
    res.json({ message: "ลบข้อความสำเร็จ" });
  } catch (err) {
    res.status(500).json({ message: "ลบล้มเหลว", error: err.message });
  }
});

module.exports = router;