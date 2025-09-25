'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MessageCircle, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Clock, 
  Users, 
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

export function CoursesSection() {
  const courses = [
    {
      id: 1,
      title: 'English Conversation',
      description: 'Master everyday English communication with confidence through interactive speaking practice.',
      level: 'Beginner',
      duration: '12 weeks',
      students: 450,
      rating: 4.9,
      price: '$299',
      icon: MessageCircle,
      features: [
        'Interactive speaking sessions',
        'Real-world conversation practice',
        'Pronunciation improvement',
        'Cultural context learning'
      ],
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 2,
      title: 'IELTS Preparation',
      description: 'Comprehensive IELTS preparation course designed to help you achieve your target band score.',
      level: 'Intermediate',
      duration: '16 weeks',
      students: 320,
      rating: 4.8,
      price: '$499',
      icon: FileText,
      features: [
        'All 4 skills coverage',
        'Mock tests & feedback',
        'Band score prediction',
        'Exam strategies & tips'
      ],
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 3,
      title: 'Business English',
      description: 'Professional English skills for workplace communication, presentations, and career advancement.',
      level: 'Advanced',
      duration: '14 weeks',
      students: 280,
      rating: 4.9,
      price: '$399',
      icon: Briefcase,
      features: [
        'Professional communication',
        'Presentation skills',
        'Email & report writing',
        'Meeting participation'
      ],
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      id: 4,
      title: 'Academic Writing',
      description: 'Develop advanced writing skills for academic success in universities and research.',
      level: 'Advanced',
      duration: '10 weeks',
      students: 190,
      rating: 4.7,
      price: '$349',
      icon: GraduationCap,
      features: [
        'Essay structure & organization',
        'Research & citation skills',
        'Critical thinking development',
        'Academic vocabulary building'
      ],
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800'
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'Advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Course Offerings
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Choose Your{' '}
            <span className="text-primary">Learning Path</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From beginner conversation to advanced academic writing, our comprehensive 
            course catalog has something for every English learner.
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {courses.map((course) => {
            const Icon = course.icon
            return (
              <Card key={course.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-lg ${course.bgColor} flex items-center justify-center`}>
                        <Icon className={`h-6 w-6 ${course.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {course.title}
                        </CardTitle>
                        <Badge className={getLevelColor(course.level)} variant="secondary">
                          {course.level}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{course.price}</div>
                      <div className="text-sm text-muted-foreground">per course</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground">{course.description}</p>
                  
                  {/* Course Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{course.students} students</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span>{course.rating}</span>
                    </div>
                  </div>
                  
                  {/* Features */}
                  <div>
                    <h4 className="font-semibold mb-3">What you'll learn:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {course.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* CTA */}
                  <div className="flex space-x-3 pt-4">
                    <Button asChild className="flex-1">
                      <Link href={`/courses/${course.id}`}>
                        Enroll Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/courses/${course.id}`}>
                        Learn More
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Course Benefits */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6">Why Choose Our Courses?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="text-3xl">🎯</div>
                  <h4 className="font-semibold">Goal-Oriented</h4>
                  <p className="text-sm text-muted-foreground">
                    Every course is designed with specific learning outcomes and measurable progress
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl">👥</div>
                  <h4 className="font-semibold">Small Class Sizes</h4>
                  <p className="text-sm text-muted-foreground">
                    Maximum 12 students per class ensures personalized attention for everyone
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl">📱</div>
                  <h4 className="font-semibold">Flexible Learning</h4>
                  <p className="text-sm text-muted-foreground">
                    Online and offline options with recorded sessions for your convenience
                  </p>
                </div>
              </div>
              
              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link href="/courses">
                    View All Courses
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
