'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Star, Quote, Award, TrendingUp } from 'lucide-react'

export function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Maria Rodriguez',
      role: 'Software Engineer',
      company: 'Tech Corp',
      course: 'Business English',
      rating: 5,
      text: "English Excellence transformed my career! The Business English course gave me the confidence to lead international meetings and communicate effectively with global teams. I got promoted within 6 months of completing the course.",
      achievement: 'Career Promotion',
      flag: '🇪🇸',
      initials: 'MR'
    },
    {
      name: 'Ahmed Hassan',
      role: 'Graduate Student',
      company: 'Oxford University',
      course: 'IELTS Preparation',
      rating: 5,
      text: "I needed a band 7.5 for my master's program and achieved 8.0! The structured approach and mock tests were incredibly helpful. The instructors provided detailed feedback that helped me improve rapidly.",
      achievement: 'IELTS Band 8.0',
      flag: '🇪🇬',
      initials: 'AH'
    },
    {
      name: 'Yuki Tanaka',
      role: 'Marketing Manager',
      company: 'Global Solutions',
      course: 'English Conversation',
      rating: 5,
      text: "As a shy speaker, I was nervous about conversation classes. But the supportive environment and patient instructors helped me gain confidence. Now I can present to international clients without hesitation!",
      achievement: 'Fluency Breakthrough',
      flag: '🇯🇵',
      initials: 'YT'
    },
    {
      name: 'Carlos Silva',
      role: 'PhD Candidate',
      company: 'MIT',
      course: 'Academic Writing',
      rating: 5,
      text: "The Academic Writing course was exactly what I needed for my research papers. My writing became more structured and professional. I've published 3 papers since completing the course!",
      achievement: '3 Publications',
      flag: '🇧🇷',
      initials: 'CS'
    },
    {
      name: 'Priya Sharma',
      role: 'Consultant',
      company: 'McKinsey & Co',
      course: 'Business English',
      rating: 5,
      text: "The course content was practical and immediately applicable. I learned professional communication skills that helped me excel in client presentations and secure my dream job at a top consulting firm.",
      achievement: 'Dream Job Secured',
      flag: '🇮🇳',
      initials: 'PS'
    },
    {
      name: 'Jean Dubois',
      role: 'International Relations',
      company: 'UN Office',
      course: 'Advanced Communication',
      rating: 5,
      text: "Working in international diplomacy requires precise communication. This course refined my English to a professional level that's essential for my role in international negotiations.",
      achievement: 'UN Position',
      flag: '🇫🇷',
      initials: 'JD'
    }
  ]

  const successStats = [
    {
      icon: TrendingUp,
      value: '95%',
      label: 'Success Rate',
      description: 'Students achieve their goals'
    },
    {
      icon: Award,
      value: '4.9/5',
      label: 'Average Rating',
      description: 'Student satisfaction score'
    },
    {
      icon: Star,
      value: '5,000+',
      label: 'Success Stories',
      description: 'Students transformed'
    }
  ]

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            Success Stories
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Real Students,{' '}
            <span className="text-primary">Real Results</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover how our students have transformed their careers, achieved their academic goals, 
            and gained confidence in English communication.
          </p>
        </div>

        {/* Success Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {successStats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="text-center group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors duration-300">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-primary">{stat.value}</div>
                    <div>
                      <h3 className="text-lg font-semibold">{stat.label}</h3>
                      <p className="text-sm text-muted-foreground">{stat.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="group hover:shadow-xl transition-all duration-300 relative overflow-hidden">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Quote Icon */}
                  <div className="flex justify-between items-start">
                    <Quote className="h-8 w-8 text-primary/20" />
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                      ))}
                    </div>
                  </div>

                  {/* Testimonial Text */}
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    "{testimonial.text}"
                  </p>

                  {/* Achievement Badge */}
                  <Badge variant="secondary" className="text-xs">
                    🎉 {testimonial.achievement}
                  </Badge>

                  {/* Student Info */}
                  <div className="flex items-center space-x-3 pt-4 border-t">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-sm">{testimonial.name}</h4>
                        <span className="text-lg">{testimonial.flag}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                    </div>
                  </div>

                  {/* Course Badge */}
                  <Badge variant="outline" className="text-xs">
                    📚 {testimonial.course}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Write Your Success Story?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join thousands of students who have achieved their English language goals 
                and transformed their careers with English Excellence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span>Rated 4.9/5 by 5,000+ students</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Award className="h-4 w-4 text-primary" />
                  <span>95% success rate</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
