'use client';

import { motion } from 'framer-motion';
import { Heart, Car, Home, Umbrella, Clock, Headphones, FileCheck, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const insuranceTypes = [
  {
    icon: Heart,
    title: 'Health Insurance',
    description: 'Comprehensive medical coverage for you and your family with access to top healthcare providers.',
    color: 'text-red-500',
    bg: 'bg-red-500/10',
  },
  {
    icon: Umbrella,
    title: 'Life Insurance',
    description: 'Secure your loved ones\' future with our flexible life insurance plans and peace of mind.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Car,
    title: 'Auto Insurance',
    description: 'Full coverage protection for your vehicles with 24/7 roadside assistance included.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Home,
    title: 'Home Insurance',
    description: 'Protect your home and belongings against unexpected events and natural disasters.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
];

const features = [
  {
    icon: Clock,
    title: 'Quick Claims',
    description: 'Process claims in minutes, not days',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Always here when you need us',
  },
  {
    icon: FileCheck,
    title: 'Easy Enrollment',
    description: 'Sign up in just a few clicks',
  },
  {
    icon: Wallet,
    title: 'Flexible Plans',
    description: 'Coverage that fits your budget',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Comprehensive Coverage Options
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose from our wide range of insurance products designed to protect
            every aspect of your life.
          </p>
        </motion.div>

        {/* Insurance types */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {insuranceTypes.map((type) => (
            <motion.div key={type.title} variants={itemVariants}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <div className={`${type.bg} ${type.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <type.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{type.title}</h3>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Features grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl font-bold mb-4">Why Choose InsureShield?</h3>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="text-center"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-6 w-6" />
              </div>
              <h4 className="font-semibold mb-2">{feature.title}</h4>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
