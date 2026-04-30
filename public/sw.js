// ملف الخدمة البسيط
self.addEventListener("install", (e) => {
  console.log("Service Worker: Installed");
});

self.addEventListener("fetch", (e) => {
  // اترك هذا فارغاً حالياً ليعمل التطبيق كـ Online PWA
});
