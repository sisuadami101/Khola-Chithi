
import React, { useState, useEffect, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Letter, LetterStatus } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface LetterFormInputs {
    subject: string;
    body: string;
}

const AdOverlay: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
    const [countdown, setCountdown] = useState(5);
    const { t } = useLanguage();

    React.useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            onFinish();
        }
    }, [countdown, onFinish]);

    return (
        <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 text-white" role="dialog" aria-modal="true" aria-labelledby="ad-overlay-title">
            <h2 id="ad-overlay-title" className="text-2xl mb-4">{t('writeLetterPage.adOverlay.title')}</h2>
            <div className="w-full max-w-xl bg-gray-700 h-64 flex items-center justify-center" aria-label={t('writeLetterPage.adOverlay.adContent')}>
                <p>{t('writeLetterPage.adOverlay.videoAdPlaceholder')}</p>
            </div>
            <p className="mt-4">{t('writeLetterPage.adOverlay.letterSubmissionCountdown', { countdown })}</p>
        </div>
    );
};

// Onboarding Modal Component
const OnboardingModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useLanguage();
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="onboarding-modal-title">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center animate-fade-in">
                <h2 id="onboarding-modal-title" className="text-2xl font-bold font-heading text-primary mb-4">{t('writeLetterPage.onboarding.title')}</h2>
                <p className="text-text-dark/80 mb-6">
                    {t('writeLetterPage.onboarding.body')}
                </p>
                <ul className="text-left space-y-2 mb-8 list-disc list-inside">
                    <li><span className="font-semibold">{t('writeLetterPage.onboarding.privacy')}</span> {t('writeLetterPage.onboarding.privacyDetail')}</li>
                    <li><span className="font-semibold">{t('writeLetterPage.onboarding.empathy')}</span> {t('writeLetterPage.onboarding.empathyDetail')}</li>
                    <li><span className="font-semibold">{t('writeLetterPage.onboarding.support')}</span> {t('writeLetterPage.onboarding.supportDetail')}</li>
                </ul>
                <button 
                    onClick={onClose}
                    className="w-full bg-accent text-text-dark py-3 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors"
                >
                    {t('writeLetterPage.onboarding.cta')}
                </button>
            </div>
             <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

const WriteLetterPage: React.FC = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<LetterFormInputs>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAd, setShowAd] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const { addLetter, getLettersSentInLast24Hours } = useData();
    const { user } = useAuth();
    const { t } = useLanguage();
    
    // Audio recording state
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const lettersSentToday = user ? getLettersSentInLast24Hours(user.id) : 0;
    const canSendLetter = user && lettersSentToday < 2; // Max 2 letters per 24 hours

    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('hasSeenLetterOnboarding');
        if (!hasSeenOnboarding) {
            setShowOnboarding(true);
        }
    }, []);

    const handleCloseOnboarding = () => {
        localStorage.setItem('hasSeenLetterOnboarding', 'true');
        setShowOnboarding(false);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            
            mediaRecorderRef.current.ondataavailable = event => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(audioBlob);
                setAudioURL(url);
                stream.getTracks().forEach(track => track.stop()); // Stop microphone access
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setAudioURL(null); // Clear previous recording
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert(t('writeLetterPage.audioNote.permissionError'));
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const onSubmit: SubmitHandler<LetterFormInputs> = (data) => {
        if (!user) {
            alert(t('common.loginRequired'));
            return;
        }
        if (!canSendLetter) {
            alert(t('writeLetterPage.postLimitReached', { count: 2 })); // Pass count for localization
            return;
        }

        if (!data.body.trim() && !audioURL) {
            alert(t('writeLetterPage.emptyContentWarning'));
            return;
        }
        
        const newLetter: Letter = {
            id: `letter_${new Date().getTime()}`,
            userId: user.id,
            subject: data.subject,
            body: data.body,
            audioUrl: audioURL || undefined,
            dateSent: new Date().toISOString(),
            status: LetterStatus.PENDING,
        };
        
        addLetter(newLetter);
        setShowAd(true);
    };
    
    const handleAdFinish = () => {
        setShowAd(false);
        setIsSubmitting(false);
        alert(t('writeLetterPage.success'));
        reset();
        setAudioURL(null);
    };

    const inputClass = "w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary";

    return (
        <div className="max-w-4xl mx-auto page-fade-in">
            {showAd && <AdOverlay onFinish={handleAdFinish} />}
            {showOnboarding && <OnboardingModal onClose={handleCloseOnboarding} />}
            <h1 className="text-3xl font-bold mb-2">{t('writeLetterPage.title')}</h1>
            <p className="mb-8 text-gray-600">{t('writeLetterPage.subtitle')}</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <label htmlFor="subject" className="block font-semibold mb-1 text-lg">{t('writeLetterPage.subject')}</label>
                    <input
                        id="subject"
                        type="text"
                        {...register("subject", { required: t('writeLetterPage.subjectRequired') })}
                        className={inputClass}
                        placeholder={t('writeLetterPage.subjectPlaceholder')}
                        disabled={!canSendLetter || isSubmitting}
                        aria-invalid={errors.subject ? "true" : "false"}
                        aria-describedby="subject-error"
                    />
                    {errors.subject && <p id="subject-error" className="text-red-500 text-sm mt-1" role="alert">{errors.subject.message}</p>}
                </div>
                <div>
                    <label htmlFor="body" className="block font-semibold mb-1 text-lg">{t('writeLetterPage.body')}</label>
                    <textarea
                        id="body"
                        {...register("body")}
                        className={`${inputClass} h-60`}
                        placeholder={t('writeLetterPage.bodyPlaceholder')}
                        disabled={!canSendLetter || isSubmitting}
                        aria-label={t('writeLetterPage.bodyPlaceholder')}
                    ></textarea>
                </div>

                {/* Audio Recorder UI */}
                <div className="p-4 border rounded-lg space-y-3">
                    <h4 className="font-semibold">{t('writeLetterPage.audioNote.title')}</h4>
                    <div className="flex items-center space-x-4">
                        {!isRecording ? (
                            <button type="button" onClick={startRecording} className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!canSendLetter || isSubmitting} aria-label={t('writeLetterPage.audioNote.start')}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7a1 1 0 100 2h6a1 1 0 100-2h-2v-2.07z" clipRule="evenodd" /></svg>
                                <span>{t('writeLetterPage.audioNote.start')}</span>
                            </button>
                        ) : (
                            <button type="button" onClick={stopRecording} className="bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 animate-pulse transition-colors hover:bg-gray-800" aria-label={t('writeLetterPage.audioNote.stop')}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                <span>{t('writeLetterPage.audioNote.stop')}</span>
                            </button>
                        )}
                        {audioURL && (
                            <audio src={audioURL} controls className="h-10" aria-label={t('writeLetterPage.audioNote.playback')}></audio>
                        )}
                    </div>
                </div>

                <div>
                    <button 
                        type="submit" 
                        disabled={isSubmitting || !canSendLetter || (!audioURL && !errors.body && !errors.subject && !register("body").value?.trim())} // Disable if no audio and no text
                        className="bg-accent text-text-dark py-3 px-8 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {t('writeLetterPage.send')}
                    </button>
                    {!canSendLetter ? (
                        <p className="text-red-500 text-sm mt-2">{t('writeLetterPage.postLimitReached', { count: lettersSentToday })}</p>
                    ) : (
                        <p className="text-sm text-gray-500 mt-2">{t('writeLetterPage.note')}</p>
                    )}
                </div>
            </form>
        </div>
    );
};

export default WriteLetterPage;
