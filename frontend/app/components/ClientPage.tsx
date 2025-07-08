'use client'

import React, { useState, useEffect } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ApiResponse {
  message?: string
  user_id?: string
  user_email?: string
  [key: string]: any
}

export default function ClientPage() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const [apiResponses, setApiResponses] = useState<Record<string, ApiResponse>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [userData, setUserData] = useState({ name: '', message: '' })

  const callAPI = async (endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) => {
    setLoading(prev => ({ ...prev, [endpoint]: true }))
    
    try {
      const token = await getToken()
      
      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }

      if (method === 'POST' && data) {
        options.body = JSON.stringify(data)
      }

      const response = await fetch(`${API_URL}${endpoint}`, options)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      setApiResponses(prev => ({ ...prev, [endpoint]: result }))
    } catch (error) {
      console.error(`API call to ${endpoint} failed:`, error)
      setApiResponses(prev => ({ 
        ...prev, 
        [endpoint]: { 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }
      }))
    } finally {
      setLoading(prev => ({ ...prev, [endpoint]: false }))
    }
  }

  const handleUpdateData = async () => {
    if (!userData.name || !userData.message) {
      alert('Please fill in both name and message fields')
      return
    }
    
    await callAPI('/user/data', 'POST', userData)
    setUserData({ name: '', message: '' })
  }

  return (
    <div className="space-y-8">
      {/* User Info */}
      {user && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            👤 User Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-lg text-gray-900">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">User ID</p>
              <p className="text-lg text-gray-900 font-mono">{user.id}</p>
            </div>
          </div>
        </div>
      )}

      {/* API Testing */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          🔌 API Testing
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => callAPI('/protected')}
            disabled={loading['/protected']}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            {loading['/protected'] ? 'Loading...' : 'Test Protected Route'}
          </button>

          <button
            onClick={() => callAPI('/user/profile')}
            disabled={loading['/user/profile']}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            {loading['/user/profile'] ? 'Loading...' : 'Get User Profile'}
          </button>

          <button
            onClick={() => callAPI('/admin/users')}
            disabled={loading['/admin/users']}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            {loading['/admin/users'] ? 'Loading...' : 'Admin Route (Demo)'}
          </button>
        </div>

        {/* User Data Update */}
        <div className="border-t pt-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Update User Data</h4>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Your name"
                value={userData.name}
                onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <textarea
                placeholder="Your message"
                value={userData.message}
                onChange={(e) => setUserData(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
            <button
              onClick={handleUpdateData}
              disabled={loading['/user/data']}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {loading['/user/data'] ? 'Updating...' : 'Update Data'}
            </button>
          </div>
        </div>
      </div>

      {/* API Responses */}
      {Object.keys(apiResponses).length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            📡 API Responses
          </h3>
          <div className="space-y-4">
            {Object.entries(apiResponses).map(([endpoint, response]) => (
              <div key={endpoint} className="border rounded-md p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  {endpoint}
                </h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 