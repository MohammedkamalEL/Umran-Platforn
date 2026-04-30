import pptxgen from 'pptxgenjs';

export const PITCH_FEATURES = [
  {
    id: 'gis',
    title: 'نظام المعلومات الجغرافية المتطور (GIS)',
    description: 'خرائط حرارية حية مدعومة ببيانات الأقمار الصناعية لتحديد مناطق الاحتياج بدقة متناهية وتوزيع الموارد بفعالية.',
    stats: 'تغطية بنسبة ١٠٠٪ لولايات السودان'
  },
  {
    id: 'omni',
    title: 'تعدد قنوات الوصول (Omni-Channel)',
    description: 'نظام بلاغات يعمل عبر الويب، الرسائل النصية القصيرة (SMS)، وأكواد الـ USSD لضمان وصول الخدمة في حالة انقطاع الإنترنت.',
    stats: 'يعمل على أبسط الهواتف المحمولة'
  },
  {
    id: 'ai',
    title: 'محرك الأولويات الذكي (AI-Driven)',
    description: 'خوارزميات ذكاء اصطناعي تقوم بتحليل البلاغات وتصنيفها حسب الأهمية والخطورة لضمان سرعة الاستجابة للحالات الحرجة.',
    stats: 'تقليل زمن الاستجابة بنسبة ٤٥٪'
  },
  {
    id: 'transparency',
    title: 'الشفافية المطلقة (Blockchain Ready)',
    description: 'سجل معاملات مالي وإداري غير قابل للتلاعب يضمن وصول كل مساهمة إلى وجهتها الصحيحة مع تقارير أداء فورية.',
    stats: 'نظام تدقيق مالي لحظي'
  },
  {
    id: 'stakeholders',
    title: 'بوابة الشركاء الاستراتيجيين',
    description: 'واجهة مخصصة للمنظمات الدولية والمحلية لإدارة مشاريع الإعمار، تبادل البيانات، وتنسيق الجهود الميدانية.',
    stats: '+٥٠ منظمة محلية ودولية'
  },
  {
    id: 'analytics',
    title: 'لوحات تحكم تحليلية (BI)',
    description: 'عرض بيانات ضخمة مبسط لاتخاذ قرارات استراتيجية مبنية على حقائق وأرقام دقيقة حول سير مشاريع الإعمار.',
    stats: 'تحديث البيانات كل ٥ دقائق'
  }
];

