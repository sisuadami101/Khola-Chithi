import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';

const AboutPage: React.FC = () => {
    const { t, language } = useLanguage();

    const bnContent = {
        inspiration: ` "The Miracle of Namiya General Store" - জাপানি লেখক কেইগো হিগাশিনোর এই অসাধারণ উপন্যাস এবং তার চলচ্চিত্র রূপান্তর আমাদের পথচলার মূল অনুপ্রেরণা। গল্পের নামিয়া জেনারেল স্টোরের মতো আমরাও এমন একটি ডিজিটাল আশ্রয় তৈরি করতে চেয়েছি, যেখানে আধুনিক জীবনের জটিলতায় হারিয়ে যাওয়া মানুষ নির্দ্বিধায় তাদের মনের গভীরের কথা, দুঃখ, এবং দ্বিধাগুলো খুলে বলতে পারে। আমরা বিশ্বাস করি, সঠিকভাবে শোনা এবং সহানুভূতির সাথে উত্তর দেওয়া কারো জীবনে ইতিবাচক পরিবর্তন আনার ক্ষমতা রাখে।`,
        mission: `আমাদের প্রধান লক্ষ্য হলো মানসিক স্বাস্থ্য এবং আবেগীয় সুস্থতা নিয়ে একটি খোলামেলা এবং বিচারহীন আলোচনার পরিবেশ তৈরি করা। আমরা এমন একটি কমিউনিটি গঠন করতে চাই যেখানে প্রত্যেকেই নিরাপদ বোধ করবে এবং জানবে যে তাদের কথা শোনার জন্য কেউ আছে। বেনামী থাকার সুবিধা দিয়ে আমরা নিশ্চিত করি, যাতে ব্যবহারকারীরা সামাজিক চাপ বা পরিচয়ের দ্বিধা ছাড়াই তাদের সবচেয়ে সংবেদনশীল সমস্যাগুলো শেয়ার করতে পারেন। আমাদের উদ্দেশ্য শুধু সাময়িক স্বস্তি দেওয়া নয়, বরং মানুষকে তাদের ভেতরের শক্তি খুঁজে পেতে এবং জীবনের চ্যালেঞ্জ মোকাবেলা করার জন্য নতুন দৃষ্টিভঙ্গি দিতে সাহায্য করা।`,
    };

    const enContent = {
        inspiration: `"The Miracle of Namiya General Store" - this extraordinary novel by Japanese author Keigo Higashino and its film adaptation are the core inspiration for our journey. Like the Namiya General Store in the story, we wanted to create a digital sanctuary where people lost in the complexities of modern life can freely express their deepest thoughts, sorrows, and dilemmas. We believe that the act of truly listening and responding with empathy has the power to bring positive change to someone's life.`,
        mission: `Our primary goal is to create an open and judgment-free environment for discussing mental health and emotional well-being. We aim to build a community where everyone feels safe and knows that there is someone to listen to them. By offering anonymity, we ensure that users can share their most sensitive issues without social pressure or identity concerns. Our purpose is not just to provide temporary relief, but to help people find their inner strength and gain new perspectives to face life's challenges.`,
    };

    const currentContent = language === 'bn' ? bnContent : enContent;

    return (
        <div className="bg-background-light">
            <Header />
            <main className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-text-dark text-center mb-8">{t('aboutPage.title')}</h1>
                    <img src="https://picsum.photos/800/400" alt={t('aboutPage.title')} className="rounded-lg shadow-lg mb-12"/>
                    
                    <div className="space-y-12 text-lg text-text-dark/90">
                        <section>
                            <h2 className="text-3xl font-bold text-primary mb-4 border-b-2 border-primary/30 pb-2">{t('aboutPage.inspirationTitle')}</h2>
                            <p className="leading-relaxed">
                                {currentContent.inspiration}
                            </p>
                        </section>
                        
                        <section>
                            <h2 className="text-3xl font-bold text-primary mb-4 border-b-2 border-primary/30 pb-2">{t('aboutPage.missionTitle')}</h2>
                            <p className="leading-relaxed">
                                {currentContent.mission}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-3xl font-bold text-primary mb-4 border-b-2 border-primary/30 pb-2">{t('aboutPage.howItWorksTitle')}</h2>
                            <div className="space-y-6">
                                <div className="p-6 bg-white rounded-lg shadow-sm border-l-4 border-accent">
                                    <h3 className="font-bold text-xl mb-2">{t('aboutPage.step1Title')}</h3>
                                    <p>{t('aboutPage.step1Body')}</p>
                                </div>
                                <div className="p-6 bg-white rounded-lg shadow-sm border-l-4 border-accent">
                                    <h3 className="font-bold text-xl mb-2">{t('aboutPage.step2Title')}</h3>
                                    <p>{t('aboutPage.step2Body')}</p>
                                </div>
                                <div className="p-6 bg-white rounded-lg shadow-sm border-l-4 border-accent">
                                    <h3 className="font-bold text-xl mb-2">{t('aboutPage.step3Title')}</h3>
                                    <p>{t('aboutPage.step3Body')}</p>
                                </div>
                            </div>
                        </section>

                        <section className="text-center bg-secondary/50 p-10 rounded-lg">
                            <h2 className="text-3xl font-bold text-text-dark mb-4">{t('aboutPage.notAloneTitle')}</h2>
                            <p className="text-xl">{t('aboutPage.notAloneBody')}</p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AboutPage;