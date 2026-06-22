import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import AnimatedItem from '../components/AnimatedItem.jsx';
import { assessmentAPI } from '../services/assessmentApi.js';

// ─── Assessment Quiz Modal ────────────────────────────────────────────────────
const QuizModal = ({ assessment, onClose, onDone }) => {
  const { success, error: showError } = useToast();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState((assessment.timeLimit || 30) * 60);

  // Countdown
  useEffect(() => {
    if (result) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, result]);

  const questions = assessment.questions || [];
  const q = questions[current];
  const answered = Object.keys(answers).length;

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // Send only required fields according to SubmitAssessmentDto
      const payload = {
        assessmentId: assessment._id,
        answers: Object.entries(answers).map(([questionId, selectedOptionIndex]) => {
          const question = questions.find(q => q._id === questionId);
          const selectedOption = question?.options?.[selectedOptionIndex];

          return {
            questionId,
            optionId: selectedOption?._id,
          };
        }),
      };

      const res = await assessmentAPI.submit(payload);
      setResult(res);
      // We don't call onDone() immediately so the user can see the result modal first
    } catch (err) {
      console.error(err);
      showError('فشل إرسال الإجابات');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseResult = () => {
    setResult(null);
    onClose();
    onDone?.();
  };

  // ─── Result View ───────────────────────────────────────────────
  if (result) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseResult} />
        <div className="relative bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--border-color)]/30 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">

          {/* Header Color Bar */}
          <div className="h-2 w-full bg-[var(--primary-color)]" />

          <div className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-[var(--primary-color)]/10 text-[var(--primary-color)]">
              <i className="fas fa-check-circle text-4xl" />
            </div>

            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              مكتمل
            </h2>

            <p className="text-[var(--text-secondary)] mb-8">
              تم إرسال إجاباتك بنجاح
            </p>

            <button
              onClick={handleCloseResult}
              className="w-full py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] transition-colors"
            >
              العودة للاختبارات
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Quiz View ───────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-2xl border border-[var(--border-color)]/30 w-full max-w-3xl h-[90vh] flex flex-col">

        {/* Header */}
        <div className="p-5 border-b border-[var(--border-color)]/30 flex items-center gap-4 flex-shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-[var(--text-primary)] truncate">
              {assessment.title}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-[var(--text-secondary)]">
                سؤال {current + 1} من {questions.length}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                {answered} / {questions.length} أجبت
              </span>
            </div>
          </div>
          <div className={`font-mono text-lg font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-[var(--bg-secondary)]">
          <div
            className="h-full bg-[var(--primary-color)] transition-all duration-300"
            style={{ width: `${((current + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="flex-1 overflow-y-auto p-6">
          {q ? (
            <div>
              <p className="text-lg font-semibold text-[var(--text-primary)] mb-6 leading-relaxed">
                {q.text}
              </p>

              <div className="space-y-3">
                {q.options?.map((opt, oi) => {
                  const selected = answers[q._id] === oi;

                  return (
                    <button
                      key={oi}
                      onClick={() =>
                        setAnswers((a) => ({
                          ...a,
                          [q._id]: oi,
                        }))
                      }
                      className={`w-full text-right px-5 py-4 rounded-xl border-2 transition-all font-medium ${selected
                        ? 'border-[var(--primary-color)] bg-[var(--primary-color)]/10 text-[var(--primary-color)]'
                        : 'border-[var(--border-color)]/30 bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:border-[var(--primary-color)]/50'
                        }`}
                    >
                      <span
                        className={`inline-flex w-7 h-7 rounded-full items-center justify-center text-sm ml-3 flex-shrink-0 ${selected
                          ? 'bg-[var(--primary-color)] text-white'
                          : 'bg-[var(--card-bg)] border border-[var(--border-color)]'
                          }`}
                      >
                        {selected ? (
                          <i className="fas fa-check text-xs" />
                        ) : (
                          String.fromCharCode(65 + oi)
                        )}
                      </span>

                      {opt.label || opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-center text-[var(--text-secondary)]">
              لا توجد أسئلة
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[var(--border-color)]/30 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="px-4 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl font-medium disabled:opacity-40 hover:text-[var(--text-primary)] transition-colors"
          >
            <i className="fas fa-chevron-right ml-1" />
            السابق
          </button>

          <div className="flex-1 flex items-center justify-center gap-1.5 overflow-x-auto">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all flex-shrink-0 ${i === current
                  ? 'bg-[var(--primary-color)] w-5'
                  : answers[questions[i]._id] != null
                    ? 'bg-[var(--primary-color)]/40'
                    : 'bg-[var(--border-color)]'
                  }`}
              />
            ))}
          </div>

          {current < questions.length - 1 ? (
            <button
              onClick={() => setCurrent((c) => c + 1)}
              className="px-4 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl font-medium hover:text-[var(--text-primary)] transition-colors"
            >
              التالي
              <i className="fas fa-chevron-left mr-1" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2.5 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {submitting ? (
                <i className="fas fa-spinner fa-spin" />
              ) : (
                <i className="fas fa-paper-plane" />
              )}
              إرسال الإجابات
            </button>
          )}
        </div>
      </div>
    </div>
  );
};// ─── Main Page ────────────────────────────────────────────────────────────────
const Assessments = () => {
  const { error: showError } = useToast();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const list = await assessmentAPI.getAll().catch(() => []);
      setAssessments(Array.isArray(list) ? list : list.assessments || []);
    } catch {
      showError('فشل تحميل الاختبارات');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => { load(); }, [load]);

  const handleStartQuiz = async (a) => {
    try {
      setLoadingQuiz(a._id);
      const full = await assessmentAPI.getOne(a._id);
      setActiveQuiz(full);
    } catch {
      showError('فشل تحميل الاختبار');
    } finally {
      setLoadingQuiz(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Page Header */}
        <AnimatedItem type="slideUp" delay={0}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">الاختبارات</h1>
            <p className="text-[var(--text-secondary)]">اختبر معرفتك وتتبع تقدمك</p>
          </div>
        </AnimatedItem>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[var(--primary-color)]" />
          </div>
        ) : (
          /* ── Available Assessments ── */
          <div className="space-y-4">
            {assessments.length === 0 ? (
              <AnimatedItem type="slideUp" delay={0.1}>
                <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)]/30 p-16 text-center">
                  <i className="fas fa-clipboard-list text-5xl text-[var(--text-secondary)] opacity-30 mb-4 block" />
                  <p className="text-[var(--text-secondary)]">لا توجد اختبارات متاحة حالياً</p>
                </div>
              </AnimatedItem>
            ) : (
              assessments.map((a, idx) => {
                return (
                  <AnimatedItem key={a._id} type="slideUp" delay={0.05 * idx}>
                    <div className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl border border-[var(--border-color)]/30 hover:border-[var(--primary-color)]/40 transition-all p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary-color)] to-[var(--secondary-color)] rounded-xl flex items-center justify-center flex-shrink-0">
                          <i className="fas fa-clipboard-list text-white text-lg" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-[var(--text-primary)] text-lg mb-1">{a.title}</h3>
                          {a.description && (
                            <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">{a.description}</p>
                          )}
                          <div className="flex flex-wrap gap-3">
                            <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-3 py-1.5 rounded-lg">
                              <i className="fas fa-question-circle text-[var(--primary-color)]" />
                              {a.questions?.length || 0} سؤال
                            </span>
                            {a.timeLimit && (
                              <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-3 py-1.5 rounded-lg">
                                <i className="fas fa-clock text-[var(--primary-color)]" />
                                {a.timeLimit} دقيقة
                              </span>
                            )}
                            {a.passingScore != null && (
                              <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-3 py-1.5 rounded-lg">
                                <i className="fas fa-award text-[var(--primary-color)]" />
                                نجاح {a.passingScore}%
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleStartQuiz(a)}
                          disabled={loadingQuiz === a._id || !a.questions?.length}
                          className="px-5 py-2.5 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors flex items-center gap-2 flex-shrink-0"
                          title={!a.questions?.length ? 'لا توجد أسئلة بعد' : ''}
                        >
                          {loadingQuiz === a._id ? (
                            <i className="fas fa-spinner fa-spin" />
                          ) : (
                            <>
                              <i className="fas fa-play text-sm" />
                              ابدأ
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </AnimatedItem>
                );
              })
            )}
          </div>
        )}
      </div>

      {activeQuiz && (
        <QuizModal
          assessment={activeQuiz}
          onClose={() => { setActiveQuiz(null); load(); }}
          onDone={() => load()}
        />
      )}
    </div>
  );
};

export default Assessments;
