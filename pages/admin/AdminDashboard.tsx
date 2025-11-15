
import React, { useState, useMemo, ReactNode, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { LetterStatus, ModeratorApplication, User, Post, Blog, Badge, Resource, PlatformSettings, Donor, PaymentMethod, RevenueData, ModeratorPayout, Memory, UserReward, Letter, AdSlot, AdCreative, AdCampaign, AdSlotType } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

type AdminSection = 'dashboard' | 'users' | 'posts' | 'blogs' | 'applications' | 'moderators' | 'badges' | 'resources' | 'donations' | 'settings' | 'monetization' | 'memories' | 'letters' | 'blog-approval' | 'ad-management'; // Added 'ad-management'

// --- SECTIONS ---
const DashboardSection: React.FC = () => {
    const { users, letters, donors, applications, posts, blogs } = useData();
    const { t } = useLanguage();

    const pendingBlogCount = blogs.filter(b => b.status === 'pending').length;

    return (
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">{t('adminDashboard.overview.title')}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-blue-100"><h4 className="font-bold">{t('adminDashboard.overview.totalUsers')}</h4><p className="text-3xl">{users.filter(u => u.type === 'user').length}</p></Card>
                <Card className="bg-green-100"><h4 className="font-bold">{t('adminDashboard.overview.totalModerators')}</h4><p className="text-3xl">{users.filter(u => u.type === 'moderator').length}</p></Card>
                <Card className="bg-yellow-100"><h4 className="font-bold">{t('adminDashboard.overview.pendingLetters')}</h4><p className="text-3xl">{letters.filter(l => l.status === LetterStatus.PENDING).length}</p></Card>
                <Card className="bg-red-100"><h4 className="font-bold">{t('adminDashboard.overview.totalDonation')}</h4><p className="text-3xl">৳{donors.reduce((acc, d) => acc + d.amount, 0).toLocaleString(t('langName') === 'বাংলা' ? 'bn-BD' : 'en-US')}</p></Card>
            </div>
             <Card>
                <h2 className="text-xl font-bold mb-4">{t('adminDashboard.overview.importantActions')}</h2>
                <div className="space-y-3">
                    <div className="flex justify-between items-center bg-yellow-50 p-3 rounded"><span>{t('adminDashboard.overview.newApplications')}</span><span className="font-bold text-lg">{applications.filter(a => a.status === 'pending').length}</span></div>
                    <div className="flex justify-between items-center bg-red-50 p-3 rounded"><span>{t('adminDashboard.overview.reportedPosts')}</span><span className="font-bold text-lg">{posts.filter(p => p.isReported && !p.isHidden).length}</span></div>
                    <div className="flex justify-between items-center bg-purple-50 p-3 rounded"><span>{t('adminDashboard.overview.escalatedToAdmin')}</span><span className="font-bold text-lg">{posts.filter(p => p.escalatedToAdmin).length}</span></div>
                    <div className="flex justify-between items-center bg-blue-50 p-3 rounded"><span>{t('adminDashboard.overview.pendingBlogApproval')}</span><span className="font-bold text-lg">{pendingBlogCount}</span></div>
                </div>
            </Card>
        </div>
    );
};

const UserManagementSection: React.FC = () => {
    const { users, updateUser, deleteUser, warnUser, suspendUser } = useData();
    const { user: adminUser } = useAuth(); // Get current admin user for warning issuerId
    const { t, language } = useLanguage();
    const [filter, setFilter] = useState({ role: 'all', term: '' });
    const filteredUsers = useMemo(() => users.filter(u => (filter.role === 'all' || u.type === filter.role) && (u.fullName.toLowerCase().includes(filter.term.toLowerCase()) || u.email.toLowerCase().includes(filter.term.toLowerCase()))), [users, filter]);
    return (
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">{t('adminDashboard.userManagement.title')}</h1>
            <Card className="mb-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder={t('adminDashboard.userManagement.searchPlaceholder')} value={filter.term} onChange={e => setFilter(f => ({...f, term: e.target.value}))} className="w-full p-2 border rounded-md" aria-label={t('adminDashboard.userManagement.searchPlaceholder')}/>
                <select value={filter.role} onChange={e => setFilter(f => ({...f, role: e.target.value}))} className="w-full p-2 border rounded-md" aria-label={t('adminDashboard.userManagement.allRoles')}>
                    <option value="all">{t('adminDashboard.userManagement.allRoles')}</option><option value="user">{t('adminDashboard.userManagement.userRole')}</option><option value="moderator">{t('adminDashboard.userManagement.moderatorRole')}</option><option value="admin">{t('adminDashboard.userManagement.adminRole')}</option>
                </select>
            </div></Card>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full min-w-max text-sm text-left text-gray-500" aria-label={t('adminDashboard.userManagement.title')}>
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr>
                        <th scope="col" className="px-6 py-3">{t('adminDashboard.userManagement.table.name')}</th>
                        <th scope="col" className="px-6 py-3">{t('adminDashboard.userManagement.table.email')}</th>
                        <th scope="col" className="px-6 py-3">{t('adminDashboard.userManagement.table.role')}</th>
                        <th scope="col" className="px-6 py-3">{t('adminDashboard.userManagement.table.status')}</th>
                        <th scope="col" className="px-6 py-3 text-right">{t('adminDashboard.userManagement.table.actions')}</th>
                    </tr></thead>
                    <tbody>{filteredUsers.map(user => (
                        <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{user.fullName}</td><td className="px-6 py-4">{user.email}</td>
                            <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${user.type === 'admin' ? 'bg-red-200 text-red-800' : user.type === 'moderator' ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800'}`}>{user.type}</span></td>
                            <td className="px-6 py-4 text-xs font-bold">
                                {user.suspendedUntil && new Date(user.suspendedUntil) > new Date() ? `${t('adminDashboard.userManagement.suspendedUntil')} ${new Date(user.suspendedUntil).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}` : 
                                user.type === 'moderator' ? (user.isActive ? t('adminDashboard.userManagement.active') : t('adminDashboard.userManagement.inactive')) : t('adminDashboard.userManagement.active')}
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                                <button onClick={() => { 
                                    const reason = prompt(t('adminDashboard.userManagement.warnReasonPrompt')); 
                                    if(reason && adminUser) warnUser(user.id, reason, 'admin', adminUser.id); 
                                }} className="font-medium text-yellow-600 hover:underline">{t('adminDashboard.userManagement.warn')}</button>
                                <button onClick={() => { 
                                    const daysStr = prompt(t('adminDashboard.userManagement.suspendDaysPrompt')); 
                                    const days = parseInt(daysStr || '0');
                                    if(!isNaN(days) && days > 0) suspendUser(user.id, days); 
                                }} className="font-medium text-orange-600 hover:underline">{t('adminDashboard.userManagement.suspend')}</button>
                                <button onClick={() => deleteUser(user.id)} className="font-medium text-red-600 hover:underline">{t('common.delete')}</button>
                            </td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
        </div>
    );
};

const PostManagementSection: React.FC = () => {
    const { posts, users, deletePost, hidePost, dismissReport, escalatePost } = useData();
    const { t } = useLanguage();
    const [filter, setFilter] = useState<'all' | 'reported' | 'hidden' | 'escalated'>('reported'); // Default to reported
    
    const filteredPosts = useMemo(() => posts.filter(p => {
        if (filter === 'reported') return p.isReported && !p.isHidden;
        if (filter === 'hidden') return p.isHidden;
        if (filter === 'escalated') return p.escalatedToAdmin;
        return true;
    }), [posts, filter]);

    return (
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">{t('adminDashboard.postManagement.title')}</h1>
            <div className="mb-4">
                <select onChange={e => setFilter(e.target.value as any)} value={filter} className="p-2 border rounded-md" aria-label={t('adminDashboard.postManagement.filterPosts')}>
                    <option value="reported">{t('adminDashboard.postManagement.reported')}</option>
                    <option value="hidden">{t('adminDashboard.postManagement.hidden')}</option>
                    <option value="escalated">{t('adminDashboard.postManagement.escalated')}</option>
                    <option value="all">{t('adminDashboard.postManagement.allPosts')}</option>
                </select>
            </div>
            <div className="space-y-4">{filteredPosts.map(post => (
                <Card key={post.id} className={`${post.isReported ? 'border-l-4 border-yellow-500' : ''} ${post.isHidden ? 'opacity-70' : ''}`}>
                    <p className="text-gray-800">{post.content}</p>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t text-sm">
                        <p className="text-xs text-gray-500">
                            {t('adminDashboard.postManagement.author')}: {users.find(u => u.id === post.userId)?.fullName || 'Unknown'}
                            {post.isReported && <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">{t('adminDashboard.postManagement.reported')} ({post.reportedBy?.length || 0})</span>}
                            {post.escalatedToAdmin && <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">{t('adminDashboard.postManagement.escalated')}</span>}
                        </p>
                        <div className="space-x-2">
                            <button onClick={() => deletePost(post.id)} className="font-medium text-red-600 hover:underline">{t('common.delete')}</button>
                            <button onClick={() => hidePost(post.id, !post.isHidden)} className="font-medium text-orange-600 hover:underline">{post.isHidden ? t('adminDashboard.postManagement.unhide') : t('adminDashboard.postManagement.hide')}</button>
                            {post.isReported && <button onClick={() => dismissReport(post.id)} className="font-medium text-green-600 hover:underline">{t('adminDashboard.postManagement.dismissReport')}</button>}
                            {!post.escalatedToAdmin && post.isReported && <button onClick={() => escalatePost(post.id, true)} className="font-medium text-purple-600 hover:underline">{t('adminDashboard.postManagement.escalate')}</button>}
                        </div>
                    </div>
                </Card>
            ))}</div>
        </div>
    );
};

const BlogManagementSection: React.FC = () => {
    const { blogs, deleteBlog } = useData();
    const { t, language } = useLanguage();
    const [filter, setFilter] = useState<'all' | 'published' | 'pending' | 'rejected'>('all');
    const filteredBlogs = useMemo(() => blogs.filter(b => filter === 'all' || b.status === filter), [blogs, filter]);

    return (
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">{t('adminDashboard.blogs.title')}</h1>
            <div className="mb-4">
                <select onChange={e => setFilter(e.target.value as any)} value={filter} className="p-2 border rounded-md" aria-label={t('adminDashboard.blogs.filterBlogs')}>
                    <option value="all">{t('adminDashboard.blogs.allBlogs')}</option>
                    <option value="published">{t('adminDashboard.blogs.published')}</option>
                    <option value="pending">{t('adminDashboard.blogs.pending')}</option>
                    <option value="rejected">{t('adminDashboard.blogs.rejected')}</option>
                </select>
            </div>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full min-w-max text-sm text-left text-gray-500" aria-label={t('adminDashboard.blogs.list')}>
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr>
                        <th scope="col" className="px-6 py-3">{t('adminDashboard.blogs.table.title')}</th>
                        <th scope="col" className="px-6 py-3">{t('adminDashboard.blogs.table.author')}</th>
                        <th scope="col" className="px-6 py-3">{t('adminDashboard.blogs.table.category')}</th>
                        <th scope="col" className="px-6 py-3">{t('adminDashboard.blogs.table.status')}</th>
                        <th scope="col" className="px-6 py-3 text-right">{t('adminDashboard.blogs.table.actions')}</th>
                    </tr></thead>
                    <tbody>{filteredBlogs.map(blog => (
                        <tr key={blog.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{blog.title}</td>
                            <td className="px-6 py-4">{blog.author}</td>
                            <td className="px-6 py-4">{t(`blogPage.categories.${blog.category.toLowerCase().replace(/\s/g, '')}`)}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${blog.status === 'published' ? 'bg-green-200 text-green-800' : blog.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'}`}>
                                    {t(`adminDashboard.blogs.${blog.status}`)}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => deleteBlog(blog.id)} className="font-medium text-red-600 hover:underline">{t('common.delete')}</button>
                            </td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
        </div>
    );
};

const BlogApprovalSection: React.FC = () => {
    const { blogs, approveBlog, rejectBlog } = useData();
    const { t, language } = useLanguage();
    const pendingBlogs = useMemo(() => blogs.filter(b => b.status === 'pending'), [blogs]);

    return (
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">{t('adminDashboard.blogApproval.title')}</h1>
            {pendingBlogs.length > 0 ? (
                <div className="space-y-4">{pendingBlogs.map(blog => (
                    <Card key={blog.id} className="border-l-4 border-yellow-500">
                        <h3 className="font-bold text-lg mb-1">{blog.title}</h3>
                        <p className="text-sm text-gray-600">{t('adminDashboard.blogApproval.submittedBy')}: {blog.author} on {new Date(blog.date).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}</p>
                        <p className="text-sm text-gray-700 mt-2">{blog.excerpt}</p>
                        <div className="flex justify-end space-x-2 mt-4">
                            <button onClick={() => approveBlog(blog.id)} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600">{t('adminDashboard.blogApproval.approve')}</button>
                            <button onClick={() => rejectBlog(blog.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600">{t('adminDashboard.blogApproval.reject')}</button>
                        </div>
                    </Card>
                ))}</div>
            ) : (
                <Card className="text-center p-6 text-gray-500">
                    <p>{t('adminDashboard.blogApproval.noPendingBlogs')}</p>
                </Card>
            )}
        </div>
    );
};

const ApplicationManagementSection: React.FC = () => {
    const { applications, approveApplication, rejectApplication } = useData();
    const { t, language } = useLanguage();
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const filteredApplications = useMemo(() => applications.filter(app => filter === 'all' || app.status === filter), [applications, filter]);

    return (
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">{t('adminDashboard.applications.title')}</h1>
            <div className="mb-4">
                <select onChange={e => setFilter(e.target.value as any)} value={filter} className="p-2 border rounded-md" aria-label={t('adminDashboard.applications.filterApplications')}>
                    <option value="pending">{t('adminDashboard.applications.pending')}</option>
                    <option value="approved">{t('adminDashboard.applications.approved')}</option>
                    <option value="rejected">{t('adminDashboard.applications.rejected')}</option>
                    <option value="all">{t('adminDashboard.applications.allApplications')}</option>
                </select>
            </div>
            <div className="space-y-4">{filteredApplications.map(app => (
                <Card key={app.id} className={`${app.status === 'pending' ? 'border-l-4 border-yellow-500' : ''}`}>
                    <h3 className="font-bold text-lg">{app.fullName}</h3>
                    <p className="text-sm text-gray-600">{app.email} | {app.phone}</p>
                    <p className="text-sm text-gray-600 mt-1">{app.age} {t('adminDashboard.applications.yearsOld')} | {app.profession}</p>
                    <p className="text-sm mt-2">{app.reason}</p>
                    <div className="flex justify-end space-x-2 mt-4">
                        {app.status === 'pending' && (
                            <>
                                <button onClick={() => approveApplication(app)} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600">{t('adminDashboard.applications.approve')}</button>
                                <button onClick={() => rejectApplication(app.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600">{t('adminDashboard.applications.reject')}</button>
                            </>
                        )}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${app.status === 'approved' ? 'bg-green-200 text-green-800' : app.status === 'rejected' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>
                            {t(`adminDashboard.applications.${app.status}`)}
                        </span>
                    </div>
                </Card>
            ))}</div>
        </div>
    );
};

const ModeratorManagementSection: React.FC = () => {
    const { users, toggleModeratorStatus, deleteUser, warnUser, suspendUser } = useData();
    const { user: adminUser } = useAuth();
    const { t, language } = useLanguage();
    const moderators = useMemo(() => users.filter(u => u.type === 'moderator'), [users]);

    return (
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">{t('adminDashboard.moderators.title')}</h1>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full min-w-max text-sm text-left text-gray-500" aria-label={t('adminDashboard.moderators.title')}>
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr>
                        <th scope="col" className="px-6 py-3">{t('adminDashboard.moderators.name')}</th>
                        <th scope="col" className="px-6 py-3">{t('adminDashboard.moderators.email')}</th>
                        <th scope="col" className="px-6 py-3">{t('adminDashboard.moderators.serial')}</th>
                        <th scope="col" className="px-6 py-3">{t('adminDashboard.moderators.status')}</th>
                        <th scope="col" className="px-6 py-3 text-right">{t('adminDashboard.moderators.actions')}</th>
                    </tr></thead>
                    <tbody>{moderators.map(mod => (
                        <tr key={mod.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{mod.fullName}</td>
                            <td className="px-6 py-4">{mod.email}</td>
                            <td className="px-6 py-4">{mod.serialNumber}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${mod.isActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                    {mod.isActive ? t('adminDashboard.userManagement.active') : t('adminDashboard.userManagement.inactive')}
                                </span>
                                {mod.suspendedUntil && new Date(mod.suspendedUntil) > new Date() &&
                                    <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-orange-200 text-orange-800">
                                        {t('adminDashboard.userManagement.suspendedUntil')} {new Date(mod.suspendedUntil).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}
                                    </span>
                                }
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                                <button onClick={() => toggleModeratorStatus(mod.id)} className="font-medium text-blue-600 hover:underline">
                                    {mod.isActive ? t('adminDashboard.moderatorManagement.deactivate') : t('adminDashboard.moderatorManagement.activate')}
                                </button>
                                <button onClick={() => { 
                                    const reason = prompt(t('adminDashboard.userManagement.warnReasonPrompt')); 
                                    if(reason && adminUser) warnUser(mod.id, reason, 'admin', adminUser.id); 
                                }} className="font-medium text-yellow-600 hover:underline">{t('adminDashboard.userManagement.warn')}</button>
                                <button onClick={() => { 
                                    const daysStr = prompt(t('adminDashboard.userManagement.suspendDaysPrompt')); 
                                    const days = parseInt(daysStr || '0');
                                    if(!isNaN(days) && days > 0) suspendUser(mod.id, days); 
                                }} className="font-medium text-orange-600 hover:underline">{t('adminDashboard.userManagement.suspend')}</button>
                                <button onClick={() => deleteUser(mod.id)} className="font-medium text-red-600 hover:underline">{t('common.delete')}</button>
                            </td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
        </div>
    );
};

const BadgeManagementSection: React.FC = () => {
    const { badges, addBadge, deleteBadge, users, awardBadgeToUser } = useData();
    const { t } = useLanguage();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<Omit<Badge, 'id'>>();
    const [selectedUserForBadge, setSelectedUserForBadge] = useState<User | null>(null);
    const [selectedBadgeToAward, setSelectedBadgeToAward] = useState<string | null>(null);

    const onSubmit: SubmitHandler<Omit<Badge, 'id'>> = (data) => {
        addBadge(data);
        reset();
        alert(t('adminDashboard.badges.awardSuccess')); // Re-used for badge added confirmation
    };

    const handleAwardBadge = () => {
        if (selectedUserForBadge && selectedBadgeToAward) {
            awardBadgeToUser(selectedUserForBadge.id, selectedBadgeToAward, 'admin_1'); // Assuming admin_1 awards
            setSelectedUserForBadge(null);
            setSelectedBadgeToAward(null);
            alert(t('adminDashboard.badges.awardSuccess'));
        } else {
            alert(t('adminDashboard.badges.awardError'));
        }
    };

    const activeUsers = useMemo(() => users.filter(u => u.type === 'user'), [users]);

    const inputClass = "w-full p-2 border rounded-md";
    const errorClass = "text-red-500 text-sm mt-1";

    return (
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">{t('adminDashboard.badges.title')}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <h2 className="text-xl font-bold mb-4">{t('adminDashboard.badges.addBadge')}</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block font-semibold mb-1">{t('adminDashboard.badges.form.nameKey')}</label>
                            <input type="text" {...register("nameKey", { required: true })} className={inputClass} placeholder={t('adminDashboard.badges.form.nameKeyPlaceholder')} />
                            {errors.nameKey && <p className={errorClass}>{t('adminDashboard.badges.form.nameKeyRequired')}</p>}
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">{t('adminDashboard.badges.form.descKey')}</label>
                            <input type="text" {...register("descriptionKey", { required: true })} className={inputClass} placeholder={t('adminDashboard.badges.form.descKeyPlaceholder')} />
                            {errors.descriptionKey && <p className={errorClass}>{t('adminDashboard.badges.form.descKeyRequired')}</p>}
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">{t('adminDashboard.badges.form.icon')}</label>
                            <input type="text" {...register("icon", { required: true })} className={inputClass} placeholder={t('adminDashboard.badges.form.iconPlaceholder')} />
                            {errors.icon && <p className={errorClass}>{t('adminDashboard.badges.form.iconRequired')}</p>}
                        </div>
                        <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-blue-600">{t('adminDashboard.badges.addBadge')}</button>
                    </form>
                </Card>
                <Card>
                    <h2 className="text-xl font-bold mb-4">{t('adminDashboard.badges.allBadges')}</h2>
                    <div className="space-y-3">
                        {badges.map(badge => (
                            <div key={badge.id} className="flex justify-between items-center p-2 border rounded-md bg-gray-50">
                                <div className="flex items-center space-x-2">
                                    <span className="text-2xl">{badge.icon}</span>
                                    <div>
                                        <p className="font-semibold">{t(badge.nameKey)}</p>
                                        <p className="text-xs text-gray-500">{t(badge.descriptionKey)}</p>
                                    </div>
                                </div>
                                <button onClick={() => deleteBadge(badge.id)} className="text-red-500 hover:text-red-700 text-lg font-bold" aria-label={t('common.delete')}>&times;</button>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
            <Card className="mt-8">
                <h2 className="text-xl font-bold mb-4">{t('adminDashboard.badges.awardBadge')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-semibold mb-1">{t('adminDashboard.badges.selectUser')}</label>
                        <select onChange={e => setSelectedUserForBadge(users.find(u => u.id === e.target.value) || null)} value={selectedUserForBadge?.id || ''} className={inputClass} aria-label={t('adminDashboard.badges.selectUser')}>
                            <option value="">{t('adminDashboard.badges.chooseUser')}</option>
                            {activeUsers.map(user => (
                                <option key={user.id} value={user.id}>{user.fullName}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">{t('adminDashboard.badges.selectBadge')}</label>
                        <select onChange={e => setSelectedBadgeToAward(e.target.value)} value={selectedBadgeToAward || ''} className={inputClass} aria-label={t('adminDashboard.badges.selectBadge')}>
                            <option value="">{t('adminDashboard.badges.chooseBadge')}</option>
                            {badges.map(badge => (
                                <option key={badge.id} value={badge.id}>{t(badge.nameKey)} {badge.icon}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <button onClick={handleAwardBadge} disabled={!selectedUserForBadge || !selectedBadgeToAward} className="mt-6 w-full bg-green-500 text-white py-2 rounded-lg font-bold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed">
                    {t('adminDashboard.badges.awardSelected')}
                </button>
            </Card>
        </div>
    );
};

const ResourceManagementSection: React.FC = () => {
    const { resources, addResource, deleteResource } = useData();
    const { t } = useLanguage();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<Omit<Resource, 'id'>>();

    const onSubmit: SubmitHandler<Omit<Resource, 'id'>> = (data) => {
        addResource(data);
        reset();
        alert(t('adminDashboard.resources.resourceAdded'));
    };

    const inputClass = "w-full p-2 border rounded-md";
    const errorClass = "text-red-500 text-sm mt-1";

    return (
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">{t('adminDashboard.resources.title')}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <h2 className="text-xl font-bold mb-4">{t('adminDashboard.resources.addResource')}</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block font-semibold mb-1">{t('adminDashboard.resources.form.title')}</label>
                            <input type="text" {...register("title", { required: true })} className={inputClass} />
                            {errors.title && <p className={errorClass}>{t('common.titleRequired')}</p>}
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">{t('adminDashboard.resources.form.description')}</label>
                            <textarea {...register("description", { required: true })} className={`${inputClass} h-24`} />
                            {errors.description && <p className={errorClass}>{t('common.descriptionRequired')}</p>}
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">{t('adminDashboard.resources.form.url')}</label>
                            <input type="url" {...register("url", { required: true, pattern: { value: /^https?:\/\/.+/, message: t('common.invalidUrl')} })} className={inputClass} />
                            {errors.url && <p className={errorClass}>{t('common.invalidUrl')}</p>}
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">{t('adminDashboard.resources.form.category')}</label>
                            <input type="text" {...register("category", { required: true })} className={inputClass} />
                            {errors.category && <p className={errorClass}>{t('common.categoryRequired')}</p>}
                        </div>
                        <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-blue-600">{t('adminDashboard.resources.form.addResource')}</button>
                    </form>
                </Card>
                <Card>
                    <h2 className="text-xl font-bold mb-4">{t('adminDashboard.resources.allResources')}</h2>
                    <div className="space-y-3">
                        {resources.map(resource => (
                            <div key={resource.id} className="p-2 border rounded-md bg-gray-50 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{resource.title}</p>
                                    <p className="text-xs text-gray-500">{resource.category}</p>
                                </div>
                                <div className="space-x-2">
                                    <a href={resource.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">{t('adminDashboard.resources.form.view')}</a>
                                    <button onClick={() => deleteResource(resource.id)} className="text-red-500 hover:text-red-700 text-lg font-bold" aria-label={t('common.delete')}>&times;</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

const DonationManagementSection: React.FC = () => {
    const { donors, updateDonationStatus, deleteDonation, paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod } = useData();
    const { t, language } = useLanguage();
    const [filterStatus, setFilterStatus] = useState<Donor['status'] | 'all'>('pending');
    const [activeTab, setActiveTab] = useState<'donations' | 'methods'>('donations');

    const filteredDonors = useMemo(() => donors.filter(d => filterStatus === 'all' || d.status === filterStatus), [donors, filterStatus]);

    const { register: registerPaymentMethod, handleSubmit: handleSubmitPaymentMethod, reset: resetPaymentMethod, formState: { errors: paymentMethodErrors } } = useForm<Omit<PaymentMethod, 'id'>>();
    const [isAddingMethod, setIsAddingMethod] = useState(false);
    const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

    useEffect(() => {
        if (editingMethod) {
            resetPaymentMethod({
                type: editingMethod.type,
                provider: editingMethod.provider,
                details: editingMethod.details,
                isActive: editingMethod.isActive,
            });
        } else {
            resetPaymentMethod();
        }
    }, [editingMethod, resetPaymentMethod]);

    const onAddOrUpdatePaymentMethod: SubmitHandler<Omit<PaymentMethod, 'id'>> = (data) => {
        if (editingMethod) {
            updatePaymentMethod(editingMethod.id, data);
            setEditingMethod(null);
        } else {
            addPaymentMethod(data);
        }
        setIsAddingMethod(false);
        resetPaymentMethod();
    };

    const handleEditPaymentMethod = (method: PaymentMethod) => {
        setEditingMethod(method);
        setIsAddingMethod(true);
    };

    const handleCancelPaymentMethodForm = () => {
        setIsAddingMethod(false);
        setEditingMethod(null);
        resetPaymentMethod();
    };


    return (
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">{t('adminDashboard.donations.title')}</h1>
            <div className="border-b mb-4">
                <nav className="flex space-x-4">
                    <button onClick={() => setActiveTab('donations')} className={`px-3 py-2 font-semibold ${activeTab === 'donations' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>{t('adminDashboard.donations.manageDonors')}</button>
                    <button onClick={() => setActiveTab('methods')} className={`px-3 py-2 font-semibold ${activeTab === 'methods' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>{t('adminDashboard.donations.manageMethods')}</button>
                </nav>
            </div>

            {activeTab === 'donations' && (
                <>
                    <div className="mb-4">
                        <select onChange={e => setFilterStatus(e.target.value as Donor['status'] | 'all')} value={filterStatus} className="p-2 border rounded-md" aria-label={t('adminDashboard.donations.filterDonations')}>
                            <option value="all">{t('adminDashboard.donations.status.all')}</option>
                            <option value="pending">{t('adminDashboard.donations.status.pending')}</option>
                            <option value="approved">{t('adminDashboard.donations.status.approved')}</option>
                            <option value="rejected">{t('adminDashboard.donations.status.rejected')}</option>
                            <option value="review">{t('adminDashboard.donations.status.review')}</option>
                            <option value="fraud">{t('adminDashboard.donations.status.fraud')}</option>
                        </select>
                    </div>
                    <div className="bg-white rounded-lg shadow overflow-x-auto">
                        <table className="w-full min-w-max text-sm text-left text-gray-500" aria-label={t('adminDashboard.donations.manageDonors')}>
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.donations.donor')}</th>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.donations.amount')}</th>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.donations.date')}</th>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.donations.statusTitle')}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('adminDashboard.donations.actions')}</th>
                            </tr></thead>
                            <tbody>{filteredDonors.map(donor => (
                                <tr key={donor.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{donor.isAnonymous ? t('adminDashboard.donations.anonymous') : donor.name}</td>
                                    <td className="px-6 py-4">৳{donor.amount.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}</td>
                                    <td className="px-6 py-4">{new Date(donor.date).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${donor.status === 'approved' ? 'bg-green-200 text-green-800' : donor.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'}`}>
                                            {t(`adminDashboard.donations.status.${donor.status}`)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => alert(donor.proofImageUrl)} className="font-medium text-blue-600 hover:underline">{t('adminDashboard.donations.viewProof')}</button>
                                        {donor.status === 'pending' && (
                                            <>
                                                <button onClick={() => updateDonationStatus(donor.id, 'approved')} className="font-medium text-green-600 hover:underline">{t('adminDashboard.donations.approve')}</button>
                                                <button onClick={() => updateDonationStatus(donor.id, 'rejected')} className="font-medium text-orange-600 hover:underline">{t('adminDashboard.donations.reject')}</button>
                                                <button onClick={() => updateDonationStatus(donor.id, 'review')} className="font-medium text-purple-600 hover:underline">{t('adminDashboard.donations.review')}</button>
                                            </>
                                        )}
                                        <button onClick={() => deleteDonation(donor.id)} className="font-medium text-red-600 hover:underline">{t('common.delete')}</button>
                                    </td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                </>
            )}

            {activeTab === 'methods' && (
                <>
                    <div className="flex justify-end mb-4">
                        <button onClick={() => setIsAddingMethod(true)} className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600">{t('adminDashboard.donations.addNewMethod')}</button>
                    </div>

                    {isAddingMethod && (
                        <Card className="mb-6 p-4">
                            <h2 className="text-xl font-bold mb-4">{editingMethod ? t('common.edit') : t('adminDashboard.donations.addNewMethod')}</h2>
                            <form onSubmit={handleSubmitPaymentMethod(onAddOrUpdatePaymentMethod)} className="space-y-4">
                                <div>
                                    <label className="block font-semibold mb-1">{t('adminDashboard.donations.methodTypePrompt')}</label>
                                    <select {...registerPaymentMethod("type", { required: true })} className="w-full p-2 border rounded-md">
                                        <option value="mobile">Mobile</option>
                                        <option value="bank">Bank</option>
                                    </select>
                                    {paymentMethodErrors.type && <p className="text-red-500 text-sm mt-1">{t('adminDashboard.donations.invalidType')}</p>}
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">{t('adminDashboard.donations.providerPrompt')}</label>
                                    <input type="text" {...registerPaymentMethod("provider", { required: t('adminDashboard.donations.providerRequired') })} className="w-full p-2 border rounded-md" />
                                    {paymentMethodErrors.provider && <p className="text-red-500 text-sm mt-1">{paymentMethodErrors.provider.message}</p>}
                                </div>
                                {paymentMethodErrors.type?.type === 'mobile' ? (
                                    <div>
                                        <label className="block font-semibold mb-1">{t('adminDashboard.donations.numberPrompt')}</label>
                                        <input type="text" {...registerPaymentMethod("details.number", { required: true })} className="w-full p-2 border rounded-md" />
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block font-semibold mb-1">{t('adminDashboard.donations.accountNamePrompt')}</label>
                                            <input type="text" {...registerPaymentMethod("details.name", { required: true })} className="w-full p-2 border rounded-md" />
                                        </div>
                                        <div>
                                            <label className="block font-semibold mb-1">{t('adminDashboard.donations.accountNumberPrompt')}</label>
                                            <input type="text" {...registerPaymentMethod("details.account", { required: true })} className="w-full p-2 border rounded-md" />
                                        </div>
                                        <div>
                                            <label className="block font-semibold mb-1">{t('adminDashboard.donations.branchPrompt')}</label>
                                            <input type="text" {...registerPaymentMethod("details.branch", { required: true })} className="w-full p-2 border rounded-md" />
                                        </div>
                                    </>
                                )}
                                <div className="flex items-center">
                                    <input type="checkbox" id="isActive" {...registerPaymentMethod("isActive")} className="h-4 w-4 text-primary" />
                                    <label htmlFor="isActive" className="ml-2 text-sm">{t('adminDashboard.donations.active')}</label>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <button type="button" onClick={handleCancelPaymentMethodForm} className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400">{t('common.cancel')}</button>
                                    <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600">{editingMethod ? t('common.save') : t('adminDashboard.donations.form.submit')}</button>
                                </div>
                            </form>
                        </Card>
                    )}

                    <div className="bg-white rounded-lg shadow overflow-x-auto">
                        <table className="w-full min-w-max text-sm text-left text-gray-500" aria-label={t('adminDashboard.donations.manageMethods')}>
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.donations.provider')}</th>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.donations.type')}</th>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.donations.details')}</th>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.donations.active')}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('adminDashboard.donations.actions')}</th>
                            </tr></thead>
                            <tbody>{paymentMethods.map(method => (
                                <tr key={method.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{method.provider}</td>
                                    <td className="px-6 py-4">{method.type}</td>
                                    <td className="px-6 py-4">
                                        {method.type === 'mobile' && method.details.number}
                                        {method.type === 'bank' && `${method.details.name} - ${method.details.account} (${method.details.branch})`}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${method.isActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                            {method.isActive ? t('adminDashboard.donations.active') : t('adminDashboard.donations.inactive')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => handleEditPaymentMethod(method)} className="font-medium text-blue-600 hover:underline">{t('common.edit')}</button>
                                        <button onClick={() => deletePaymentMethod(method.id)} className="font-medium text-red-600 hover:underline">{t('common.delete')}</button>
                                    </td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

const MonetizationManagementSection: React.FC = () => {
    const { revenueData, addMonthlyRevenue, moderatorPayouts, calculateAndSetModeratorPayouts, updatePayoutStatus, users, userRewards, calculateAndSetUserRewards, updateUserRewardStatus } = useData();
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState<'overview' | 'payouts' | 'user-rewards'>('overview');
    const { register: registerRevenue, handleSubmit: handleSubmitRevenue, reset: resetRevenue, formState: { errors: revenueErrors } } = useForm<RevenueData>();

    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7); // YYYY-MM
    const currentRevenue = revenueData.find(r => r.month === currentMonth);

    useEffect(() => {
        if (currentRevenue) {
            resetRevenue(currentRevenue);
        } else {
            resetRevenue({ month: currentMonth, ads: 0, donations: 0, subscriptions: 0 });
        }
    }, [currentRevenue, resetRevenue, currentMonth]);


    const onSaveRevenue: SubmitHandler<RevenueData> = (data) => {
        addMonthlyRevenue(data);
        alert(t('adminDashboard.settings.saveSuccess'));
    };

    const handleCalculatePayouts = (month: string) => {
        calculateAndSetModeratorPayouts(month);
    };

    const handleCalculateUserRewards = (year: number, period: 'H1' | 'H2') => {
        calculateAndSetUserRewards(year, period);
    };

    const handleExportPayouts = (month: string) => {
        const payouts = moderatorPayouts.filter(p => p.month === month);
        if (payouts.length === 0) {
            alert(t('adminDashboard.monetization.noPayoutData'));
            return;
        }
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Moderator Name,Points,Amount,Status\n"
            + payouts.map(p => {
                const mod = users.find(u => u.id === p.moderatorId);
                return `${mod?.fullName || 'Unknown'},${p.totalPoints},${p.amount.toFixed(2)},${p.status}`;
            }).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `moderator_payouts_${month}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportUserRewards = (year: number, period: 'H1' | 'H2') => {
        const rewards = userRewards.filter(r => r.year === year && r.period === period);
        if (rewards.length === 0) {
            alert(t('adminDashboard.monetization.noRewardDataExport', { year, period }));
            return;
        }
        const csvContent = "data:text/csv;charset=utf-8,"
            + "User Name,Points,Amount,Status\n"
            + rewards.map(r => {
                const user = users.find(u => u.id === r.userId);
                return `${user?.fullName || 'Unknown'},${r.totalPoints},${r.amount.toFixed(2)},${r.status}`;
            }).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `user_rewards_${year}_${period}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const inputClass = "w-full p-2 border rounded-md";
    const errorClass = "text-red-500 text-sm mt-1";

    return (
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">{t('adminDashboard.monetization.title')}</h1>
            <div className="border-b mb-4">
                <nav className="flex space-x-4">
                    <button onClick={() => setActiveTab('overview')} className={`px-3 py-2 font-semibold ${activeTab === 'overview' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>{t('adminDashboard.monetization.overview')}</button>
                    <button onClick={() => setActiveTab('payouts')} className={`px-3 py-2 font-semibold ${activeTab === 'payouts' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>{t('adminDashboard.monetization.modPayouts')}</button>
                    <button onClick={() => setActiveTab('user-rewards')} className={`px-3 py-2 font-semibold ${activeTab === 'user-rewards' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>{t('adminDashboard.monetization.userRewards')}</button>
                </nav>
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-8">
                    <Card>
                        <h2 className="text-xl font-bold mb-4">{t('adminDashboard.monetization.revenueEntryTitle')}</h2>
                        <form onSubmit={handleSubmitRevenue(onSaveRevenue)} className="space-y-4">
                            <div>
                                <label className="block font-semibold mb-1">{t('adminDashboard.monetization.month')}</label>
                                <input type="month" {...registerRevenue("month", { required: true })} className={inputClass} />
                                {revenueErrors.month && <p className={errorClass}>{t('common.required')}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">{t('adminDashboard.monetization.ads')}</label>
                                <input type="number" {...registerRevenue("ads", { required: true, valueAsNumber: true, min: 0 })} className={inputClass} />
                                {revenueErrors.ads && <p className={errorClass}>{t('common.required')}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">{t('adminDashboard.monetization.donations')}</label>
                                <input type="number" {...registerRevenue("donations", { required: true, valueAsNumber: true, min: 0 })} className={inputClass} />
                                {revenueErrors.donations && <p className={errorClass}>{t('common.required')}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">{t('adminDashboard.monetization.subscriptions')}</label>
                                <input type="number" {...registerRevenue("subscriptions", { required: true, valueAsNumber: true, min: 0 })} className={inputClass} />
                                {revenueErrors.subscriptions && <p className={errorClass}>{t('common.required')}</p>}
                            </div>
                            <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-blue-600">{t('adminDashboard.monetization.saveRevenue')}</button>
                        </form>
                    </Card>

                    {currentRevenue && (
                        <Card className="bg-blue-50 p-6">
                            <h2 className="text-xl font-bold mb-4">{t('adminDashboard.monetization.revenueTitle')} ({currentRevenue.month})</h2>
                            <p className="text-3xl font-bold text-primary mb-4">৳{(currentRevenue.ads + currentRevenue.donations + currentRevenue.subscriptions).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}</p>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div><p className="font-semibold text-sm">{t('adminDashboard.monetization.ads')}</p><p>৳{currentRevenue.ads.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}</p></div>
                                <div><p className="font-semibold text-sm">{t('adminDashboard.monetization.donations')}</p><p>৳{currentRevenue.donations.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}</p></div>
                                <div><p className="font-semibold text-sm">{t('adminDashboard.monetization.subscriptions')}</p><p>৳{currentRevenue.subscriptions.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}</p></div>
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {activeTab === 'payouts' && (
                <div className="space-y-8">
                    <Card>
                        <h2 className="text-xl font-bold mb-4">{t('adminDashboard.monetization.payoutsFor')}</h2>
                        <div className="flex space-x-2">
                            <input type="month" value={currentMonth} onChange={(e) => alert(t('adminDashboard.monetization.payoutsFor') + ': ' + e.target.value)} className={inputClass} />
                            <button onClick={() => handleCalculatePayouts(currentMonth)} className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600">{t('adminDashboard.monetization.calculatePayouts')}</button>
                            <button onClick={() => handleExportPayouts(currentMonth)} className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600">{t('adminDashboard.monetization.exportCSV')}</button>
                        </div>
                    </Card>
                    <div className="bg-white rounded-lg shadow overflow-x-auto">
                        <table className="w-full min-w-max text-sm text-left text-gray-500" aria-label={t('adminDashboard.monetization.modPayouts')}>
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.monetization.moderator')}</th>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.monetization.paymentInfo')}</th>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.monetization.points')}</th>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.monetization.amount')}</th>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.monetization.status')}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('adminDashboard.monetization.action')}</th>
                            </tr></thead>
                            <tbody>
                                {moderatorPayouts.filter(p => p.month === currentMonth).map(payout => {
                                    const mod = users.find(u => u.id === payout.moderatorId);
                                    return (
                                        <tr key={payout.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{mod?.fullName || 'Unknown'}</td>
                                            <td className="px-6 py-4 text-xs">
                                                {mod?.paymentInfo?.bkash && `Bkash: ${mod.paymentInfo.bkash}`}<br />
                                                {mod?.paymentInfo?.nagad && `Nagad: ${mod.paymentInfo.nagad}`}<br />
                                                {mod?.paymentInfo?.rocket && `Rocket: ${mod.paymentInfo.rocket}`}
                                            </td>
                                            <td className="px-6 py-4">{payout.totalPoints}</td>
                                            <td className="px-6 py-4">৳{payout.amount.toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${payout.status === 'paid' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                                    {t(`adminDashboard.monetization.campaignStatus.${payout.status}`)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {payout.status === 'pending' && (
                                                    <button onClick={() => updatePayoutStatus(payout.id, 'paid')} className="font-medium text-green-600 hover:underline">{t('adminDashboard.monetization.markPaid')}</button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'user-rewards' && (
                <div className="space-y-8">
                    <Card>
                        <h2 className="text-xl font-bold mb-4">{t('adminDashboard.monetization.userRewardsTitle')}</h2>
                        <div className="flex space-x-2 mb-4">
                            <input type="number" value={today.getFullYear()} onChange={(e) => alert(t('adminDashboard.monetization.year') + ': ' + e.target.value)} className={inputClass} />
                            <button onClick={() => handleCalculateUserRewards(today.getFullYear(), 'H1')} className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600">{t('adminDashboard.monetization.calculateH1')}</button>
                            <button onClick={() => handleCalculateUserRewards(today.getFullYear(), 'H2')} className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600">{t('adminDashboard.monetization.calculateH2')}</button>
                        </div>
                        <div className="flex space-x-2">
                            <button onClick={() => handleExportUserRewards(today.getFullYear(), 'H1')} className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600">{t('adminDashboard.monetization.exportCSV')} (H1)</button>
                            <button onClick={() => handleExportUserRewards(today.getFullYear(), 'H2')} className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600">{t('adminDashboard.monetization.exportCSV')} (H2)</button>
                        </div>
                    </Card>
                    <div className="bg-white rounded-lg shadow overflow-x-auto">
                        <table className="w-full min-w-max text-sm text-left text-gray-500" aria-label={t('adminDashboard.monetization.userRewardsTitle')}>
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.monetization.userName')}</th>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.monetization.period')}</th>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.monetization.points')}</th>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.monetization.rewardAmount')}</th>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.monetization.status')}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('adminDashboard.monetization.action')}</th>
                            </tr></thead>
                            <tbody>
                                {userRewards.filter(r => r.year === today.getFullYear() && (r.period === 'H1' || r.period === 'H2')).map(reward => {
                                    const user = users.find(u => u.id === reward.userId);
                                    return (
                                        <tr key={reward.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{user?.fullName || 'Unknown'}</td>
                                            <td className="px-6 py-4">{reward.year} {reward.period}</td>
                                            <td className="px-6 py-4">{reward.totalPoints}</td>
                                            <td className="px-6 py-4">৳{reward.amount.toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${reward.status === 'paid' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                                    {t(`adminDashboard.monetization.campaignStatus.${reward.status}`)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {reward.status === 'pending' && (
                                                    <button onClick={() => updateUserRewardStatus(reward.id, 'paid')} className="font-medium text-green-600 hover:underline">{t('adminDashboard.monetization.markPaid')}</button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {userRewards.filter(r => r.year === today.getFullYear() && (r.period === 'H1' || r.period === 'H2')).length === 0 && (
                                    <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">{t('adminDashboard.monetization.noRewardsCalculated')}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

const MemoryManagementSection: React.FC = () => {
    const { memories, approveMemory, deleteMemory, editMemory, users } = useData();
    const { t, language } = useLanguage();
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
    const [editedContent, setEditedContent] = useState('');

    const filteredMemories = useMemo(() => memories.filter(m => filter === 'all' || m.status === filter), [memories, filter]);

    const handleEditClick = (memory: Memory) => {
        setEditingMemory(memory);
        setEditedContent(memory.content);
    };

    const handleSaveEdit = () => {
        if (editingMemory && editedContent.trim()) {
            editMemory(editingMemory.id, editedContent);
            setEditingMemory(null);
            setEditedContent('');
        }
    };

    return (
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">{t('adminDashboard.memories.title')}</h1>
            <div className="mb-4">
                <select onChange={e => setFilter(e.target.value as any)} value={filter} className="p-2 border rounded-md" aria-label={t('adminDashboard.memories.filterMemories')}>
                    <option value="pending">{t('adminDashboard.memories.status.pending')}</option>
                    <option value="approved">{t('adminDashboard.memories.status.approved')}</option>
                    <option value="rejected">{t('adminDashboard.memories.status.rejected')}</option>
                    <option value="all">{t('adminDashboard.memories.all')}</option>
                </select>
            </div>
            <div className="space-y-4">
                {filteredMemories.length > 0 ? filteredMemories.map(memory => (
                    <Card key={memory.id} className={`${memory.status === 'pending' ? 'border-l-4 border-yellow-500' : ''}`}>
                        {editingMemory?.id === memory.id ? (
                            <div className="space-y-2">
                                <textarea
                                    value={editedContent}
                                    onChange={(e) => setEditedContent(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    rows={4}
                                    aria-label={t('adminDashboard.memories.editContent')}
                                />
                                <div className="flex justify-end space-x-2">
                                    <button onClick={() => setEditingMemory(null)} className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400">{t('common.cancel')}</button>
                                    <button onClick={handleSaveEdit} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">{t('common.save')}</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="text-gray-800">{memory.content}</p>
                                <div className="flex justify-between items-center mt-2 pt-2 border-t text-sm">
                                    <p className="text-xs text-gray-500">
                                        {t('adminDashboard.memories.submittedBy')}: {users.find(u => u.id === memory.userId)?.fullName || t('adminDashboard.memories.author')} on {new Date(memory.timestamp).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}
                                    </p>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${memory.status === 'approved' ? 'bg-green-200 text-green-800' : memory.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'}`}>
                                        {t(`adminDashboard.memories.status.${memory.status}`)}
                                    </span>
                                </div>
                                <div className="flex justify-end space-x-2 mt-4">
                                    {memory.status === 'pending' && (
                                        <>
                                            <button onClick={() => approveMemory(memory.id)} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600">{t('adminDashboard.memories.approve')}</button>
                                            <button onClick={() => deleteMemory(memory.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600">{t('adminDashboard.memories.reject')}</button>
                                        </>
                                    )}
                                    <button onClick={() => handleEditClick(memory)} className="font-medium text-blue-600 hover:underline">{t('common.edit')}</button>
                                    <button onClick={() => { if (window.confirm(t('adminDashboard.memories.confirmDelete'))) deleteMemory(memory.id); }} className="font-medium text-red-600 hover:underline">{t('common.delete')}</button>
                                </div>
                            </>
                        )}
                    </Card>
                )) : (
                    <Card className="text-center p-6 text-gray-500">
                        <p>{t('adminDashboard.memories.noMemories')}</p>
                    </Card>
                )}
            </div>
        </div>
    );
};

const LetterManagementSection: React.FC = () => {
    const { letters, users, updateLetter } = useData();
    const { t, language } = useLanguage();
    const [filter, setFilter] = useState<LetterStatus | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewingLetter, setViewingLetter] = useState<Letter | null>(null);
    const [newReply, setNewReply] = useState('');

    const filteredLetters = useMemo(() => {
        let currentLetters = letters;
        if (filter !== 'all') {
            currentLetters = currentLetters.filter(l => l.status === filter);
        }
        if (searchTerm) {
            currentLetters = currentLetters.filter(l => 
                l.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                l.body.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return currentLetters.sort((a, b) => new Date(b.dateSent).getTime() - new Date(a.dateSent).getTime());
    }, [letters, filter, searchTerm]);

    const handleViewLetter = (letter: Letter) => {
        setViewingLetter(letter);
        setNewReply(letter.reply || '');
    };

    const handleSendReply = () => {
        if (viewingLetter && newReply.trim()) {
            updateLetter(viewingLetter.id, { 
                reply: newReply, 
                status: LetterStatus.REPLIED, 
                dateReplied: new Date().toISOString() 
            });
            setViewingLetter(null);
            setNewReply('');
            alert(t('adminDashboard.letters.sendReplySuccess')); // Assuming a success message is needed
        }
    };

    return (
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">{t('adminDashboard.letters.title')}</h1>
            <Card className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" placeholder={t('adminDashboard.letters.searchPlaceholder')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 border rounded-md" aria-label={t('adminDashboard.letters.searchPlaceholder')} />
                    <select value={filter} onChange={e => setFilter(e.target.value as LetterStatus | 'all')} className="w-full p-2 border rounded-md" aria-label={t('adminDashboard.letters.allStatus')}>
                        <option value="all">{t('adminDashboard.letters.allStatus')}</option>
                        <option value={LetterStatus.PENDING}>{t('LetterStatus.PENDING')}</option>
                        <option value={LetterStatus.REPLIED}>{t('LetterStatus.REPLIED')}</option>
                    </select>
                </div>
            </Card>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full min-w-max text-sm text-left text-gray-500" aria-label={t('adminDashboard.letters.title')}>
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr>
                        <th scope="col" className="px-6 py-3">{t('adminDashboard.letters.subject')}</th>
                        <th scope="col" className="px-6 py-3">{t('adminDashboard.letters.user')}</th>
                        <th scope="col" className="px-6 py-3">{t('adminDashboard.letters.moderator')}</th>
                        <th scope="col" className="px-6 py-3">{t('adminDashboard.letters.dateSent')}</th>
                        <th scope="col" className="px-6 py-3">{t('adminDashboard.letters.status')}</th>
                        <th scope="col" className="px-6 py-3">{t('adminDashboard.letters.rating')}</th>
                        <th scope="col" className="px-6 py-3 text-right">{t('adminDashboard.letters.action')}</th>
                    </tr></thead>
                    <tbody>
                        {filteredLetters.length > 0 ? filteredLetters.map(letter => {
                            const user = users.find(u => u.id === letter.userId);
                            const moderator = users.find(u => u.id === letter.moderatorId);
                            return (
                                <tr key={letter.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{letter.subject}</td>
                                    <td className="px-6 py-4">{user?.fullName || 'Unknown'}</td>
                                    <td className="px-6 py-4">{moderator?.fullName || '-'}</td>
                                    <td className="px-6 py-4">{new Date(letter.dateSent).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${letter.status === LetterStatus.REPLIED ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                            {t(`LetterStatus.${letter.status}`)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{letter.moderatorRating || '-'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleViewLetter(letter)} className="font-medium text-blue-600 hover:underline">{t('adminDashboard.letters.view')}</button>
                                        <button onClick={() => { if (window.confirm(t('adminDashboard.letters.confirmDelete'))) updateLetter(letter.id, { status: LetterStatus.REPLIED, reply: "Deleted by Admin" }); }} className="font-medium text-red-600 hover:underline ml-2">{t('common.delete')}</button>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500">{t('adminDashboard.letters.noLetters')}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {viewingLetter && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="letter-detail-title">
                    <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h2 id="letter-detail-title" className="text-2xl font-bold">{viewingLetter.subject}</h2>
                            <button onClick={() => setViewingLetter(null)} className="text-3xl font-light hover:text-red-500 transition-colors" aria-label={t('common.cancel')}>&times;</button>
                        </div>
                        <div className="overflow-y-auto space-y-4 p-1 flex-grow custom-scrollbar">
                            <div>
                                <h4 className="font-semibold text-text-dark mb-2">{t('adminDashboard.letters.originalLetter')}:</h4>
                                <p className="text-xs text-gray-500 mb-2">
                                    {t('adminDashboard.letters.from')}: {users.find(u => u.id === viewingLetter.userId)?.fullName || 'Unknown User'} |
                                    {t('adminDashboard.letters.dateSent')}: {new Date(viewingLetter.dateSent).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}
                                </p>
                                <p className="bg-gray-100 p-4 rounded-lg leading-relaxed">{viewingLetter.body}</p>
                                {viewingLetter.audioUrl && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-sm mb-2">{t('adminDashboard.letters.userVoiceNote')}</h4>
                                        <audio src={viewingLetter.audioUrl} controls className="w-full h-10"></audio>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <h4 className="font-semibold text-primary mb-2">{t('adminDashboard.letters.moderatorReply')}:</h4>
                                {viewingLetter.status === LetterStatus.REPLIED ? (
                                    <>
                                        <p className="text-xs text-gray-500 mb-2">
                                            {t('adminDashboard.letters.assignedTo')}: {users.find(u => u.id === viewingLetter.moderatorId)?.fullName || 'N/A'} |
                                            {t('adminDashboard.letters.dateReplied')}: {viewingLetter.dateReplied ? new Date(viewingLetter.dateReplied).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US') : 'N/A'}
                                        </p>
                                        <p className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg leading-relaxed">{viewingLetter.reply}</p>
                                    </>
                                ) : (
                                    <div className="space-y-3">
                                        <textarea value={newReply} onChange={(e) => setNewReply(e.target.value)} className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder={t('adminDashboard.letters.yourReply')}></textarea>
                                        <button onClick={handleSendReply} className="bg-green-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-600 transition-colors">{t('adminDashboard.letters.sendReply')}</button>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end mt-4 space-x-2">
                                <button onClick={() => updateLetter(viewingLetter.id, { isComplex: !viewingLetter.isComplex })} className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-600">
                                    {viewingLetter.isComplex ? t('adminDashboard.letters.markNotComplex') : t('adminDashboard.letters.markComplex')}
                                </button>
                                <button onClick={() => setViewingLetter(null)} className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400">{t('common.close')}</button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

const SettingsSection: React.FC = () => {
    const { platformSettings, updatePlatformSettings } = useData();
    const { t } = useLanguage();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<PlatformSettings>({ defaultValues: platformSettings });
    const [updateSuccess, setUpdateSuccess] = useState(false);

    useEffect(() => {
        reset(platformSettings);
    }, [platformSettings, reset]);

    const onSubmit: SubmitHandler<PlatformSettings> = (data) => {
        updatePlatformSettings(data);
        setUpdateSuccess(true);
        setTimeout(() => setUpdateSuccess(false), 3000);
    };

    const inputClass = "w-full p-2 border rounded-md";
    const errorClass = "text-red-500 text-sm mt-1";

    return (
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">{t('adminDashboard.settings.title')}</h1>
            <Card>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Site Announcement */}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="font-bold px-2">{t('adminDashboard.settings.announcement.title')}</legend>
                        <div className="space-y-4 mt-2">
                            <div>
                                <label className="block font-semibold mb-1">{t('adminDashboard.settings.announcement.message')}</label>
                                <textarea {...register("siteAnnouncement.message", { required: true })} className={`${inputClass} h-24`} placeholder={t('adminDashboard.settings.announcement.messagePlaceholder')} />
                                {errors.siteAnnouncement?.message && <p className={errorClass}>{t('common.required')}</p>}
                            </div>
                            <div className="flex items-center">
                                <input type="checkbox" id="announcementIsActive" {...register("siteAnnouncement.isActive")} className="h-4 w-4 text-primary" />
                                <label htmlFor="announcementIsActive" className="ml-2 text-sm">{t('adminDashboard.settings.announcement.isActive')}</label>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">{t('adminDashboard.settings.announcement.type')}</label>
                                <select {...register("siteAnnouncement.type", { required: true })} className={inputClass}>
                                    <option value="info">{t('adminDashboard.settings.announcement.typeInfo')}</option>
                                    <option value="warning">{t('adminDashboard.settings.announcement.typeWarning')}</option>
                                    <option value="success">{t('adminDashboard.settings.announcement.typeSuccess')}</option>
                                </select>
                                {errors.siteAnnouncement?.type && <p className={errorClass}>{t('common.required')}</p>}
                            </div>
                             <div>
                                <label className="block font-semibold mb-1">{t('adminDashboard.settings.announcement.scheduledDate')}</label>
                                <input type="date" {...register("siteAnnouncement.scheduledDate")} className={inputClass} />
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">{t('adminDashboard.settings.announcement.endDate')}</label>
                                <input type="date" {...register("siteAnnouncement.endDate")} className={inputClass} />
                            </div>
                        </div>
                    </fieldset>

                    {/* Moderator Email Domain */}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="font-bold px-2">{t('adminDashboard.settings.moderatorEmailDomain.title')}</legend>
                        <div className="space-y-4 mt-2">
                            <div>
                                <label className="block font-semibold mb-1">{t('adminDashboard.settings.moderatorEmailDomain.domain')}</label>
                                <input type="text" {...register("moderatorEmailDomain", { required: t('adminDashboard.settings.moderatorEmailDomain.required') })} className={inputClass} />
                                {errors.moderatorEmailDomain && <p className={errorClass}>{errors.moderatorEmailDomain.message}</p>}
                            </div>
                        </div>
                    </fieldset>

                    {/* Point System */}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="font-bold px-2">{t('adminDashboard.settings.pointSystem.title')}</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">{t('adminDashboard.settings.pointSystem.userPoints')}</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center"><label className="text-sm">{t('adminDashboard.settings.pointSystem.writeLetter')}</label><input type="number" {...register("pointSystem.user.writeLetter", { required: true, valueAsNumber: true, min: 0 })} className="w-20 p-1 border rounded-md text-right" /></div>
                                    <div className="flex justify-between items-center"><label className="text-sm">{t('adminDashboard.settings.pointSystem.writePost')}</label><input type="number" {...register("pointSystem.user.writePost", { required: true, valueAsNumber: true, min: 0 })} className="w-20 p-1 border rounded-md text-right" /></div>
                                    <div className="flex justify-between items-center"><label className="text-sm">{t('adminDashboard.settings.pointSystem.receiveLike')}</label><input type="number" {...register("pointSystem.user.receiveLike", { required: true, valueAsNumber: true, min: 0 })} className="w-20 p-1 border rounded-md text-right" /></div>
                                    <div className="flex justify-between items-center"><label className="text-sm">{t('adminDashboard.settings.pointSystem.giveGoodRating')}</label><input type="number" {...register("pointSystem.user.giveGoodRating", { required: true, valueAsNumber: true, min: 0 })} className="w-20 p-1 border rounded-md text-right" /></div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">{t('adminDashboard.settings.pointSystem.moderatorPoints')}</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center"><label className="text-sm">{t('adminDashboard.settings.pointSystem.replyToLetter')}</label><input type="number" {...register("pointSystem.moderator.replyToLetter", { required: true, valueAsNumber: true, min: 0 })} className="w-20 p-1 border rounded-md text-right" /></div>
                                    <div className="flex justify-between items-center"><label className="text-sm">{t('adminDashboard.settings.pointSystem.replyFast')}</label><input type="number" {...register("pointSystem.moderator.replyFast", { required: true, valueAsNumber: true, min: 0 })} className="w-20 p-1 border rounded-md text-right" /></div>
                                    <div className="flex justify-between items-center"><label className="text-sm">{t('adminDashboard.settings.pointSystem.receiveGoodRating')}</label><input type="number" {...register("pointSystem.moderator.receiveGoodRating", { required: true, valueAsNumber: true, min: 0 })} className="w-20 p-1 border rounded-md text-right" /></div>
                                    <div className="flex justify-between items-center"><label className="text-sm">{t('adminDashboard.settings.pointSystem.receiveBadRating')}</label><input type="number" {...register("pointSystem.moderator.receiveBadRating", { required: true, valueAsNumber: true })} className="w-20 p-1 border rounded-md text-right" /></div>
                                    <div className="flex justify-between items-center"><label className="text-sm">{t('adminDashboard.settings.pointSystem.reviewReportedPost')}</label><input type="number" {...register("pointSystem.moderator.reviewReportedPost", { required: true, valueAsNumber: true, min: 0 })} className="w-20 p-1 border rounded-md text-right" /></div>
                                </div>
                            </div>
                        </div>
                    </fieldset>

                    {/* Revenue Share */}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="font-bold px-2">{t('adminDashboard.settings.revenueShare.title')}</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                            <div>
                                <label className="block font-semibold mb-1 text-sm">{t('adminDashboard.settings.revenueShare.moderators')}</label>
                                <input type="number" step="0.01" {...register("revenueShare.moderators", { required: true, valueAsNumber: true, min: 0, max: 1 })} className={inputClass} />
                                {errors.revenueShare?.moderators && <p className={errorClass}>{t('common.required')}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1 text-sm">{t('adminDashboard.settings.revenueShare.users')}</label>
                                <input type="number" step="0.01" {...register("revenueShare.users", { required: true, valueAsNumber: true, min: 0, max: 1 })} className={inputClass} />
                                {errors.revenueShare?.users && <p className={errorClass}>{t('common.required')}</p>}
                            </div>
                        </div>
                    </fieldset>

                    <button type="submit" className="w-full bg-accent text-text-dark py-3 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors">
                        {t('adminDashboard.settings.saveSettings')}
                    </button>
                    {updateSuccess && <p className="text-green-600 text-sm text-center mt-2">{t('adminDashboard.settings.saveSuccess')}</p>}
                </form>
            </Card>
        </div>
    );
};

const AdManagementSection: React.FC = () => {
    const { adSlots, addAdSlot, updateAdSlot, deleteAdSlot, adCreatives, addAdCreative, updateAdCreative, deleteAdCreative, adCampaigns, addAdCampaign, updateAdCampaign, deleteAdCampaign, logAdImpression, logAdClick } = useData();
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState<'slots' | 'campaigns' | 'creatives' | 'reports'>('slots');

    // Ad Slot Forms
    const { register: registerSlot, handleSubmit: handleSubmitSlot, reset: resetSlot, formState: { errors: slotErrors } } = useForm<Omit<AdSlot, 'id'>>();
    const [editingSlot, setEditingSlot] = useState<AdSlot | null>(null);

    // Ad Campaign Forms
    const { register: registerCampaign, handleSubmit: handleSubmitCampaign, reset: resetCampaign, formState: { errors: campaignErrors } } = useForm<Omit<AdCampaign, 'id'>>();
    const [editingCampaign, setEditingCampaign] = useState<AdCampaign | null>(null);

    // Ad Creative Forms
    const { register: registerCreative, handleSubmit: handleSubmitCreative, reset: resetCreative, formState: { errors: creativeErrors } } = useForm<Omit<AdCreative, 'id' | 'impressions' | 'clicks'>>();
    const [editingCreative, setEditingCreative] = useState<AdCreative | null>(null);

    // Common input/error classes
    const inputClass = "w-full p-2 border rounded-md";
    const errorClass = "text-red-500 text-sm mt-1";

    // Slot useEffect and Handlers
    useEffect(() => {
        if (editingSlot) {
            resetSlot(editingSlot);
        } else {
            resetSlot({ name: '', description: '', type: AdSlotType.BANNER, dimensions: { width: 0, height: 0 }, isActive: true });
        }
    }, [editingSlot, resetSlot]);

    const onAddOrUpdateSlot: SubmitHandler<Omit<AdSlot, 'id'>> = (data) => {
        if (editingSlot) {
            updateAdSlot(editingSlot.id, data);
        } else {
            addAdSlot(data);
        }
        setEditingSlot(null);
        resetSlot();
    };

    // Campaign useEffect and Handlers
    useEffect(() => {
        if (editingCampaign) {
            resetCampaign(editingCampaign);
        } else {
            resetCampaign({ name: '', startDate: undefined, endDate: undefined, status: 'active', priority: 0 });
        }
    }, [editingCampaign, resetCampaign]);

    const onAddOrUpdateCampaign: SubmitHandler<Omit<AdCampaign, 'id'>> = (data) => {
        if (editingCampaign) {
            updateAdCampaign(editingCampaign.id, data);
        } else {
            addAdCampaign(data);
        }
        setEditingCampaign(null);
        resetCampaign();
    };

    // Creative useEffect and Handlers
    useEffect(() => {
        if (editingCreative) {
            resetCreative(editingCreative);
        } else {
            resetCreative({ name: '', campaignId: '', type: 'image', content: '', targetUrl: '', status: 'active', allowedSlotTypes: [AdSlotType.BANNER], audience: ['all'] });
        }
    }, [editingCreative, resetCreative]);

    const onAddOrUpdateCreative: SubmitHandler<Omit<AdCreative, 'id' | 'impressions' | 'clicks'>> = (data) => {
        if (editingCreative) {
            updateAdCreative(editingCreative.id, data);
        } else {
            addAdCreative(data);
        }
        setEditingCreative(null);
        resetCreative();
    };

    const getCampaignName = (campaignId: string) => adCampaigns.find(c => c.id === campaignId)?.name || 'Unknown';


    return (
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">{t('adminDashboard.adManagement.title')}</h1>
            <div className="border-b mb-4">
                <nav className="flex space-x-4">
                    <button onClick={() => setActiveTab('slots')} className={`px-3 py-2 font-semibold ${activeTab === 'slots' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>{t('adminDashboard.adManagement.adSlots')}</button>
                    <button onClick={() => setActiveTab('campaigns')} className={`px-3 py-2 font-semibold ${activeTab === 'campaigns' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>{t('adminDashboard.adManagement.adCampaigns')}</button>
                    <button onClick={() => setActiveTab('creatives')} className={`px-3 py-2 font-semibold ${activeTab === 'creatives' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>{t('adminDashboard.adManagement.adCreatives')}</button>
                    <button onClick={() => setActiveTab('reports')} className={`px-3 py-2 font-semibold ${activeTab === 'reports' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>{t('adminDashboard.adManagement.reports')}</button>
                </nav>
            </div>

            {/* Ad Slots Section */}
            {activeTab === 'slots' && (
                <div className="space-y-8">
                    <Card>
                        <h2 className="text-xl font-bold mb-4">{editingSlot ? t('adminDashboard.adManagement.editAdSlot') : t('adminDashboard.adManagement.addNewAdSlot')}</h2>
                        <form onSubmit={handleSubmitSlot(onAddOrUpdateSlot)} className="space-y-4">
                            <div>
                                <label className="block font-semibold mb-1">{t('adminDashboard.adManagement.slotName')}</label>
                                <input type="text" {...registerSlot("name", { required: true })} className={inputClass} />
                                {slotErrors.name && <p className={errorClass}>{t('common.required')}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">{t('adminDashboard.adManagement.slotDescription')}</label>
                                <textarea {...registerSlot("description", { required: true })} className={`${inputClass} h-20`} />
                                {slotErrors.description && <p className={errorClass}>{t('common.required')}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">{t('adminDashboard.adManagement.slotType')}</label>
                                <select {...registerSlot("type", { required: true })} className={inputClass}>
                                    {Object.values(AdSlotType).map(type => (
                                        <option key={type} value={type}>{t(`AdSlotType.${type.toLowerCase().replace(/_/g, '-')}`)}</option>
                                    ))}
                                </select>
                                {slotErrors.type && <p className={errorClass}>{t('common.required')}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-semibold mb-1">{t('adminDashboard.adManagement.width')}</label>
                                    <input type="number" {...registerSlot("dimensions.width", { required: true, valueAsNumber: true, min: 1 })} className={inputClass} />
                                    {slotErrors.dimensions?.width && <p className={errorClass}>{t('adminDashboard.adManagement.validWidthRequired')}</p>}
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">{t('adminDashboard.adManagement.height')}</label>
                                    <input type="number" {...registerSlot("dimensions.height", { required: true, valueAsNumber: true, min: 1 })} className={inputClass} />
                                    {slotErrors.dimensions?.height && <p className={errorClass}>{t('adminDashboard.adManagement.validHeightRequired')}</p>}
                                </div>
                            </div>
                            <div className="flex items-center">
                                <input type="checkbox" id="slotIsActive" {...registerSlot("isActive")} className="h-4 w-4 text-primary" />
                                <label htmlFor="slotIsActive" className="ml-2 text-sm">{t('adminDashboard.adManagement.active')}</label>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setEditingSlot(null)} className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400">{t('common.cancel')}</button>
                                <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600">{editingSlot ? t('adminDashboard.adManagement.updateSlot') : t('adminDashboard.adManagement.addSlot')}</button>
                            </div>
                        </form>
                    </Card>

                    <div className="bg-white rounded-lg shadow overflow-x-auto">
                        <table className="w-full min-w-max text-sm text-left text-gray-500" aria-label={t('adminDashboard.adManagement.allSlots')}>
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.adManagement.slotName')}</th>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.adManagement.type')}</th>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.adManagement.dimensions')}</th>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.adManagement.status')}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('adminDashboard.adManagement.actions')}</th>
                            </tr></thead>
                            <tbody>{adSlots.map(slot => (
                                <tr key={slot.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{slot.name}</td>
                                    <td className="px-6 py-4">{t(`AdSlotType.${slot.type.toLowerCase().replace(/_/g, '-')}`)}</td>
                                    <td className="px-6 py-4">{slot.dimensions.width}x{slot.dimensions.height}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${slot.isActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                            {slot.isActive ? t('adminDashboard.adManagement.active') : t('adminDashboard.adManagement.inactive')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => setEditingSlot(slot)} className="font-medium text-blue-600 hover:underline">{t('common.edit')}</button>
                                        <button onClick={() => { if (window.confirm(t('adminDashboard.adManagement.confirmDeleteSlot'))) deleteAdSlot(slot.id); }} className="font-medium text-red-600 hover:underline">{t('common.delete')}</button>
                                    </td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Ad Campaigns Section */}
            {activeTab === 'campaigns' && (
                <div className="space-y-8">
                    <Card>
                        <h2 className="text-xl font-bold mb-4">{editingCampaign ? t('adminDashboard.adManagement.editAdCampaign') : t('adminDashboard.adManagement.addNewAdCampaign')}</h2>
                        <form onSubmit={handleSubmitCampaign(onAddOrUpdateCampaign)} className="space-y-4">
                            <div>
                                <label className="block font-semibold mb-1">{t('adminDashboard.adManagement.campaignName')}</label>
                                <input type="text" {...registerCampaign("name", { required: true })} className={inputClass} />
                                {campaignErrors.name && <p className={errorClass}>{t('common.required')}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-semibold mb-1">{t('adminDashboard.adManagement.startDate')}</label>
                                    <input type="date" {...registerCampaign("startDate")} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1">{t('adminDashboard.adManagement.endDate')}</label>
                                    <input type="date" {...registerCampaign("endDate")} className={inputClass} />
                                </div>
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">{t('adminDashboard.adManagement.selectStatus')}</label>
                                <select {...registerCampaign("status", { required: true })} className={inputClass}>
                                    {Object.values(['active', 'paused', 'scheduled', 'completed']).map(status => (
                                        <option key={status} value={status}>{t(`adminDashboard.adManagement.campaignStatus.${status}`)}</option>
                                    ))}
                                </select>
                                {campaignErrors.status && <p className={errorClass}>{t('common.required')}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">{t('adminDashboard.adManagement.priority')}</label>
                                <input type="number" {...registerCampaign("priority", { required: true, valueAsNumber: true, min: 0 })} className={inputClass} />
                                {campaignErrors.priority && <p className={errorClass}>{t('adminDashboard.adManagement.priorityRequired')}</p>}
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setEditingCampaign(null)} className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400">{t('common.cancel')}</button>
                                <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600">{editingCampaign ? t('adminDashboard.adManagement.updateCampaign') : t('adminDashboard.adManagement.addCampaign')}</button>
                            </div>
                        </form>
                    </Card>

                    <div className="bg-white rounded-lg shadow overflow-x-auto">
                        <table className="w-full min-w-max text-sm text-left text-gray-500" aria-label={t('adminDashboard.adManagement.allCampaigns')}>
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.adManagement.campaignName')}</th>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.adManagement.period')}</th>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.adManagement.status')}</th>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.adManagement.priority')}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('adminDashboard.adManagement.actions')}</th>
                            </tr></thead>
                            <tbody>{adCampaigns.map(campaign => (
                                <tr key={campaign.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{campaign.name}</td>
                                    <td className="px-6 py-4">
                                        {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US') : 'N/A'} - {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US') : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${campaign.status === 'active' ? 'bg-green-200 text-green-800' : campaign.status === 'paused' ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800'}`}>
                                            {t(`adminDashboard.adManagement.campaignStatus.${campaign.status}`)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{campaign.priority}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => setEditingCampaign(campaign)} className="font-medium text-blue-600 hover:underline">{t('common.edit')}</button>
                                        <button onClick={() => { if (window.confirm(t('adminDashboard.adManagement.confirmDeleteCampaign'))) deleteAdCampaign(campaign.id); }} className="font-medium text-red-600 hover:underline">{t('common.delete')}</button>
                                    </td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Ad Creatives Section */}
            {activeTab === 'creatives' && (
                <div className="space-y-8">
                    <Card>
                        <h2 className="text-xl font-bold mb-4">{editingCreative ? t('adminDashboard.adManagement.editAdCreative') : t('adminDashboard.adManagement.addNewAdCreative')}</h2>
                        <form onSubmit={handleSubmitCreative(onAddOrUpdateCreative)} className="space-y-4">
                            <div>
                                <label className="block font-semibold mb-1">{t('adminDashboard.adManagement.creativeName')}</label>
                                <input type="text" {...registerCreative("name", { required: true })} className={inputClass} />
                                {creativeErrors.name && <p className={errorClass}>{t('common.required')}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">{t('adminDashboard.adManagement.selectCampaign')}</label>
                                <select {...registerCreative("campaignId", { required: true })} className={inputClass}>
                                    <option value="">{t('adminDashboard.adManagement.selectCampaign')}</option>
                                    {adCampaigns.map(campaign => (
                                        <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                                    ))}
                                </select>
                                {creativeErrors.campaignId && <p className={errorClass}>{t('common.required')}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">{t('adminDashboard.adManagement.creativeType')}</label>
                                <select {...registerCreative("type", { required: true })} className={inputClass}>
                                    <option value="image">Image</option>
                                    <option value="video">Video</option>
                                    <option value="html">HTML</option>
                                </select>
                                {creativeErrors.type && <p className={errorClass}>{t('common.required')}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">{t('adminDashboard.adManagement.contentUrlOrHtml')}</label>
                                <textarea {...registerCreative("content", { required: true })} className={`${inputClass} h-24`} />
                                {creativeErrors.content && <p className={errorClass}>{t('adminDashboard.adManagement.contentRequired')}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">{t('adminDashboard.adManagement.targetUrl')}</label>
                                <input type="url" {...registerCreative("targetUrl", { required: true, pattern: { value: /^https?:\/\/.+/, message: t('adminDashboard.adManagement.validTargetUrlRequired')} })} className={inputClass} />
                                {creativeErrors.targetUrl && <p className={errorClass}>{t('adminDashboard.adManagement.validTargetUrlRequired')}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">{t('adminDashboard.adManagement.selectStatus')}</label>
                                <select {...registerCreative("status", { required: true })} className={inputClass}>
                                    {Object.values(['active', 'paused']).map(status => (
                                        <option key={status} value={status}>{t(`adminDashboard.adManagement.campaignStatus.${status}`)}</option>
                                    ))}
                                </select>
                                {creativeErrors.status && <p className={errorClass}>{t('common.required')}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">{t('adminDashboard.adManagement.allowedSlotTypes')}</label>
                                <select multiple {...registerCreative("allowedSlotTypes", { required: true })} className={`${inputClass} h-28`} aria-describedby="slot-type-help">
                                    {Object.values(AdSlotType).map(type => (
                                        <option key={type} value={type}>{t(`AdSlotType.${type.toLowerCase().replace(/_/g, '-')}`)}</option>
                                    ))}
                                </select>
                                <p id="slot-type-help" className="text-xs text-gray-500 mt-1">{t('adminDashboard.adManagement.holdCtrlToSelect')}</p>
                                {creativeErrors.allowedSlotTypes && <p className={errorClass}>{t('adminDashboard.adManagement.slotTypeRequired')}</p>}
                            </div>
                            <div>
                                <label className="block font-semibold mb-1">{t('adminDashboard.adManagement.audience')}</label>
                                <select multiple {...registerCreative("audience", { required: true })} className={`${inputClass} h-28`} aria-describedby="audience-help">
                                    {Object.values(['all', 'logged_in_users', 'moderators_only', 'public_only']).map(audienceType => (
                                        <option key={audienceType} value={audienceType}>{t(`adminDashboard.adManagement.audienceTypes.${audienceType}`)}</option>
                                    ))}
                                </select>
                                <p id="audience-help" className="text-xs text-gray-500 mt-1">{t('adminDashboard.adManagement.holdCtrlToSelect')}</p>
                                {creativeErrors.audience && <p className={errorClass}>{t('common.required')}</p>}
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setEditingCreative(null)} className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400">{t('common.cancel')}</button>
                                <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600">{editingCreative ? t('adminDashboard.adManagement.updateCreative') : t('adminDashboard.adManagement.addCreative')}</button>
                            </div>
                        </form>
                    </Card>

                    <div className="bg-white rounded-lg shadow overflow-x-auto">
                        <table className="w-full min-w-max text-sm text-left text-gray-500" aria-label={t('adminDashboard.adManagement.allCreatives')}>
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.adManagement.creativeName')}</th>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.adManagement.campaign')}</th>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.adManagement.type')}</th>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.adManagement.status')}</th>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.adManagement.impressions')}</th>
                                <th scope="col" className="px-6 py-3">{t('adminDashboard.adManagement.clicks')}</th>
                                <th scope="col" className="px-6 py-3 text-right">{t('adminDashboard.adManagement.actions')}</th>
                            </tr></thead>
                            <tbody>{adCreatives.map(creative => (
                                <tr key={creative.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{creative.name}</td>
                                    <td className="px-6 py-4">{getCampaignName(creative.campaignId)}</td>
                                    <td className="px-6 py-4">{creative.type}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${creative.status === 'active' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                            {t(`adminDashboard.adManagement.campaignStatus.${creative.status}`)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{creative.impressions}</td>
                                    <td className="px-6 py-4">{creative.clicks}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => setEditingCreative(creative)} className="font-medium text-blue-600 hover:underline">{t('common.edit')}</button>
                                        <button onClick={() => { if (window.confirm(t('adminDashboard.adManagement.confirmDeleteCreative'))) deleteAdCreative(creative.id); }} className="font-medium text-red-600 hover:underline">{t('common.delete')}</button>
                                    </td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Ad Reports Section */}
            {activeTab === 'reports' && (
                <div className="space-y-8">
                    <Card>
                        <h2 className="text-xl font-bold mb-4">{t('adminDashboard.adManagement.creativePerformance')}</h2>
                        <div className="bg-white rounded-lg shadow overflow-x-auto">
                            <table className="w-full min-w-max text-sm text-left text-gray-500" aria-label={t('adminDashboard.adManagement.creativePerformance')}>
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr>
                                    <th scope="col" className="px-6 py-3">{t('adminDashboard.adManagement.creativeName')}</th>
                                    <th scope="col" className="px-6 py-3">{t('adminDashboard.adManagement.campaign')}</th>
                                    <th scope="col" className="px-6 py-3">{t('adminDashboard.adManagement.impressions')}</th>
                                    <th scope="col" className="px-6 py-3">{t('adminDashboard.adManagement.clicks')}</th>
                                    <th scope="col" className="px-6 py-3">CTR</th>
                                </tr></thead>
                                <tbody>
                                    {adCreatives.map(creative => (
                                        <tr key={creative.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{creative.name}</td>
                                            <td className="px-6 py-4">{getCampaignName(creative.campaignId)}</td>
                                            <td className="px-6 py-4">{creative.impressions}</td>
                                            <td className="px-6 py-4">{creative.clicks}</td>
                                            <td className="px-6 py-4">{creative.impressions > 0 ? ((creative.clicks / creative.impressions) * 100).toFixed(2) : 0}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};


const AdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');

    const renderSection = () => {
        switch (activeSection) {
            case 'dashboard': return <DashboardSection />;
            case 'users': return <UserManagementSection />;
            case 'posts': return <PostManagementSection />;
            case 'blogs': return <BlogManagementSection />;
            case 'blog-approval': return <BlogApprovalSection />;
            case 'applications': return <ApplicationManagementSection />;
            case 'moderators': return <ModeratorManagementSection />;
            case 'badges': return <BadgeManagementSection />;
            case 'resources': return <ResourceManagementSection />;
            case 'donations': return <DonationManagementSection />;
            case 'monetization': return <MonetizationManagementSection />;
            case 'memories': return <MemoryManagementSection />;
            case 'letters': return <LetterManagementSection />;
            case 'settings': return <SettingsSection />;
            case 'ad-management': return <AdManagementSection />;
            default: return <DashboardSection />;
        }
    };

    if (user?.type !== 'admin') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-800 text-xl font-bold">
                Access Denied: Admins only.
            </div>
        );
    }

    const navItems = [
        { key: 'dashboard', label: t('adminDashboard.menu.dashboard') },
        { key: 'users', label: t('adminDashboard.menu.userManagement') },
        { key: 'moderators', label: t('adminDashboard.menu.moderatorManagement') },
        { key: 'applications', label: t('adminDashboard.menu.moderatorApplications') },
        { key: 'letters', label: t('adminDashboard.menu.letterManagement') },
        { key: 'posts', label: t('adminDashboard.menu.postManagement') },
        { key: 'blogs', label: t('adminDashboard.menu.blogManagement') },
        { key: 'blog-approval', label: t('adminDashboard.menu.blogApproval') },
        { key: 'memories', label: t('adminDashboard.menu.wallOfMemories') },
        { key: 'badges', label: t('adminDashboard.menu.badgeManagement') },
        { key: 'resources', label: t('adminDashboard.menu.resourceLibrary') },
        { key: 'donations', label: t('adminDashboard.menu.donations') },
        { key: 'monetization', label: t('adminDashboard.menu.monetization') },
        { key: 'ad-management', label: t('adminDashboard.menu.adManagement') },
        { key: 'settings', label: t('adminDashboard.menu.settings') },
    ];

    return (
        <div className="flex min-h-screen bg-background-light">
            <aside className="w-64 bg-white shadow-lg p-6 flex flex-col">
                <h2 className="text-2xl font-bold text-primary mb-6">{t('adminDashboard.panelTitle')}</h2>
                <nav className="flex-grow space-y-2">
                    {navItems.map(item => (
                        <button
                            key={item.key}
                            onClick={() => setActiveSection(item.key as AdminSection)}
                            className={`w-full text-left px-4 py-2 rounded-lg font-semibold transition-colors ${
                                activeSection === item.key ? 'bg-primary text-white' : 'text-text-dark hover:bg-secondary'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>
                <div className="mt-6 border-t pt-4">
                    <button onClick={logout} className="w-full bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition-colors">
                        {t('nav.logout')}
                    </button>
                </div>
            </aside>
            <main className="flex-1 p-10 overflow-y-auto">
                {renderSection()}
            </main>
        </div>
    );
};

export default AdminDashboard;
