import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import Card from './ui/Card'; // Assuming Card is in components/ui

interface ForgotPasswordModalProps {
    onClose: () => void;
}

type ForgotPasswordInputs = {
    identifier: string; // Can be serial number or email
};

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInputs>();
    const { users, platformSettings } = useData();
    const { t } = useLanguage();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const onSubmit: SubmitHandler<ForgotPasswordInputs> = (data) => {
        setIsSubmitting(true);
        setSubmitMessage(null);

        // Determine if it's an email or serial number
        const isEmail = data.identifier.includes('@');
        let foundModerator = null;

        if (isEmail) {
            foundModerator = users.find(u => u.type === 'moderator' && u.email === data.identifier);
        } else {
            // Assume it's a serial number and construct the email
            const moderatorEmail = `${data.identifier}${platformSettings.moderatorEmailDomain}`;
            foundModerator = users.find(u => u.type === 'moderator' && u.email === moderatorEmail);
        }

        setTimeout(() => { // Simulate API call delay
            if (foundModerator) {
                setSubmitMessage({ type: 'success', text: t('moderatorLogin.forgotPasswordModal.success') });
                setTimeout(onClose, 3000); // Close modal after 3 seconds on success
            } else {
                setSubmitMessage({ type: 'error', text: t('moderatorLogin.forgotPasswordModal.errorNotFound') });
            }
            setIsSubmitting(false);
        }, 1500);
    };

    const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary";
    const errorClass = "text-red-500 text-sm mt-1";

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="forgot-password-title">
            <Card className="w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-2xl font-bold hover:text-red-500 transition-colors" aria-label={t('common.cancel')}>&times;</button>
                <h2 id="forgot-password-title" className="text-2xl font-bold font-heading text-text-dark text-center mb-4">{t('moderatorLogin.forgotPasswordModal.title')}</h2>
                <p className="text-center text-text-dark/80 mb-6">{t('moderatorLogin.forgotPasswordModal.subtitle')}</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="identifier" className="sr-only">{t('moderatorLogin.forgotPasswordModal.inputPlaceholder')}</label>
                        <input
                            id="identifier"
                            type="text"
                            {...register("identifier", {
                                required: t('moderatorLogin.forgotPasswordModal.identifierRequired'),
                                pattern: {
                                    value: /^\S+@\S+\.\S+$|^[a-zA-Z0-9_]+$/, // Basic email or serial number (alphanumeric/underscore)
                                    message: t('moderatorLogin.forgotPasswordModal.emailInvalid')
                                }
                            })}
                            className={inputClass}
                            placeholder={t('moderatorLogin.forgotPasswordModal.inputPlaceholder')}
                            aria-invalid={errors.identifier ? "true" : "false"}
                            aria-describedby="identifier-error"
                            disabled={isSubmitting}
                        />
                        {errors.identifier && <p id="identifier-error" className={errorClass} role="alert">{errors.identifier.message}</p>}
                    </div>

                    {submitMessage && (
                        <div className={`p-3 rounded-lg text-sm text-center ${submitMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`} role="status">
                            {submitMessage.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? t('common.submitting') : t('moderatorLogin.forgotPasswordModal.submitButton')}
                    </button>
                </form>
            </Card>
            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default ForgotPasswordModal;