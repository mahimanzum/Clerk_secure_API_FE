'use client'

import React, { useState } from 'react'
import { useAuth } from '@clerk/nextjs'

interface TokenClaims {
  exp?: number
  iat?: number
  sub?: string
  email?: string
  [key: string]: any
}

export default function TokenDisplay() {
  const { getToken } = useAuth()
  const [token, setToken] = useState<string>('')
  const [tokenClaims, setTokenClaims] = useState<TokenClaims | null>(null)
  const [loading, setLoading] = useState(false)

  const parseJWT = (token: string): TokenClaims | null => {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('Error parsing JWT:', error)
      return null
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const getTimeUntilExpiry = (exp: number) => {
    const now = Math.floor(Date.now() / 1000)
    const timeLeft = exp - now
    
    if (timeLeft <= 0) return 'Expired'
    
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  const showToken = async () => {
    setLoading(true)
    try {
      const jwt = await getToken()
      if (jwt) {
        setToken(jwt)
        const claims = parseJWT(jwt)
        setTokenClaims(claims)
      } else {
        setToken('No token available')
        setTokenClaims(null)
      }
    } catch (error) {
      setToken('Error getting token')
      setTokenClaims(null)
    } finally {
      setLoading(false)
    }
  }

  const copyToken = () => {
    navigator.clipboard.writeText(token)
    alert('Token copied to clipboard!')
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        🔑 JWT Token Information
      </h3>
      
      <button
        onClick={showToken}
        disabled={loading}
        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md disabled:opacity-50 mb-4"
      >
        {loading ? 'Getting Token...' : 'Show JWT Token & Claims'}
      </button>

      {tokenClaims && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
          <h4 className="font-medium text-blue-800 mb-2">📊 Token Information:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-700">Issued At:</span>
              <p className="text-blue-600">{tokenClaims.iat ? formatTime(tokenClaims.iat) : 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium text-blue-700">Expires At:</span>
              <p className="text-blue-600">{tokenClaims.exp ? formatTime(tokenClaims.exp) : 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium text-blue-700">Time Until Expiry:</span>
              <p className="text-blue-600 font-mono">{tokenClaims.exp ? getTimeUntilExpiry(tokenClaims.exp) : 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium text-blue-700">User ID:</span>
              <p className="text-blue-600 font-mono">{tokenClaims.sub || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {token && (
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700">Your JWT Token:</span>
              <button
                onClick={copyToken}
                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
              >
                Copy Token
              </button>
            </div>
            <code className="text-xs text-gray-800 break-all">{token}</code>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h4 className="font-medium text-green-800 mb-2">📋 All Token Claims:</h4>
            <pre className="text-xs text-green-700 bg-green-100 p-2 rounded overflow-auto max-h-40">
              {tokenClaims ? JSON.stringify(tokenClaims, null, 2) : 'No claims available'}
            </pre>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h4 className="font-medium text-yellow-800 mb-2">🔧 Manual Testing with curl:</h4>
            <pre className="text-xs text-yellow-700 bg-yellow-100 p-2 rounded overflow-auto">
{`curl -H "Authorization: Bearer ${token}" \\
     http://localhost:8000/protected`}
            </pre>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
            <h4 className="font-medium text-purple-800 mb-2">ℹ️ JWT Token Facts:</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• <strong>Default Expiry:</strong> 1 hour (3600 seconds)</li>
              <li>• <strong>Auto Refresh:</strong> Clerk automatically refreshes tokens ~5 minutes before expiry</li>
              <li>• <strong>Browser Storage:</strong> Stored in httpOnly cookies (secure)</li>
              <li>• <strong>Frequency:</strong> New token generated on each API call if near expiry</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
} 