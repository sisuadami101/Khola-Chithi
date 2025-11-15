
import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const ModeratorDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { t } = useLanguage();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { name: t('moderatorDashboard.performance'), path: '/moderator/dashboard' },
        { name: t('moderatorDashboard.myProfile'), path: '/moderator/profile' },
        { name: t('moderatorDashboard.myPosts'), path: '/moderator/posts' },
        { name: t('moderatorDashboard.writeBlog'), path: '/moderator/write-blog' },
    ];
    
    const activeLinkClass = 'bg-primary text-white';
    const inactiveLinkClass = 'hover:bg-secondary hover:text-text-dark';

    const sidebarContent = (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b text-center">
                <img src={user?.profilePicture || `https://i.pravatar.cc/150?u=${user?.id}`} alt="Profile" className="w-20 h-20 rounded-full object-cover mx-auto mb-2 border-2 border-primary" aria-hidden="true"/>
                <h2 className="text-xl font-bold font-heading">{user?.fullName}</h2>
                <p className="text-sm text-gray-500 capitalize">{user?.type}</p>
            </div>
            <nav className="flex-grow p-4 space-y-2">
                {navItems.map(item => (
                    <NavLink 
                        key={item.name}
                        to={item.path} 
                        end={item.path === '/moderator/dashboard'} // Use 'end' for the root dashboard link
                        onClick={() => setIsSidebarOpen(false)}
                        className={({ isActive }) => `flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg transition-colors ${isActive ? activeLinkClass : inactiveLinkClass}`}
                    >
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t">
                <button onClick={handleLogout} className="w-full bg-red-500 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-red-600 transition-all">
                    {t('nav.logout')}
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-background-light text-text-dark">
            {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} aria-label={t('common.closeSidebar')}></div>}
            <aside className={`fixed top-0 left-0 h-full w-64 bg-white shadow-md z-40 transform transition-transform md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {sidebarContent}
            </aside>
            <main className="flex-1 p-6 md:p-10 overflow-y-auto">
                <div className="md:hidden flex justify-between items-center mb-6 pb-4 border-b">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2" aria-label={t('common.openSidebar')}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                    <h2 className="text-lg font-bold font-heading">{t('moderatorDashboard.title')}</h2>
                    <div className="w-6" aria-hidden="true"></div>
                </div>
                <Outlet />
            </main>
        </div>
    );
};

export default ModeratorDashboard;