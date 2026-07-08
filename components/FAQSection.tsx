"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What are your accommodation rates?",
    answer: (
      <div className="space-y-3">
        <p>Our rooms are charged weekly.</p>
        <div>
          <strong className="text-white block mb-1">Premium Rooms</strong>
          <ul className="list-disc pl-5 space-y-1">
            <li>Single Room (Private) – ₦70,000/week</li>
            <li>Single Room (Private) – ₦40,000/week</li>
          </ul>
        </div>
        <div>
          <strong className="text-white block mb-1">Shared Rooms – ₦40,000/week per person</strong>
          <ul className="list-disc pl-5 space-y-1">
            <li>2 persons in a room</li>
            <li>3 persons in a room</li>
            <li>4 persons in a room</li>
          </ul>
        </div>
        <div>
          <strong className="text-white block mb-1">Shared Rooms – ₦30,000/week per person</strong>
          <ul className="list-disc pl-5 space-y-1">
            <li>2 persons in a room</li>
            <li>3 persons in a room</li>
            <li>4 persons in a room</li>
          </ul>
        </div>
        <p className="mt-2 italic">If you intend to stay for one month, simply multiply the weekly rate by 4 weeks.</p>
      </div>
    ),
  },
  {
    question: "Where are your hostels located?",
    answer: (
      <div className="space-y-2">
        <p>We currently have two locations:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Golden Ray Estate, Olokonla, Ajah, Lagos.</li>
          <li>Greenland Estate, Olokonla, Ajah, Lagos.</li>
        </ul>
      </div>
    ),
  },
  {
    question: "Can I reserve a room before I arrive?",
    answer: (
      <p>
        No. Rooms are allocated on a first come, first served basis. Availability changes regularly, so we advise you to check availability or contact us directly when you are ready to move in.
      </p>
    ),
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-10" id="faq">
      <div className="mb-8">
        <h2 className="font-display text-3xl md:text-4xl tracking-tight mb-2">Frequently Asked Questions</h2>
        <p className="text-[#b1b1ba] max-w-2xl">Find quick answers to common questions about staying with us.</p>
      </div>
      
      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div 
              key={index} 
              className="glass overflow-hidden rounded-2xl border border-white/5 transition-all duration-300"
            >
              <button
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-display text-lg text-white pr-4">{faq.question}</span>
                <div className={\`w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/10 shrink-0 transition-transform duration-300 \${isOpen ? 'rotate-180 bg-[#ff7a1a] text-black border-[#ff7a1a]' : 'text-gray-400'}\`}>
                  <ChevronDown size={18} />
                </div>
              </button>
              
              <div 
                className={\`transition-all duration-300 ease-in-out \${isOpen ? 'max-h-[800px] opacity-100 pb-6 px-6' : 'max-h-0 opacity-0 px-6'}\`}
              >
                <div className="text-[#b1b1ba] text-sm md:text-base leading-relaxed border-t border-white/10 pt-4 mt-2">
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
