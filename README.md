

<div align="center">

<img src="https://img.shields.io/badge/المرحلة-MVP-brightgreen?style=for-the-badge" />
<img src="https://img.shields.io/badge/اللغة-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
<img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
<img src="https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white" />

# 🏗️ عمران | Umran Platform

**منصة المشاركة المجتمعية في البنية التحتية**
*The Participatory Infrastructure Platform*

> "عمران هو الطبقة التشغيلية للبنية التحتية التشاركية — نحوّل الملاحظات المجتمعية إلى قرارات بلدية مبنية على البيانات."

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-umran--platforn.vercel.app-blue?style=flat-square)](https://umran-platforn.vercel.app)
[![AI Studio](https://img.shields.io/badge/🤖_AI_Studio-View_App-orange?style=flat-square)](https://ai.studio/apps/7915a7af-a73d-48d3-84d6-f7ea44f8dd11)

</div>

---

## 🌍 ما هو عمران؟

**عمران** منصة تقنية اجتماعية تربط المواطنين بالجهات البلدية المسؤولة عن البنية التحتية. تُمكّن المستخدمين في المناطق النامية — وبالأخص السودان — من الإبلاغ عن المشكلات البيئية والمشاركة في حملات الإصلاح، حتى في ظل ضعف الإنترنت أو انعدامه.

---

## ✨ المميزات الأساسية

| الميزة | الوصف |
|--------|-------|
| 📍 **الإبلاغ الذكي** | إبلاغ ثنائي اللغة (AR/EN) بالنص والصورة والصوت مع GPS |
| 📡 **Offline-First** | يعمل بدون إنترنت ويزامن البيانات تلقائياً عند الاتصال |
| 🗺️ **خريطة التأثير** | خريطة ملونة تُظهر صحة البنية التحتية في كل منطقة |
| ⚡ **محرك الأولويات** | نظام تسجيل ذكي: `الخطورة × عدد البلاغات` |
| 📱 **حملات المجتمع** | تنسيق peer-to-peer لحملات الإصلاح الصغيرة |
| 💬 **SMS Integration** | استقبال البلاغات عبر رسائل SMS لمن لا يملك هاتفاً ذكياً |

---

## 👥 المستخدمون المستهدفون

- **المواطنون** — الإبلاغ عن المشكلات والانضمام لحملات الإصلاح
- **الجهات البلدية** — إدارة أوامر العمل ومشاهدة الخرائط الحرارية
- **الشركاء الخاصون** — إيجاد مقاولين لأعمال الإصلاح الصغيرة

---

## 🛠️ المكدس التقني

```
[ الواجهة الأمامية ]
  React + Vite + TypeScript
  Tailwind CSS

[ قاعدة البيانات والخلفية ]
  Firebase Firestore (NoSQL + Offline Persistence)
  Firebase Auth (Google + Anonymous)
  Firebase Storage (الصور والتسجيلات الصوتية)
  Firebase Cloud Functions

[ الخادم ]
  Express.js + TypeScript
  SMS Webhook (Twilio)

[ الذكاء الاصطناعي ]
  Google Gemini API (معالجة اللهجات)
```

---

## 🚀 تشغيل المشروع محلياً

### المتطلبات
- Node.js (الإصدار 18 أو أحدث)
- حساب Firebase مُفعّل
- مفتاح Gemini API

### الخطوات

```bash
# 1. استنساخ المشروع
git clone https://github.com/MohammedkamalEL/Umran-Platforn.git
cd Umran-Platforn

# 2. تثبيت التبعيات
npm install

# 3. إعداد متغيرات البيئة
cp .env.example .env.local
# ثم افتح .env.local وأضف مفاتيح Firebase و Gemini

# 4. تشغيل المشروع
npm run dev
```

افتح المتصفح على `http://localhost:3000`

---

## ⚙️ متغيرات البيئة

انسخ `.env.example` إلى `.env.local` واملأ القيم التالية:

```env
GEMINI_API_KEY=your_gemini_api_key_here
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## 📁 هيكل المشروع

```
Umran-Platforn/
├── src/                    # الكود الأساسي (React + TypeScript)
├── public/                 # الملفات الثابتة
├── server.ts               # الخادم الخلفي (Express + SMS Webhook)
├── firestore.rules         # قواعد أمان Firestore
├── vite.config.ts          # إعدادات Vite
├── ARCHITECTURE.md         # هيكل النظام ومخطط قاعدة البيانات
├── PRODUCT_SPEC.md         # مواصفات المنتج والرؤية
├── PITCH_DECK.md           # عرض تقديمي للمستثمرين
├── PITCH_ROADMAP.md        # خارطة الطريق
├── GOVERNANCE.md           # حوكمة البيانات
├── USER_JOURNEY.md         # رحلة المستخدم
└── security_spec.md        # مواصفات الأمان
```

---

## 🗺️ خارطة الطريق

| المرحلة | التوقيت | الهدف |
|---------|---------|-------|
| ✅ **MVP** | Q2 2026 | إطلاق تجريبي في الخرطوم وأم درمان |
| 🔄 **المرحلة 2** | Q3 2026 | تكامل SMS للإبلاغ من الهواتف العادية |
| 📊 **المرحلة 3** | Q4 2026 | تحليلات تنبؤية (توقع أعطال المياه والطرق) |
| 🏢 **المرحلة 4** | Q1 2027 | API للشركات لتكامل مسؤولية CSR |

---

## 📊 مخطط قاعدة البيانات (Firestore)

```
issues/          → البلاغات (نوع، وصف، موقع، حالة، خطورة)
campaigns/       → حملات الإصلاح المجتمعية
  └ participations/ → مشاركات المستخدمين في الحملة
users/           → ملفات المستخدمين والنقاط
  └ participations/ → سجل مشاركات المستخدم
alerts/          → تنبيهات النظام (للمديرين فقط)
```

---

## 🔒 الأمان

- جميع عمليات القراءة/الكتابة محمية بقواعد Firestore مُعقّدة
- التحقق من صحة البيانات يتم على مستوى قاعدة البيانات مباشرة
- يمنع النظام تلاعب المستخدمين بالأدوار أو النقاط
- دعم تسجيل الدخول المجهول (Anonymous) كخيار احتياطي

---

## 🤝 المساهمة

نرحب بمساهماتك! يرجى اتباع الخطوات التالية:

1. Fork المشروع
2. أنشئ فرعاً جديداً: `git checkout -b feature/اسم-الميزة`
3. أضف التغييرات: `git commit -m 'إضافة ميزة جديدة'`
4. ادفع الفرع: `git push origin feature/اسم-الميزة`
5. افتح Pull Request

---

## 📄 الترخيص

هذا المشروع مفتوح المصدر. راجع ملف `LICENSE` للتفاصيل.

---

<div align="center">

صُنع بـ ❤️ من أجل مجتمعاتنا | Built with ❤️ for our communities

**[🌐 الموقع](https://umran-platforn.vercel.app)** · **[🐛 الإبلاغ عن خطأ](https://github.com/MohammedkamalEL/Umran-Platforn/issues)** · **[💡 اقتراح ميزة](https://github.com/MohammedkamalEL/Umran-Platforn/issues)**

</div>



<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/7915a7af-a73d-48d3-84d6-f7ea44f8dd11

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
