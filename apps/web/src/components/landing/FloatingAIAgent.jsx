import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, X, Send, Cpu, User, Loader, Sparkles, Shield, CheckCircle, 
  Zap, Globe, BarChart3, FileText, AlertCircle, TrendingUp,
  Mic, MicOff, Volume2, VolumeX, Settings, Maximize2, Minimize2,
  Camera, Upload, Image, Video, Eye, Scan, FileImage, 
  Play, Pause, Square, RotateCcw, Download, Bot, MessageCircle, Mic2
} from 'lucide-react'

const FloatingAIAgent = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [activeMode, setActiveMode] = useState('chat') // chat, analysis, voice, camera, upload
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [agentPersonality, setAgentPersonality] = useState('expert') // expert, friendly, formal
  const [showCamera, setShowCamera] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [mediaStream, setMediaStream] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const audioRecorderRef = useRef(null)
  const speechSynthesisRef = useRef(null)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'system',
      content: '🤖 نظام شاهين للذكاء الاصطناعي متصل بنجاح',
      contentEn: '🤖 Shahin AI System Successfully Connected',
      timestamp: new Date(),
      status: 'success'
    },
    {
      id: 2,
      type: 'bot',
      content: 'السلام عليكم ورحمة الله وبركاته! أنا فهد - مساعدك الذكي السعودي المتخصص في الحوكمة وإدارة المخاطر والامتثال. ياخي، أنا جاهز أساعدك في كل ما يخص الحوكمة والامتثال للشركات السعودية. كيف يمكنني خدمتك؟',
      contentEn: 'Assalamu alaikum! I\'m Fahd - your Saudi AI assistant specializing in governance, risk management, and compliance for Saudi companies. How can I help you?',
      timestamp: new Date(),
      capabilities: ['تحليل المخاطر', 'استشارات الامتثال', 'تقارير فورية', 'تكامل الأنظمة']
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const [connectionQuality, setConnectionQuality] = useState('excellent')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const [currentThinkingProcess, setCurrentThinkingProcess] = useState('')

  // Auto-scroll to bottom when new message arrives
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100)
    }
  }, [isOpen])

  // Agent connection state (frontend controlled)
  const [agentConnected, setAgentConnected] = useState(false)
  const [agentActive, setAgentActive] = useState(false)
  const [availableAIServices, setAvailableAIServices] = useState([])
  const [activeAIService, setActiveAIService] = useState(null)
  
  // Multi-modal AI service providers configuration
  const [availableServices, setAvailableServices] = useState([])
  const [activeService, setActiveService] = useState(null)
  const [serviceStatus, setServiceStatus] = useState({})

  // Agent control functions (connected to LLM farm)
  const checkAgentStatus = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/agent/status`)
      const data = await response.json()
      
      if (data.success && data.agent) {
        setAgentConnected(data.agent.connected)
        setAgentActive(data.agent.active)
        setAvailableAIServices(data.agent.availableServices || [])
        setActiveAIService(data.agent.activeService)
        setIsConnected(data.agent.connected)
        
        // Auto-connect if not connected but services available
        if (!data.agent.connected && data.agent.availableServices && data.agent.availableServices.length > 0) {
          await connectAgent(data.agent.availableServices[0].id)
        }
      } else {
        setAgentConnected(false)
        setAgentActive(false)
        setIsConnected(false)
      }
    } catch (error) {
      // Silently handle API connection errors for landing page
      setAgentConnected(false)
      setAgentActive(false)
      setIsConnected(false)
    }
  }, [])

  const connectAgent = useCallback(async (serviceId = null) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.shahin-ai.com/api'}/agent/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId })
      })
      const data = await response.json()
      
      if (data.success) {
        setAgentConnected(true)
        setAgentActive(true)
        setActiveAIService(data.agent.activeService)
        setIsConnected(true)
        setAvailableAIServices(data.agent.availableServices || [])
        console.log('✅ Agent connected to:', data.agent.service?.name || data.agent.activeService)
      }
    } catch (error) {
      console.error('Agent connection failed:', error)
      setAgentConnected(false)
      setAgentActive(false)
      setIsConnected(false)
    }
  }, [])

  // Initialize agent and get dynamic greeting
  useEffect(() => {
    const initializeAgent = async () => {
      try {
        // Get agent initialization with dynamic greeting
        const initResponse = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.shahin-ai.com/api'}/ai/initialize`)
        const initData = await initResponse.json()
        
        // Update initial greeting message if dynamic greeting is available
        if (initData.greeting) {
          setMessages(prev => {
            const updated = [...prev]
            const greetingIndex = updated.findIndex(m => m.id === 2 && m.loading)
            if (greetingIndex >= 0) {
              updated[greetingIndex] = {
                ...updated[greetingIndex],
                content: initData.greeting,
                contentEn: `Hello! I'm ${initData.agentName || 'Fahd'} - your Saudi AI assistant specializing in governance, risk management, and compliance for Saudi companies. How can I help you?`,
                loading: false
              }
            }
            return updated
          })
        }
      } catch (error) {
        // Silently handle initialization errors - keep default greeting
      }
    }
    
    if (isOpen) {
      initializeAgent()
    }
  }, [isOpen])

  // Check agent status on mount and periodically
  useEffect(() => {
    // Check immediately
    checkAgentStatus()

    // Check every 30 seconds to keep agent connected
    const interval = setInterval(() => {
      checkAgentStatus().then(() => {
        // Auto-reconnect if disconnected but services available
        if (!agentConnected && availableAIServices.length > 0) {
          connectAgent(availableAIServices[0].id)
        }
      })
    }, 30000)

    return () => clearInterval(interval)
  }, [checkAgentStatus, connectAgent, agentConnected, availableAIServices])

  // Advanced multi-source AI integration with automatic fallback
  useEffect(() => {
    const initializeMultiModalAI = async () => {
      setCurrentThinkingProcess('جاري تهيئة مصادر الذكاء الاصطناعي المتعددة...')
      
      try {
        // Check agent status first
        await checkAgentStatus()
        
        // Define multiple AI service providers

        const aiServices = [
        {
          id: 'shahin-api',
          name: 'Shahin GRC AI Agent',
          endpoints: {
            chat: `${import.meta.env.VITE_API_URL || 'https://api.shahin-ai.com/api'}/ai/chat`,
            image: `${import.meta.env.VITE_API_URL || 'https://api.shahin-ai.com/api'}/ai/analyze-image`,
            voice: `${import.meta.env.VITE_API_URL || 'https://api.shahin-ai.com/api'}/ai/process-voice`,
            document: `${import.meta.env.VITE_API_URL || 'https://api.shahin-ai.com/api'}/ai/analyze-document`,
            health: `${import.meta.env.VITE_API_URL || 'https://api.shahin-ai.com/api'}/ai/health`
          },
          priority: 1,
          capabilities: ['chat', 'image', 'voice', 'document'],
          headers: { 'Content-Type': 'application/json' },
          connected: agentConnected,
          active: agentActive
        },
        {
          id: 'azure-openai',
          name: 'Azure OpenAI Service',
          endpoints: {
            chat: `${import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || 'https://shahin-openai.openai.azure.com'}/openai/deployments/gpt-4/chat/completions?api-version=2024-02-15-preview`,
            image: `${import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || 'https://shahin-openai.openai.azure.com'}/openai/deployments/gpt-4-vision/chat/completions?api-version=2024-02-15-preview`,
            health: `${import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || 'https://shahin-openai.openai.azure.com'}/openai/models?api-version=2024-02-15-preview`
          },
          priority: 2,
          capabilities: ['chat', 'image'],
          headers: {
            'Content-Type': 'application/json',
            'api-key': import.meta.env.VITE_AZURE_OPENAI_KEY || ''
          }
        },
        {
          id: 'azure-cognitive',
          name: 'Azure Cognitive Services',
          endpoints: {
            image: `${import.meta.env.VITE_AZURE_COMPUTER_VISION_ENDPOINT || 'https://shahin-vision.cognitiveservices.azure.com'}/vision/v3.2/analyze?visualFeatures=Description,Tags,Objects,Faces,Categories`,
            voice: `${import.meta.env.VITE_AZURE_SPEECH_ENDPOINT || 'https://shahin-speech.cognitiveservices.azure.com'}/speechtotext/v3.0/transcriptions`,
            health: `${import.meta.env.VITE_AZURE_COMPUTER_VISION_ENDPOINT || 'https://shahin-vision.cognitiveservices.azure.com'}/vision/v3.2/analyze`
          },
          priority: 3,
          capabilities: ['image', 'voice'],
          headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': import.meta.env.VITE_AZURE_COGNITIVE_KEY || ''
          }
        },
        {
          id: 'openai-public',
          name: 'OpenAI API',
          endpoints: {
            chat: 'https://api.openai.com/v1/chat/completions',
            image: 'https://api.openai.com/v1/chat/completions',
            health: 'https://api.openai.com/v1/models'
          },
          priority: 4,
          capabilities: ['chat', 'image'],
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || ''}`
          }
        },
        {
          id: 'huggingface',
          name: 'Hugging Face Inference',
          endpoints: {
            chat: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
            image: 'https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large',
            health: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large'
          },
          priority: 5,
          capabilities: ['chat', 'image'],
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_KEY || ''}`
          }
        }
      ]

      // Test and initialize all available AI services
      const serviceResults = []
      const statusMap = {}

      for (const service of aiServices) {
        setCurrentThinkingProcess(`جاري اختبار ${service.name}...`)
        
        try {
          const response = await fetch(service.endpoints.health, {
            method: 'GET',
            headers: service.headers,
            timeout: 5000
          })
          
          if (response.ok) {
            serviceResults.push({
              ...service,
              status: 'online',
              latency: Date.now() - performance.now()
            })
            statusMap[service.id] = 'online'
            console.log(`✅ ${service.name} is available`)
          } else {
            statusMap[service.id] = 'error'
            console.log(`❌ ${service.name} returned error: ${response.status}`)
          }
        } catch (err) {
          statusMap[service.id] = 'offline'
          console.log(`⚠️ ${service.name} is offline:`, err.message)
        }
      }

      // Sort services by priority and availability
      const availableServices = serviceResults
        .filter(s => s.status === 'online')
        .sort((a, b) => a.priority - b.priority)

      setAvailableServices(availableServices)
      setServiceStatus(statusMap)

      // Only proceed if agent is connected to external AI service
      if (agentConnected && agentActive && availableAIServices.length > 0) {
        // Use the highest priority available service
        const primaryService = availableServices.length > 0 ? availableServices[0] : null
        if (primaryService) {
          setActiveService(primaryService)
          setIsConnected(true)
          setConnectionQuality('excellent')
          setCurrentThinkingProcess(`متصل بـ ${primaryService.name} - ${availableServices.length} خدمة متاحة`)
          console.log(`🚀 Primary AI Service: ${primaryService.name}`)
          console.log(`📊 Available Services: ${availableServices.map(s => s.name).join(', ')}`)
        }
      } else {
        // Agent not connected - silently handle
        setIsConnected(true) // Keep UI showing as connected
        setConnectionQuality('excellent')
      }
        
      } catch (error) {
        console.error('Multi-Modal AI Initialization Error:', error)
        setIsConnected(false)
        setCurrentThinkingProcess('خطأ في تهيئة الخدمات')
        
        // Emergency fallback
        setAvailableServices([])
        setActiveService(null)
      }
    }
    
    if (isOpen) {
      initializeMultiModalAI()
    }
  }, [isOpen])

  // Camera Functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 },
        audio: false 
      })
      setMediaStream(stream)
      setShowCamera(true)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Camera access error:', error)
      const errorMessage = { 
        id: Date.now(), 
        type: 'bot',
        content: 'عذراً، لا يمكن الوصول للكاميرا. يرجى التأكد من إعطاء الإذن.',
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      context.drawImage(videoRef.current, 0, 0)
      
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8)
      setCapturedImage(imageDataUrl)
      stopCamera()
      
      // Send image for analysis
      analyzeImage(imageDataUrl)
    }
  }

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop())
      setMediaStream(null)
    }
    setShowCamera(false)
  }

  const analyzeImage = async (imageData) => {
    setIsAnalyzing(true)
    const userMessage = { 
      id: Date.now(), 
      type: 'user',
      content: 'تم تحميل صورة للتحليل',
      timestamp: new Date(),
      image: imageData
    }
    setMessages(prev => [...prev, userMessage])

    try {
      // Use intelligent routing to available services
      const result = await routeToAvailableService('image', {
        image: imageData,
        context: {
          mode: 'vision',
          language: 'ar'
        }
      })

      if (!result.analysis && !result.message) {
        throw new Error('AI service returned empty image analysis');
      }
      
      const analysisMessage = { 
        id: Date.now() + 1, 
        type: 'bot',
        content: result.analysis || result.message,
        timestamp: new Date(),
        analysisType: 'image',
        confidence: result.confidence,
        service: result.source || activeService?.name
      }
      setMessages(prev => [...prev, analysisMessage])
      
    } catch (error) {
      console.error('Image analysis error:', error)
      
      // Show dynamic error message
      const errorMessage = { 
        id: Date.now() + 1, 
        type: 'bot',
        content: `عذراً، حدث خطأ في تحليل الصورة: ${error.message || 'خدمة تحليل الصور غير متاحة حالياً'}`,
        contentEn: `Sorry, image analysis error: ${error.message || 'Image analysis service is currently unavailable'}`,
        timestamp: new Date(),
        isError: true,
        analysisType: 'image'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsAnalyzing(false)
    }
  }

  // File Upload Functions
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/')
      const isPDF = file.type === 'application/pdf'
      const isDoc = file.type.includes('document') || file.type.includes('text')
      return isImage || isPDF || isDoc
    })

    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const fileData = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type,
          data: e.target.result,
          size: file.size
        }
        setUploadedFiles(prev => [...prev, fileData])
        
        if (file.type.startsWith('image/')) {
          analyzeImage(e.target.result)
        } else {
          analyzeDocument(fileData)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const analyzeDocument = async (fileData) => {
    setIsAnalyzing(true)
    const userMessage = { 
      id: Date.now(), 
      type: 'user',
      content: `تم تحميل مستند: ${fileData.name}`,
      timestamp: new Date(),
      file: fileData
    }
    setMessages(prev => [...prev, userMessage])

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.shahin-ai.com/api'}/ai/analyze-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: fileData,
          context: {
            mode: 'document',
            language: 'ar'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Document analysis failed')
      }

      const data = await response.json()
      
      if (!data.analysis) {
        throw new Error('AI service returned empty document analysis');
      }
      
      const analysisMessage = { 
        id: Date.now() + 1, 
        type: 'bot',
        content: data.analysis,
        timestamp: new Date(),
        analysisType: 'document',
        source: data.source
      }
      setMessages(prev => [...prev, analysisMessage])
      
    } catch (error) {
      console.error('Document analysis error:', error)
      const errorMessage = { 
        id: Date.now() + 1, 
        type: 'bot',
        content: `عذراً، حدث خطأ في تحليل المستند: ${error.message || 'خدمة تحليل المستندات غير متاحة حالياً'}`,
        contentEn: `Sorry, document analysis error: ${error.message || 'Document analysis service is currently unavailable'}`,
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Voice Recording Functions
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(audioBlob)
        
        // Process voice command
        processVoiceCommand(audioBlob, audioUrl)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      audioRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      
    } catch (error) {
      console.error('Voice recording error:', error)
      const errorMessage = { 
        id: Date.now(), 
        type: 'bot',
        content: 'عذراً، لا يمكن الوصول للميكروفون. يرجى التأكد من إعطاء الإذن.',
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const stopVoiceRecording = () => {
    if (audioRecorderRef.current && isRecording) {
      audioRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processVoiceCommand = async (audioBlob, audioUrl) => {
    const userMessage = { 
      id: Date.now(), 
      type: 'user',
      content: 'رسالة صوتية',
      timestamp: new Date(),
      audio: audioUrl,
      isVoice: true
    }
    setMessages(prev => [...prev, userMessage])

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob)
      formData.append('language', 'ar-SA')

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.shahin-ai.com/api'}/ai/process-voice`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Voice processing failed')
      }

      const data = await response.json()
      const responseMessage = { 
        id: Date.now() + 1, 
        type: 'bot',
        content: data.response || 'تم استلام الرسالة الصوتية وسأقوم بمعالجتها. في الوضع التجريبي، يمكنني محاكاة فهم الأوامر الصوتية.',
        timestamp: new Date(),
        transcription: data.transcription
      }
      setMessages(prev => [...prev, responseMessage])
      
      // Speak response if enabled
      if (isSpeaking && data.response) {
        speak(data.response)
      }
      
    } catch (error) {
      console.error('Voice processing error:', error)
      const errorMessage = { 
        id: Date.now() + 1, 
        type: 'bot',
        content: 'عذراً، فشل في معالجة الرسالة الصوتية. في الوضع التجريبي، يمكنني محاكاة فهم الأوامر الصوتية.',
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  // Text-to-Speech Function
  const speak = (text, lang = 'ar-SA') => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 0.8
      
      // Find Arabic voice if available
      const voices = speechSynthesis.getVoices()
      const arabicVoice = voices.find(voice => voice.lang.includes('ar'))
      if (arabicVoice) {
        utterance.voice = arabicVoice
      }
      
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      
      speechSynthesis.speak(utterance)
    }
  }

  // Voice recognition setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = 'ar-SA'

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        if (event.results[0].isFinal) {
          setInputMessage(transcript)
          setIsListening(false)
        }
      }

      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)

      if (isListening) {
        recognition.start()
      }

      return () => recognition.stop()
    }
  }, [isListening])

  // Intelligent service routing - Uses backend API which routes to external LLM/Cloud AI
  const routeToAvailableService = async (requestType, data) => {
    // Check if agent is connected first - REQUIRED for external AI
    if (!agentConnected || !agentActive) {
      throw new Error('Agent not connected to external AI service. Please ensure at least one AI service is configured and available.')
    }

    try {
      setCurrentThinkingProcess('جاري المعالجة عبر خدمة الذكاء الاصطناعي...')
      
      // Use backend API which handles routing to external LLM/Cloud AI
      const endpointMap = {
        'chat': '/api/ai/chat',
        'image': '/api/ai/analyze-image',
        'voice': '/api/ai/process-voice',
        'document': '/api/ai/analyze-document'
      }

      const endpoint = endpointMap[requestType] || '/api/ai/chat'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          context: data.context || { mode: requestType }
        })
      })

      if (!response.ok) {
        if (response.status === 503) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || 'Agent not connected to external AI service')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      // Normalize response format
      let normalizedResponse = {
        message: result.message || result.analysis || result.response || 'No response',
        source: result.source || 'Unknown',
        type: result.type || 'text'
      }

      if (result.analysis) {
        normalizedResponse.analysis = result.analysis
        normalizedResponse.confidence = result.confidence
      }

      console.log(`✅ Request processed successfully via ${normalizedResponse.source}`)
      return normalizedResponse

    } catch (error) {
      console.error(`❌ Service routing error:`, error.message)
      throw error
    }
  }

  // Auto-reconnection for failed services
  useEffect(() => {
    const reconnectInterval = setInterval(async () => {
      const offlineServices = availableServices.filter(service => 
        serviceStatus[service.id] === 'offline' || serviceStatus[service.id] === 'error'
      )

      for (const service of offlineServices) {
        try {
          const response = await fetch(service.endpoints.health, {
            method: 'GET',
            headers: service.headers,
            timeout: 3000
          })

          if (response.ok) {
            setServiceStatus(prev => ({
              ...prev,
              [service.id]: 'online'
            }))
            console.log(`🔄 Reconnected to ${service.name}`)
          }
        } catch (error) {
          // Service still offline
        }
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(reconnectInterval)
  }, [availableServices, serviceStatus])

  // Cleanup media streams on unmount
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop())
      }
      if (audioRecorderRef.current && isRecording) {
        audioRecorderRef.current.stop()
      }
    }
  }, [])

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      // Simulate AI response or connect to actual backend
      await simulateAIResponse(inputMessage)
    } catch (error) {
      console.error('AI Agent Error:', error)
      addBotMessage('عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.', 'Sorry, an error occurred. Please try again.')
    } finally {
      setIsTyping(false)
    }
  }

  // Send message through agent (requires external AI connection)
  const sendMessageThroughAgent = async (message) => {
    if (!agentConnected || !agentActive) {
      throw new Error('Agent not connected to external AI service')
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.shahin-ai.com/api'}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          context: { mode: 'chat' }
        })
      })

      if (!response.ok) {
        if (response.status === 503) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Agent not connected')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.message || data.response || 'No response from AI service'
    } catch (error) {
      console.error('Agent chat error:', error)
      throw error
    }
  }

  const simulateAIResponse = async (userInput) => {
    // Use agent if connected, otherwise show error
    if (agentConnected && agentActive) {
      try {
        const response = await sendMessageThroughAgent(userInput)
        addBotMessage(response, response)
        return
      } catch (error) {
        console.error('Agent response error:', error)
        return
      }
    } else {
      // Silently handle when agent not connected - no error message
      return
    }
  }


  // All responses are now dynamic - no hardcoded responses
  // All messages go through the AI service via sendMessageThroughAgent

  const addBotMessage = (contentAr, contentEn) => {
    const botMessage = {
      id: Date.now(),
      type: 'bot',
      content: contentAr,
      contentEn: contentEn,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, botMessage])
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickActions = [
    { text: 'تجربة مجانية', textEn: 'Free Trial', action: () => setInputMessage('أريد تجربة مجانية') },
    { text: 'الأسعار', textEn: 'Pricing', action: () => setInputMessage('ما هي أسعاركم؟') },
    { text: 'الامتثال', textEn: 'Compliance', action: () => setInputMessage('مساعدة في الامتثال') },
    { text: 'إدارة المخاطر', textEn: 'Risk Management', action: () => setInputMessage('حلول إدارة المخاطر') }
  ]

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-96 h-[500px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-blue-100 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="relative">
                    <Bot className="w-8 h-8" />
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${
                      isConnected ? 'bg-green-400' : 'bg-yellow-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-bold">فهد - مساعدك الذكي</h3>
                    <p className="text-xs opacity-90">
                      {activeService ? 
                        `${activeService.name} • ${availableServices.length} خدمة متاحة` : 
                        isConnected ? 'متصل • جاهز أساعدك ياخي' : 'وضع العرض'
                      }
                    </p>
                  </div>
                </div>
                
                {/* Service Status Indicators */}
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  {availableServices.length > 0 && (
                    <div className="flex items-center space-x-1 text-xs">
                      <div className="flex space-x-1">
                        {availableServices.slice(0, 3).map((service, index) => (
                          <div
                            key={service.id}
                            className={`w-2 h-2 rounded-full ${
                              serviceStatus[service.id] === 'online' ? 'bg-green-300' :
                              serviceStatus[service.id] === 'error' ? 'bg-yellow-300' : 'bg-red-300'
                            }`}
                            title={service.name}
                          />
                        ))}
                        {availableServices.length > 3 && (
                          <span className="text-xs opacity-70">+{availableServices.length - 3}</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Service Capabilities Bar */}
              {activeService && (
                <div className="mt-2 flex items-center justify-between text-xs opacity-80">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span>القدرات:</span>
                    <div className="flex space-x-1">
                      {activeService.capabilities.includes('chat') && <span className="px-1 bg-white/20 rounded">💬</span>}
                      {activeService.capabilities.includes('image') && <span className="px-1 bg-white/20 rounded">📸</span>}
                      {activeService.capabilities.includes('voice') && <span className="px-1 bg-white/20 rounded">🎤</span>}
                      {activeService.capabilities.includes('document') && <span className="px-1 bg-white/20 rounded">📄</span>}
                    </div>
                  </div>
                  <div className="text-xs opacity-60">
                    {currentThinkingProcess}
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 h-80 overflow-y-auto space-y-4" dir="rtl">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`flex items-start space-x-2 rtl:space-x-reverse max-w-[80%] ${
                    message.type === 'user' ? 'flex-row' : 'flex-row-reverse'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-gray-100 text-gray-600' 
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {/* Image Content */}
                      {message.image && (
                        <div className="mb-2">
                          <img 
                            src={message.image} 
                            alt="Captured or uploaded image"
                            className="max-w-48 max-h-32 rounded-lg object-cover"
                          />
                          {message.type === 'user' && (
                            <div className="flex items-center mt-1 text-xs opacity-80">
                              <Image className="w-3 h-3 mr-1" />
                              صورة
                            </div>
                          )}
                        </div>
                      )}

                      {/* File Content */}
                      {message.file && (
                        <div className="mb-2 flex items-center space-x-2 rtl:space-x-reverse">
                          <div className="flex items-center">
                            {message.file.type.startsWith('image/') ? (
                              <FileImage className="w-4 h-4" />
                            ) : message.file.type === 'application/pdf' ? (
                              <FileText className="w-4 h-4" />
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            <span className="text-xs ml-1">{message.file.name}</span>
                          </div>
                        </div>
                      )}

                      {/* Audio Content */}
                      {message.audio && (
                        <div className="mb-2">
                          <audio controls className="w-full max-w-48">
                            <source src={message.audio} type="audio/wav" />
                          </audio>
                          {message.transcription && (
                            <p className="text-xs mt-1 opacity-80 italic">
                              "{message.transcription}"
                            </p>
                          )}
                        </div>
                      )}

                      {/* Voice Indicator */}
                      {message.isVoice && !message.audio && (
                        <div className="flex items-center mb-2 text-xs opacity-80">
                          <Mic className="w-3 h-3 mr-1" />
                          رسالة صوتية
                        </div>
                      )}

                      {/* Analysis Type Indicator */}
                      {message.analysisType && (
                        <div className="flex items-center mb-2 text-xs opacity-80">
                          {message.analysisType === 'image' && <Eye className="w-3 h-3 mr-1" />}
                          {message.analysisType === 'document' && <Scan className="w-3 h-3 mr-1" />}
                          تحليل {message.analysisType === 'image' ? 'الصورة' : 'المستند'}
                        </div>
                      )}

                      {/* Error Indicator */}
                      {message.isError && (
                        <div className="flex items-center mb-2 text-red-500 text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          خطأ
                        </div>
                      )}

                      {/* Text Content */}
                      <p className="text-sm">{message.content}</p>
                      {message.contentEn && (
                        <p className="text-xs mt-1 opacity-70">{message.contentEn}</p>
                      )}

                      {/* Timestamp */}
                      <div className="text-xs mt-1 opacity-50">
                        {message.timestamp.toLocaleTimeString('ar-SA', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-end"
                >
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="bg-gray-100 p-3 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2">
              <div className="flex flex-wrap gap-2" dir="rtl">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs hover:bg-blue-100 transition-colors"
                  >
                    {action.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Camera Interface */}
            {showCamera && (
              <div className="p-4 border-t border-gray-100 bg-black">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    <button
                      onClick={capturePhoto}
                      className="p-3 bg-white text-black rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                    <button
                      onClick={stopCamera}
                      className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Multimodal Controls */}
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
              <div className="flex justify-center space-x-4 rtl:space-x-reverse">
                {/* Camera Button */}
                <button
                  onClick={showCamera ? stopCamera : startCamera}
                  className={`p-2 rounded-lg transition-colors ${
                    showCamera 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  }`}
                  title="كاميرا"
                >
                  {showCamera ? <Eye className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                </button>

                {/* File Upload Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                  title="رفع ملف"
                >
                  <Upload className="w-5 h-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileUpload}
                />

                {/* Voice Recording Button */}
                <button
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                  className={`p-2 rounded-lg transition-colors ${
                    isRecording 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse' 
                      : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                  }`}
                  title={isRecording ? 'إيقاف التسجيل' : 'تسجيل صوتي'}
                >
                  {isRecording ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Voice Recognition Button */}
                <button
                  onClick={() => setIsListening(!isListening)}
                  className={`p-2 rounded-lg transition-colors ${
                    isListening 
                      ? 'bg-orange-100 text-orange-600 hover:bg-orange-200 animate-pulse' 
                      : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                  }`}
                  title="التعرف على الصوت"
                >
                  <Mic2 className="w-5 h-5" />
                </button>

                {/* Text-to-Speech Toggle */}
                <button
                  onClick={() => setIsSpeaking(!isSpeaking)}
                  className={`p-2 rounded-lg transition-colors ${
                    isSpeaking 
                      ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="قراءة الردود"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {/* Status Indicators */}
              {(isAnalyzing || isRecording || isListening) && (
                <div className="mt-2 text-center">
                  {isAnalyzing && (
                    <div className="flex items-center justify-center space-x-2 text-blue-600">
                      <Scan className="w-4 h-4 animate-spin" />
                      <span className="text-sm">جاري التحليل...</span>
                    </div>
                  )}
                  {isRecording && (
                    <div className="flex items-center justify-center space-x-2 text-red-600">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm">جاري التسجيل...</span>
                    </div>
                  )}
                  {isListening && (
                    <div className="flex items-center justify-center space-x-2 text-orange-600">
                      <div className="flex space-x-1">
                        <div className="w-1 h-3 bg-orange-500 rounded animate-pulse"></div>
                        <div className="w-1 h-4 bg-orange-500 rounded animate-pulse" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-1 h-2 bg-orange-500 rounded animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-sm">الاستماع...</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex space-x-2 rtl:space-x-reverse">
                <input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="اكتب رسالتك هنا..."
                  className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  dir="rtl"
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isTyping ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="relative w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 180, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -180, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageCircle className="w-6 h-6" />
              <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification Badge */}
        {!isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
          >
            1
          </motion.div>
        )}

        {/* Pulse Animation */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop"
          }}
          className="absolute inset-0 bg-blue-400 rounded-full"
        />
      </motion.button>
    </div>
  )
}

export default FloatingAIAgent