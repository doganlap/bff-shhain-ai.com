# 📋 توصيات التنظيف الإضافية - Additional Cleanup Recommendations

**تاريخ الفحص:** نوفمبر 14, 2025  
**الحالة:** يتطلب إجراء

---

## ⚠️ ملفات تحتاج لإجراء فوري Files Requiring Immediate Action

### 1️⃣ ملفات `.env` في الجذر

**الملفات المكتشفة:**
- `.env` (1.8 KB) - ⚠️ قد يحتوي على بيانات حساسة
- `.env.development.local` (1.9 KB) - ⚠️ قد يحتوي على بيانات حساسة
- `.env.production` (2.9 KB) - ⚠️ قد يحتوي على بيانات حساسة
- `.env.unified` (6.7 KB) - ⚠️ قد يحتوي على بيانات حساسة

**الإجراء الموصى به:**
```bash
# 1. راجع محتوى الملفات
cat .env
cat .env.production

# 2. إذا كانت تحتوي على قيم حقيقية، احذفها من Git
git rm --cached .env .env.development.local .env.production .env.unified

# 3. أضفها إلى .gitignore (تم بالفعل)
# 4. احتفظ بنسخة محلية فقط
```

---

### 2️⃣ ملفات Backup SQL

**الملفات:**
- `backup_shahin_ksa_before_merge.sql` (122 KB)
- `backup_shahin_ksa_compliance_20251114_` (0 bytes - فارغ)

**الإجراء:**
```powershell
# نقل الـ backup إلى DB urgent
Move-Item backup_shahin_ksa_before_merge.sql "DB urgent/"

# حذف الملف الفارغ
Remove-Item backup_shahin_ksa_compliance_20251114_

# تحديث Git
git add .
git commit -m "cleanup: Move SQL backups to DB urgent"
```

---

### 3️⃣ ملفات البيانات الضخمة

**الملفات:**
- `azdo_bulk_import.csv` (~6 MB)
- `jira_bulk_payload.json` (~7 MB)

**الإجراء:**
```powershell
# نقل إلى DB urgent
Move-Item azdo_bulk_import.csv "DB urgent/"
Move-Item jira_bulk_payload.json "DB urgent/"

# تحديث .gitignore
# (تم بالفعل - *.csv patterns موجودة)
```

---

### 4️⃣ ملفات اللوج

**الملفات المكتشفة:**
1. `apps/bff/startup.log`
2. `apps/web/src/services/grc-api/backend.log`
3. `apps/web/src/services/notification-service/logs/email-service.log`

**الإجراء:**
```powershell
# حذف ملفات اللوج
Remove-Item apps/bff/startup.log -ErrorAction SilentlyContinue
Remove-Item apps/web/src/services/grc-api/backend.log -ErrorAction SilentlyContinue
Remove-Item apps/web/src/services/notification-service/logs/email-service.log -Force -ErrorAction SilentlyContinue

# تأكد من .gitignore
# (تم بالفعل - *.log patterns موجودة)
```

---

### 5️⃣ ملفات متفرقة

**الملفات:**
- `nul` (0 bytes) - ملف خطأ Windows
- `tracker_import.env` (198 bytes) - تم حذفه من Git سابقاً

**الإجراء:**
```powershell
# حذف ملف nul
Remove-Item nul -ErrorAction SilentlyContinue

# التحقق من tracker_import.env
git ls-files | findstr tracker_import.env
# إذا ظهر، احذفه من Git:
# git rm --cached tracker_import.env
```

---

## 📊 ملخص التوفير المتوقع Expected Space Savings

| الفئة | الحجم المتوقع |
|------|---------------|
| ملفات CSV/JSON | ~13 MB |
| ملفات SQL backup | ~122 KB |
| ملفات Log | ~50 KB |
| ملفات متفرقة | ~10 KB |
| **الإجمالي** | **~13.2 MB** |

---

## 🎯 أولوية التنفيذ Execution Priority

