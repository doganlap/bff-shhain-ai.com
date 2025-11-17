import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react'

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      name: 'أحمد العلي',
      nameEn: 'Ahmed Al-Ali',
      role: 'مدير الحوكمة والامتثال',
      roleEn: 'Governance & Compliance Director',
      company: 'بنك الفرات',
      companyEn: 'Furrat Bank',
      avatar: '💼',
      rating: 5,
      text: 'شاهين غيرت طريقة عملنا بشكل كامل. التقييمات التي كانت تستغرق أسابيع أصبحت تستغرق أياماً. النظام العربي الكامل والدعم المتميز يجعلها الخيار الأمثل للمؤسسات السعودية.',
      textEn: 'Shahin completely changed how we work. Assessments that used to take weeks now take days. Full Arabic system and exceptional support make it the ideal choice for Saudi organizations.',
      color: 'from-blue-500 to-blue-700',
      bgColor: 'from-blue-50 to-blue-100'
    },
    {
      name: 'فاطمة المنصور',
      nameEn: 'Fatima Al-Mansour',
      role: 'رئيس قسم الامتثال',
      roleEn: 'Compliance Head',
      company: 'مستشفى الأمل',
      companyEn: 'Amal Hospital',
      avatar: '🏥',
      rating: 5,
      text: 'أكثر من 3,200 ضابط جاهز ونظام ذكاء اصطناعي متقدم. شاهين وفرت علينا الوقت والتكاليف مع ضمان الامتثال الكامل. فريقي يحب العمل عليها!',
      textEn: 'Over 3,200 pre-loaded controls and advanced AI system. Shahin saved us time and costs while ensuring full compliance. My team loves working with it!',
      color: 'from-green-500 to-emerald-700',
      bgColor: 'from-green-50 to-emerald-100'
    },
    {
      name: 'سعود النجار',
      nameEn: 'Saud Al-Najjar',
      role: 'مدير المخاطر والحوكمة',
      roleEn: 'Risk & Governance Manager',
      company: 'شركة الطاقة المتجددة',
      companyEn: 'Renewable Energy Company',
      avatar: '⚡',
      rating: 5,
      text: 'الدعم الشامل للأطر السعودية والدولية في مكان واحد. فريق الشجيع الذكاء الاصطناعي يساعدنا في كل خطوة. لم أكن أتصور أن الامتثال يمكن أن يكون بهذه السهولة!',
      textEn: 'Comprehensive support for Saudi and international frameworks in one place. The AI team guides us every step of the way. I never imagined compliance could be this easy!',
      color: 'from-amber-500 to-orange-700',
      bgColor: 'from-amber-50 to-orange-100'
    },
    {
      name: 'ليلى الأحمد',
      nameEn: 'Layla Al-Ahmad',
      role: 'مدير الأمن المعلوماتي',
      roleEn: 'Information Security Manager',
      company: 'شركة التقنية الرائدة',
      companyEn: 'Leading Tech Company',
      avatar: '💻',
      rating: 5,
      text: 'دقة النظام وسهولة الاستخدام لا مثيل لها. التقارير التلقائية والإشعارات الذكية تجعل إدارة الامتثال شفافة وفعالة. أنصح بها بشدة!',
      textEn: 'The system accuracy and ease of use are unmatched. Automatic reports and smart notifications make compliance management transparent and efficient. Highly recommended!',
      color: 'from-purple-500 to-pink-700',
      bgColor: 'from-purple-50 to-pink-100'
    }
  ]

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section id="testimonials" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-accent to-brand-gold text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
            <Star className="w-4 h-4 fill-white" />
            <span>آراء عملائنا</span>
          </div>
          <h2 className="font-arabic font-bold text-4xl lg:text-6xl text-gray-900 mb-4">
            ماذا يقول عملاؤنا
          </h2>
          <h3 className="font-english font-semibold text-2xl lg:text-3xl text-gray-700 mb-6">
            What Our Clients Say
          </h3>
          <p className="font-arabic text-lg text-gray-600 max-w-3xl mx-auto">
            رضا العملاء هو شعارنا ونجاحهم هو هدفنا
          </p>
          <p className="font-english text-base text-gray-500 max-w-3xl mx-auto mt-2">
            Customer satisfaction is our motto and their success is our goal
          </p>
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            {/* Navigation Buttons */}
            <button
              onClick={prevTestimonial}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all"
              aria-label="شهادة سابقة"
            >
              <ChevronLeft className="w-6 h-6" strokeWidth={2} />
            </button>

            <button
              onClick={nextTestimonial}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all"
              aria-label="شهادة تالية"
            >
              <ChevronRight className="w-6 h-6" strokeWidth={2} />
            </button>

            {/* Testimonial Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
              >
                <div className={`bg-gradient-to-br ${testimonials[currentIndex].bgColor} rounded-3xl p-12 border-4 border-brand-accent/30 shadow-2xl`}>
                  <div className="max-w-4xl mx-auto text-center">
                    {/* Quote Icon */}
                    <div className="mb-6 flex justify-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Quote className="w-8 h-8 text-brand-primary" strokeWidth={2} fill="currentColor" />
                      </div>
                    </div>

                    {/* Stars */}
                    <div className="flex justify-center gap-1 mb-8">
                      {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                        <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>

                    {/* Testimonial Text */}
                    <p className="font-arabic text-xl text-gray-900 leading-relaxed mb-6">
                      {testimonials[currentIndex].text}
                    </p>
                    <p className="font-english text-base text-gray-700 leading-relaxed mb-8">
                      {testimonials[currentIndex].textEn}
                    </p>

                    {/* Author Info */}
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl shadow-lg">
                        {testimonials[currentIndex].avatar}
                      </div>
                      <div className="text-right">
                        <div className="font-arabic font-bold text-xl text-gray-900">
                          {testimonials[currentIndex].name}
                        </div>
                        <div className="font-english font-semibold text-sm text-gray-700 mb-1">
                          {testimonials[currentIndex].nameEn}
                        </div>
                        <div className="font-arabic text-sm text-gray-600">
                          {testimonials[currentIndex].role}
                        </div>
                        <div className="font-english text-xs text-gray-500">
                          {testimonials[currentIndex].roleEn}
                        </div>
                        <div className="font-arabic text-lg font-bold text-brand-primary mt-1">
                          {testimonials[currentIndex].company}
                        </div>
                        <div className="font-english text-xs text-gray-600">
                          {testimonials[currentIndex].companyEn}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex ? 'bg-brand-primary w-8' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`انتقل إلى الشهادة ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-primary mb-2">500+</div>
              <div className="font-arabic text-sm text-gray-700">منظمة سعيدة</div>
              <div className="font-english text-xs text-gray-500">Happy Organizations</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">97%</div>
              <div className="font-arabic text-sm text-gray-700">رضا العملاء</div>
              <div className="font-english text-xs text-gray-500">Customer Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-amber-600 mb-2">4.9/5</div>
              <div className="font-arabic text-sm text-gray-700">تقييم متوسط</div>
              <div className="font-english text-xs text-gray-500">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">98%</div>
              <div className="font-arabic text-sm text-gray-700">معدل التجديد</div>
              <div className="font-english text-xs text-gray-500">Renewal Rate</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
