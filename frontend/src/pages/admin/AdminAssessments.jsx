import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import AnimatedItem from '../../components/AnimatedItem.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { assessmentAPI } from '../../services/assessmentApi.js';


// ─── Question Form Modal ──────────────────────────────────────────────────────
const QuestionModal = ({ assessmentId, onClose, onSuccess }) => {
  const { success, error: showError } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    text: '',
    order: 0, // Add the order field
    options: [{ label: '', score: 0 }, { label: '', score: 0 }, { label: '', score: 0 }, { label: '', score: 0 }],
  });

  const updateOption = (i, field, val) => {
    const opts = [...form.options];
    opts[i][field] = val;
    setForm((f) => ({ ...f, options: opts }));
  };

  const handleSubmit = async () => {
    if (!form.text.trim()) return showError('أدخل نص السؤال');
    if (form.options.some((o) => !o.label.trim())) return showError('أكمل جميع الخيارات');
    try {
      setSaving(true);
      await assessmentAPI.addQuestion(assessmentId, form);
      success('تمت إضافة السؤال');
      onSuccess();
    } catch {
      showError('فشل إضافة السؤال');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--border-color)]/30 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--card-bg)] backdrop-blur-md p-6 border-b border-[var(--border-color)]/30 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">إضافة سؤال</h2>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 transition-colors">
            <i className="fas fa-times text-xl" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">نص السؤال</label>
            <textarea
              rows={3}
              value={form.text}
              onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)]/40 rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors resize-none"
              placeholder="اكتب السؤال هنا..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">الترتيب</label>
            <input
              type="number"
              min={1}
              value={form.order}
              onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)]/40 rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
              placeholder="رقم ترتيب السؤال"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">الخيارات</label>
            <div className="space-y-2">
              {form.options.map((opt, i) => (
                <div key={i} className="grid grid-cols-[auto_1fr_auto] gap-3 items-center">
                  <span className="w-8 h-8 rounded-full border border-[var(--border-color)]/40 flex items-center justify-center flex-shrink-0 text-sm text-[var(--text-secondary)]">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <div className="space-y-1">
                    <input
                      value={opt.label}
                      onChange={(e) => updateOption(i, 'label', e.target.value)}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)]/40 rounded-xl px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                      placeholder={`الخيار ${i + 1}`}
                    />
                    <input
                      type="number"
                      min={0}
                      value={opt.score}
                      onChange={(e) => updateOption(i, 'score', Number(e.target.value))}
                      className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)]/40 rounded-xl px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                      placeholder="النقاط"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl font-medium hover:text-[var(--text-primary)] transition-colors">
              إلغاء
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors"
            >
              {saving ? <i className="fas fa-spinner fa-spin" /> : 'إضافة السؤال'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};// ─── Assessment Form Modal ────────────────────────────────────────────────────
