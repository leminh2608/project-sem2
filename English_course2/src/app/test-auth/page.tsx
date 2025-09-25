'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestAuthPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
          <CardDescription>
            Test page to verify authentication is working
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Status:</strong> {status}
          </div>
          
          {session ? (
            <div className="space-y-2">
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <h3 className="font-semibold text-green-800">✅ Authenticated</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p><strong>Name:</strong> {session.user?.name}</p>
                  <p><strong>Email:</strong> {session.user?.email}</p>
                  <p><strong>Role:</strong> {session.user?.role}</p>
                  <p><strong>ID:</strong> {session.user?.id}</p>
                </div>
              </div>
              <Button onClick={() => signOut()} variant="outline" className="w-full">
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="p-4 bg-red-50 border border-red-200 rounded">
                <h3 className="font-semibold text-red-800">❌ Not Authenticated</h3>
                <p className="text-sm text-red-700">Please sign in to continue</p>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={() => signIn('credentials', { 
                    email: 'admin@example.com', 
                    password: 'admin123',
                    callbackUrl: '/test-auth'
                  })} 
                  className="w-full"
                >
                  Test Admin Login
                </Button>
                
                <Button 
                  onClick={() => signIn('credentials', { 
                    email: 'student.c@example.com', 
                    password: 'student123',
                    callbackUrl: '/test-auth'
                  })} 
                  variant="outline" 
                  className="w-full"
                >
                  Test Student Login
                </Button>
                
                <Button 
                  onClick={() => signIn()} 
                  variant="secondary" 
                  className="w-full"
                >
                  Go to Sign In Page
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
