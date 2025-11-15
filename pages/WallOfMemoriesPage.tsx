import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';

const WallOfMemoriesPage: React.FC = () => {
    const { memories, toggleLikeMemory, addMemory, users } = useData();
    const { t } = useLanguage();
    const { user } = useAuth();
    const [newMemoryContent, setNewMemoryContent] = useState('');
    const [isSubmittingMemory, setIsSubmittingMemory] = useState(false);

    const approvedMemories = memories
        .filter(m => m.status === 'approved')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const handleLike = (memoryId: string) => {
        if (user) {
            toggleLikeMemory(memoryId, user.id);
        } else {
            alert(t('common.loginRequired'));
        }
    };

    const handleMemorySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert(t('common.loginRequired'));
            return;
        }
        if (!newMemoryContent.trim()) {
            alert(t('wallOfMemoriesPage.emptyMemoryWarning'));
            return;
        }

        setIsSubmittingMemory(true);
        const success = addMemory({
            userId: user.id,
            content: newMemoryContent,
        });

        if (success) {
            setNewMemoryContent('');
        }
        setIsSubmittingMemory(false);
    };

    // Check if user can post
    const canPostMemory = user ? 
        (!user.lastMemoryPostDate || 
        new Date(user.lastMemoryPostDate).getTime() < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).getTime()) : false;
    
    const timeToNextPost = user && user.lastMemoryPostDate ? 
        Math.ceil((new Date(user.lastMemoryPostDate).getTime() + 7 * 24 * 60 * 60 * 1000 - Date.now()) / (24 * 60 * 60 * 1000)) : 0;


    return (
        <div className="bg-background-light min-h-screen wall-background">
            <Header />
            <main className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                     <h1 className="text-4xl md:text-5xl font-bold text-text-dark">{t('wallOfMemoriesPage.title')}</h1>
                     <p className="mt-4 text-lg text-text-dark/80 max-w-2xl mx-auto">{t('wallOfMemoriesPage.subtitle')}</p>
                </div>

                {user && (
                    <Card className="mb-8 p-6">
                        <h2 className="text-xl font-bold mb-4">{t('wallOfMemoriesPage.shareYourMoment')}</h2>
                        <form onSubmit={handleMemorySubmit} className="space-y-4">
                            <textarea
                                value={newMemoryContent}
                                onChange={(e) => setNewMemoryContent(e.target.value)}
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                rows={4}
                                placeholder={t('wallOfMemoriesPage.sharePlaceholder')}
                                disabled={!canPostMemory || isSubmittingMemory}
                            ></textarea>
                            <button
                                type="submit"
                                className="w-full bg-accent text-text-dark py-3 rounded-lg font-bold hover:bg-yellow-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                disabled={!canPostMemory || isSubmittingMemory}
                            >
                                {isSubmittingMemory ? t('common.submitting') : t('wallOfMemoriesPage.submitMemory')}
                            </button>
                            {!canPostMemory && user?.lastMemoryPostDate && (
                                <p className="text-red-500 text-sm mt-2 text-center">
                                    {t('wallOfMemoriesPage.postLimitReached', { days: timeToNextPost })}
                                </p>
                            )}
                             {!user && (
                                <p className="text-gray-500 text-sm mt-2 text-center">{t('common.loginToPost')}</p>
                            )}
                        </form>
                    </Card>
                )}


                {approvedMemories.length > 0 ? (
                    <div className="masonry-grid">
                        {approvedMemories.map((memory, index) => {
                             const isLiked = user ? memory.likes.includes(user.id) : false;
                             const rotations = ['-2deg', '1deg', '-1deg', '2deg', '-1.5deg', '1.5deg', '0.5deg', '-0.5deg'];
                             const rotation = rotations[index % rotations.length];
                             return (
                                <div key={memory.id} className="masonry-item mb-6">
                                     <div 
                                        className="bg-[#FFFFF0] p-6 rounded shadow-lg text-left relative h-full flex flex-col transition-transform hover:scale-105"
                                        style={{ transform: `rotate(${rotation})` }}
                                      >
                                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full shadow-inner border-2 border-red-700 z-10"></div>
                                        <p className="text-lg italic text-text-dark/90 flex-grow pt-4">"{memory.content}"</p>
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold text-sm">{t('wallOfMemoriesPage.anonymous')}</p>
                                                    <p className="text-xs text-gray-500">{t('wallOfMemoriesPage.postedOn')} {new Date(memory.timestamp).toLocaleDateString(t('langName') === 'বাংলা' ? 'bn-BD' : 'en-US')}</p>
                                                </div>
                                                <button onClick={() => handleLike(memory.id)} className={`flex items-center space-x-1 text-sm font-semibold ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>{memory.likes.length}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             )
                        })}
                    </div>
                ) : (
                    <Card className="text-center p-12">
                        <p className="text-gray-500 text-xl">{t('wallOfMemoriesPage.noMemories')}</p>
                    </Card>
                )}
            </main>
            <Footer />
            <style jsx>{`
                .wall-background {
                    background-color: #f0e9e0;
                    background-image: url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E");
                }
                .masonry-grid {
                    column-count: 1;
                    column-gap: 1.5rem;
                }
                @media (min-width: 768px) {
                    .masonry-grid {
                        column-count: 2;
                    }
                }
                @media (min-width: 1024px) {
                    .masonry-grid {
                        column-count: 3;
                    }
                }
                .masonry-item {
                    break-inside: avoid;
                    display: inline-block;
                    width: 100%;
                }
            `}</style>
        </div>
    );
};

export default WallOfMemoriesPage;