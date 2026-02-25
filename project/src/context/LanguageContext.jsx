import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

const translations = {
    en: {
        home: 'Home',
        games: 'Games',
        categories: 'Categories',
        about: 'About',
        privacyPolicy: 'Privacy Policy',
        newsletter: 'Newsletter',
        login: 'Login',
        signIn: 'Sign In',
        signup: 'Sign Up',
        search: 'Search games...',
        addToCart: 'Add to Cart',
        buyNow: 'Buy Now',
        new: 'NEW',
        sale: 'SALE',
        featured: 'Featured',
        popular: 'Popular',
        all: 'All',
        loading: 'Loading...',
        error: 'An error occurred',
        success: 'Success',
        rightsReserved: 'All rights reserved.',
        adding: 'Adding...',
        outOfStock: 'Out of Stock',
        // Cart Translations
        cartTitle: 'Shopping Cart',
        emptyCart: 'Your cart is empty',
        browseGames: 'Browse Games',
        checkout: 'Checkout',
        subtotal: 'Subtotal',
        total: 'Total',
        remove: 'Remove',
        quantity: 'Quantity',
        price: 'Price',
        clearCart: 'Clear Cart',
        summary: 'Order Summary',
        // About Page Elite
        aboutTitle: 'THE SUB HUB LEGACY',
        whoWeAreTitle: 'ELITE GAMING ACCESS',
        whoWeAreDesc1: 'SUB HUB is your premier destination for elite gaming access. We curate a refined selection of the latest AAA masterpieces, essential digital assets, and premium services for the discerning gamer across Egypt and the MENA region.',
        whoWeAreDesc2: 'Our vision is to redefine digital distribution through accessibility, speed, and absolute reliability. Whether you seek the latest blockbusters or niche indie gems, SUB HUB is your gateway to superior gaming.',
        whatWeOfferTitle: 'OUR PREMIUM ECOSYSTEM',
        offer1Title: 'Masterpiece Collection',
        offer1Desc: 'Instant access to a curated library of AAA titles and high-art indie games.',
        offer2Title: 'Global Digital Assets',
        offer2Desc: 'Premium gift cards and credits for all major ecosystems: Steam, PSN, Xbox, and more.',
        offer3Title: 'Ironclad Security',
        offer3Desc: 'Proprietary payment protocols ensuring every transaction is as safe as it is swift.',
        offer4Title: 'Hyper-Speed Delivery',
        offer4Desc: 'Instant digital fulfillment. No waiting. Just gaming.',
        offer5Title: 'Concierge Support',
        offer5Desc: 'A dedicated team of experts ready to handle your every inquiry with precision.',
        ourValuesTitle: 'CORE PRINCIPLES',
        value1Title: 'UNCOMPROMISING QUALITY',
        value1Desc: 'We only source authentic, top-tier products from the world\'s most trusted publishers.',
        value2Title: 'FORTIFIED PRIVACY',
        value2Desc: 'Your security is our highest priority, protected by industry-leading encryption and protocols.',
        value3Title: 'CLIENT SUPREMACY',
        value3Desc: 'Our commitment goes beyond sales—we provide an exceptional support experience tailored to you.',
        contactUsTitle: 'ELITE CONCIERGE',
        contactDesc: 'Require assistance? Our team is standing by to assist with your journey.',
        // Privacy Policy Page Elite
        privacyTitle: 'FORTIFIED PRIVACY PROTOCOL',
        privacyLastUpdated: 'Last Updated',
        privacyIntroTitle: '1. INTRODUCTION',
        privacyIntroDesc: 'Welcome to SUB HUB Gaming. We are committed to protecting your privacy and ensuring you have a positive experience on our website. This Privacy Policy explains how we collect, use, and safeguard your personal information.',
        privacyCollectTitle: '2. INFORMATION WE COLLECT',
        privacyCollectDesc: 'We collect information that you provide directly to us, including:',
        privacyCollectItem1: 'Name and contact information (email, phone number)',
        privacyCollectItem2: 'Account credentials and profile information',
        privacyCollectItem3: 'Payment information and transaction history',
        privacyCollectItem4: 'Order history and preferences',
        privacyCollectItem5: 'Communication preferences',
        privacyUseTitle: '3. HOW WE USE',
        privacyUseDesc: 'We use the information we collect to:',
        privacyUseItem1: 'Process and fulfill your orders',
        privacyUseItem2: 'Send you order confirmations and updates',
        privacyUseItem3: 'Respond to your inquiries and provide customer support',
        privacyUseItem4: 'Improve our services and user experience',
        privacyUseItem5: 'Send you promotional communications (with your consent)',
        privacyUseItem6: 'Detect and prevent fraud and abuse',
        privacySharingTitle: '4. INFORMATION SHARING',
        privacySharingDesc: 'We do not sell your personal information. We may share your information only in the following circumstances:',
        privacySharingItem1: 'With service providers who assist us in operating our website',
        privacySharingItem2: 'When required by law or to protect our rights',
        privacySharingItem3: 'In connection with a business transfer or merger',
        privacySharingItem4: 'With your explicit consent',
        privacySecurityTitle: '5. DATA SECURITY',
        privacySecurityDesc: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.',
        privacyRightsTitle: '6. YOUR RIGHTS',
        privacyRightsDesc: 'You have the right to:',
        privacyRightsItem1: 'Access and receive a copy of your personal data',
        privacyRightsItem2: 'Rectify inaccurate or incomplete data',
        privacyRightsItem3: 'Request deletion of your personal data',
        privacyRightsItem4: 'Object to processing of your personal data',
        privacyRightsItem5: 'Withdraw consent at any time',
        privacyCookiesTitle: '7. COOKIES',
        privacyCookiesDesc: 'We use cookies and similar tracking technologies to enhance your experience, analyze usage, and assist in marketing efforts. You can control cookie preferences through your browser settings.',
        privacyContactTitle: '8. CONTACT US',
        privacyContactDesc: 'If you have any questions about this Privacy Policy or our data practices, please contact us at:',
        // Newsletter Page Elite
        newsTitle: 'JOIN THE INNER CIRCLE',
        newsSubtitle: 'GAIN EXCLUSIVE ACCESS TO THE ELITE',
        newsBenefit1Title: 'Early Access',
        newsBenefit1Desc: 'Be the first to secure the most anticipated AAA titles and limited editions.',
        newsBenefit2Title: 'Private Drops',
        newsBenefit2Desc: 'Exclusive member-only digital assets and rare gaming collectibles.',
        newsBenefit3Title: 'VIP Protocol',
        newsBenefit3Desc: 'Priority concierge support and elite tier loyalty rewards.',
        newsPlaceholder: 'Secure your transmission (Email)',
        newsCTA: 'CLAIM ACCESS',
        newsSuccess: 'WELCOME TO THE INNER CIRCLE. ACCESS GRANTED.',
        newsPrivacy: 'Your privacy is fortified. Join without compromise.',
    },
    ar: {
        home: 'الرئيسية',
        games: 'الألعاب',
        categories: 'التصنيفات',
        about: 'من نحن',
        privacyPolicy: 'سياسة الخصوصية',
        newsletter: 'النشرة البريدية',
        login: 'تسجيل الدخول',
        signIn: 'تسجيل الدخول',
        signup: 'إنشاء حساب',
        search: 'ابحث عن الألعاب...',
        addToCart: 'أضف للسلة',
        buyNow: 'شراء الآن',
        new: 'جديد',
        sale: 'خصم',
        featured: 'متميز',
        popular: 'شائع',
        all: 'الكل',
        loading: 'جاري التحميل...',
        error: 'حدث خطأ',
        success: 'تم بنجاح',
        rightsReserved: 'جميع الحقوق محفوظة.',
        adding: 'جاري الإضافة...',
        outOfStock: 'نفذت الكمية',
        // Cart Translations
        cartTitle: 'سلة التسوق',
        emptyCart: 'سلة التسوق فارغة',
        browseGames: 'تصفح الألعاب',
        checkout: 'إتمام الشراء',
        subtotal: 'المجموع الفرعي',
        total: 'المجموع الإجمالي',
        remove: 'حذف',
        quantity: 'الكمية',
        price: 'السعر',
        clearCart: 'إفراغ السلة',
        summary: 'ملخص الطلب',
        // About Page Elite
        aboutTitle: 'إرث صب هب',
        whoWeAreTitle: 'وصول النخبة للألعاب',
        whoWeAreDesc1: 'صب هب هي وجهتك الأولى للوصول إلى نخبة الألعاب. نحن ننسق مجموعة مختارة من أحدث روائع الـ AAA، والأصول الرقمية الأساسية، والخدمات المميزة للاعبين المتمرسين في مصر ومنطقة الشرق الأوسط وشمال أفريقيا.',
        whoWeAreDesc2: 'رؤيتنا هي إعادة تعريف التوزيع الرقمي من خلال سهولة الوصول والسرعة والموثوقية المطلقة. سواء كنت تبحث عن أحدث الألعاب الضخمة أو الجواهر المستقلة، صب هب هو بوابتك لتجربة ألعاب متفوقة.',
        whatWeOfferTitle: 'نظامنا البيئي المتميز',
        offer1Title: 'مجموعة الروائع',
        offer1Desc: 'وصول فوري إلى مكتبة منسقة من ألعاب AAA والألعاب المستقلة الراقية.',
        offer2Title: 'الأصول الرقمية العالمية',
        offer2Desc: 'بطاقات هدايا ورصيد مميز لجميع الأنظمة الرئيسية: Steam وPSN وXbox والمزيد.',
        offer3Title: 'أمان حديدي',
        offer3Desc: 'بروتوكولات دفع خاصة تضمن أن كل معاملة آمنة بقدر سرعتها.',
        offer4Title: 'تسليم فائق السرعة',
        offer4Desc: 'تنفيذ رقمي فوري. لا انتظار. فقط اللعب.',
        offer5Title: 'دعم الكونسيرج',
        offer5Desc: 'فريق متخصص من الخبراء مستعد للتعامل مع كل استفساراتك بدقة.',
        ourValuesTitle: 'المبادئ الأساسية',
        value1Title: 'جودة لا تهاون فيها',
        value1Desc: 'نحن نوفر فقط منتجات أصلية من الدرجة الأولى من أكثر الناشرين موثوقية في العالم.',
        value2Title: 'خصوصية محصنة',
        value2Desc: 'أمنك هو أولويتنا القصوى، وهو محمي بأحدث تقنيات التشفير والبروتوكولات الرائدة في الصناعة.',
        value3Title: 'سيادة العميل',
        value3Desc: 'التزامنا يتجاوز المبيعات - نحن نقدم تجربة دعم استثنائية مصممة خصيصًا لك.',
        contactUsTitle: 'كونسيرج النخبة',
        contactDesc: 'هل تحتاج إلى مساعدة؟ فريقنا على أهبة الاستعداد لمساعدتك في رحلتك.',
        // Privacy Policy Page Elite
        privacyTitle: 'بروتوكول الخصوصية المحصن',
        privacyLastUpdated: 'آخر تحديث',
        privacyIntroTitle: '1. مقدمة',
        privacyIntroDesc: 'مرحبًا بك في صب هب. نحن ملتزمون بحماية خصوصيتك وضمان حصولك على تجربة إيجابية على موقعنا. توضح سياسة الخصوصية هذه كيفية جمع معلوماتك الشخصية واستخدامها وحمايتها.',
        privacyCollectTitle: '2. المعلومات التي نجمعها',
        privacyCollectDesc: 'نحن نجمع المعلومات التي تقدمها لنا مباشرة، بما في ذلك:',
        privacyCollectItem1: 'الاسم ومعلومات الاتصال (البريد الإلكتروني، رقم الهاتف)',
        privacyCollectItem2: 'بيانات اعتماد الحساب ومعلومات الملف الشخصي',
        privacyCollectItem3: 'معلومات الدفع وسجل المعاملات',
        privacyCollectItem4: 'سجل الطلبات والتفضيلات',
        privacyCollectItem5: 'تفضيلات الاتصال',
        privacyUseTitle: '3. كيف نستخدم المعلومات',
        privacyUseDesc: 'نستخدم المعلومات التي نجمعها لـ:',
        privacyUseItem1: 'معالجة وتنفيذ طلباتك',
        privacyUseItem2: 'إرسال تأكيدات الطلبات والتحديثات',
        privacyUseItem3: 'الرد على استفساراتك وتقديم دعم العملاء',
        privacyUseItem4: 'تحسين خدماتنا وتجربة المستخدم',
        privacyUseItem5: 'إرسال رسائل ترويجية (بموافقتك)',
        privacyUseItem6: 'اكتشاف ومنع الاحتيال وإساءة الاستخدام',
        privacySharingTitle: '4. مشاركة المعلومات',
        privacySharingDesc: 'نحن لا نبيع معلوماتك الشخصية. قد نشارك معلوماتك فقط في الحالات التالية:',
        privacySharingItem1: 'مع مقدمي الخدمات الذين يساعدوننا في تشغيل موقعنا',
        privacySharingItem2: 'عندما يقتضي القانون أو لحماية حقوقنا',
        privacySharingItem3: 'فيما يتعلق بنقل الأعمال أو الاندماج',
        privacySharingItem4: 'بموافقتك الصريحة',
        privacySecurityTitle: '5. أمن البيانات',
        privacySecurityDesc: 'نطبق التدابير التقنية والتنظيمية المناسبة لحماية معلوماتك الشخصية ضد الوصول غير المصرح به أو التغيير أو الكشف أو التدمير. ومع ذلك، لا توجد طريقة نقل عبر الإنترنت آمنة بنسبة 100%.',
        privacyRightsTitle: '6. حقوقك',
        privacyRightsDesc: 'لديك الحق في:',
        privacyRightsItem1: 'الوصول والحصول على نسخة من بياناتك الشخصية',
        privacyRightsItem2: 'تصحيح البيانات غير الدقيقة أو غير الكاملة',
        privacyRightsItem3: 'طلب حذف بياناتك الشخصية',
        privacyRightsItem4: 'الاعتراض على معالجة بياناتك الشخصية',
        privacyRightsItem5: 'سحب الموافقة في أي وقت',
        privacyCookiesTitle: '7. ملفات تعريف الارتباط',
        privacyCookiesDesc: 'نستخدم ملفات تعريف الارتباط وتقنيات التتبع المماثلة لتعزيز تجربتك وتحليل الاستخدام والمساعدة في جهود التسويق. يمكنك التحكم في تفضيلات ملفات تعريف الارتباط من خلال إعدادات المتصفح.',
        privacyContactTitle: '8. اتصل بنا',
        privacyContactDesc: 'إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه أو ممارسات البيانات الخاصة بنا، يرجى الاتصال بنا على:',
        // Newsletter Page Elite
        newsTitle: 'انضم إلى الدائرة الداخلية',
        newsSubtitle: 'احصل على وصول حصري لنخبة اللاعبين',
        newsBenefit1Title: 'وصول مبكر',
        newsBenefit1Desc: 'كن أول من يحصل على ألعاب AAA الأكثر انتظاراً والإصدارات المحدودة.',
        newsBenefit2Title: 'إصدارات خاصة',
        newsBenefit2Desc: 'أصول رقمية حصرية للأعضاء فقط ومقتنيات ألعاب نادرة.',
        newsBenefit3Title: 'بروتوكول VIP',
        newsBenefit3Desc: 'دعم خاص ذو أولوية ومكافآت ولاء من فئة النخبة.',
        newsPlaceholder: 'أمن عنوان مراسلتك (البريد الإلكتروني)',
        newsCTA: 'طلب الوصول',
        newsSuccess: 'مرحباً بك في الدائرة الداخلية. تم منح الوصول.',
        newsPrivacy: 'خصوصيتك محصنة. انضم دون مساومة.',
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('language') || 'en';
    });

    const t = (key) => {
        return translations[language][key] || key;
    };

    useEffect(() => {
        localStorage.setItem('language', language);
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
    }, [language]);

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'ar' : 'en');
    };

    const value = {
        language,
        setLanguage,
        toggleLanguage,
        t,
        isRTL: language === 'ar'
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export default LanguageContext;
