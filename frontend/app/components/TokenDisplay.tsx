'use client'

import React, { useState } from 'react'
import { useAuth } from '@clerk/nextjs'

export default function TokenDisplay() {
  const { getToken } = useAuth()
  const [token, setToken] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const showToken = async () => {
    setLoading(true)
    try {
      const jwt = await getToken()
      setToken(jwt || 'No token available')
    } catch (error) {
      setToken('Error getting token')
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
        🔑 JWT Token (For Manual Testing)
      </h3>
      
      <button
        onClick={showToken}
        disabled={loading}
        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md disabled:opacity-50 mb-4"
      >
        {loading ? 'Getting Token...' : 'Show JWT Token'}
      </button>

      {token && (
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700">Your JWT Token:</span>
              <button
                onClick={copyToken}
                className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
              >
                Copy
              </button>
            </div>
            <code className="text-xs text-gray-800 break-all">{token}</code>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Manual Testing with curl:</h4>
            <pre className="text-xs text-yellow-700 bg-yellow-100 p-2 rounded overflow-auto">
{`curl -H "Authorization: Bearer ${token}" \\
     http://localhost:8000/protected`}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
} 