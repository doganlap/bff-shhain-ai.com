import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, Shield, AlertTriangle, CheckCircle, Clock,
  Bot, Brain, Cpu, MessageCircle, Activity, Users, Edit, Code, Settings,
  TrendingUp, X
} from 'lucide-react'

const DashboardPreview = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [showAIPanel, setShowAIPanel] = useState(true) // Show AI panel by default
  const [selectedAgent, setSelectedAgent] = useState('compliance') // Pre-select compliance agent

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', labelEn: 'Overview', icon: BarChart3 },
    { id: 'compliance', label: 'حالة الامتثال', labelEn: 'Compliance Status', icon: Shield },
    { id: 'assessments', label: 'التقييمات', labelEn: 'Assessments', icon: CheckCircle },
    { id: 'risks', label: 'المخاطر', labelEn: 'Risk Management', icon: AlertTriangle }
  ]

  const aiAgents = [
    { 
      id: 'user_support',
      name: 'مساعد المستخدم',
      nameEn: 'User Support',
      icon: MessageCircle,
      color: '#3B82F6',
      description: 'Help & support'
    },
    { 
      id: 'developer',
      name: 'مساعد المطور',
      nameEn: 'Developer',
      icon: Cpu,
      color: '#8B5CF6',
      description: 'Code assistance'
    },
    { 
      id: 'compliance',
      name: 'أخصائي الامتثال',
      nameEn: 'Compliance Expert',
      icon: Shield,
      color: '#10B981',
      description: 'GRC expertise'
    },
    { 
      id: 'system',
      name: 'مدير النظام',
      nameEn: 'System Operations',
      icon: Activity,
      color: '#F59E0B',
      description: 'System ops'
    },
    { 
      id: 'collaborator',
      name: 'منسق الفريق',
      nameEn: 'Team Coordinator',
      icon: Users,
      color: '#EC4899',
      description: 'Team coordination'
    },
    { 
      id: 'assessor',
      name: 'مُقيّم الذكاء الاصطناعي',
      nameEn: 'AI Assessor',
      icon: Bot,
      color: '#06B6D4',
      description: 'Auto assessments'
    }
  ]

  return (
    <section id="dashboard" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-arabic font-bold text-4xl lg:text-5xl text-gray-900 mb-4">
            شاهد منصة شاهين في العمل
          </h2>
          <h3 className="font-english font-semibold text-2xl lg:text-3xl text-gray-700 mb-4">
            See Shahin GRC in Action
          </h3>
          <p className="font-arabic text-lg text-gray-600">
            لوحة معلومات مباشرة وتفاعلية للحوكمة والامتثال
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-brand-primary'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-arabic">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dashboard Preview with AI Panel */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <div className="flex gap-4">
            {/* Main Dashboard */}
            <div className="flex-1 bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
              {/* Dashboard Header */}
              <div className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6" />
                  <div>
                    <div className="font-arabic font-bold">لوحة تحكم شاهين</div>
                    <div className="font-english text-sm opacity-90">Shahin GRC Dashboard</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIPanel(!showAIPanel)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <Brain className="w-4 h-4" />
                  <span className="text-sm font-arabic">فريق الذكاء الاصطناعي</span>
                </button>
              </div>

              {/* Dashboard Content */}
              <div className="p-8">
                {activeTab === 'overview' && <OverviewDashboard />}
                {activeTab === 'compliance' && <ComplianceDashboard />}
                {activeTab === 'assessments' && <AssessmentsDashboard />}
                {activeTab === 'risks' && <RiskDashboard />}
              </div>
            </div>

            {/* Right AI Agent Panel - Always Visible on Landing Page */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex-shrink-0"
            >
                {/* AI Panel Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    <span className="font-arabic font-bold">فريق الذكاء الاصطناعي</span>
                  </div>
                  <button
                    onClick={() => setShowAIPanel(false)}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* AI Agents List */}
                <div className="p-4 max-h-[600px] overflow-y-auto">
                  <div className="mb-4">
                    <h4 className="font-arabic font-bold text-sm text-gray-700 mb-3">الوكلاء المتخصصون (6)</h4>
                    <div className="space-y-2">
                      {aiAgents.map((agent) => (
                        <button
                          key={agent.id}
                          onClick={() => setSelectedAgent(agent.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                            selectedAgent === agent.id
                              ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300'
                              : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: agent.color + '20' }}
                          >
                            <agent.icon className="w-5 h-5" style={{ color: agent.color }} />
                          </div>
                          <div className="text-left flex-1">
                            <div className="font-arabic font-semibold text-sm text-gray-900">
                              {agent.name}
                            </div>
                            <div className="font-english text-xs text-gray-500">
                              {agent.nameEn}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* AI Tools */}
                  <div className="mb-4 border-t border-gray-200 pt-4">
                    <h4 className="font-arabic font-bold text-sm text-gray-700 mb-3">أدوات الذكاء الاصطناعي</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <Edit className="w-5 h-5 text-gray-600" />
                        <span className="font-arabic text-sm text-gray-700">هندسة الأوامر</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <Code className="w-5 h-5 text-gray-600" />
                        <span className="font-arabic text-sm text-gray-700">مقارنة النماذج</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <Settings className="w-5 h-5 text-gray-600" />
                        <span className="font-arabic text-sm text-gray-700">إعدادات الذكاء الاصطناعي</span>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Agent Collaboration Badge */}
                  <div className="bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span className="font-arabic font-bold text-sm text-purple-900">
                        التعاون المتعدد
                      </span>
                    </div>
                    <p className="font-arabic text-xs text-purple-700 leading-relaxed">
                      جميع الوكلاء الستة يعملون معاً للإجابة على الأسئلة المعقدة
                    </p>
                  </div>
                </div>
              </motion.div>
          </div>
        </motion.div>

        {/* Mobile Info */}
        <div className="text-center mt-6">
          <p className="font-arabic text-gray-600 text-sm">
            💡 على شاشات صغيرة، انقر زر &quot;فريق الذكاء الاصطناعي&quot; لإظهار/إخفاء اللوحة
          </p>
        </div>
      </div>
    </section>
  )
}

const OverviewDashboard = () => {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard 
          value="87%" 
          label="معدل الامتثال" 
          labelEn="Compliance Rate"
          trend="+5%"
          color="emerald"
        />
        <KPICard 
          value="24" 
          label="التقييمات النشطة" 
          labelEn="Active Assessments"
          trend="+3"
          color="blue"
        />
        <KPICard 
          value="12" 
          label="المخاطر العالية" 
          labelEn="High Risks"
          trend="-2"
          color="red"
        />
        <KPICard 
          value="156" 
          label="الأدلة المرفوعة" 
          labelEn="Evidence Uploaded"
          trend="+48"
          color="purple"
        />
      </div>

      {/* Compliance Progress */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
        <h4 className="font-arabic font-bold text-lg text-gray-900 mb-4">تقدم الامتثال حسب الإطار</h4>
        <div className="space-y-3">
          <ProgressBar framework="NCA ECC" progress={92} color="blue" />
          <ProgressBar framework="PDPL" progress={78} color="purple" />
          <ProgressBar framework="SAMA" progress={85} color="emerald" />
          <ProgressBar framework="SDAIA" progress={65} color="amber" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h4 className="font-arabic font-bold text-lg text-gray-900 mb-4">النشاط الأخير</h4>
        <div className="space-y-3">
          <ActivityItem 
            action="تقييم جديد مكتمل"
            framework="NCA ECC"
            time="منذ ساعتين"
            icon={CheckCircle}
            color="green"
          />
          <ActivityItem 
            action="دليل تم رفعه"
            framework="PDPL"
            time="منذ 4 ساعات"
            icon={TrendingUp}
            color="blue"
          />
          <ActivityItem 
            action="مخاطر جديدة محددة"
            framework="SAMA"
            time="منذ 6 ساعات"
            icon={AlertTriangle}
            color="amber"
          />
        </div>
      </div>
    </div>
  )
}

const ComplianceDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-arabic font-semibold text-gray-700">متوافق</span>
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-4xl font-bold text-green-600 mb-1">342</div>
          <div className="font-english text-sm text-gray-600">Compliant Controls</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-arabic font-semibold text-gray-700">قيد التنفيذ</span>
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div className="text-4xl font-bold text-amber-600 mb-1">48</div>
          <div className="font-english text-sm text-gray-600">In Progress</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border-2 border-red-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-arabic font-semibold text-gray-700">غير متوافق</span>
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="text-4xl font-bold text-red-600 mb-1">14</div>
          <div className="font-english text-sm text-gray-600">Non-Compliant</div>
        </div>
      </div>
    </div>
  )
}

