import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import { medicalContactsAPI } from '../services/medicalContactApi.js';
import AnimatedItem from '../components/AnimatedItem.jsx';

// --- Booking Modal Component ---
const BookingModal = ({ contact, onClose, onBooked }) => {
  const { success, error: showError } = useToast();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Example: Generate time slots (adjust logic as needed)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) { // Example: 9 AM to 5 PM
      for (let minute = 0; minute < 60; minute += 30) { // Every 30 minutes
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      showError('الرجاء اختيار التاريخ والوقت');
      return;
    }

    setSubmitting(true);
    try {
      // Replace with your actual API call and payload structure
      const payload = {
        date: selectedDate, // Format might need adjustment (e.g., YYYY-MM-DD)
        time: selectedTime, // Format might need adjustment (e.g., HH:mm)
        doctorId: contact._id, // Pass the doctor's ID
        // Add other necessary fields like userId if needed
      };

      // Simulate API call with setTimeout
      // await bookingAPI.bookAppointment(payload); // Replace with your actual API call
      console.log("Booking request sent:", payload); // Placeholder for API call

      // Simulate success response
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      success('تم حجز الموعد بنجاح!');
      setBookingConfirmed(true);
      onBooked && onBooked(); // Optional callback to update parent state
    } catch (err) {
      console.error("Booking Error:", err);
      showError('فشل حجز الموعد. حاول مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  if (bookingConfirmed) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className="relative bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--border-color)]/30 w-full max-w-md overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-green-500/10 text-green-500">
              <i className="fas fa-check-circle text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              تم الحجز!
            </h2>
            <p className="text-[var(--text-secondary)] mb-6">
              تم حجز موعدك مع {contact.name} بنجاح في {selectedDate} الساعة {selectedTime}.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--border-color)]/30 w-full max-w-md">
        <div className="p-6 border-b border-[var(--border-color)]/30 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">حجز موعد مع {contact.name}</h2>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 transition-colors">
            <i className="fas fa-times text-xl" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">التاريخ</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]} // Minimum selectable date is today
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)]/40 rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">الوقت</label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)]/40 rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
            >
              <option value="">اختر الوقت</option>
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl font-medium hover:text-[var(--text-primary)] transition-colors">
              إلغاء
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors"
            >
              {submitting ? <i className="fas fa-spinner fa-spin" /> : 'حجز'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
// --- End of Booking Modal Component ---

const MedicalContactsPage = () => {
  const { error: showError } = useToast();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingContact, setBookingContact] = useState(null); // State for the contact being booked

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

  const handleBookAppointment = (contact) => {
    setBookingContact(contact); // Set the contact to book
  };

  const handleBookingClose = () => {
    setBookingContact(null); // Close the modal
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
                          onClick={() => handleBookAppointment(contact)} // Call handler to open modal
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

      {/* Render Booking Modal if bookingContact is set */}
      {bookingContact && (
        <BookingModal
          contact={bookingContact}
          onClose={handleBookingClose}
        // onBooked={someCallbackFunction} // Optional: Pass a callback to update state after booking
        />
      )}
    </div>
  );
};

export default MedicalContactsPage;
