import { createContext, useContext, useEffect, useState } from 'react'
import { loginUser, registerUser, logoutUser, getCurrentUser } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  async function initializeAuth() {
    try {
      const res = await getCurrentUser();
      // console.log("Fetched current user: AppCONTEXT", res);
      setUser(res);
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    initializeAuth()
  }, [])

  async function login(email, password) {
    await loginUser(email, password)
    await initializeAuth()
  }

  async function register(email, password, confirmPassword) {
    await registerUser(email, password, confirmPassword)
    await initializeAuth()
  }

  async function logout() {
    await logoutUser()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, initializeAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}