const AssessmentsDashboard = () => {
  return (
    <div className="text-center py-12">
      <BarChart3 className="w-16 h-16 text-brand-accent mx-auto mb-4" />
      <h4 className="font-arabic font-bold text-xl text-gray-900 mb-2">
        التقييمات والتدقيق
      </h4>
      <p className="font-english text-gray-600">
        Assessment Management & Audit Trails
      </p>
    </div>
  )
}

const RiskDashboard = () => {
  return (
    <div className="text-center py-12">
      <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h4 className="font-arabic font-bold text-xl text-gray-900 mb-2">
        إدارة المخاطر المؤسسية
      </h4>
      <p className="font-english text-gray-600">
        Enterprise Risk Management
      </p>
    </div>
  )
}

const KPICard = ({ value, label, labelEn, trend, color }) => {
  const colorClasses = {
    emerald: 'text-emerald-600 bg-emerald-50',
    blue: 'text-blue-600 bg-blue-50',
    red: 'text-red-600 bg-red-50',
    purple: 'text-purple-600 bg-purple-50'
  }

  return (
    <div className={`${colorClasses[color]} rounded-xl p-5 border border-${color}-200`}>
      <div className="text-3xl font-bold mb-2">{value}</div>
      <div className="font-arabic font-semibold text-sm text-gray-700">{label}</div>
      <div className="font-english text-xs text-gray-600">{labelEn}</div>
      <div className="text-xs font-semibold mt-2">{trend}</div>
    </div>
  )
}

const ProgressBar = ({ framework, progress, color }) => {
  const colorClasses = {
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-600'
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="font-arabic font-semibold text-sm text-gray-700">{framework}</span>
        <span className="font-bold text-sm text-gray-900">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${progress}%` }}
          transition={{ duration: 1, delay: 0.2 }}
          viewport={{ once: true }}
          className={`h-2.5 rounded-full ${colorClasses[color]}`}
        ></motion.div>
      </div>
    </div>
  )
}

const ActivityItem = ({ action, framework, time, icon: Icon, color }) => {
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600'
  }

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className={`w-10 h-10 rounded-full ${colorClasses[color]} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="font-arabic font-semibold text-gray-900">{action}</div>
        <div className="font-english text-sm text-gray-500">{framework}</div>
      </div>
      <div className="font-arabic text-xs text-gray-500">{time}</div>
    </div>
  )
}

export default DashboardPreview

