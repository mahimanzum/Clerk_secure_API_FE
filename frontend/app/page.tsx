import React from 'react'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import ClientPage from './components/ClientPage'
import TokenDisplay from './components/TokenDisplay'

export default async function HomePage() {
  const { userId } = await auth()

  if (!userId) {
    // If not authenticated, redirect to dashboard to trigger sign-in
    redirect('/dashboard')
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to the Secured API Demo
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          This application demonstrates secure communication between a Next.js frontend 
          and FastAPI backend using Clerk authentication and JWT tokens.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          🔒 Security Features
        </h3>
        <ul className="space-y-2 text-gray-600">
          <li>✅ JWT token authentication with Clerk</li>
          <li>✅ Secure API communication</li>
          <li>✅ Protected routes and middleware</li>
          <li>✅ CORS protection</li>
          <li>✅ Token verification using JWKS</li>
        </ul>
      </div>

      <ClientPage />
      <TokenDisplay />
    </div>
  )
} 