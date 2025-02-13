import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does the free trial work?",
    answer: "Our free trial gives you full access to all features for 14 days. No credit card required. You can upgrade to a paid plan at any time during or after the trial."
  },
  {
    question: "What kind of support do you offer?",
    answer: "We offer 24/7 email support for all customers. Pro and Enterprise plans include priority support with guaranteed response times and phone support."
  },
  {
    question: "Can I cancel my subscription?",
    answer: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
  },
  {
    question: "Do you offer custom solutions?",
    answer: "Yes! Our Enterprise plan includes custom solutions, dedicated support, and personalized onboarding. Contact our sales team for more information."
  },
  {
    question: "Is my data secure?",
    answer: "We take security seriously. We use industry-standard encryption, regular security audits, and maintain strict data protection policies to keep your information safe."
  }
];

const FAQSection = () => {
  return (
    <div className="py-24 bg-gray-50">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">Frequently asked questions</h2>
          <p className="mt-4 text-lg text-gray-600">
            Have a different question? Contact our support team
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default FAQSection;