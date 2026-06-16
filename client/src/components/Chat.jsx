import { useState, useEffect, useRef } from 'react'
import { Send, Loader } from 'lucide-react'
import socket from '../socket'
import API from '../utils/axios'
import useAuth from '../hooks/useAuth'

export default function Chat({ projectId }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUser, setTypingUser] = useState('')
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)
  let typingTimeout = null

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await API.get(`/api/messages/${projectId}`)
        setMessages(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchMessages()
  }, [projectId])

  useEffect(() => {
    socket.connect()
    socket.emit('join_room', projectId)

    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg])
    })

    socket.on('user_typing', (data) => {
      if (data.senderId !== user._id) {
        setTypingUser(data.senderName)
        setIsTyping(true)
      }
    })

    socket.on('user_stop_typing', () => {
      setIsTyping(false)
      setTypingUser('')
    })

    return () => {
      socket.off('receive_message')
      socket.off('user_typing')
      socket.off('user_stop_typing')
      socket.disconnect()
    }
  }, [projectId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleTyping = () => {
    socket.emit('typing', {
      projectId,
      senderId: user._id,
      senderName: user.name,
    })
    clearTimeout(typingTimeout)
    typingTimeout = setTimeout(() => {
      socket.emit('stop_typing', { projectId })
    }, 1500)
  }

  const sendMessage = () => {
    if (!input.trim()) return
    socket.emit('send_message', {
      projectId,
      senderId: user._id,
      senderName: user.name,
      senderAvatar: user.profilePicture,
      message: input.trim(),
    })
    setInput('')
    socket.emit('stop_typing', { projectId })
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="font-medium text-gray-900">Project Chat</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader className="animate-spin text-[#0A7C72]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-400 text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === user._id || msg.sender === user._id
            return (
              <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                {!isOwn && (
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-[#0A7C72] text-sm font-bold mr-2 flex-shrink-0">
                    {msg.senderName?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOwn ? 'bg-[#0A7C72] text-white rounded-tr-sm' : 'bg-gray-100 text-gray-900 rounded-tl-sm'}`}>
                  {!isOwn && (
                    <p className="text-xs font-medium text-[#0A7C72] mb-1">{msg.senderName}</p>
                  )}
                  <p className="text-sm">{msg.message}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-teal-200' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}

        {isTyping && (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            {typingUser} is typing...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-gray-200 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            handleTyping()
          }}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#0A7C72] focus:ring-1 focus:ring-[#0A7C72]"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="bg-[#0A7C72] hover:bg-[#065F55] disabled:opacity-50 text-white p-2 rounded-xl transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
