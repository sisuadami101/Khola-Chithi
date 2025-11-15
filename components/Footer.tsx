
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const UrgentHelpModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useLanguage();
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-2xl font-bold" aria-label={t('common.cancel')}>&times;</button>
                <h2 className="text-2xl font-bold font-heading text-red-600 mb-4">{t('footer.urgentHelpModal.title')}</h2>
                <p className="text-text-dark/80 mb-6">
                    {t('footer.urgentHelpModal.body')}
                </p>
                <div className="space-y-3 text-left">
                    <p><strong>{t('footer.urgentHelpModal.helpline1')}</strong> <a href="tel:+880123456789" className="text-primary hover:underline">0123456789</a></p>
                    <p><strong>{t('footer.urgentHelpModal.helpline2')}</strong> <a href="tel:+880123456789" className="text-primary hover:underline">0123456789</a> (মানসিক সহায়তার জন্য একটি হেল্পলাইন)</p>
                </div>
            </div>
        </div>
    );
};

const Footer: React.FC = () => {
    const [isScrollVisible, setIsScrollVisible] = useState(false);
    const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);
    const { t } = useLanguage();

    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsScrollVisible(true);
        } else {
            setIsScrollVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <>
            {isHelpModalVisible && <UrgentHelpModal onClose={() => setIsHelpModalVisible(false)} />}
            <footer className="bg-secondary text-text-dark pt-12 pb-8 mt-16">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-xl font-heading font-bold mb-4">খোলা চিঠি</h3>
                        <p className="text-sm">{t('footer.tagline')}</p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">{t('footer.linksTitle')}</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/about" className="hover:text-primary">{t('nav.about')}</Link></li>
                            <li><a href="#" className="hover:text-primary">{t('footer.privacyPolicy')}</a></li>
                            <li><a href="#" className="hover:text-primary">{t('footer.terms')}</a></li>
                            <li><a href="#" className="hover:text-primary">{t('footer.contact')}</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">{t('footer.getInvolvedTitle')}</h4>
                         <ul className="space-y-2 text-sm">
                            <li><Link to="/apply-moderator" className="hover:text-primary">{t('footer.becomeModerator')}</Link></li>
                            <li><Link to="/donate" className="hover:text-primary">{t('nav.donate')}</Link></li>
                            <li><Link to="/blog" className="hover:text-primary">{t('footer.readBlog')}</Link></li>
                            <li><Link to="/wall-of-memories" className="hover:text-primary">{t('nav.wallOfMemories')}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">{t('footer.socialMediaTitle')}</h4>
                        <div className="flex space-x-4">
                            {/* Placeholder icons */}
                            <a href="#" className="text-text-dark hover:text-primary" aria-label="Facebook"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></a>
                            <a href="#" className="text-text-dark hover:text-primary" aria-label="Twitter"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg></a>
                            <a href="#" className="text-text-dark hover:text-primary" aria-label="Instagram"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a>
                        </div>
                    </div>
                </div>
                <div className="text-center text-sm mt-8 border-t border-primary/20 pt-6">
                    <p>&copy; {new Date().getFullYear()} kholachitthi.com. {t('footer.copyright')}</p>
                </div>
                <button onClick={() => setIsHelpModalVisible(true)} className="fixed bottom-20 right-5 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-600 focus:outline-none transition-all duration-300 animate-pulse">
                    {t('footer.urgentHelp')}
                </button>
                 {isScrollVisible && (
                    <button onClick={scrollToTop} className="fixed bottom-5 right-5 bg-accent text-text-dark p-3 rounded-full shadow-lg hover:bg-yellow-500 focus:outline-none transition-all duration-300" aria-label={t('footer.scrollToTop')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                    </button>
                )}
            </footer>
        </>
    );
};

export default Footer;