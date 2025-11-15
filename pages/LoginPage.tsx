
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';

type LoginFormInputs = {
  identifier: string;
  password: string;
  rememberMe: boolean; // Added for "Remember Me"
};

const LoginPage: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();
    const navigate = useNavigate();
    const { login } = useAuth();
    const { users } = useData();
    const { t } = useLanguage();

    const onSubmit: SubmitHandler<LoginFormInputs> = data => {
        const identifier = data.identifier.trim();
        // Find user by either email or phone number
        const foundUser = users.find(u => 
            (u.email === identifier || u.phone === identifier) && 
            u.password === data.password
        );
        
        if (foundUser) {
            // Check for suspension
            if (foundUser.suspendedUntil && new Date(foundUser.suspendedUntil) > new Date()) {
                alert(t('loginPage.suspendedAccount', { date: new Date(foundUser.suspendedUntil).toLocaleString(t('langName') === 'বাংলা' ? 'bn-BD' : 'en-US') }));
                return;
            }

            const { password, ...userToLogin } = foundUser;
            login(userToLogin, data.rememberMe); // Pass rememberMe state
            
            switch (foundUser.type) {
                case 'user':
                    navigate('/user/profile');
                    break;
                case 'admin':
                    navigate('/admin');
                    break;
                case 'moderator':
                     if (foundUser.isActive) {
                        navigate('/moderator/dashboard');
                     } else {
                        alert(t('loginPage.inactive'));
                     }
                     break;
                default:
                    navigate('/');
            }
        } else {
            alert(t('loginPage.error'));
        }
    };

    const handleSocialLogin = (provider: string) => {
        alert(t('loginPage.socialLoginComingSoon', { provider }));
    };

    const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary";
    const errorClass = "text-red-500 text-sm mt-1";

    return (
        <div className="flex flex-col min-h-screen bg-background-light">
            <Header />
            <main className="flex-grow flex items-center justify-center pt-12 pb-32 px-4">
                <div className="w-full max-w-md mx-auto bg-white p-8 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                    <h1 className="text-3xl font-bold text-text-dark text-center mb-6">{t('loginPage.title')}</h1>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label htmlFor="identifier" className="block font-semibold mb-1">{t('loginPage.emailOrPhone')}</label>
                            <input 
                                id="identifier"
                                type="text" 
                                {...register("identifier", { required: t('loginPage.identifierRequired') })} 
                                className={inputClass}
                                placeholder={t('loginPage.emailOrPhonePlaceholder')}
                            />
                            {errors.identifier && <p className={errorClass}>{errors.identifier.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="password" className="block font-semibold mb-1">{t('loginPage.password')}</label>
                            <input type="password" {...register("password", { required: t('loginPage.passwordRequired') })} className={inputClass} />
                            {errors.password && <p className={errorClass}>{errors.password.message}</p>}
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    id="rememberMe" 
                                    {...register("rememberMe")} 
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" 
                                />
                                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">{t('loginPage.rememberMe')}</label>
                            </div>
                            <a href="#" className="text-sm text-primary hover:underline">{t('loginPage.forgotPassword')}</a>
                        </div>
                        <button type="submit" className="w-full bg-accent text-text-dark py-3 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors">{t('nav.login')}</button>
                    </form>
                    <div className="text-center mt-6">
                        <p className="text-sm">{t('loginPage.noAccount')} <Link to="/register" className="text-primary font-bold hover:underline">{t('loginPage.registerHere')}</Link></p>
                    </div>
                     <div className="text-center mt-4">
                        <Link to="/moderator/login" className="text-gray-600 font-semibold hover:text-primary hover:underline text-sm">{t('loginPage.moderatorLoginLink')}</Link>
                    </div>
                     <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">{t('loginPage.or')}</span>
                        </div>
                    </div>
                     <div className="space-y-3">
                        <button onClick={() => handleSocialLogin('Google')} className="w-full flex items-center justify-center py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-semibold">
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691c-1.346 2.535-2.074 5.46-2.074 8.529s.728 5.994 2.074 8.529l-5.657 5.657C.261 34.046 0 29.268 0 24s.261-10.046 2.65-14.041l5.656 5.657z"></path><path fill="#4CAF50" d="M24 48c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 40.61 26.715 42 24 42c-4.971 0-9.266-3.373-10.734-7.962l-5.733 5.044C10.158 44.646 16.6 48 24 48z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path></svg>
                            <span>{t('loginPage.googleLogin')}</span>
                        </button>
                         <button onClick={() => handleSocialLogin('Facebook')} className="w-full flex items-center justify-center py-2.5 border border-transparent rounded-lg bg-[#1877F2] text-white hover:bg-[#166fe5] transition-colors font-semibold">
                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg>
                            <span>{t('loginPage.facebookLogin')}</span>
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default LoginPage;
