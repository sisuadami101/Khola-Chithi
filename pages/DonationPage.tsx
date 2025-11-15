
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useData } from '../context/DataContext';
import { Donor, PaymentMethod } from '../types';
import { useLanguage } from '../context/LanguageContext';

type Step = 'form' | 'payment' | 'proof';

interface DonationInfo {
    name: string;
    email: string;
    phone: string;
    amount: number;
    message: string;
    isAnonymous: boolean;
}

interface ProofInfo {
    paymentMethod: string;
    transactionId: string;
    senderInfo: string;
    proofImage: FileList;
}

const DonationPage: React.FC = () => {
    const [step, setStep] = useState<Step>('form');
    const [donationInfo, setDonationInfo] = useState<DonationInfo | null>(null);
    const { addDonation, paymentMethods } = useData();
    const { t } = useLanguage();
    const navigate = useNavigate();
    
    const { register: registerForm, handleSubmit: handleFormSubmit, formState: { errors: formErrors } } = useForm<DonationInfo>();
    const { register: registerProof, handleSubmit: handleProofSubmit, formState: { errors: proofErrors } } = useForm<ProofInfo>();

    const onFormSubmit: SubmitHandler<DonationInfo> = data => {
        setDonationInfo(data);
        setStep('payment');
    };

    const onProofSubmit: SubmitHandler<ProofInfo> = data => {
        if (!donationInfo) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const newDonation: Omit<Donor, 'id' | 'date' | 'status'> = {
                ...donationInfo,
                amount: Number(donationInfo.amount),
                paymentMethod: data.paymentMethod,
                transactionId: data.transactionId,
                senderInfo: data.senderInfo,
                proofImageUrl: reader.result as string,
            };
            addDonation(newDonation);
            alert(t('donationPage.successMessage'));
            navigate('/');
        };
        reader.readAsDataURL(data.proofImage[0]);
    };

    const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary";
    const errorClass = "text-red-500 text-sm mt-1";

    const renderStep = () => {
        switch (step) {
            case 'form':
                return (
                    <form onSubmit={handleFormSubmit(onFormSubmit)} className="space-y-6">
                        <div>
                            <label className="block font-semibold mb-1">{t('donationPage.name')}</label>
                            <input type="text" {...registerForm("name", { required: t('donationPage.validation.nameRequired') })} className={inputClass} />
                            {formErrors.name && <p className={errorClass}>{formErrors.name.message}</p>}
                        </div>
                         <div>
                            <label className="block font-semibold mb-1">{t('donationPage.email')}</label>
                            <input type="email" {...registerForm("email", { required: t('donationPage.validation.emailRequired') })} className={inputClass} />
                            {formErrors.email && <p className={errorClass}>{formErrors.email.message}</p>}
                        </div>
                         <div>
                            <label className="block font-semibold mb-1">{t('donationPage.phone')}</label>
                            <input type="tel" {...registerForm("phone", { required: t('donationPage.validation.phoneRequired') })} className={inputClass} />
                            {formErrors.phone && <p className={errorClass}>{formErrors.phone.message}</p>}
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">{t('donationPage.amount')}</label>
                            <input type="number" {...registerForm("amount", { required: t('donationPage.validation.amountRequired'), min: { value: 10, message: t('donationPage.validation.amountMin')} })} className={inputClass} />
                            {formErrors.amount && <p className={errorClass}>{formErrors.amount.message}</p>}
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">{t('donationPage.message')}</label>
                            <textarea {...registerForm("message")} className={`${inputClass} h-24`} placeholder={t('donationPage.messagePlaceholder')}></textarea>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" id="isAnonymous" {...registerForm("isAnonymous")} className="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded" />
                            <label htmlFor="isAnonymous" className="ml-2">{t('donationPage.anonymous')}</label>
                        </div>
                        <button type="submit" className="w-full bg-accent text-text-dark py-3 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors">{t('donationPage.nextStep')}</button>
                    </form>
                );

            case 'payment':
                return (
                    <div>
                        <h2 className="text-2xl font-bold font-heading text-primary mb-4">{t('donationPage.paymentModal.title')}</h2>
                        <p className="text-text-dark/80 mb-6">
                            {t('donationPage.paymentModal.body')} <strong>৳{donationInfo?.amount.toLocaleString('bn-BD')}</strong> {t('donationPage.paymentModal.bodySuffix')}
                        </p>
                        <div className="space-y-4 text-left max-h-60 overflow-y-auto p-4 bg-gray-50 rounded-lg">
                            {paymentMethods.filter(m => m.isActive).map(method => (
                                <div key={method.id} className="p-3 border rounded-lg bg-white">
                                    <h3 className="font-bold">{method.provider} ({method.type === 'mobile' ? 'Send Money' : 'Bank Transfer'})</h3>
                                    {method.type === 'mobile' && <p>Number: <span className="font-mono">{method.details.number}</span></p>}
                                    {method.type === 'bank' && (
                                        <>
                                            <p>A/C Name: {method.details.name}</p>
                                            <p>A/C Number: <span className="font-mono">{method.details.account}</span></p>
                                            <p>Branch: {method.details.branch}</p>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setStep('proof')} className="mt-8 w-full bg-accent text-text-dark py-3 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors">{t('donationPage.paymentModal.cta')}</button>
                    </div>
                );

            case 'proof':
                return (
                    <form onSubmit={handleProofSubmit(onProofSubmit)} className="space-y-6">
                        <div>
                            <label className="block font-semibold mb-1">{t('donationPage.proof.method')}</label>
                            <select {...registerProof("paymentMethod", { required: true })} className={inputClass}>
                                {paymentMethods.filter(m => m.isActive).map(m => (
                                    <option key={m.id} value={m.provider}>{m.provider}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">{t('donationPage.proof.transactionId')}</label>
                            <input type="text" {...registerProof("transactionId", { required: t('donationPage.validation.transactionIdRequired') })} className={inputClass} />
                            {proofErrors.transactionId && <p className={errorClass}>{proofErrors.transactionId.message}</p>}
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">{t('donationPage.proof.senderInfo')}</label>
                            <input type="text" {...registerProof("senderInfo", { required: t('donationPage.validation.senderInfoRequired') })} className={inputClass} placeholder={t('donationPage.proof.senderInfoPlaceholder')} />
                            {proofErrors.senderInfo && <p className={errorClass}>{proofErrors.senderInfo.message}</p>}
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">{t('donationPage.proof.screenshot')}</label>
                            <input type="file" {...registerProof("proofImage", { required: t('donationPage.validation.proofImageRequired') })} accept="image/png, image/jpeg" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-text-dark hover:file:bg-primary/50" />
                            {proofErrors.proofImage && <p className={errorClass}>{proofErrors.proofImage.message}</p>}
                        </div>
                        <button type="submit" className="w-full bg-accent text-text-dark py-3 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors">{t('donationPage.submit')}</button>
                    </form>
                );
        }
    };

    return (
        <div className="bg-background-light min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-16">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                    <h1 className="text-3xl font-bold text-text-dark text-center mb-2">{t('donationPage.title')}</h1>
                    <p className="text-center text-text-dark/80 mb-8">
                        {step === 'form' && t('donationPage.subtitle')}
                        {step === 'payment' && t('donationPage.paymentSubtitle')}
                        {step === 'proof' && t('donationPage.proofSubtitle')}
                    </p>
                    {renderStep()}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default DonationPage;
