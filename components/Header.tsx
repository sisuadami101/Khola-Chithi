
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';

const AnnouncementBanner: React.FC = () => {
    const { platformSettings } = useData();
    const { t } = useLanguage();
    const [isVisible, setIsVisible] = useState(true);
    
    const { message, isActive, type, scheduledDate, endDate } = platformSettings.siteAnnouncement;

    const today = new Date();
    const startDate = scheduledDate ? new Date(scheduledDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const isCurrent = isActive && isVisible && 
                      (!startDate || today >= startDate) && 
                      (!end || today <= end);

    if (!isCurrent) {
        return null;
    }

    const baseClasses = "w-full text-center p-2 text-sm text-white flex justify-center items-center gap-4 fixed top-0 left-0 z-[100]";
    const typeClasses = {
        info: 'bg-blue-500',
        warning: 'bg-yellow-500',
        success: 'bg-green-500',
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`}>
            <span>{message}</span>
            <button onClick={() => setIsVisible(false)} className="text-xl font-bold" aria-label={t('header.announcementDismiss')}>&times;</button>
        </div>
    );
};


const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const navigate = useNavigate();
    const { platformSettings } = useData();

    const handleLogout = () => {
        logout();
        navigate('/');
    };
    
    const toggleLanguage = () => {
        setLanguage(language === 'bn' ? 'en' : 'bn');
    };

    const navLinks = [
        { name: t('nav.home'), path: '/' },
        { name: t('nav.about'), path: '/about' },
        { name: t('nav.wallOfMemories'), path: '/wall-of-memories' },
        { name: t('nav.community'), path: '/community' },
        { name: t('nav.groups'), path: '/groups' },
        { name: t('nav.blog'), path: '/blog' },
        { name: t('nav.donate'), path: '/donate' },
    ];
    
    const today = new Date();
    const scheduledDate = platformSettings.siteAnnouncement.scheduledDate ? new Date(platformSettings.siteAnnouncement.scheduledDate) : null;
    const endDate = platformSettings.siteAnnouncement.endDate ? new Date(platformSettings.siteAnnouncement.endDate) : null;
    const isAnnouncementActive = platformSettings.siteAnnouncement.isActive && 
                                 (!scheduledDate || today >= scheduledDate) && 
                                 (!endDate || today <= endDate);
    
    const headerTopOffset = isAnnouncementActive ? 'top-[40px]' : 'top-0'; // Adjust based on announcement banner height

    return (
        <>
        <AnnouncementBanner />
        <header className={`sticky ${headerTopOffset} bg-background-light/80 backdrop-blur-sm shadow-md z-50 transition-all duration-300`}>
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    <Link to="/" className="flex items-center space-x-2">
                        <img src="https://picsum.photos/40/40" alt="Logo" className="h-10 w-10 rounded-full"/>
                        <span className="text-2xl font-heading font-bold text-text-dark">খোলা চিঠি</span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-2">
                         <button onClick={toggleLanguage} className="px-3 py-2 rounded-md text-sm font-semibold hover:bg-secondary transition-colors">
                            {language === 'bn' ? 'English' : 'বাংলা'}
                        </button>
                        {user ? (
                            <>
                                {user.subscriptionStatus === 'none' && <Link to="/subscribe" className="px-4 py-2 rounded-md text-primary font-bold hover:bg-secondary transition-colors animate-pulse">{t('nav.subscribe')}</Link>}
                                {user.type === 'user' && <Link to="/user/profile" className="px-4 py-2 rounded-md text-text-dark font-semibold hover:bg-secondary transition-colors">{t('nav.dashboard')}</Link>}
                                {user.type === 'moderator' && <Link to="/moderator/dashboard" className="px-4 py-2 rounded-md text-text-dark font-semibold hover:bg-secondary transition-colors">{t('nav.dashboard')}</Link>}
                                <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-red-600 transition-all">{t('nav.logout')}</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="px-4 py-2 rounded-md text-text-dark font-semibold hover:bg-secondary transition-colors">{t('nav.login')}</Link>
                                <Link to="/register" className="bg-accent text-text-dark px-4 py-2 rounded-lg shadow-sm hover:bg-yellow-500 transition-all font-bold">{t('nav.register')}</Link>
                            </>
                        )}
                    </div>

                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-text-dark focus:outline-none">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                        </button>
                    </div>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden pb-4">
                        <nav className="flex flex-col space-y-2">
                            {navLinks.map(link => (
                                <Link key={link.name} to={link.path} className="text-text-dark py-2 px-4 rounded-md hover:bg-secondary transition-colors">{link.name}</Link>
                            ))}
                             {user ? (
                                <>
                                    {user.subscriptionStatus === 'none' && <Link to="/subscribe" className="text-primary font-bold py-2 px-4 rounded-md hover:bg-secondary transition-colors">{t('nav.subscribe')}</Link>}
                                    <Link to={user.type === 'user' ? '/user/profile' : '/moderator/dashboard'} className="text-text-dark py-2 px-4 rounded-md hover:bg-secondary transition-colors">{t('nav.dashboard')}</Link>
                                    <button onClick={handleLogout} className="bg-red-500 text-white text-left mt-2 w-full px-4 py-2 rounded-lg shadow-sm hover:bg-red-600 transition-all">{t('nav.logout')}</button>
                                </>
                             ) : (
                                <>
                                    <Link to="/login" className="text-text-dark py-2 px-4 rounded-md hover:bg-secondary transition-colors">{t('nav.login')}</Link>
                                    <Link to="/register" className="bg-accent text-center text-text-dark mt-2 w-full px-4 py-2 rounded-lg shadow-sm hover:bg-yellow-500 transition-all font-bold">{t('nav.register')}</Link>
                                </>
                             )}
                              <button onClick={toggleLanguage} className="text-text-dark py-2 px-4 rounded-md hover:bg-secondary transition-colors mt-2 text-left">
                                {language === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
                            </button>
                        </nav>
                    </div>
                )}
            </div>
            <nav className="hidden md:flex justify-center items-center py-3 border-t border-gray-200">
                <ul className="flex space-x-8">
                    {navLinks.map(link => (
                        <li key={link.name}>
                            <Link to={link.path} className="text-text-dark font-semibold relative after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-0 after:h-[2px] after:bg-primary after:transition-all after:duration-300 hover:after:w-full">{link.name}</Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
        </>
    );
};

export default Header;
