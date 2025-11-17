import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'
import { sendContactMessage } from '../services/sandboxService'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      await sendContactMessage(formData)
      setSubmitStatus('success')
      setFormData({ name: '', email: '', phone: '', company: '', subject: '', message: '' })
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-arabic font-bold text-4xl lg:text-6xl text-gray-900 mb-4">
            اتصل بنا
          </h2>
          <h3 className="font-english font-semibold text-2xl lg:text-3xl text-gray-700 mb-6">
            Get in Touch
          </h3>
          <p className="font-arabic text-lg text-gray-600 max-w-3xl mx-auto">
            نحن هنا للمساعدة. تواصل معنا لأي استفسارات أو للحصول على مزيد من المعلومات حول شاهين للحوكمة
          </p>
          <p className="font-english text-base text-gray-500 max-w-3xl mx-auto mt-2">
            We&apos;re here to help. Contact us with any questions or to learn more about Shahin GRC
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-xl"
          >
            <h3 className="font-arabic font-bold text-2xl text-gray-900 mb-2">
              أرسل لنا رسالة
            </h3>
            <h4 className="font-english font-semibold text-xl text-gray-700 mb-6">
              Send Us a Message
            </h4>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <span className="font-english">Full Name</span>
                  <span className="font-arabic">الاسم الكامل</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
                  placeholder="John Doe"
                  aria-label="Full Name"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <span className="font-english">Email</span>
                  <span className="font-arabic">البريد الإلكتروني</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
                  placeholder="john@company.com"
                  aria-label="Email Address"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <span className="font-english">Phone</span>
                    <span className="font-arabic">الهاتف</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
                    placeholder="+966 XX XXX XXXX"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <span className="font-english">Company</span>
                    <span className="font-arabic">الشركة</span>
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
                    placeholder="Company Name"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <span className="font-english">Subject</span>
                  <span className="font-arabic">الموضوع</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all"
                  placeholder="Inquiry about Shahin GRC"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <span className="font-english">Message</span>
                  <span className="font-arabic">الرسالة</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none resize-none transition-all"
                  placeholder="Tell us more about your inquiry..."
                ></textarea>
              </div>

              {submitStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-lg p-4">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-english text-sm">Message sent successfully! We&apos;ll get back to you soon.</span>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-english text-sm">Something went wrong. Please try again.</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary text-white px-8 py-4 rounded-xl font-arabic font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>جارٍ الإرسال...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>إرسال الرسالة</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Contact

