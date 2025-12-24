'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CTASection() {
  return (
    <section id="coverage" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-8 sm:p-12 lg:p-16"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/10 blur-2xl" />
          </div>

          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
                <Shield className="h-4 w-4" />
                Start Your Coverage Today
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to Protect What Matters?
              </h2>

              <p className="text-lg text-white/80 mb-8">
                Join millions of satisfied customers who trust InsureShield for their
                insurance needs. Get a personalized quote in minutes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full sm:w-auto group bg-white text-primary hover:bg-white/90"
                  >
                    Get Started Now
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10"
                  >
                    Already a Member?
                  </Button>
                </Link>
              </div>
            </div>

            <div className="hidden lg:flex justify-end">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-sm">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-white">
                    <span className="text-white/70">Average Savings</span>
                    <span className="font-semibold">$1,200/year</span>
                  </div>
                  <div className="flex items-center justify-between text-white">
                    <span className="text-white/70">Quote Time</span>
                    <span className="font-semibold">2 minutes</span>
                  </div>
                  <div className="flex items-center justify-between text-white">
                    <span className="text-white/70">Customer Rating</span>
                    <span className="font-semibold">4.9/5 Stars</span>
                  </div>
                  <div className="pt-4 border-t border-white/20">
                    <p className="text-sm text-white/70 text-center">
                      No credit card required to get started
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
