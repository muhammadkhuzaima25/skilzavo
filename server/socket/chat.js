import Message from '../models/Message.js'

const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    socket.on('join_room', (projectId) => {
      socket.join(projectId)
      console.log(`User joined room: ${projectId}`)
    })

    socket.on('send_message', async (data) => {
      const { projectId, senderId, senderName, message, senderAvatar } = data

      try {
        const newMessage = new Message({
          projectId,
          sender: senderId,
          senderName,
          senderAvatar,
          message,
          createdAt: new Date(),
        })
        await newMessage.save()

        io.to(projectId).emit('receive_message', {
          _id: newMessage._id,
          projectId,
          senderId,
          senderName,
          senderAvatar,
          message,
          createdAt: newMessage.createdAt,
        })
      } catch (err) {
        console.error('Message save error:', err)
      }
    })

    socket.on('typing', (data) => {
      socket.to(data.projectId).emit('user_typing', data)
    })

    socket.on('stop_typing', (data) => {
      socket.to(data.projectId).emit('user_stop_typing', data)
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })
}

export default setupSocket
