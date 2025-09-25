'use client'

import React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Home, LogIn } from 'lucide-react'
import { CourseDashboardLayout } from '@/components/layout'

const errorMessages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The verification token has expired or has already been used.',
  Default: 'An error occurred during authentication.',
  CredentialsSignin: 'Invalid email or password. Please check your credentials and try again.',
  EmailSignin: 'Unable to send email. Please try again later.',
  OAuthSignin: 'Error occurred during OAuth sign in.',
  OAuthCallback: 'Error occurred during OAuth callback.',
  OAuthCreateAccount: 'Could not create OAuth account.',
  EmailCreateAccount: 'Could not create email account.',
  Callback: 'Error occurred during callback.',
  OAuthAccountNotLinked: 'To confirm your identity, sign in with the same account you used originally.',
  SessionRequired: 'Please sign in to access this page.',
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error') || 'Default'

  const errorMessage = errorMessages[error] || errorMessages.Default

  const breadcrumbs = [
    { title: 'Home', href: '/' },
    { title: 'Authentication Error' }
  ]

  const handleRetry = () => {
    router.push('/auth/signin')
  }

  const handleHome = () => {
    router.push('/')
  }

  return (
    <CourseDashboardLayout
      pageTitle="Authentication Error"
      pageDescription="An error occurred during authentication"
      breadcrumbs={breadcrumbs}
    >
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-red-600">Authentication Error</CardTitle>
            <CardDescription>
              We encountered an issue while trying to authenticate you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Error Code: <code className="bg-muted px-1 py-0.5 rounded text-xs">{error}</code>
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={handleRetry} className="w-full">
                <LogIn className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={handleHome} className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                If this problem persists, please contact support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </CourseDashboardLayout>
  )
}
