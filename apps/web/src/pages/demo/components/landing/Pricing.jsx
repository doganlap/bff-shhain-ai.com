import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import DemoBooking from './DemoBooking'

const Pricing = () => {
  const [isDemoOpen, setIsDemoOpen] = useState(false)
  const packages = [
    {
      name: 'Starter',
      nameAr: 'المبتدئ',
      price: 'Contact',
      priceAr: 'اتصل بنا',
      target: 'Small (1-50)',
      targetAr: 'صغير (1-50)',
      features: ['5 Frameworks', '500 Controls', '10 Users', 'Cloud Deployment', 'Email Support'],
      featuresAr: ['5 إطارات', '500 ضابط', '10 مستخدمين', 'نشر سحابي', 'دعم بريدي'],
      highlight: false
    },
    {
      name: 'Professional',
      nameAr: 'المهني',
      price: 'Contact',
      priceAr: 'اتصل بنا',
      target: 'Medium (51-250)',
      targetAr: 'متوسط (51-250)',
      features: ['15 Frameworks', '1,500 Controls', '50 Users', 'AI Features', 'API Access', 'Priority Support'],
      featuresAr: ['15 إطار', '1,500 ضابط', '50 مستخدم', 'ميزات الذكاء الاصطناعي', 'واجهة برمجة', 'دعم ذو أولوية'],
      highlight: true
    },
    {
      name: 'Enterprise',
      nameAr: 'المؤسسي',
      price: 'Contact',
      priceAr: 'اتصل بنا',
      target: 'Large (250+)',
      targetAr: 'كبير (250+)',
      features: ['Unlimited Frameworks', 'All 3,200+ Controls', 'Unlimited Users', 'White-Label', 'Custom Integration', 'Dedicated Support'],
      featuresAr: ['إطارات غير محدودة', 'جميع 3,200+ ضابط', 'مستخدمين غير محدودين', 'علامة تجارية خاصة', 'تكامل مخصص', 'دعم مخصص'],
      highlight: false
    },
  ]

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-arabic font-bold text-4xl lg:text-5xl text-gray-900 mb-4">
            أسعار بسيطة وشفافة
          </h2>
          <h3 className="font-english font-bold text-3xl lg:text-4xl text-gray-800 mb-4">
            Simple, Transparent Pricing
          </h3>
          <p className="font-arabic text-lg text-gray-600">
            ابحث عن الحزمة المثالية لمنظمتك
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages.map((pkg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`rounded-2xl p-8 border transition-all ${
                pkg.highlight
                  ? 'border-brand-primary bg-gradient-to-br from-brand-primary/5 to-blue-50 shadow-xl scale-105'
                  : 'border-gray-200 bg-white shadow-md hover:shadow-lg'
              }`}
            >
              {pkg.highlight && (
                <div className="bg-brand-primary text-white px-4 py-1 rounded-lg text-sm font-semibold mb-4 inline-block">
                  Most Popular
                </div>
              )}
              
              <h3 className="font-arabic font-bold text-2xl text-gray-900 mb-2">
                {pkg.nameAr}
              </h3>
              <h4 className="font-english font-semibold text-xl text-gray-700 mb-4">
                {pkg.name}
              </h4>
              
              <div className="mb-4">
                <div className="font-arabic text-sm text-gray-600 mb-1">{pkg.targetAr}</div>
                <div className="font-english text-xs text-gray-500">{pkg.target}</div>
              </div>

              <div className="mb-6">
                <div className="text-4xl font-bold text-brand-primary mb-2">
                  {pkg.priceAr}
                </div>
                <div className="font-english text-sm text-gray-600">{pkg.price}</div>
              </div>

              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-arabic text-sm text-gray-700">{pkg.featuresAr[i]}</div>
                      <div className="font-english text-xs text-gray-500">{feature}</div>
                    </div>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => setIsDemoOpen(true)}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  pkg.highlight
                    ? 'bg-brand-primary text-white hover:bg-brand-secondary hover:shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-label="اطلب عرض توضيحي"
              >
                <span className="font-english">Request Demo</span>
              </button>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="font-arabic text-gray-600 mb-2">
            متوفر: حزمة خاصة للحكومة
          </p>
          <p className="font-english text-sm text-gray-500">
            Available: Special Government Package
          </p>
        </div>
      </div>

      {/* Demo Booking Modal */}
      <DemoBooking 
        isOpen={isDemoOpen} 
        onClose={() => setIsDemoOpen(false)}
        type="demo"
      />
    </section>
  )
}

export default Pricing

