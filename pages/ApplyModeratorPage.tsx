
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useData } from '../context/DataContext';
import { ModeratorApplication } from '../types';
import { useLanguage } from '../context/LanguageContext';


interface IFormInput {
  fullName: string;
  age: number;
  phone: string;
  email: string;
  address: string;
  profession: string;
  reason: string;
}

const ApplyModeratorPage: React.FC = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<IFormInput>();
    const { addApplication } = useData();
    const { t } = useLanguage();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const onSubmit: SubmitHandler<IFormInput> = data => {
        setIsSubmitting(true);
        // Simulate network delay
        setTimeout(() => {
            const newApplication: ModeratorApplication = {
                id: `app_${new Date().getTime()}`,
                ...data,
                status: 'pending',
            };
            addApplication(newApplication);
            setIsSubmitting(false);
            setSubmitSuccess(true);
            reset();
        }, 1000);
    };

    const handleAnotherApplication = () => {
        setSubmitSuccess(false);
    }

    const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary";
    const errorClass = "text-red-500 text-sm mt-1";

    return (
        <div className="bg-background-light">
            <Header />
            <main className="container mx-auto px-4 py-16">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                    {submitSuccess ? (
                        <div className="text-center">
                            <svg className="mx-auto h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h2 className="mt-3 text-2xl font-bold text-text-dark">{t('applyModeratorPage.successMessageTitle')}</h2>
                            <p className="mt-2 text-text-dark/80">{t('applyModeratorPage.successMessage')}</p>
                            <button onClick={handleAnotherApplication} className="mt-6 bg-accent text-text-dark py-2 px-6 rounded-lg font-bold hover:bg-yellow-500 transition-colors">
                                {t('applyModeratorPage.anotherApplication')}
                            </button>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-3xl font-bold text-text-dark text-center mb-2">{t('applyModeratorPage.title')}</h1>
                            <p className="text-center text-text-dark/80 mb-8">{t('applyModeratorPage.subtitle')}</p>
                            
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div>
                                    <label htmlFor="fullName" className="block font-semibold mb-1">{t('applyModeratorPage.fullName')}</label>
                                    <input id="fullName" type="text" {...register("fullName", { required: t('common.fullNameRequired') })} className={inputClass} />
                                    {errors.fullName && <p className={errorClass}>{errors.fullName.message}</p>}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     <div>
                                        <label htmlFor="age" className="block font-semibold mb-1">{t('applyModeratorPage.age')}</label>
                                        <input id="age" type="number" {...register("age", { required: t('applyModeratorPage.validation.ageRequired'), min: { value: 18, message: t('applyModeratorPage.validation.ageMin')} })} className={inputClass} />
                                        {errors.age && <p className={errorClass}>{errors.age.message}</p>}
                                    </div>
                                     <div>
                                        <label htmlFor="phone" className="block font-semibold mb-1">{t('applyModeratorPage.phone')}</label>
                                        <input id="phone" type="tel" {...register("phone", { required: t('applyModeratorPage.validation.phoneRequired') })} className={inputClass} />
                                        {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
                                    </div>
                               </div>

                                <div>
                                    <label htmlFor="email" className="block font-semibold mb-1">{t('applyModeratorPage.email')}</label>
                                    <input id="email" type="email" {...register("email", { required: t('applyModeratorPage.validation.emailRequired'), pattern: { value: /^\S+@\S+$/i, message: t('applyModeratorPage.validation.emailInvalid') }})} className={inputClass} />
                                    {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                                </div>

                                <div>
                                    <label htmlFor="address" className="block font-semibold mb-1">{t('applyModeratorPage.address')}</label>
                                    <input id="address" type="text" {...register("address", { required: t('applyModeratorPage.validation.addressRequired') })} className={inputClass} />
                                    {errors.address && <p className={errorClass}>{errors.address.message}</p>}
                                </div>
                                
                                <div>
                                    <label htmlFor="profession" className="block font-semibold mb-1">{t('applyModeratorPage.profession')}</label>
                                    <input id="profession" type="text" {...register("profession", { required: t('applyModeratorPage.validation.professionRequired') })} className={inputClass} />
                                    {errors.profession && <p className={errorClass}>{errors.profession.message}</p>}
                                </div>

                                <div>
                                    <label htmlFor="reason" className="block font-semibold mb-1">{t('applyModeratorPage.reason')}</label>
                                    <textarea id="reason" {...register("reason", { required: t('applyModeratorPage.validation.reasonRequired') })} className={`${inputClass} h-32`}></textarea>
                                    {errors.reason && <p className={errorClass}>{errors.reason.message}</p>}
                                </div>
                                
                                <button type="submit" disabled={isSubmitting} className="w-full bg-accent text-text-dark py-3 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                                    {isSubmitting ? t('common.submitting') : t('applyModeratorPage.submit')}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ApplyModeratorPage;