### 🔴 **أولوية عالية (الآن):**
1. ✅ فحص ملفات `.env` وحذفها من Git إذا كانت تحتوي على بيانات حساسة
2. ✅ نقل ملفات CSV/JSON الكبيرة إلى `DB urgent/`
3. ✅ حذف ملف `nul`

### 🟡 **أولوية متوسطة (قريباً):**
4. ✅ حذف ملفات اللوج
5. ✅ نقل SQL backups إلى `DB urgent/`

### 🟢 **أولوية منخفضة (اختياري):**
6. ⚪ مراجعة ملفات التوثيق الزائدة (.md files)

---

## 🚀 سكربت التنفيذ السريع Quick Execution Script

```powershell
# === سكربت التنظيف الإضافي ===
Write-Host "Starting additional cleanup..." -ForegroundColor Cyan

# 1. نقل ملفات البيانات الكبيرة
Write-Host "Moving large data files to DB urgent..." -ForegroundColor Yellow
Move-Item -Path "azdo_bulk_import.csv" -Destination "DB urgent/" -Force -ErrorAction SilentlyContinue
Move-Item -Path "jira_bulk_payload.json" -Destination "DB urgent/" -Force -ErrorAction SilentlyContinue
Move-Item -Path "backup_shahin_ksa_before_merge.sql" -Destination "DB urgent/" -Force -ErrorAction SilentlyContinue

# 2. حذف ملفات غير ضرورية
Write-Host "Removing unnecessary files..." -ForegroundColor Yellow
Remove-Item -Path "nul" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "backup_shahin_ksa_compliance_20251114_" -Force -ErrorAction SilentlyContinue

# 3. حذف ملفات اللوج
Write-Host "Removing log files..." -ForegroundColor Yellow
Remove-Item -Path "apps/bff/startup.log" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "apps/web/src/services/grc-api/backend.log" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "apps/web/src/services/notification-service/logs/email-service.log" -Force -ErrorAction SilentlyContinue

# 4. فحص ملفات .env (يدوي)
Write-Host "" -ForegroundColor Green
Write-Host "⚠️  MANUAL ACTION REQUIRED:" -ForegroundColor Red
Write-Host "Please review these .env files and remove from Git if they contain sensitive data:" -ForegroundColor Yellow
Write-Host "  - .env"
Write-Host "  - .env.development.local"
Write-Host "  - .env.production"
Write-Host "  - .env.unified"
Write-Host ""
Write-Host "Run: git rm --cached .env .env.development.local .env.production .env.unified" -ForegroundColor Cyan

Write-Host ""
Write-Host "✅ Additional cleanup completed!" -ForegroundColor Green
```

---

## ✅ قائمة التحقق Post-Cleanup Checklist

بعد تنفيذ التنظيف، تحقق من:

- [ ] تم نقل جميع الملفات الكبيرة إلى `DB urgent/`
- [ ] تم حذف ملفات اللوج
- [ ] تم مراجعة ملفات `.env` وإزالة الحساسة من Git
- [ ] تم حذف الملفات الفارغة والخاطئة
- [ ] تم تحديث `.gitignore` (تم بالفعل)
- [ ] تم عمل commit للتغييرات
- [ ] تم التحقق من أن المشروع يعمل بشكل صحيح

---

## 📞 ملاحظات إضافية

### ملفات آمنة - لا تحذفها:
- ✅ `project-inventory.csv` - مخرجات سكربت الجرد
- ✅ `project-inventory-by-extension.csv` - مخرجات سكربت الجرد
- ✅ `package-lock.json` - ضروري لـ npm
- ✅ جميع ملفات `.env.template` و `.env.example`
- ✅ `seed_grc_data.sql` - بيانات البذرة الأساسية

### مجلدات آمنة - لا تحذفها:
- ✅ `node_modules/` - محمي في `.gitignore`
- ✅ `DB urgent/` - محمي في `.gitignore`
- ✅ `.git/` - ضروري لـ Git

---

**✅ تم الإنشاء:** نوفمبر 14, 2025  
**👤 المنفذ:** Cascade AI Agent  
**📍 الحالة:** يتطلب إجراء يدوي
