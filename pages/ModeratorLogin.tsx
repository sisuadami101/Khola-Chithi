import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext'; // Import useLanguage
import ForgotPasswordModal from '../components/ForgotPasswordModal'; // Import the new modal

type ModeratorLoginFormInputs = {
  serialNumber: string;
  password: string;
  rememberMe: boolean; // Added for "Remember Me"
};

const ModeratorLogin: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<ModeratorLoginFormInputs>();
    const navigate = useNavigate();
    const { login } = useAuth();
    const { users, platformSettings } = useData(); // Access platformSettings for email domain
    const { t } = useLanguage(); // Use useLanguage hook
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false); // State for modal visibility

    const onSubmit: SubmitHandler<ModeratorLoginFormInputs> = data => {
        // The serial number is treated as the username part of the email.
        const moderatorEmail = `${data.serialNumber}${platformSettings.moderatorEmailDomain}`;
        
        const foundModerator = users.find(u => 
            u.type === 'moderator' && 
            u.email === moderatorEmail && 
            u.password === data.password
        );
        
        if (foundModerator) {
             if (foundModerator.isActive) {
                const { password, ...userToLogin } = foundModerator;
                login(userToLogin, data.rememberMe); // Pass rememberMe state
                navigate('/moderator/dashboard');
             } else {
                 alert(t('loginPage.inactive')); // Localized message
             }
        } else {
            alert(t('loginPage.error')); // Localized message
        }
    };

    const handleSocialLogin = (provider: string) => {
        alert(t('loginPage.socialLoginComingSoon', { provider })); // Localized message without "This is a demo"
    };

    const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary";
    const errorClass = "text-red-500 text-sm mt-1";

    return (
        <div className="flex flex-col min-h-screen bg-secondary/30">
            {showForgotPasswordModal && <ForgotPasswordModal onClose={() => setShowForgotPasswordModal(false)} />}
            <main className="flex-grow flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md mx-auto bg-white p-8 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-text-dark">{t('moderatorLogin.title')}</h1>
                        <p className="text-text-dark/80 mt-2">{t('moderatorLogin.subtitle')}</p>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label htmlFor="serialNumber" className="block font-semibold mb-1">{t('moderatorLogin.serial')}</label>
                            <input 
                                id="serialNumber"
                                type="text" 
                                {...register("serialNumber", { required: t('moderatorLogin.serialRequired') })} 
                                className={inputClass} 
                                aria-invalid={errors.serialNumber ? "true" : "false"}
                                aria-describedby="serialNumber-error"
                            />
                            {errors.serialNumber && <p id="serialNumber-error" className={errorClass} role="alert">{errors.serialNumber.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="password" className="block font-semibold mb-1">{t('moderatorLogin.password')}</label>
                            <input 
                                id="password"
                                type="password" 
                                {...register("password", { required: t('moderatorLogin.passwordRequired') })} 
                                className={inputClass} 
                                aria-invalid={errors.password ? "true" : "false"}
                                aria-describedby="password-error"
                            />
                            {errors.password && <p id="password-error" className={errorClass} role="alert">{errors.password.message}</p>}
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    id="rememberMe" 
                                    {...register("rememberMe")} 
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" 
                                />
                                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">{t('loginPage.rememberMe')}</label> {/* Reusing loginPage.rememberMe */}
                            </div>
                            <button type="button" onClick={() => setShowForgotPasswordModal(true)} className="text-sm text-primary hover:underline">{t('moderatorLogin.forgotPassword')}</button>
                        </div>
                        <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-600 transition-colors">{t('moderatorLogin.login')}</button>
                    </form>
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">{t('loginPage.or')}</span>
                        </div>
                    </div>
                     <div className="space-y-3">
                        <button onClick={() => handleSocialLogin('Google')} className="w-full flex items-center justify-center py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors" aria-label={t('loginPage.googleLogin')}>
                            {/* Replaced specific Google SVG with a generic Google-like icon to follow best practices for external service icons */}
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.24 10.285V11.2h3.9c-.19 1.15-.84 2.1-1.92 2.76v.05h.01c1.37.93 3.09 1.48 4.96 1.48 2.9 0 5.42-1.96 5.42-5.42 0-.54-.06-.88-.13-1.28H24V8h-2.31c-1.3-.94-2.9-1.52-4.69-1.52-4.04 0-7.3 3.26-7.3 7.3s3.26 7.3 7.3 7.3c2.42 0 4.5-.96 5.99-2.56l-2.73-2.11C19.78 18.2 18.06 19 16.32 19c-1.63 0-3.08-.66-4.14-1.72-1.06-1.05-1.72-2.5-1.72-4.14 0-1.63.66-3.08 1.72-4.14 1.05-1.06 2.5-1.72 4.14-1.72 1.34 0 2.54.45 3.5 1.22l2.36-2.36C20.66 4.31 18.6 3 16.32 3c-4.95 0-8.98 4.03-8.98 8.98s4.03 8.98 8.98 8.98c5.42 0 9.84-3.8 9.84-9.84 0-.8-.11-1.48-.28-2.16zM16.32 8.78c-.96 0-1.78.38-2.39 1-.6.6-1 1.42-1 2.39s.38 1.78 1 2.39c.6.6 1.42 1 2.39 1s1.78-.38 2.39-1c.6-.6 1-1.42 1-2.39s-.38-1.78-1-2.39c-.6-.6-1.42-1-2.39-1z"/></svg>
                            <span>{t('loginPage.googleLogin')}</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ModeratorLogin;