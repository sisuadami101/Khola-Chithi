import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Card from '../components/ui/Card';
import PostCard from '../components/PostCard';
import { useLanguage } from '../context/LanguageContext';

const GroupDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { getSupportGroupById, getGroupPosts, users } = useData();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'members'>('posts');

    const group = id ? getSupportGroupById(id) : undefined;
    const posts = id ? getGroupPosts(id) : [];

    if (!group) {
        return (
            <div>
                <Header/>
                <main className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-3xl font-bold">Group not found</h1>
                    <Link to="/groups" className="text-primary mt-4 inline-block">Back to all groups</Link>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <Header />
            <main className="container mx-auto py-8 px-4">
                <Card className="!p-0 overflow-hidden mb-8">
                    <div className="h-48 bg-cover bg-center" style={{ backgroundImage: `url(${group.coverImage})` }}></div>
                    <div className="p-6">
                        <h1 className="text-4xl font-bold">{group.name}</h1>
                        <p className="text-gray-600 mt-1">{group.memberCount} members</p>
                    </div>
                     <div className="px-6 border-b">
                        <nav className="flex space-x-4">
                             <button onClick={() => setActiveTab('posts')} className={`px-3 py-2 font-semibold ${activeTab === 'posts' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>{t('supportGroups.groupDetail.posts')}</button>
                             <button onClick={() => setActiveTab('about')} className={`px-3 py-2 font-semibold ${activeTab === 'about' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>{t('supportGroups.groupDetail.about')}</button>
                             <button onClick={() => setActiveTab('members')} className={`px-3 py-2 font-semibold ${activeTab === 'members' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>{t('supportGroups.groupDetail.members')}</button>
                        </nav>
                    </div>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-3">
                        {activeTab === 'posts' && (
                            <div className="space-y-6">
                                 <Card>
                                     <h3 className="font-bold mb-2">Create Post</h3>
                                     <textarea className="w-full p-2 border rounded-lg" placeholder={t('supportGroups.groupDetail.postPlaceholder')} rows={3}></textarea>
                                     <button className="mt-2 bg-accent text-text-dark px-4 py-2 rounded-lg font-bold">{t('supportGroups.groupDetail.post')}</button>
                                 </Card>
                                 {posts.map(post => <PostCard key={post.id} post={post} />)}
                            </div>
                        )}
                        {activeTab === 'about' && (
                            <Card>
                                <h2 className="text-2xl font-bold mb-4">{t('supportGroups.groupDetail.about')}</h2>
                                <p className="text-gray-700">{group.description}</p>
                            </Card>
                        )}
                        {activeTab === 'members' && (
                             <Card>
                                <h2 className="text-2xl font-bold mb-4">{group.memberCount} {t('supportGroups.groupDetail.members')}</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                   {users.slice(0, group.memberCount).map(user => (
                                       <div key={user.id} className="text-center">
                                           <img src={user.profilePicture} alt={user.fullName} className="w-20 h-20 rounded-full mx-auto object-cover"/>
                                           <p className="mt-2 font-semibold text-sm">{user.fullName}</p>
                                       </div>
                                   ))}
                                </div>
                            </Card>
                        )}
                    </div>
                    <aside className="md:col-span-1">
                         <Card>
                            <h3 className="font-bold text-lg mb-2">{t('supportGroups.groupDetail.about')}</h3>
                            <p className="text-sm text-gray-600">{group.description}</p>
                         </Card>
                    </aside>
                </div>

            </main>
        </div>
    )

};

export default GroupDetailPage;
