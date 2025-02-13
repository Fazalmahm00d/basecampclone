import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Shield, Rocket } from "lucide-react";

const features = [
  {
    title: "Lightning Fast",
    description: "Experience unprecedented speed with our optimized platform designed for maximum efficiency.",
    icon: Zap,
  },
  {
    title: "Secure by Default",
    description: "Rest easy knowing your data is protected with enterprise-grade security measures.",
    icon: Shield,
  },
  {
    title: "Scalable Solution",
    description: "Grow without limits. Our platform scales seamlessly with your business needs.",
    icon: Rocket,
  },
];

const FeaturesSection = () => {
  return (
    <div className="py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">Features that set us apart</h2>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to take your productivity to the next level
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <feature.icon className="w-12 h-12 text-blue-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;