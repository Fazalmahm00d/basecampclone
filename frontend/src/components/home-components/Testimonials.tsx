import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    content: "This platform has completely transformed how our team works. The efficiency gains have been remarkable.",
    author: "Sarah Johnson",
    role: "CTO at TechCorp",
    image: "/assets/avatar.png"
  },
  {
    content: "The best investment we've made for our workflow. Customer support is outstanding!",
    author: "Michael Chen",
    role: "Product Manager at Innovation Labs",
    image: "/assets/avatar.png"
  },
  {
    content: "We've seen a 40% increase in productivity since implementing this solution.",
    author: "Emma Davis",
    role: "CEO at Growth Startup",
    image: "/assets/avatar.png"
  }
];

const TestimonialsSection = () => {
  return (
    <div className="py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">Loved by teams everywhere</h2>
          <p className="mt-4 text-lg text-gray-600">
            See what our customers have to say about their experience
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">{testimonial.content}</p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full overflow-hidden"
                  />
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;