import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedItem from '../components/AnimatedItem.jsx';

const CategoriesPage = () => {
  const categories = [
    // Keep your existing categories...
    {
      id: 11,
      title: 'رحلة وعي',
      description: 'رحلة تعليمية مكونة من 4 مستويات للوعي النفسي',
      icon: 'fas fa-road',
      path: '/journey',
      featured: true
    },
    {
      id: 1,
      title: 'مجتمع وعي',
      description: 'انضم إلى مجتمع الدعم والمشاركة',
      icon: 'fas fa-users',
      path: '/community'
    },
    {
      id: 2,
      title: 'مقالات وعي',
      description: 'مقالات موثوقة في الصحة النفسية',
      icon: 'fas fa-newspaper',
      path: '/articles'
    },
    {
      id: 3,
      title: 'رسالة وعي المستقبلية',
      description: 'رسالتك إلى نفسك في المستقبل',
      icon: 'fas fa-envelope-open-text',
      path: '/future-messages'
    },
    {
      id: 4,
      title: 'مساعد وعي الذكي',
      description: 'مساعد افتراضي للدعم النفسي',
      icon: 'fas fa-robot',
      path: '/chatbot'
    },
    {
      id: 5,
      title: 'فيديوهات',
      description: 'فيديوهات تعليمية وتحفيزية',
      icon: 'fas fa-video',
      path: '/videos'
    },
    {
      id: 6,
      title: 'قصص وتجارب',
      description: 'قصص واقعية من أشخاص مروا بتجارب مشابهة',
      icon: 'fas fa-comment-dots',
      path: '/stories'
    },
    {
      id: 9,
      title: 'كتب',
      description: 'كتب مختارة في الصحة النفسية وتطوير الذات',
      icon: 'fas fa-book-open',
      path: '/books'
    },
    {
      id: 7,
      title: 'آراء وملاحظات',
      description: 'شاركنا رأيك وملاحظاتك',
      icon: 'fas fa-comments',
      path: '/feedback'
    },
    {
      id: 8,
      title: 'ابحث عن معالج',
      description: 'ابحث واتصل بأفضل المعالجين النفسيين',
      icon: 'fas fa-search',
      path: '/find-therapist',
      hidden: true,
    },
    {
      id: 10,
      title: 'دليل وعي',
      description: 'دليل المستشفيات والعيادات والأطباء',
      icon: 'fas fa-phone-alt',
      path: '/medical-contacts'
    },
    {
      id: 12,
      title: 'وعي للإدمان',
      description: 'توعية علمية وعلاج آمن للإدمان',
      icon: 'fas fa-brain',
      path: '/waey-addiction'
    },
    // Add the assessments link as a category object at the end
    {
      id: 'assessments', // Use a unique identifier
      title: 'الاختبارات',
      description: 'تحليل مبدئي لحالتك',
      icon: 'fas fa-clipboard-list', // Choose an appropriate icon
      path: '/assessments',
      featured: false // Set to true if you want it highlighted like 'رحلة وعي'
    }
  ];

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen">
      <section className="py-16 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <AnimatedItem type="slideUp" delay={0.1}>
            <h1 className="text-4xl font-bold text-[var(--primary-color)] mb-4">استكشف أقسام منصة وعي</h1>
            <p className="text-xl text-[var(--text-secondary)]">نقدم لك مجموعة متنوعة من الأقسام المتخصصة لدعم صحتك النفسية</p>
          </AnimatedItem>
        </div>
      </section>

      <section className="py-16 bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4">
          <AnimatedItem type="slideUp" delay={0.1}>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[var(--primary-color)] mb-4">الأقسام المتاحة</h2>
              <p className="text-xl text-[var(--text-secondary)]">اختر القسم الذي يناسب احتياجاتك النفسية والصحية</p>
            </div>
          </AnimatedItem>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.filter(c => !c.hidden).map((category, index) => (
              <AnimatedItem key={category.id} type="slideUp" delay={0.1 * index}>
                <Link
                  to={category.path}
                  className={`
                    relative p-8 rounded-xl text-center transition-all duration-300 block h-full
                    ${category.featured
                      ? 'bg-[var(--bg-secondary)] shadow-xl border-2 border-[var(--primary-color)]/40 hover:shadow-2xl hover:border-[var(--primary-color)]/60 hover:scale-105'
                      : 'bg-[var(--bg-secondary)] shadow-lg border border-[var(--border-color)] hover:shadow-xl hover:border-[var(--primary-color)]/50'
                    }
                  `}
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl bg-gradient-to-br from-amber-500 to-[var(--secondary-color)] text-white">
                    <i className={category.icon}></i>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">
                    {category.title}
                  </h3>
                  <p className="text-[var(--text-secondary)]">
                    {category.description}
                  </p>
                </Link>
              </AnimatedItem>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategoriesPage;
