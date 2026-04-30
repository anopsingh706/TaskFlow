import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { token, isAuthenticated } = useAuth()
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState(new Set())

  useEffect(() => {
    if (!isAuthenticated || !token) {
      socketRef.current?.disconnect()
      socketRef.current = null
      setConnected(false)
      return
    }

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    socket.on('connect',    () => { setConnected(true);  console.log('🟢 Socket connected') })
    socket.on('disconnect', () => { setConnected(false); console.log('🔴 Socket disconnected') })
    socket.on('connect_error', (err) => console.error('Socket error:', err.message))

    socket.on('user_status', ({ userId, status }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev)
        if (status === 'online') next.add(userId)
        else next.delete(userId)
        return next
      })
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
      setConnected(false)
    }
  }, [isAuthenticated, token])

  const emit = (event, data, cb) => {
    if (!socketRef.current?.connected) return
    socketRef.current.emit(event, data, cb)
  }

  const on  = (event, handler) => socketRef.current?.on(event, handler)
  const off = (event, handler) => socketRef.current?.off(event, handler)

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected, onlineUsers, emit, on, off }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket must be inside SocketProvider')
  return ctx
}
