import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Github, Linkedin, Twitter } from "lucide-react";

const team = [
  {
    name: "Alex Thompson",
    role: "CEO & Founder",
    bio: "10+ years of experience in building successful SaaS products",
    image: "/assets/8422.jpg",
    social: {
      twitter: "#",
      linkedin: "https://www.linkedin.com/in/sfazalmahmood/",
      github: "https://github.com/Fazalmahm00d"
    }
  },
  {
    name: "Patricia Lee",
    role: "CTO",
    bio: "Former Senior Engineer at Major Tech Companies",
    image: "/assets/3583.jpg",
    social: {
      twitter: "#",
      linkedin: "https://www.linkedin.com/in/sfazalmahmood/",
      github: "https://github.com/Fazalmahm00d"
    }
  },
  {
    name: "Marcus Rodriguez",
    role: "Head of Product",
    bio: "Specialist in user-centered design and product strategy",
    image: "/assets/1499.jpg",
    social: {
      twitter: "#",
      linkedin: "https://www.linkedin.com/in/sfazalmahmood/",
      github: "https://github.com/Fazalmahm00d"
    }
  }
];

const TeamSection = () => {
  return (
    <div className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">Meet our team</h2>
          <p className="mt-4 text-lg text-gray-600">
            The people behind the platform
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full aspect-square object-cover object-center object-[65%_35%]"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold">{member.name}</h3>
                  <p className="text-blue-600">{member.role}</p>
                  <p className="mt-2 text-gray-600">{member.bio}</p>
                  <div className="flex gap-4 mt-4">
                    <a href={member.social.twitter} className="text-gray-400 hover:text-blue-400">
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a href={member.social.linkedin} className="text-gray-400 hover:text-blue-700">
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a href={member.social.github} className="text-gray-400 hover:text-gray-900">
                      <Github className="w-5 h-5" />
                    </a>
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

export default TeamSection;