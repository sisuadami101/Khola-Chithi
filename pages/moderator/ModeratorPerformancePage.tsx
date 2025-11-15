

import React, { useState, useMemo } from 'react';
import { Letter, LetterStatus, Post, User, Badge } from '../../types';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import { getReplySuggestion } from '../../services/geminiService';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';

type ModeratorTab = 'letters' | 'reports' | 'knowledge' | 'myReplies';

const ModeratorPerformancePage: React.FC = () => {
    const { user } = useAuth();
    // Add 'language' to the destructuring from useLanguage
    const { t, language } = useLanguage();
    const { letters, updateLetter, posts, hidePost, escalatePost, users, resources, awardBadgeToUser, badges, dismissReport } = useData();
    const [activeLetter, setActiveLetter] = useState<Letter | null>(null);
    const [reply, setReply] = useState('');
    const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
    const [activeTab, setActiveTab] = useState<ModeratorTab>('letters');
    const [awardBadgeModal, setAwardBadgeModal] = useState<{ user: User, letterId: string } | null>(null);
    
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

    // Fix: Changed LetterStatus.Pending to LetterStatus.PENDING
    const availableLettersToReply = useMemo(() => letters.filter(l => l.status === LetterStatus.PENDING && !l.moderatorId), [letters]);
    const reportedPosts = useMemo(() => posts.filter(p => p.isReported && !p.isHidden), [posts]);
    // Fix: Changed LetterStatus.Replied to LetterStatus.REPLIED
    const myRecentReplies = useMemo(() => letters.filter(l => l.moderatorId === user?.id && l.status === LetterStatus.REPLIED).sort((a,b) => new Date(b.dateReplied!).getTime() - new Date(a.dateReplied!).getTime()), [letters, user]);


    const moderatorStats = useMemo(() => {
        if (!user) return { answered: 0, avgRating: '0.0', currentMonthPoints: 0 };
        // Fix: Changed LetterStatus.Replied to LetterStatus.REPLIED
        const answeredLetters = letters.filter(l => l.moderatorId === user.id && l.status === LetterStatus.REPLIED);
        const ratedLetters = answeredLetters.filter(l => typeof l.moderatorRating === 'number');
        const totalRating = ratedLetters.reduce((sum, l) => sum + (l.moderatorRating || 0), 0);
        const avgRating = ratedLetters.length > 0 ? (totalRating / ratedLetters.length) : 0;
        const currentMonthPoints = user.performancePoints?.find(p => p.month === currentMonth)?.points || 0;
        return {
            answered: answeredLetters.length,
            avgRating: avgRating.toFixed(1),
            currentMonthPoints: currentMonthPoints
        };
    }, [letters, user, currentMonth]);


    const handleReplyClick = (letter: Letter) => {
        if (!user?.id) {
            alert(t('common.loginRequired'));
            return;
        }
        updateLetter(letter.id, { moderatorId: user.id }); // Assign the letter to the current moderator
        setActiveLetter({ ...letter, moderatorId: user.id });
    };
    
    const handleCancelReply = () => {
        if (!activeLetter) return;
        // Optionally unassign the letter if the moderator cancels, allowing others to take it
        updateLetter(activeLetter.id, { moderatorId: undefined });
        setActiveLetter(null);
        setReply(''); // Clear reply on cancel
    }

    const handleSubmitReply = () => {
        if (!activeLetter || !reply.trim()) return alert(t('moderatorPerformancePage.replyPage.emptyReplyWarning'));
        
        const letterUser = users.find(u => u.id === activeLetter.userId);
        
        updateLetter(activeLetter.id, { 
            reply, 
            // Fix: Changed LetterStatus.Replied to LetterStatus.REPLIED
            status: LetterStatus.REPLIED, 
            moderatorId: user?.id,
            dateReplied: new Date().toISOString()
        });
        alert(t('moderatorPerformancePage.replyPage.success'));

        if (letterUser) {
            setAwardBadgeModal({ user: letterUser, letterId: activeLetter.id });
        }
        
        setActiveLetter(null);
        setReply('');
    };

    const handleGetSuggestion = async () => {
        if (!activeLetter) return;
        setIsLoadingSuggestion(true);
        try {
            const suggestion = await getReplySuggestion(activeLetter);
            setReply(suggestion);
        } catch (error) {
            console.error(error);
            alert(t('moderatorPerformancePage.replyPage.suggestionError'));
        } finally {
            setIsLoadingSuggestion(false);
        }
    };

    const handleAwardBadge = (badgeId: string) => {
        if (awardBadgeModal && user) {
            const badge = badges.find(b => b.id === badgeId);
            if (!badge) return;

            awardBadgeToUser(awardBadgeModal.user.id, badgeId, user.id);
            alert(t('moderatorPerformancePage.awardBadge.success', { 
                badgeName: t(badge.nameKey), 
                userName: awardBadgeModal.user.fullName 
            }));
            setAwardBadgeModal(null);
        }
    };
    
    if (activeLetter) {
        return (
            <div className="h-full bg-background-light flex flex-col page-fade-in">
                <h1 className="text-2xl font-bold mb-4">{t('moderatorPerformancePage.replyPage.title')}</h1>
                <Card className="flex-grow flex flex-col">
                   <div className="overflow-y-auto p-4 border-b mb-4 bg-gray-50 rounded-t-lg">
                     <h2 className="text-xl font-bold">{activeLetter.subject}</h2>
                     <p className="text-sm text-gray-500 mb-4">{t('moderatorPerformancePage.replyPage.received')}: {new Date(activeLetter.dateSent).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}</p>
                     {activeLetter.body && <p className="bg-white p-3 rounded-md shadow-sm border">{activeLetter.body}</p>}
                     {activeLetter.audioUrl && (
                        <div className="mt-4">
                            <h4 className="font-semibold text-sm mb-2">{t('moderatorPerformancePage.replyPage.userVoiceNote')}</h4>
                            <audio src={activeLetter.audioUrl} controls className="w-full h-10"></audio>
                        </div>
                     )}
                   </div>
                   <div className="flex-grow flex flex-col p-4">
                        <textarea value={reply} onChange={(e) => setReply(e.target.value)} className="w-full h-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" placeholder={t('moderatorPerformancePage.replyPage.placeholder')}/>
                   </div>
                   <div className="p-4 mt-4 flex justify-between items-center border-t">
                        <button onClick={handleSubmitReply} className="bg-green-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-600 transition-colors">{t('moderatorPerformancePage.replyPage.submit')}</button>
                        <button onClick={handleGetSuggestion} className="bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center gap-2" disabled={isLoadingSuggestion}>
                             {isLoadingSuggestion ? t('moderatorPerformancePage.replyPage.loading') : t('moderatorPerformancePage.replyPage.aiSuggestion')}
                             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
                        </button>
                        <button onClick={handleCancelReply} className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors">{t('moderatorPerformancePage.replyPage.cancel')}</button>
                   </div>
                </Card>
            </div>
        )
    }

    return (
         <div className="h-full bg-background-light overflow-y-auto page-fade-in">
            {awardBadgeModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card>
                        <h2 className="text-xl font-bold mb-2">{t('moderatorPerformancePage.awardBadge.title', { name: awardBadgeModal.user.fullName })}</h2>
                        <p className="text-sm text-gray-600 mb-4">{t('moderatorPerformancePage.awardBadge.description')}</p>
                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                            {badges.map(badge => (
                                <button key={badge.id} onClick={() => handleAwardBadge(badge.id)} className="w-full text-left p-3 hover:bg-secondary rounded transition-colors flex items-center gap-3">
                                    <span className="text-2xl">{badge.icon}</span>
                                    <div>
                                        <p className="font-semibold">{t(badge.nameKey)}</p>
                                        <p className="text-xs text-gray-500">{t(badge.descriptionKey)}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setAwardBadgeModal(null)} className="mt-4 bg-gray-200 w-full p-2 rounded hover:bg-gray-300">
                            {t('moderatorPerformancePage.awardBadge.skip')}
                        </button>
                    </Card>
                </div>
            )}

            <header className="mb-8">
                <h1 className="text-3xl font-bold">{t('moderatorPerformancePage.title')}</h1>
                <p>{t('moderatorDashboard.welcome')} {user?.fullName}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="text-center"><h3 className="font-semibold text-gray-500">{t('moderatorPerformancePage.currentMonthPoints')}</h3><p className="text-4xl font-bold text-primary mt-2">{moderatorStats.currentMonthPoints}</p></Card>
                <Card className="text-center"><h3 className="font-semibold text-gray-500">{t('moderatorPerformancePage.answeredLetters')}</h3><p className="text-4xl font-bold text-primary mt-2">{moderatorStats.answered}</p></Card>
                <Card className="text-center"><h3 className="font-semibold text-gray-500">{t('moderatorPerformancePage.avgRating')}</h3><p className="text-4xl font-bold text-primary mt-2">{moderatorStats.avgRating} <span className="text-lg">/ 10</span></p></Card>
            </div>

            <div className="border-b mb-4">
                <nav className="flex space-x-4">
                    {(Object.keys({ letters: 'অমীমাংসিত চিঠি', reports: 'রিপোর্টেড পোস্ট', knowledge: 'নলেজ বেস', myReplies: 'আমার উত্তরসমূহ' }) as ModeratorTab[]).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-2 font-semibold ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>
                           { { letters: `${t('moderatorPerformancePage.lettersToReply')} (${availableLettersToReply.length})`, 
                               reports: `${t('moderatorPerformancePage.reportedPosts')} (${reportedPosts.length})`, 
                               knowledge: t('moderatorPerformancePage.knowledgeBase'),
                               myReplies: `${t('moderatorPerformancePage.myReplies')} (${myRecentReplies.length})`
                             }[tab] }
                        </button>
                    ))}
                </nav>
            </div>
            
            {activeTab === 'letters' && (
                <div className="space-y-4">
                    {availableLettersToReply.length > 0 ? availableLettersToReply.map(letter => (
                        <Card key={letter.id} className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                {letter.audioUrl && <span className="text-2xl" title={t('moderatorPerformancePage.replyPage.userVoiceNote')}>🎤</span>}
                                <div>
                                    <h3 className="font-bold text-lg">{letter.subject}</h3>
                                    <p className="text-sm text-gray-500">{t('moderatorPerformancePage.replyPage.received')}: {new Date(letter.dateSent).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}</p>
                                </div>
                            </div>
                            <button onClick={() => handleReplyClick(letter)} className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-500 transition-colors">{t('moderatorPerformancePage.reply')}</button>
                        </Card>
                    )) : <p>{t('moderatorPerformancePage.noNewLetters')}</p>}
                </div>
            )}

            {activeTab === 'reports' && (
                <div className="space-y-4">
                    {reportedPosts.length > 0 ? reportedPosts.map(post => (
                        <Card key={post.id} className="border-l-4 border-yellow-500">
                            <p className="border-b pb-2 mb-2">{post.content}</p>
                            <p className="text-xs text-gray-500">{t('moderatorPerformancePage.reportedBy')}: {post.reportedBy?.length} {t('moderatorPerformancePage.reportedUsers')}</p>
                            <div className="flex justify-end space-x-2 mt-2">
                                <button onClick={() => dismissReport(post.id)} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors">{t('adminDashboard.postManagement.dismissReport')}</button>
                                <button onClick={() => hidePost(post.id, true)} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 transition-colors">{t('moderatorPerformancePage.hidePost')}</button>
                                <button onClick={() => escalatePost(post.id, true)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors">{t('moderatorPerformancePage.escalateToAdmin')}</button>
                            </div>
                        </Card>
                    )) : <p>{t('moderatorPerformancePage.noReportedPosts')}</p>}
                </div>
            )}
            
            {activeTab === 'knowledge' && (
                <div className="space-y-4">
                    {resources.map(res => (
                        <Card key={res.id}>
                            <h3 className="font-bold text-lg">{res.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{res.description}</p>
                            <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-primary font-semibold text-sm hover:underline">{t('moderatorPerformancePage.readMore')}</a>
                        </Card>
                    ))}
                </div>
            )}

            {activeTab === 'myReplies' && (
                <div className="space-y-4">
                    {myRecentReplies.length > 0 ? myRecentReplies.map(letter => (
                        <Card key={letter.id} className="border-l-4 border-blue-500">
                             <h3 className="font-bold text-lg">{t('moderatorPerformancePage.myRepliesItemTitle', {subject: letter.subject})}</h3>
                             <p className="text-sm text-gray-500 mb-2">{t('moderatorPerformancePage.repliedOn')}: {new Date(letter.dateReplied!).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}</p>
                             <p className="text-sm">{letter.reply?.substring(0, 100)}...</p>
                             {letter.moderatorRating && <p className="text-xs text-right text-gray-600 mt-2">{t('moderatorPerformancePage.avgRating')}: {letter.moderatorRating}/10</p>}
                        </Card>
                    )) : <p>{t('moderatorPerformancePage.noRecentReplies')}</p>}
                </div>
            )}
        </div>
    );
};

export default ModeratorPerformancePage;