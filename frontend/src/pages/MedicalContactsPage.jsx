import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import { medicalContactsAPI } from '../services/medicalContactApi.js';
import AnimatedItem from '../components/AnimatedItem.jsx';

const MedicalContactsPage = () => {
  const { error: showError } = useToast();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadContacts();
  }, [filterType]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterType !== 'all') params.type = filterType;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const data = await medicalContactsAPI.getAll(params);
      setContacts(data.data || []);
    } catch (error) {
      showError('فشل في تحميل جهات الاتصال');
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadContacts();
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'hospital':
        return 'fa-hospital';
      case 'clinic':
        return 'fa-clinic-medical';
      case 'doctor':
        return 'fa-user-md';
      default:
        return 'fa-phone';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'hospital':
        return 'مستشفى';
      case 'clinic':
        return 'عيادة';
      case 'doctor':
        return 'طبيب';
      default:
        return type;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'hospital':
        return 'from-red-500 to-red-600';
      case 'clinic':
        return 'from-blue-500 to-blue-600';
      case 'doctor':
        return 'from-green-500 to-green-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="bg-[var(--bg-primary)] min-h-screen">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-[var(--primary-color)] mb-4">دليل جهات الاتصال الطبية</h1>
          <p className="text-xl text-[var(--text-secondary)]">دليلك الشامل للمستشفيات والعيادات والأطباء</p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم أو الهاتف أو العنوان..."
                className="flex-1 px-4 py-3 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--primary-color)] focus:outline-none transition-colors text-[var(--text-primary)] bg-[var(--bg-primary)]"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors"
              >
                <i className="fas fa-search"></i>
              </button>
            </form>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              {[
                { id: 'all', label: 'الكل', icon: 'fa-list' },
                { id: 'hospital', label: 'مستشفيات', icon: 'fa-hospital' },
                { id: 'clinic', label: 'عيادات', icon: 'fa-clinic-medical' },
                { id: 'doctor', label: 'أطباء', icon: 'fa-user-md' },
              ].map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setFilterType(filter.id)}
                  className={`px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${filterType === filter.id
                      ? 'bg-[var(--primary-color)] text-white shadow-lg'
                      : 'bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] border border-[var(--border-color)]'
                    }`}
                >
                  <i className={`fas ${filter.icon} ml-2`}></i>
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contacts List */}
      <section className="py-12 bg-[var(--bg-secondary)]">
        <div className="max-w-6xl mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--primary-color)]"></div>
            </div>
          ) : contacts.length === 0 ? (
            <AnimatedItem type="slideUp" delay={0.2}>
              <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-12 text-center border border-[var(--border-color)]/30">
                <i className="fas fa-phone-alt text-6xl text-[var(--text-secondary)]/30 mb-4"></i>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">لا توجد جهات اتصال</h3>
                <p className="text-[var(--text-secondary)]">
                  {searchQuery ? 'جرب البحث بكلمات أخرى' : 'لم يتم إضافة جهات اتصال بعد'}
                </p>
              </div>
            </AnimatedItem>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contacts.map((contact, index) => (
                <AnimatedItem key={contact._id} type="slideUp" delay={index * 0.05}>
                  <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl p-6 border border-[var(--border-color)]/30 hover:border-[var(--primary-color)]/50 transition-all hover:shadow-xl">
                    {/* Type Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${getTypeColor(contact.type)} rounded-xl flex items-center justify-center text-white`}>
                        <i className={`fas ${getTypeIcon(contact.type)} text-xl`}></i>
                      </div>
                      <span className="px-3 py-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-full text-sm">
                        {getTypeLabel(contact.type)}
                      </span>
                    </div>

                    {/* Contact Info */}
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4">{contact.name}</h3>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <i className="fas fa-phone text-[var(--primary-color)]"></i>
                        <span className="text-[var(--text-primary)]" style={{ direction: 'ltr' }}>{contact.phone}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <i className="fas fa-envelope text-[var(--primary-color)]"></i>
                        <span className="text-[var(--text-primary)] text-sm">{contact.email}</span>
                      </div>

                      <div className="flex items-start gap-3">
                        <i className="fas fa-map-marker-alt text-[var(--primary-color)] mt-1"></i>
                        <span className="text-[var(--text-primary)] text-sm">{contact.address}</span>
                      </div>

                      {contact.notes && (
                        <div className="pt-3 border-t border-[var(--border-color)]/30">
                          <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{contact.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--border-color)]/30">
                      <a
                        href={`tel:${contact.phone}`}
                        className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors text-center"
                      >
                        <i className="fas fa-phone ml-1"></i> اتصل
                      </a>
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors text-center"
                      >
                        <i className="fas fa-envelope ml-1"></i> راسل
                      </a>
                      {contact.type === 'doctor' && (
                        <button
                          onClick={() => { }}
                          className="flex-1 px-3 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors text-center cursor-pointer"
                        >
                          <i className="fas fa-calendar-check ml-1"></i> احجز موعد
                        </button>
                      )}
                    </div>
                  </div>
                </AnimatedItem>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MedicalContactsPage;
