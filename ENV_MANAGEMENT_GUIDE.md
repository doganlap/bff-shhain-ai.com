# 🔐 دليل إدارة ملفات البيئة Environment Variables Management Guide

## ⚠️ تحذير أمني مهم جداً CRITICAL SECURITY WARNING

**🚨 لا ترفع أبداً ملفات `.env` إلى Git!**
**🚨 NEVER commit `.env` files to Git!**

---

## 📋 جدول المحتويات Table of Contents

1. [نظرة عامة Overview](#نظرة-عامة-overview)
2. [الإعداد المحلي Local Setup](#الإعداد-المحلي-local-setup)
3. [النشر على Vercel / Azure](#النشر-على-vercel--azure)
4. [الملفات المهمة Important Files](#الملفات-المهمة-important-files)
5. [الأمان Security](#الأمان-security)

---

## 🎯 نظرة عامة Overview

### ما هي ملفات `.env`؟
ملفات `.env` تحتوي على متغيرات البيئة الحساسة مثل:
- كلمات مرور قواعد البيانات Database passwords
- مفاتيح API Keys
- رموز JWT Secrets
- معلومات الاتصال بالخدمات Service URLs

### لماذا لا نرفعها إلى Git؟
- **الأمان**: تحتوي على بيانات سرية يمكن استغلالها
- **المرونة**: كل بيئة (تطوير، إنتاج) لها إعداداتها الخاصة
- **الامتثال**: متطلبات الأمان والخصوصية

---

## 🛠️ الإعداد المحلي Local Setup

### الخطوة 1: نسخ ملفات Template

#### للـ BFF (Backend for Frontend):
\`\`\`bash
cd apps/bff
cp .env.template .env
\`\`\`

#### للـ Frontend (Web):
\`\`\`bash
cd apps/web
cp .env.template .env
\`\`\`

### الخطوة 2: ملء القيم الفعلية

افتح الملفات `.env` وعدّل القيم حسب بيئتك المحلية:

#### مثال لـ `apps/bff/.env`:
\`\`\`env
DATABASE_URL=postgresql://grc_user:my_secure_password@localhost:5432/grc_ecosystem
JWT_SECRET=my-super-secret-key-change-this-in-production
PORT=8001
FRONTEND_URL=http://localhost:5173
\`\`\`

#### مثال لـ `apps/web/.env`:
\`\`\`env
VITE_API_BASE_URL=http://localhost:8001
VITE_API_URL=http://localhost:8001/api
VITE_WS_URL=http://localhost:3008
\`\`\`

### الخطوة 3: التحقق من الإعداد

\`\`\`bash
# تشغيل BFF
cd apps/bff
npm run dev

# تشغيل Frontend (في terminal آخر)
cd apps/web
npm run dev
\`\`\`

---

## ☁️ النشر على Vercel / Azure

### ❌ لا تفعل:
- ❌ لا ترفع ملفات `.env` إلى Git
- ❌ لا تضع قيماً حساسة في ملفات الكود
- ❌ لا تشارك ملفات `.env` عبر البريد الإلكتروني

### ✅ افعل:

#### على Vercel:
1. اذهب إلى **Project Settings**
2. اختر **Environment Variables**
3. أضف المتغيرات واحدة تلو الأخرى:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `FRONTEND_URL`
   - إلخ...

#### على Azure:
1. افتح **App Service**
2. اذهب إلى **Configuration** → **Application Settings**
3. أضف المتغيرات المطلوبة

#### مثال على إضافة متغير على Vercel:
\`\`\`
Key: DATABASE_URL
Value: postgresql://user:pass@host:5432/db
Environment: Production
\`\`\`

---

## 📁 الملفات المهمة Important Files

### ✅ ملفات يجب الاحتفاظ بها في Git:
- ✅ `seed_grc_data.sql` - بيانات البذرة للنظام
- ✅ `*.md` - ملفات التوثيق (395 ملف)
- ✅ `.env.template` - قوالب بدون قيم حساسة
- ✅ `.env.example` - أمثلة توضيحية

### ❌ ملفات يجب استبعادها من Git:
- ❌ `.env` - ملف البيئة الرئيسي
- ❌ `.env.*` - أي ملف بيئة آخر
- ❌ `apps/*/.env` - ملفات البيئة في التطبيقات
- ❌ `apps/infra/deployment/.env*` - ملفات النشر

---

## 🔒 الأمان Security

### قواعد ذهبية Golden Rules:

1. **لا ترفع أبداً ملفات `.env` إلى Git**
   \`\`\`bash
   # تحقق من .gitignore
   cat .gitignore | grep ".env"
   \`\`\`

2. **استخدم قيماً قوية ومعقدة**
   - JWT Secret: 64+ حرف عشوائي
   - Passwords: 16+ حرف مع أحرف خاصة

3. **غيّر القيم بين البيئات**
   - Development ≠ Production
   - Staging ≠ Production

4. **راجع الملفات قبل الـ Commit**
   \`\`\`bash
   git status
   git diff
   \`\`\`

### التحقق من عدم وجود ملفات `.env` في Git:

\`\`\`bash
# البحث عن ملفات .env
git ls-files | grep ".env"

# إذا وجدت أي ملفات، احذفها من Git:
git rm --cached apps/bff/.env
git commit -m "Remove sensitive .env file"
\`\`\`

---

## 🚀 سير العمل الموصى به Recommended Workflow

### للمطورين Developers:

1. **استنساخ المشروع Clone**
   \`\`\`bash
   git clone <repository-url>
   cd Assessmant-GRC
   \`\`\`

2. **نسخ Templates**
   \`\`\`bash
   cp apps/bff/.env.template apps/bff/.env
   cp apps/web/.env.template apps/web/.env
   \`\`\`

3. **طلب القيم من فريق DevOps**
   - اطلب القيم الحساسة بشكل آمن (Slack، Microsoft Teams، إلخ)
   - لا ترسلها عبر البريد الإلكتروني

4. **التحقق قبل Commit**
   \`\`\`bash
   git status
   # تأكد من عدم ظهور ملفات .env
   \`\`\`

### للمديرين Managers:

1. **تخزين آمن للأسرار**
   - استخدم Azure Key Vault أو AWS Secrets Manager
   - احتفظ بنسخة احتياطية آمنة

2. **التحكم في الوصول**
   - قيّد الوصول للقيم الحساسة
   - استخدم Role-Based Access Control (RBAC)

---

## 📞 الدعم Support

إذا واجهت مشاكل:
1. راجع هذا الدليل
2. تحقق من `.env.template` للمتغيرات المطلوبة
3. تواصل مع فريق DevOps

---

## 📚 مصادر إضافية Additional Resources

- [12-Factor App Methodology](https://12factor.net/)
- [Vercel Environment Variables Docs](https://vercel.com/docs/environment-variables)
- [Azure App Service Configuration](https://docs.microsoft.com/azure/app-service/configure-common)

---

**✅ تم التحديث:** نوفمبر 2025  
**👤 المسؤول:** DevOps Team
