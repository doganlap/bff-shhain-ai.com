import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import LoginForm from './components/auth/LoginForm'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          شاهين الذكي – بوابة الحوكمة والالتزام للأعمال في السعودية
        </h1>
        <p className="text-slate-300 max-w-xl mb-8">
          منصة GRC موحّدة للحوكمة، المخاطر، والامتثال، مصممة لبيئة المملكة (NCA، SAMA، PDPL، DGA) وتخدم القطاعات الحيوية.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a href="/demo" className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 font-semibold">
            اطلب Demo مباشر
          </a>
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <button className="px-6 py-3 rounded-full border border-slate-600 hover:border-blue-400">
                دخول الشركاء / العملاء
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/60" />
              <Dialog.Content className="fixed top-1/2 left-1/2 max-w-md w-[90%] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-slate-900 p-6 shadow-xl">
                <Dialog.Title className="text-xl font-semibold mb-2">
                  تسجيل الدخول إلى لوحة شاهين
                </Dialog.Title>
                <Dialog.Description className="text-sm text-slate-400 mb-4">
                  أدخل البريد الإلكتروني وكلمة المرور للدخول للمنصة.
                </Dialog.Description>
                <LoginForm />
                <Dialog.Close className="mt-4 text-sm text-slate-400 hover:text-slate-200">
                  إغلاق
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </header>
      <footer className="py-4 text-center text-xs text-slate-500">
        © 2025 Shahin Platform – Powered by DoganConsult
      </footer>
    </div>
  )
}