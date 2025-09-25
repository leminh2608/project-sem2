'use client'

import React, { useState } from 'react'
import { Container } from '@/components/layout'
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  Badge,
  Avatar,
  AvatarFallback,
  Alert,
  AlertDescription,
  AlertTitle,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Separator
} from '@/components/ui'
import { ThemeSwitcher } from '@/components/shared/theme-switcher'
import { Navbar, NavbarBrand, NavbarContent } from './navbar'
import { FormField } from './form-field'
import { FormGroup } from './form-group'
import { LoadingSpinner } from './loading-spinner'
import { EmptyState } from './empty-state'
import { Modal, ConfirmModal } from './modal'
import { useTheme } from '@/contexts/theme-context'
import { toast } from 'sonner'
import {
  Bell,
  Search,
  Download,
  Upload,
  Heart,
  Star,
  Share2
} from 'lucide-react'

export function ComponentShowcase() {
  const { theme, availableVariants } = useTheme()
  const [showModal, setShowModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    notifications: false,
    theme: 'system'
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const showToast = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        toast.success('Success!', { description: 'Operation completed successfully.' })
        break
      case 'error':
        toast.error('Error!', { description: 'Something went wrong.' })
        break
      case 'info':
        toast.info('Info', { description: 'Here is some information.' })
        break
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navbar>
        <NavbarBrand>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">UI</span>
            </div>
            <span className="font-semibold text-lg">Component Library</span>
          </div>
        </NavbarBrand>
        <NavbarContent>
          <ThemeSwitcher />
        </NavbarContent>
      </Navbar>

      <Container size="xl" className="py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Next.js UI Component Library
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            A comprehensive, themeable, and accessible component library built with Next.js, TypeScript, and Tailwind CSS
          </p>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Badge variant="secondary">Next.js 15</Badge>
            <Badge variant="secondary">TypeScript</Badge>
            <Badge variant="secondary">Tailwind CSS</Badge>
            <Badge variant="secondary">shadcn/ui</Badge>
            <Badge variant="secondary">Accessible</Badge>
            <Badge variant="secondary">Responsive</Badge>
          </div>
        </div>

        {/* Theme Showcase */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Theme System</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Current theme: <Badge>{theme.variant}</Badge> in <Badge>{theme.mode}</Badge> mode
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {availableVariants.map((variant) => (
                <div key={variant} className="text-center">
                  <div className="w-full h-16 rounded-lg border mb-2 bg-gradient-to-r from-primary to-secondary"></div>
                  <span className="text-sm capitalize">{variant}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Component Showcase */}
        <Tabs defaultValue="buttons" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="overlays">Overlays</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
          </TabsList>

          {/* Buttons Tab */}
          <TabsContent value="buttons">
            <Card>
              <CardHeader>
                <CardTitle>Button Components</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Button Variants</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="link">Link</Button>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Button Sizes</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-3">Icon Buttons</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button><Heart className="w-4 h-4 mr-2" />Like</Button>
                    <Button variant="outline"><Star className="w-4 h-4 mr-2" />Star</Button>
                    <Button variant="ghost"><Share2 className="w-4 h-4 mr-2" />Share</Button>
                    <Button size="sm"><Download className="w-4 h-4" /></Button>
                    <Button size="sm" variant="outline"><Upload className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forms Tab */}
          <TabsContent value="forms">
            <Card>
              <CardHeader>
                <CardTitle>Form Components</CardTitle>
              </CardHeader>
              <CardContent>
                <FormGroup>
                  <FormField label="Full Name" required>
                    <Input 
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </FormField>

                  <FormField label="Email Address" required>
                    <Input 
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </FormField>

                  <FormField label="Message">
                    <Textarea 
                      placeholder="Enter your message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                    />
                  </FormField>

                  <FormField label="Theme Preference">
                    <Select value={formData.theme} onValueChange={(value) => handleInputChange('theme', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="notifications"
                      checked={formData.notifications}
                      onCheckedChange={(checked) => handleInputChange('notifications', checked)}
                    />
                    <Label htmlFor="notifications">Enable notifications</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => showToast('success')}>Submit</Button>
                    <Button variant="outline" onClick={() => setFormData({
                      name: '', email: '', message: '', notifications: false, theme: 'system'
                    })}>
                      Reset
                    </Button>
                  </div>
                </FormGroup>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Alerts & Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Bell className="h-4 w-4" />
                    <AlertTitle>Default Alert</AlertTitle>
                    <AlertDescription>
                      This is a default alert with some information.
                    </AlertDescription>
                  </Alert>

                  <Alert variant="destructive">
                    <AlertTitle>Error Alert</AlertTitle>
                    <AlertDescription>
                      Something went wrong. Please try again.
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-2">
                    <Button onClick={() => showToast('success')}>Success Toast</Button>
                    <Button onClick={() => showToast('error')} variant="destructive">Error Toast</Button>
                    <Button onClick={() => showToast('info')} variant="outline">Info Toast</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Loading States</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <LoadingSpinner size="sm" />
                    <LoadingSpinner size="md" />
                    <LoadingSpinner size="lg" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Progress Example</Label>
                    <Progress value={65} className="w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Avatars & Badges</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarFallback>AB</AvatarFallback>
                    </Avatar>
                    <Avatar>
                      <AvatarFallback>CD</AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="outline">Outline</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Empty State</CardTitle>
                </CardHeader>
                <CardContent>
                  <EmptyState
                    icon={<Search className="w-12 h-12" />}
                    title="No results found"
                    description="Try adjusting your search criteria or filters."
                    action={{
                      label: "Clear filters",
                      onClick: () => showToast('info')
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Overlays Tab */}
          <TabsContent value="overlays">
            <Card>
              <CardHeader>
                <CardTitle>Modals & Dialogs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={() => setShowModal(true)}>Open Modal</Button>
                  <Button onClick={() => setShowConfirmModal(true)} variant="destructive">
                    Delete Item
                  </Button>
                </div>

                <Modal
                  open={showModal}
                  onOpenChange={setShowModal}
                  title="Example Modal"
                  description="This is an example modal dialog."
                  footer={
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowModal(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => {
                        setShowModal(false)
                        showToast('success')
                      }}>
                        Confirm
                      </Button>
                    </div>
                  }
                >
                  <p>This is the modal content. You can put any content here.</p>
                </Modal>

                <ConfirmModal
                  open={showConfirmModal}
                  onOpenChange={setShowConfirmModal}
                  title="Delete Item"
                  description="Are you sure you want to delete this item? This action cannot be undone."
                  onConfirm={() => showToast('success')}
                  variant="destructive"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout">
            <Card>
              <CardHeader>
                <CardTitle>Layout Components</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This showcase itself demonstrates various layout components including Container, Card, Grid, and responsive design patterns.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
          <p>Built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui</p>
          <p className="mt-2">Comprehensive UI Component Library with Theme System</p>
        </div>
      </Container>
    </div>
  )
}
