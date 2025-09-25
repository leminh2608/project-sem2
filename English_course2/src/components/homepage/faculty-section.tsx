'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Star, Award, BookOpen, Users, Globe, GraduationCap } from 'lucide-react'

export function FacultySection() {
  const facultyMembers = [
    {
      name: 'Dr. Sarah Johnson',
      title: 'Head of Academic Affairs',
      specialization: 'IELTS & Academic Writing',
      experience: '15+ years',
      qualifications: ['PhD in Applied Linguistics', 'CELTA Certified', 'IELTS Examiner'],
      rating: 4.9,
      studentsCount: 1200,
      initials: 'SJ'
    },
    {
      name: 'Prof. Michael Chen',
      title: 'Senior Language Instructor',
      specialization: 'Business English & Communication',
      experience: '12+ years',
      qualifications: ['MA in TESOL', 'Cambridge DELTA', 'Corporate Training Specialist'],
      rating: 4.8,
      studentsCount: 950,
      initials: 'MC'
    },
    {
      name: 'Ms. Emma Williams',
      title: 'Conversation & Fluency Expert',
      specialization: 'Spoken English & Pronunciation',
      experience: '10+ years',
      qualifications: ['BA in English Literature', 'TEFL Certified', 'Pronunciation Specialist'],
      rating: 4.9,
      studentsCount: 800,
      initials: 'EW'
    }
  ]

  const expertise = [
    {
      icon: Award,
      title: 'Certified Excellence',
      description: 'All our instructors hold internationally recognized teaching certifications',
      stats: '100% Certified'
    },
    {
      icon: Globe,
      title: 'Global Experience',
      description: 'Our faculty has taught students from over 50 countries worldwide',
      stats: '50+ Countries'
    },
    {
      icon: BookOpen,
      title: 'Continuous Learning',
      description: 'Regular professional development ensures cutting-edge teaching methods',
      stats: '40+ Hours/Year'
    },
    {
      icon: Users,
      title: 'Student Success',
      description: 'Our instructors maintain exceptional student satisfaction rates',
      stats: '4.9/5 Rating'
    }
  ]

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Expert Faculty
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Learn from the{' '}
            <span className="text-primary">Best Instructors</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our world-class faculty brings decades of experience, advanced qualifications, 
            and a passion for helping students achieve their English language goals.
          </p>
        </div>

        {/* Faculty Expertise Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {expertise.map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.title} className="text-center group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors duration-300">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <div className="text-2xl font-bold text-primary">{item.stats}</div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Featured Faculty */}
        <div>
          <h3 className="text-2xl lg:text-3xl font-bold text-center mb-12">
            Meet Our Lead Instructors
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {facultyMembers.map((faculty) => (
              <Card key={faculty.name} className="group hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Profile Header */}
                    <div className="text-center space-y-4">
                      <Avatar className="w-20 h-20 mx-auto">
                        <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                          {faculty.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="text-xl font-bold">{faculty.name}</h4>
                        <p className="text-primary font-medium">{faculty.title}</p>
                        <p className="text-sm text-muted-foreground">{faculty.specialization}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold">{faculty.experience}</div>
                        <div className="text-xs text-muted-foreground">Experience</div>
                      </div>
                      <div>
                        <div className="flex items-center justify-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-lg font-bold">{faculty.rating}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Rating</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold">{faculty.studentsCount}+</div>
                        <div className="text-xs text-muted-foreground">Students</div>
                      </div>
                    </div>

                    {/* Qualifications */}
                    <div>
                      <h5 className="font-semibold mb-3 flex items-center">
                        <GraduationCap className="h-4 w-4 mr-2 text-primary" />
                        Qualifications
                      </h5>
                      <div className="space-y-2">
                        {faculty.qualifications.map((qual, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {qual}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Learn from the Best?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join thousands of students who have achieved their English language goals 
                with guidance from our expert instructors.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Badge variant="outline" className="text-sm px-4 py-2">
                  📚 Personalized Learning Plans
                </Badge>
                <Badge variant="outline" className="text-sm px-4 py-2">
                  🎯 Goal-Oriented Approach
                </Badge>
                <Badge variant="outline" className="text-sm px-4 py-2">
                  💬 One-on-One Support
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
