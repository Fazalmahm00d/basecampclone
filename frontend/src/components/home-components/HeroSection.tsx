import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="relative py-24 lg:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold tracking-tight">
              Transform Your Workflow with Our Platform
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              Streamline your process, boost productivity, and achieve better results with our innovative solution designed for modern teams.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-video rounded-xl bg-gray-100 shadow-xl border-4 border-black">
              <img
                src="/assets/hero.png"
                alt="Product screenshot"
                className="rounded-xl object-cover h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;