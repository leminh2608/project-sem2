'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target, Heart, Lightbulb, Globe, Users, Zap } from 'lucide-react'

export function MissionSection() {
  const values = [
    {
      icon: Target,
      title: 'Excellence in Education',
      description: 'We strive for the highest standards in English language education, ensuring every student reaches their full potential.',
      color: 'text-blue-600'
    },
    {
      icon: Heart,
      title: 'Student-Centered Approach',
      description: 'Every lesson is tailored to individual learning styles and goals, creating a personalized educational journey.',
      color: 'text-red-600'
    },
    {
      icon: Lightbulb,
      title: 'Innovation in Teaching',
      description: 'We embrace modern teaching methodologies and technology to make learning engaging and effective.',
      color: 'text-yellow-600'
    },
    {
      icon: Globe,
      title: 'Global Perspective',
      description: 'Preparing students for international communication and cultural understanding in our connected world.',
      color: 'text-green-600'
    },
    {
      icon: Users,
      title: 'Community Building',
      description: 'Fostering a supportive learning community where students and teachers grow together.',
      color: 'text-purple-600'
    },
    {
      icon: Zap,
      title: 'Rapid Progress',
      description: 'Our proven methods ensure students see measurable improvement in their English skills quickly.',
      color: 'text-orange-600'
    }
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Our Mission & Philosophy
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Empowering Students Through{' '}
            <span className="text-primary">English Excellence</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            At English Excellence, we believe that language learning is more than just grammar and vocabulary. 
            It's about opening doors to new opportunities, cultures, and connections that last a lifetime.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8 lg:p-12">
              <div className="text-center space-y-6">
                <h3 className="text-2xl lg:text-3xl font-bold">Our Mission</h3>
                <p className="text-lg text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                  To provide world-class English language education that empowers students to communicate 
                  confidently, think critically, and succeed in their personal and professional endeavors. 
                  We are committed to creating an inclusive, supportive environment where every student 
                  can thrive and achieve their language learning goals.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Core Values */}
        <div>
          <h3 className="text-2xl lg:text-3xl font-bold text-center mb-12">
            Our Core Values
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <Card key={value.title} className="group hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className={`w-12 h-12 rounded-lg bg-background border flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`h-6 w-6 ${value.color}`} />
                      </div>
                      <h4 className="text-xl font-semibold">{value.title}</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Philosophy */}
        <div className="mt-16 text-center">
          <Card className="bg-background border-2 border-dashed border-primary/20">
            <CardContent className="p-8 lg:p-12">
              <h3 className="text-2xl lg:text-3xl font-bold mb-6">Our Teaching Philosophy</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-primary">Learn by Doing</h4>
                  <p className="text-muted-foreground">
                    We believe in immersive, practical learning where students actively use English 
                    in real-world contexts from day one.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-primary">Personalized Growth</h4>
                  <p className="text-muted-foreground">
                    Every student is unique. Our adaptive teaching methods ensure personalized 
                    attention and customized learning paths.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-lg font-semibold text-primary">Continuous Support</h4>
                  <p className="text-muted-foreground">
                    Learning doesn't stop in the classroom. We provide ongoing support and 
                    resources for continuous improvement.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
