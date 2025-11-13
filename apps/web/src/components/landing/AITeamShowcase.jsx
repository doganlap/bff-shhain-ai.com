import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Cpu, MessageCircle, Shield, Code, Activity, Users, CheckCircle, Zap } from 'lucide-react'

const AITeamShowcase = () => {
  const [selectedAgent, setSelectedAgent] = useState(0)

  const aiAgents = [
    {
      icon: MessageCircle,
      name: 'مساعد المستخدم',
      nameEn: 'User Support Agent',
      role: 'الدعم والمساعدة',
      roleEn: 'Support & Assistance',
      color: '#3B82F6',
      description: 'مساعدك الشخصي على مدار الساعة للإجابة على الأسئلة وإرشادك في كل ما تحتاجه',
      descriptionEn: 'Your personal 24/7 assistant to answer questions and guide you in everything you need',
      capabilities: [
        'إجابات فورية للأسئلة',
        'إرشادات خطوة بخطوة',
        'اقتراحات ذكية',
        'دعم متعدد اللغات'
      ],
      gradient: 'from-blue-500 to-blue-700'
    },
    {
      icon: Code,
      name: 'مساعد المطور',
      nameEn: 'Developer Agent',
      role: 'التطوير والتكويد',
      roleEn: 'Development & Coding',
      color: '#8B5CF6',
      description: 'يساعدك في بناء وتخصيص الحلول وفقاً لمتطلباتك الفنية',
      descriptionEn: 'Helps you build and customize solutions according to your technical requirements',
      capabilities: [
        'كتابة الكود تلقائياً',
        'إصلاح الأخطاء',
        'التحسينات',
        'دمج الأنظمة'
      ],
      gradient: 'from-purple-500 to-purple-700'
    },
    {
      icon: Shield,
      name: 'أخصائي الامتثال',
      nameEn: 'Compliance Expert',
      role: 'الامتثال والجودة',
      roleEn: 'Compliance & Quality',
      color: '#10B981',
      description: 'خبير في جميع الأطر التنظيمية يضمن لك الامتثال الكامل',
      descriptionEn: 'Expert in all regulatory frameworks ensuring your full compliance',
      capabilities: [
        'مراجعة الامتثال',
        'تحديد الثغرات',
        'اقتراح التحسينات',
        'تحديثات الأطر'
      ],
      gradient: 'from-green-500 to-green-700'
    },
    {
      icon: Activity,
      name: 'مدير النظام',
      nameEn: 'System Operations',
      role: 'العمليات والصيانة',
      roleEn: 'Operations & Maintenance',
      color: '#F59E0B',
      description: 'يراقب أداء النظام ويضمن التشغيل السلس بدون مشاكل',
      descriptionEn: 'Monitors system performance and ensures smooth operation without issues',
      capabilities: [
        'مراقبة الأداء',
        'الصيانة التلقائية',
        'التنبيهات الذكية',
        'تحسين الاستخدام'
      ],
      gradient: 'from-amber-500 to-orange-700'
    },
    {
      icon: Users,
      name: 'منسق الفريق',
      nameEn: 'Team Coordinator',
      role: 'التعاون والتنسيق',
      roleEn: 'Collaboration & Coordination',
      color: '#EC4899',
      description: 'ينسق بين أعضاء الفريق ويضمن التواصل الفعال والتقدم المنظم',
      descriptionEn: 'Coordinates between team members and ensures effective communication and organized progress',
      capabilities: [
        'إدارة المهام',
        'تنسيق الفريق',
        'تتبع التقدم',
        'تقارير الفريق'
      ],
      gradient: 'from-pink-500 to-rose-700'
    },
    {
      icon: Cpu,
      name: 'مُقيّم الذكاء الاصطناعي',
      nameEn: 'AI Assessor',
      role: 'التقييم الذكي',
      roleEn: 'Smart Assessment',
      color: '#06B6D4',
      description: 'يُجري تقييمات تلقائية ذكية باستخدام الذكاء الاصطناعي',
      descriptionEn: 'Conducts intelligent automatic assessments using artificial intelligence',
      capabilities: [
        'تقييم تلقائي',
        'تحليل الذكاء الاصطناعي',
        'توليد التقارير',
        'التعلم المستمر'
      ],
      gradient: 'from-cyan-500 to-cyan-700'
    }
  ]

  return (
    <section id="ai-team" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-accent to-brand-gold text-white px-6 py-2 rounded-full text-sm font-bold mb-6">
            <Bot className="w-4 h-4" />
            <span>فريق الذكاء الاصطناعي</span>
          </div>
          <h2 className="font-arabic font-bold text-4xl lg:text-6xl text-gray-900 mb-4">
            قابل فريق الذكاء الاصطناعي الخاص بك
          </h2>
          <h3 className="font-english font-semibold text-2xl lg:text-3xl text-gray-700 mb-6">
            Meet Your AI Team
          </h3>
          <p className="font-arabic text-lg text-gray-600 max-w-3xl mx-auto">
            ستة وكلاء ذكيون متخصصون في خدمتك على مدار الساعة
          </p>
          <p className="font-english text-base text-gray-500 max-w-3xl mx-auto mt-2">
            Six intelligent specialists serving you 24/7
          </p>
        </motion.div>

        {/* AI Agents Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiAgents.map((agent, index) => (
            <motion.button
              key={index}
              onClick={() => setSelectedAgent(index)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-2xl p-8 border-2 transition-all text-right hover:shadow-xl ${
                selectedAgent === index
                  ? 'border-brand-accent shadow-2xl scale-105'
                  : 'border-gray-200 hover:border-gray-300 shadow-lg'
              }`}
            >
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center mb-6 shadow-lg mx-auto`}>
                <agent.icon className="w-10 h-10 text-white" strokeWidth={2} />
              </div>
              
              <h3 className="font-arabic font-bold text-2xl text-gray-900 mb-2">
                {agent.name}
              </h3>
              <h4 className="font-english font-semibold text-sm text-gray-700 mb-1">
                {agent.nameEn}
              </h4>
              
              <div className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold mb-4">
                {agent.role}
              </div>
              
              <p className="font-arabic text-sm text-gray-600 leading-relaxed mb-4">
                {agent.description}
              </p>
              
              {selectedAgent === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 pt-4 border-t border-gray-200"
                >
                  <div className="space-y-2">
                    {agent.capabilities.map((capability, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" strokeWidth={2} />
                        <span className="font-arabic text-gray-700">{capability}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="font-arabic text-xl text-gray-900 mb-4">
            فريق ذكي كامل في خدمتك
          </p>
          <p className="font-english text-lg text-gray-600">
            A complete intelligent team at your service
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default AITeamShowcase
