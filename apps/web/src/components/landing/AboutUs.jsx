import React from 'react';
import { motion } from 'framer-motion';
import { Users, Award, Target, Globe, Shield, TrendingUp } from 'lucide-react';
import GlassCard from './GlassCard';

const AboutUs = () => {
  const stats = [
    { icon: Users, number: '500+', label: 'عملاء سعوديين', color: 'text-blue-500' },
    { icon: Award, number: '50+', label: 'شهادة ISO', color: 'text-green-500' },
    { icon: Target, number: '99.9%', label: 'نسبة الامتثال', color: 'text-purple-500' },
    { icon: Globe, number: '12+', label: 'دولة مشتركة', color: 'text-orange-500' }
  ];

  const values = [
    {
      icon: Shield,
      title: 'الأمان والموثوقية',
      description: 'نلتزم بأعلى معايير الأمان وحماية البيانات مع تخزين محلي كامل'
    },
    {
      icon: TrendingUp,
      title: 'التميز والابتكار',
      description: 'نسعى دائماً لتقديم حلول مبتكرة تفوق توقعات عملائنا'
    },
    {
      icon: Users,
      title: 'الشراكة الاستراتيجية',
      description: 'نبني علاقات طويلة الأمد مع عملائنا لضمان نجاحهم المستمر'
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            من نحن
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            شاهين للحوكمة هي شركة سعودية رائدة متخصصة في تقديم حلول الحوكمة والامتثال الذكية، 
            مدعومة بالذكاء الاصطناعي لتلبية احتياجات المنظمات في المملكة والمنطقة.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <GlassCard className="text-center p-6 hover:scale-105 transition-transform duration-300">
                <stat.icon className={`w-12 h-12 ${stat.color} mx-auto mb-4`} />
                <div className="text-3xl font-bold mb-2">{stat.number}</div>
                <div className="text-gray-600 dark:text-gray-300 text-sm">{stat.label}</div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              رؤيتنا
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              نحو مستقبل مستدام من خلال الحوكمة المتميزة، حيث نساهم في بناء منظمات قوية 
              ومرنة تلبي أعلى معايير الامتثال وتدفع عجلة الاقتصاد الوطني.
            </p>
            
            <h3 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
              مهمتنا
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              تمكين المنظمات السعودية من تحقيق التميز في الحوكمة والامتثال من خلال 
              حلول ذكية تعتمد على أحدث تقنيات الذكاء الاصطناعي والخبرة المحلية العميقة.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Modern%20Saudi%20Arabian%20business%20team%20in%20professional%20setting%2C%20diverse%20group%20of%20executives%20in%20traditional%20and%20modern%20attire%2C%20confident%20poses%2C%20corporate%20office%20environment%2C%20professional%20lighting%2C%20high-quality%20corporate%20photography&image_size=landscape_16_9"
                alt="فريق شاهين للحوكمة"
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            قيمنا الأساسية
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <GlassCard key={index} className="p-8 text-center">
                <value.icon className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                <h4 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  {value.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {value.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutUs;