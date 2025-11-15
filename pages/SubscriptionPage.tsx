
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const SubscriptionPage: React.FC = () => {
    const { subscriptionPlans, subscribeUser } = useData();
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleSubscribe = (planId: string) => {
        if (!user) {
            alert("Please log in to subscribe.");
            navigate('/login');
            return;
        }
        const plan = subscriptionPlans.find(p => p.id === planId);
        if (plan) {
            subscribeUser(user.id, plan);
            alert(t('subscriptionPage.success'));
            navigate('/user/profile');
        }
    };

    const yearlyPlan = subscriptionPlans.find(p => p.duration === 'yearly');
    const monthlyPlan = subscriptionPlans.find(p => p.duration === 'monthly');

    return (
        <div className="bg-background-light min-h-screen">
            <Header />
            <main className="container mx-auto px-4 py-16">
                <div className="text-center max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-text-dark">{t('subscriptionPage.title')}</h1>
                    <p className="mt-4 text-lg text-text-dark/80">{t('subscriptionPage.subtitle')}</p>
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {monthlyPlan && (
                         <Card className="flex flex-col p-8 border-2 border-gray-200">
                            <h2 className="text-2xl font-bold text-center">{monthlyPlan.name}</h2>
                            <p className="text-center text-4xl font-bold my-6">৳{monthlyPlan.price}<span className="text-lg font-normal text-gray-500">/{t('subscriptionPage.monthly')}</span></p>
                            <ul className="space-y-3 text-gray-600 mb-8">
                                {monthlyPlan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={() => handleSubscribe(monthlyPlan.id)} className="mt-auto w-full bg-primary text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-600 transition-colors">{t('subscriptionPage.subscribe')}</button>
                        </Card>
                    )}
                   
                    {yearlyPlan && (
                         <Card className="flex flex-col p-8 border-2 border-primary relative">
                             <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-accent text-text-dark px-4 py-1 rounded-full text-sm font-bold">{t('subscriptionPage.save')} 15%</div>
                            <h2 className="text-2xl font-bold text-center">{yearlyPlan.name}</h2>
                            <p className="text-center text-4xl font-bold my-6">৳{yearlyPlan.price}<span className="text-lg font-normal text-gray-500">/{t('subscriptionPage.yearly')}</span></p>
                            <ul className="space-y-3 text-gray-600 mb-8">
                                 {yearlyPlan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={() => handleSubscribe(yearlyPlan.id)} className="mt-auto w-full bg-accent text-text-dark py-3 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors">{t('subscriptionPage.subscribe')}</button>
                        </Card>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default SubscriptionPage;