export const generatePitchDeck = () => {
    const pres = new pptxgen();
    pres.layout = 'LAYOUT_WIDE';
    pres.author = 'UMRAN_TECH_SDN';
    pres.company = 'Umran National Platform';
    pres.title = 'Umran Pitch Deck 2026';

    // Slide 1: Welcome (Title Slide)
    let slide1 = pres.addSlide();
    slide1.background = { color: 'F8FAFC' };
    slide1.addText('عُـمْـران', { 
      x: '10%', y: '25%', fontSize: 72, fontFace: 'Arial Black', color: '10B981', align: pres.AlignH.center, w: '80%' 
    });
    slide1.addText('المنصة الوطنية الموحدة لإعادة الإعمار والتحول الرقمي', { 
      x: '10%', y: '45%', fontSize: 28, fontFace: 'Arial', color: '1E293B', align: pres.AlignH.center, w: '80%' 
    });
    slide1.addText('SUDAN RECONSTRUCTION & SMART RECOVERY PLATFORM', { 
      x: '10%', y: '58%', fontSize: 16, fontFace: 'Arial', color: '64748B', align: pres.AlignH.center, w: '80%', italic: true
    });
    slide1.addShape(pres.ShapeType.rect, { x: '45%', y: '75%', w: '10%', h: 0.05, fill: { color: '10B981' } });
    slide1.addText('تقرير الاستراتيجية الوطنية ٢٠٢٦', { 
      x: '10%', y: '85%', fontSize: 12, fontFace: 'Arial', color: '94A3B8', align: pres.AlignH.center, w: '80%' 
    });

    // Slide 2: Problem Statement (The "Why")
    let slide2 = pres.addSlide();
    slide2.addText('التحديات الراهنة: فجوة البيانات والأداء', { x: 0.5, y: 0.5, fontSize: 32, fontFace: 'Arial Black', color: '1E293B', w: '90%', align: pres.AlignH.right });
    slide2.addText('١. غياب التنسيق اللحظي بين الجهات الفاعلة في الميدان\n٢. تأخر وصول البلاغات الحرجة بسبب انقطاع سلاسل التواصل\n٣. صعوبة تتبع الموارد وتوزيعها حسب الأولوية القصوى\n٤. الحاجة الماسة لنظام شفاف لبناء الثقة مع الممولين والشركاء الدوليين', { 
      x: 0.5, y: 1.5, fontSize: 18, color: '475569', w: '90%', align: pres.AlignH.right, lineSpacing: 38 
    });

    // Slide 3: The Vision (The "How")
    let slide3 = pres.addSlide();
    slide3.addText('الرؤية الاستراتيجية', { x: 0.5, y: 0.5, fontSize: 32, fontFace: 'Arial Black', color: '10B981', w: '90%', align: pres.AlignH.right });
    slide3.addText('"نظام عصبي رقمي موحد للسودان يربط المواطن بالدولة ويربط البيانات بالفعل الميداني"', { 
      x: 0.5, y: 1.8, fontSize: 24, fontFace: 'Arial', color: '1E293B', align: pres.AlignH.center, w: '90%', italic: true 
    });
    slide3.addText('• الشفافية المطلقة عبر تقنيات السجلات الموزعة\n• الكفاءة التشغيلية المعتمدة على الذكاء الاصطناعي\n• الشمولية الرقمية لضمان وصول الخدمة لكل مواطن', { 
      x: 0.5, y: 3.5, fontSize: 18, color: '475569', w: '90%', align: pres.AlignH.right, lineSpacing: 32 
    });

    // Slides for Features
    PITCH_FEATURES.forEach(feature => {
      let slide = pres.addSlide();
      slide.background = { color: 'FFFFFF' };
      slide.addText(feature.title, { x: 0.5, y: 0.5, fontSize: 28, fontFace: 'Arial Black', color: '10B981', w: '90%', align: pres.AlignH.right });
      slide.addText(feature.description, { x: 0.5, y: 1.5, fontSize: 20, color: '1E293B', w: '90%', align: pres.AlignH.right, lineSpacing: 28 });
      slide.addText(`الإنجاز القياسي: ${feature.stats}`, { x: 0.5, y: 3.8, fontSize: 16, color: '10B981', w: '90%', align: pres.AlignH.right, bold: true });
      slide.addShape(pres.ShapeType.rect, { x: 0.5, y: 4.8, w: 9, h: 0.05, fill: { color: 'F1F5F9' } });
    });

    // Slide: Technical Architecture
    let slideTech = pres.addSlide();
    slideTech.addText('الهيكلية التقنية (Next-Gen Stack)', { x: 0.5, y: 0.5, fontSize: 32, fontFace: 'Arial Black', color: '1E293B', w: '90%', align: pres.AlignH.right });
    slideTech.addText('• واجهات برمجية موحدة (GraphQL APIs) لتبادل البيانات\n• محرك معالجة لغوية (NLP) لتحليل البلاغات الصوتية\n• قواعد بيانات جغرافية متقدمة (PostGIS) للتحليل المكاني\n• نظام توزيع أحمال مرن (Cloud Native) يضمن استمرارية الخدمة بنسبة ٩٩.٩٪', { 
      x: 0.5, y: 1.5, fontSize: 18, color: '475569', w: '90%', align: pres.AlignH.right, lineSpacing: 34 
    });

    // Slide: Impact (The Result)
    let slideImpact = pres.addSlide();
    slideImpact.addText('الأثر المتوقع بحلول ٢٠٢٦', { x: 0.5, y: 0.5, fontSize: 32, fontFace: 'Arial Black', color: '1E293B', w: '90%', align: pres.AlignH.right });
    slideImpact.addText('• إعادة تأهيل ٧٠٪ من مرافق الخدمة الأساسية في المناطق العمرانية\n• خلق +١٠,٠٠٠ فرصة عمل تقنية وميدانية عبر منصة "سفراء عمران"\n• بناء أول سجل وطني رقمي دقيق للأصول والموارد بنسبة خطأ < ١٪\n• جذب استثمارات دولية بقيمة تزيد عن ٢٠٠ مليون دولار مدعومة ببيانات الشفافية', { 
      x: 0.5, y: 1.5, fontSize: 18, color: '475569', w: '90%', align: pres.AlignH.right, lineSpacing: 32
    });

    // Slide: Final Call to Action
    let slideEnd = pres.addSlide();
    slideEnd.background = { color: '1E293B' };
    slideEnd.addText('عُـمْـران', { x: '10%', y: '35%', fontSize: 64, fontFace: 'Arial Black', color: '10B981', align: pres.AlignH.center, w: '80%' });
    slideEnd.addText('لنصنع واقعاً جديداً للسودان، اليوم وليس غداً.', { x: '10%', y: '55%', fontSize: 24, fontFace: 'Arial', color: 'FFFFFF', align: pres.AlignH.center, w: '80%' });
    slideEnd.addText('www.umran.gov.sd | info@umran.gov.sd', { x: '10%', y: '75%', fontSize: 14, fontFace: 'Arial', color: '94A3B8', align: pres.AlignH.center, w: '80%' });

    // Save
    pres.writeFile({ fileName: `UMRAN_Sudan_Pitch_Deck_${new Date().getFullYear()}.pptx` });
};