const AssessmentModal = ({ assessment, onClose, onSuccess }) => {
  const { success, error: showError } = useToast();
  const [saving, setSaving] = useState(false);

  // Initialize form according to CreateAssessmentDto structure
  const [form, setForm] = useState({
    title: assessment?.title || '',
    description: assessment?.description || '',
    results: assessment?.results || [], // Array of ResultDto objects
    questions: assessment?.questions || [] // Array of QuestionDto objects
  });

  const updateResult = (index, field, value) => {
    setForm(prev => {
      const updatedResults = [...prev.results];
      updatedResults[index] = { ...updatedResults[index], [field]: value };
      return { ...prev, results: updatedResults };
    });
  };

  const addNewResult = () => {
    setForm(prev => ({
      ...prev,
      results: [
        ...prev.results,
        { minScore: 0, maxScore: 0, title: '', description: '', message: '', recommendations: [], needsDoctor: false }
      ]
    }));
  };

  // Function to remove a specific result object
  const removeResult = (index) => {
    setForm(prev => ({
      ...prev,
      results: prev.results.filter((_, i) => i !== index)
    }));
  };

  // Function to add a recommendation to a specific result object
  const addRecommendation = (resultIndex) => {
    setForm(prev => {
      const updatedResults = [...prev.results];
      const newRecommendations = [...(updatedResults[resultIndex].recommendations || [])];
      newRecommendations.push('');
      updatedResults[resultIndex] = { ...updatedResults[resultIndex], recommendations: newRecommendations };
      return { ...prev, results: updatedResults };
    });
  };

  // Function to update a specific recommendation within a specific result object
  const updateRecommendation = (resultIndex, recIndex, value) => {
    setForm(prev => {
      const updatedResults = [...prev.results];
      const updatedRecs = [...updatedResults[resultIndex].recommendations];
      updatedRecs[recIndex] = value;
      updatedResults[resultIndex] = { ...updatedResults[resultIndex], recommendations: updatedRecs };
      return { ...prev, results: updatedResults };
    });
  };

  // Function to remove a specific recommendation from a specific result object
  const removeRecommendation = (resultIndex, recIndex) => {
    setForm(prev => {
      const updatedResults = [...prev.results];
      const updatedRecs = updatedResults[resultIndex].recommendations.filter((_, i) => i !== recIndex);
      updatedResults[resultIndex] = { ...updatedResults[resultIndex], recommendations: updatedRecs };
      return { ...prev, results: updatedResults };
    });
  };


  const handleSubmit = async () => {
    if (!form.title.trim()) return showError('أدخل عنوان الاختبار');
    // Optional: Add validation for results array (e.g., check if ranges overlap, if required fields are filled)
    // Example basic check for empty title/desc/msg in results
    const invalidResultIndex = form.results.findIndex(r => !r.title.trim() || !r.description.trim() || !r.message.trim());
    if (invalidResultIndex >= 0) {
      return showError(`املأ الحقول المطلوبة في نتيجة رقم ${invalidResultIndex + 1}`);
    }

    try {
      setSaving(true);
      if (assessment) {
        await assessmentAPI.update(assessment._id, form);
        success('تم تحديث الاختبار');
      } else {
        await assessmentAPI.create(form);
        success('تم إنشاء الاختبار');
      }
      onSuccess();
    } catch (err) { // Catch the error to show specific messages if needed
      console.error("Submission Error:", err); // Log for debugging
      showError('فشل حفظ الاختبار');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--border-color)]/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto"> {/* Increased width */}
        <div className="p-6 border-b border-[var(--border-color)]/30 flex justify-between items-center sticky top-0 bg-[var(--card-bg)] z-10">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            {assessment ? 'تعديل الاختبار' : 'إنشاء اختبار جديد'}
          </h2>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 transition-colors">
            <i className="fas fa-times text-xl" />
          </button>
        </div>
        <div className="p-6 space-y-6"> {/* Increased vertical spacing */}
          {/* Basic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Grid for basic info */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">عنوان الاختبار</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)]/40 rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors"
                placeholder="عنوان الاختبار"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">الوصف</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)]/40 rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors resize-none"
                placeholder="وصف الاختبار (اختياري)"
              />
            </div>
          </div>

          {/* Results Configuration */}
          <div className="border border-[var(--border-color)]/40 rounded-xl p-5 bg-[var(--bg-secondary)]/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[var(--text-primary)]">نطاقات النتائج</h3>
              <button
                type="button"
                onClick={addNewResult}
                className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-hover)] transition-colors text-sm flex items-center gap-1"
              >
                <i className="fas fa-plus text-xs"></i> إضافة نطاق
              </button>
            </div>

            {form.results.length === 0 ? (
              <p className="text-center text-[var(--text-secondary)] text-sm py-4">
                لم يتم تحديد أي نطاقات نتائج. أضف نطاقًا لتحديد الرسائل والتوصيات بناءً على النتيجة.
              </p>
            ) : (
              <div className="space-y-5">
                {form.results.map((result, index) => (
                  <div key={index} className="border border-[var(--border-color)]/30 rounded-lg p-4 bg-[var(--card-bg)]">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-[var(--text-primary)]">النطاق {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeResult(index)}
                        className="text-red-500 hover:text-red-700 p-1 transition-colors"
                        title="حذف النطاق"
                      >
                        <i className="fas fa-trash text-sm"></i>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">الحد الأدنى للنقاط</label>
                        <input
                          type="number"
                          min={0}
                          value={result.minScore}
                          onChange={(e) => updateResult(index, 'minScore', parseInt(e.target.value) || 0)}
                          className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)]/40 rounded-xl px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors text-sm"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">الحد الأعلى للنقاط</label>
                        <input
                          type="number"
                          min={0}
                          value={result.maxScore}
                          onChange={(e) => updateResult(index, 'maxScore', parseInt(e.target.value) || 0)}
                          className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)]/40 rounded-xl px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors text-sm"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">العنوان (التشخيص)</label>
                        <input
                          value={result.title}
                          onChange={(e) => updateResult(index, 'title', e.target.value)}
                          className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)]/40 rounded-xl px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors text-sm"
                          placeholder="مثل: اكتئاب خفيف"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">الوصف</label>
                        <input
                          value={result.description}
                          onChange={(e) => updateResult(index, 'description', e.target.value)}
                          className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)]/40 rounded-xl px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors text-sm"
                          placeholder="وصف مفصل للنتيجة"
                        />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">الرسالة الشخصية</label>
                      <textarea
                        rows={2}
                        value={result.message}
                        onChange={(e) => updateResult(index, 'message', e.target.value)}
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)]/40 rounded-xl px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors resize-none text-sm"
                        placeholder="رسالة تظهر للمستخدم بناءً على النتيجة"
                      />
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-medium text-[var(--text-secondary)]">التوصيات</label>
                        <button
                          type="button"
                          onClick={() => addRecommendation(index)}
                          className="text-xs text-[var(--primary-color)] hover:text-[var(--primary-hover)] flex items-center gap-1"
                        >
                          <i className="fas fa-plus text-xs"></i> إضافة
                        </button>
                      </div>
                      <div className="space-y-2">
                        {(result.recommendations || []).map((rec, recIndex) => (
                          <div key={recIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={rec}
                              onChange={(e) => updateRecommendation(index, recIndex, e.target.value)}
                              className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-color)]/40 rounded-xl px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-color)] transition-colors text-sm"
                              placeholder="توصية"
                            />
                            <button
                              type="button"
                              onClick={() => removeRecommendation(index, recIndex)}
                              className="text-red-500 hover:text-red-700 p-1.5 transition-colors"
                              title="حذف التوصية"
                            >
                              <i className="fas fa-trash text-xs"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`needsDoctor_${index}`}
                        checked={result.needsDoctor}
                        onChange={(e) => updateResult(index, 'needsDoctor', e.target.checked)}
                        className="h-4 w-4 text-[var(--primary-color)] focus:ring-[var(--primary-color)] border-[var(--border-color)] rounded"
                      />
                      <label htmlFor={`needsDoctor_${index}`} className="ml-2 block text-sm text-[var(--text-primary)]">
                        يتطلب زيارة الطبيب
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-[var(--border-color)]/30 pt-6">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl font-medium hover:text-[var(--text-primary)] transition-colors">
              إلغاء
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 px-4 py-2.5 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors"
            >
              {saving ? <i className="fas fa-spinner fa-spin" /> : 'حفظ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Attempts Drawer ──────────────────────────────────────────────────────────
const AttemptsDrawer = ({ assessment, onClose }) => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    assessmentAPI
      .getAssessmentAttempts(assessment._id)
      .then(setAttempts)
      .catch(() => setAttempts([]))
      .finally(() => setLoading(false));
  }, [assessment._id]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--border-color)]/30 w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="p-6 border-b border-[var(--border-color)]/30 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">محاولات الاختبار</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">{assessment.title}</p>
          </div>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 transition-colors">
            <i className="fas fa-times text-xl" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-[var(--primary-color)]" />
            </div>
          ) : attempts.length === 0 ? (
            <div className="text-center py-16 text-[var(--text-secondary)]">
              <i className="fas fa-inbox text-4xl mb-3 block opacity-30" />
              لا توجد محاولات بعد
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-[var(--bg-secondary)] sticky top-0">
                <tr>
                  <th className="px-5 py-3 text-right text-xs font-bold text-[var(--text-secondary)] uppercase">المستخدم</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-[var(--text-secondary)] uppercase">الدرجة</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-[var(--text-secondary)] uppercase">النتيجة</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-[var(--text-secondary)] uppercase">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {attempts.map((a, i) => (
                  <tr key={i} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                    <td className="px-5 py-4 text-sm text-[var(--text-primary)]">
                      {a.user?.firstName} {a.user?.lastName || a.userId || '—'}
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-[var(--text-primary)]">{a.score ?? '—'}%</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${a.passed ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                        {a.passed ? 'ناجح' : 'راسب'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-[var(--text-secondary)]">
                      {a.createdAt ? new Date(a.createdAt).toLocaleDateString('ar-EG') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const AdminAssessments = () => {
  const { success, error: showError } = useToast();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false); // New state for edit loading

  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [targetAssessment, setTargetAssessment] = useState(null);

  const [showAttemptsDrawer, setShowAttemptsDrawer] = useState(false);
  const [attemptsAssessment, setAttemptsAssessment] = useState(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [showDeleteQConfirm, setShowDeleteQConfirm] = useState(false);
  const [deleteQTarget, setDeleteQTarget] = useState(null); // { questionId, assessmentTitle }

  const [expandedId, setExpandedId] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await assessmentAPI.getAll();
      setAssessments(Array.isArray(data) ? data : data.assessments || []);
    } catch {
      showError('فشل تحميل الاختبارات');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => { load(); }, [load]);

  const handleTogglePublish = async (a) => {
    try {
      await assessmentAPI.togglePublish(a._id, !a.isPublished);
      success(`تم ${a.isPublished ? 'إخفاء' : 'نشر'} الاختبار`);
      load();
    } catch {
      showError('فشل تحديث حالة النشر');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await assessmentAPI.delete(deleteTarget._id);
      success('تم حذف الاختبار');
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      load();
    } catch {
      showError('فشل الحذف');
    }
  };

  const handleDeleteQuestion = async () => {
    try {
      await assessmentAPI.deleteQuestion(deleteQTarget.questionId);
      success('تم حذف السؤال');
      setShowDeleteQConfirm(false);
      setDeleteQTarget(null);
      load();
    } catch {
      showError('فشل حذف السؤال');
    }
  };

  // Updated handleEdit function
  const handleEdit = async (assessment) => { // Renamed parameter
    setLoadingEdit(true); // Set loading state
    try {
      // Fetch the *full* assessment details using the existing getOne API call
      const fullAssessment = await assessmentAPI.getOne(assessment._id);
      setEditingAssessment(fullAssessment); // Set state with the full data
      setShowAssessmentModal(true); // Show the modal
    } catch (err) {
      console.error("Failed to load assessment for editing:", err);
      showError("فشل تحميل تفاصيل الاختبار للتعديل.");
    } finally {
      setLoadingEdit(false); // Reset loading state
    }
  };


  const filtered = assessments.filter((a) => {
    if (filterStatus === 'published') return a.isPublished;
    if (filterStatus === 'draft') return !a.isPublished;
    return true;
  });

  const stats = {
    total: assessments.length,
    published: assessments.filter((a) => a.isPublished).length,
    draft: assessments.filter((a) => !a.isPublished).length,
    questions: assessments.reduce((s, a) => s + (a.questions?.length || 0), 0),
  };

  return (
    <AdminLayout title="إدارة الاختبارات">
      {/* Stats */}
      <AnimatedItem type="slideUp" delay={0.05}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'إجمالي', value: stats.total, color: 'text-[var(--text-primary)]' },
            { label: 'منشور', value: stats.published, color: 'text-green-500' },
            { label: 'مسودة', value: stats.draft, color: 'text-yellow-500' },
            { label: 'أسئلة', value: stats.questions, color: 'text-[var(--primary-color)]' },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--card-bg)] backdrop-blur-md rounded-xl p-4 border border-[var(--border-color)]/30 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </AnimatedItem>

      {/* Filters + Add */}
      <AnimatedItem type="slideUp" delay={0.1}>
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'all', label: 'الكل', icon: 'fa-list' },
            { id: 'published', label: 'منشور', icon: 'fa-globe' },
            { id: 'draft', label: 'مسودة', icon: 'fa-pencil-alt' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterStatus(f.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${filterStatus === f.id
                ? 'bg-[var(--primary-color)] text-white shadow-lg'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
            >
              <i className={`fas ${f.icon}`} />
              <span>{f.label}</span>
            </button>
          ))}
          <div className="flex-grow" />
          <button
            onClick={() => { setEditingAssessment(null); setShowAssessmentModal(true); }}
            className="px-5 py-2.5 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2"
          >
            <i className="fas fa-plus" />
            اختبار جديد
          </button>
        </div>
      </AnimatedItem>

      {/* List */}
      <AnimatedItem type="slideUp" delay={0.15}>
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[var(--primary-color)]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)]/30 p-16 text-center">
              <i className="fas fa-clipboard-list text-5xl text-[var(--text-secondary)] opacity-30 mb-4 block" />
              <p className="text-[var(--text-secondary)]">لا توجد اختبارات</p>
            </div>
          ) : (
            filtered.map((a) => (
              <div key={a._id} className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl border border-[var(--border-color)]/30 overflow-hidden">
                {/* Header Row */}
                <div className="px-6 py-4 flex items-center gap-4">
                  <div className="w-11 h-11 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-clipboard-list text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[var(--text-primary)] truncate">{a.title}</h3>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-[var(--text-secondary)]">
                        <i className="fas fa-question-circle mr-1" />
                        {a.questions?.length || 0} سؤال
                      </span>
                      {a.timeLimit && (
                        <span className="text-xs text-[var(--text-secondary)]">
                          <i className="fas fa-clock mr-1" />
                          {a.timeLimit} دقيقة
                        </span>
                      )}
                      {a.passingScore != null && (
                        <span className="text-xs text-[var(--text-secondary)]">
                          <i className="fas fa-award mr-1" />
                          نجاح {a.passingScore}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Publish toggle */}
                  <button
                    onClick={() => handleTogglePublish(a)}
                    className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors flex-shrink-0 ${a.isPublished
                      ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                      : 'bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30'
                      }`}
                  >
                    <i className={`fas ${a.isPublished ? 'fa-globe' : 'fa-eye-slash'} mr-1`} />
                    {a.isPublished ? 'منشور' : 'مسودة'}
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => { setAttemptsAssessment(a); setShowAttemptsDrawer(true); }}
                      className="p-2 text-[var(--text-secondary)] hover:text-[var(--primary-color)] hover:bg-[var(--primary-color)]/10 rounded-lg transition-colors"
                      title="المحاولات"
                    >
                      <i className="fas fa-chart-bar" />
                    </button>
                    <button
                      onClick={() => { setTargetAssessment(a); setShowQuestionModal(true); }}
                      className="p-2 text-[var(--text-secondary)] hover:text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                      title="إضافة سؤال"
                    >
                      <i className="fas fa-plus-circle" />
                    </button>
                    <button
                      onClick={() => handleEdit(a)} // Use the updated handleEdit function
                      className={`p-2 rounded-lg transition-colors ${loadingEdit ? 'opacity-50 cursor-not-allowed' : 'text-blue-500 hover:bg-blue-500/10'}`} // Apply loading style
                      title="تعديل"
                      disabled={loadingEdit} // Disable while loading
                    >
                      <i className="fas fa-pen" />
                    </button>
                    <button
                      onClick={() => { setDeleteTarget(a); setShowDeleteConfirm(true); }}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <i className="fas fa-trash" />
                    </button>
                    <button
                      onClick={() => setExpandedId(expandedId === a._id ? null : a._id)}
                      className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                      title="الأسئلة"
                    >
                      <i className={`fas fa-chevron-${expandedId === a._id ? 'up' : 'down'}`} />
                    </button>
                  </div>
                </div>

                {/* Expanded Questions */}
                {expandedId === a._id && (
                  <div className="border-t border-[var(--border-color)]/30 bg-[var(--bg-secondary)]/40 px-6 py-4">
                    {!a.questions?.length ? (
                      <p className="text-sm text-[var(--text-secondary)] text-center py-4">
                        لا توجد أسئلة — اضغط <i className="fas fa-plus-circle mx-1 text-green-500" /> لإضافة سؤال
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {a.questions.map((q, qi) => (
                          <div key={q._id || qi} className="bg-[var(--card-bg)] rounded-xl p-4 border border-[var(--border-color)]/20 flex items-start gap-3">
                            <span className="w-7 h-7 rounded-lg bg-[var(--primary-color)]/10 text-[var(--primary-color)] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                              {qi + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[var(--text-primary)] mb-2">{q.text}</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {q.options?.map((opt, oi) => (
                                  <div key={oi} className="flex items-center gap-2 text-xs p-2 bg-[var(--bg-secondary)] rounded-lg">
                                    <span className="font-bold text-[var(--text-secondary)]">{String.fromCharCode(65 + oi)}.</span>
                                    <span className="flex-1 truncate">{opt.label}</span>
                                    <span className="text-[var(--text-secondary)]">+{opt.score}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <button
                              onClick={() => { setDeleteQTarget({ questionId: q._id, title: q.text }); setShowDeleteQConfirm(true); }}
                              className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                              title="حذف السؤال"
                            >
                              <i className="fas fa-trash text-xs" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </AnimatedItem>

      {/* Modals */}
      {showAssessmentModal && (
        <AssessmentModal
          assessment={editingAssessment}
          onClose={() => { setShowAssessmentModal(false); setEditingAssessment(null); }} // Reset state on close
          onSuccess={() => { setShowAssessmentModal(false); setEditingAssessment(null); load(); }} // Reset state and reload on success
        />
      )}

      {showQuestionModal && (
        <QuestionModal
          assessmentId={targetAssessment?._id}
          onClose={() => { setShowQuestionModal(false); setTargetAssessment(null); }}
          onSuccess={() => { setShowQuestionModal(false); setTargetAssessment(null); load(); }}
        />
      )}

      {showAttemptsDrawer && (
        <AttemptsDrawer
          assessment={attemptsAssessment}
          onClose={() => { setShowAttemptsDrawer(false); setAttemptsAssessment(null); }}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="حذف الاختبار"
        message={`هل أنت متأكد من حذف اختبار "${deleteTarget?.title}"؟\n\nسيتم حذف جميع الأسئلة والمحاولات المرتبطة به.`}
        confirmText="حذف"
        cancelText="إلغاء"
        isDanger
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setShowDeleteConfirm(false); setDeleteTarget(null); }}
      />

      <ConfirmDialog
        isOpen={showDeleteQConfirm}
        title="حذف السؤال"
        message={`هل أنت متأكد من حذف هذا السؤال؟`}
        confirmText="حذف"
        cancelText="إلغاء"
        isDanger
        onConfirm={handleDeleteQuestion}
        onCancel={() => { setShowDeleteQConfirm(false); setDeleteQTarget(null); }}
      />
    </AdminLayout>
  );
};

export default AdminAssessments;
