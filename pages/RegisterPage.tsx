
import React, { useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useData } from '../context/DataContext';
import { User } from '../types';
import { useLanguage } from '../context/LanguageContext';

type RegisterFormInputs = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
};

const RegisterPage: React.FC = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormInputs>();
    const password = useRef({});
    password.current = watch("password", "");
    const navigate = useNavigate();
    const { addUser, users } = useData();
    const { t } = useLanguage();

    const onSubmit: SubmitHandler<RegisterFormInputs> = data => {
        if (users.find(u => u.email === data.email)) {
            alert(t('registerPage.emailExists'));
            return;
        }

        const newUser: User = {
            id: `user_${new Date().getTime()}`,
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            password: data.password,
            type: 'user',
            engagementPoints: 0, // Initialize engagement points
            moods: [],
            warnings: [],
            awardedBadges: [],
            subscriptionStatus: 'none',
        };

        addUser(newUser);
        alert(t('registerPage.success'));
        navigate('/login');
    };

    const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary";
    const errorClass = "text-red-500 text-sm mt-1";

    return (
        <div className="flex flex-col min-h-screen bg-background-light">
            <Header />
            <main className="flex-grow flex items-center justify-center py-12">
                <div className="w-full max-w-md mx-auto bg-white p-8 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                    <h1 className="text-3xl font-bold text-text-dark text-center mb-6">{t('registerPage.title')}</h1>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label htmlFor="fullName" className="block font-semibold mb-1">{t('registerPage.fullName')}</label>
                            <input id="fullName" type="text" {...register("fullName", { required: t('common.fullNameRequired') })} className={inputClass} />
                            {errors.fullName && <p className={errorClass}>{errors.fullName.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="email" className="block font-semibold mb-1">{t('registerPage.email')}</label>
                            <input id="email" type="email" {...register("email", { required: t('loginPage.identifierRequired'), pattern: { value: /^\S+@\S+$/i, message: t('applyModeratorPage.validation.emailInvalid') }})} className={inputClass} />
                            {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="phone" className="block font-semibold mb-1">{t('registerPage.phone')}</label>
                            <input id="phone" type="tel" {...register("phone", { required: t('applyModeratorPage.validation.phoneRequired') })} className={inputClass} />
                            {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="password" className="block font-semibold mb-1">{t('registerPage.password')}</label>
                            <input id="password" type="password" {...register("password", { required: t('loginPage.passwordRequired'), minLength: { value: 6, message: t('registerPage.validation.passwordMinLength') } })} className={inputClass} />
                            {errors.password && <p className={errorClass}>{errors.password.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block font-semibold mb-1">{t('registerPage.confirmPassword')}</label>
                            <input id="confirmPassword" type="password" {...register("confirmPassword", { required: t('registerPage.validation.confirmPasswordRequired'), validate: value => value === password.current || t('registerPage.validation.passwordsMismatch') })} className={inputClass} />
                            {errors.confirmPassword && <p className={errorClass}>{errors.confirmPassword.message}</p>}
                        </div>
                        <div className="flex items-start">
                            <input type="checkbox" id="agreeTerms" {...register("agreeTerms", { required: t('registerPage.validation.agreeTermsRequired') })} className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded mt-1" />
                            <label htmlFor="agreeTerms" className="ml-2 text-sm">{t('registerPage.agreeTerms')} <a href="#" className="text-primary hover:underline">{t('registerPage.termsLink')}</a>{t('registerPage.agreeTermsSuffix')}</label>
                        </div>
                         {errors.agreeTerms && <p className={errorClass}>{errors.agreeTerms.message}</p>}
                        <button type="submit" className="w-full bg-accent text-text-dark py-3 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors">{t('registerPage.submit')}</button>
                    </form>
                    <div className="text-center mt-6">
                        <p className="text-sm">{t('registerPage.haveAccount')} <Link to="/login" className="text-primary font-bold hover:underline">{t('registerPage.loginHere')}</Link></p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default RegisterPage;
