
import React, { useState, useMemo } from 'react';
import { Letter, LetterStatus } from '../../types';
import Card from '../../components/ui/Card';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import ChatModal from '../../components/ChatModal';

const MyLettersPage: React.FC = () => {
    const { user } = useAuth();
    const { letters, updateLetter, addMemory } = useData();
    const { t, language } = useLanguage();
    const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
    const [rating, setRating] = useState(0);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // New states for filtering, sorting, and pagination
    const [filterStatus, setFilterStatus] = useState<LetterStatus | 'all'>('all');
    const [sortBy, setSortBy] = useState('date-desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const LETTERS_PER_PAGE = 5;

    const userLetters = useMemo(() => letters.filter(l => l.userId === user?.id), [letters, user]);

    const filteredAndSortedLetters = useMemo(() => {
        let processedLetters = [...userLetters];

        // Filtering by status
        if (filterStatus !== 'all') {
            processedLetters = processedLetters.filter(l => l.status === filterStatus);
        }
        
        // Filtering by search term (subject)
        if (searchTerm) {
            processedLetters = processedLetters.filter(l => 
                l.subject.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sorting
        processedLetters.sort((a, b) => {
            switch (sortBy) {
                case 'date-asc':
                    return new Date(a.dateSent).getTime() - new Date(b.dateSent).getTime();
                case 'subject-asc':
                    return a.subject.localeCompare(b.subject);
                case 'subject-desc':
                    return b.subject.localeCompare(a.subject);
                case 'date-desc':
                default:
                    return new Date(b.dateSent).getTime() - new Date(a.dateSent).getTime();
            }
        });

        return processedLetters;
    }, [userLetters, filterStatus, sortBy, searchTerm]);
    
    // Pagination calculation
    const totalPages = Math.ceil(filteredAndSortedLetters.length / LETTERS_PER_PAGE);
    const paginatedLetters = filteredAndSortedLetters.slice(
        (currentPage - 1) * LETTERS_PER_PAGE,
        currentPage * LETTERS_PER_PAGE
    );

    const handleViewReply = (letter: Letter) => {
        setSelectedLetter(letter);
        setRating(letter.moderatorRating || 0); // Set rating for display if already exists
    };
    
    const handleRatingSubmit = () => {
        if (!selectedLetter || rating === 0) {
            alert(t('myLettersPage.replyModal.ratingRequired'));
            return;
        }
        
        const confirmation = window.confirm(t('myLettersPage.ratingConfirm', { rating }));
        if (confirmation) {
            updateLetter(selectedLetter.id, { moderatorRating: rating });
            
            alert(t('myLettersPage.ratingThanks', { rating }));
            setSelectedLetter(prev => {
                // Ensure the previous state is updated with the new rating to reflect in UI immediately
                const updated = prev ? { ...prev, moderatorRating: rating } : null;
                return updated;
            });
            if(rating > 7) {
                 const writeReview = window.confirm(t('myLettersPage.reviewPrompt'));
                 if(writeReview) {
                     alert(t('myLettersPage.reviewRedirect'));
                 }
            }
        }
    };
    
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleShareToWall = () => {
        if (!selectedLetter || !user) return;
        const message = prompt(t('myLettersPage.replyModal.shareToWallPrompt'));
        if (message && message.trim()) {
            addMemory({
                userId: user.id,
                letterId: selectedLetter.id,
                content: message,
            });
        }
    };


    return (
        <div className="page-fade-in">
            {isChatOpen && selectedLetter && (
                <ChatModal 
                    sessionId={`chat_${selectedLetter.id}`} 
                    onClose={() => setIsChatOpen(false)}
                />
            )}
            <h1 className="text-3xl font-bold mb-8">{t('myLettersPage.title')}</h1>

            {/* Filter and Sort Controls */}
            <Card className="mb-6 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input 
                        type="text"
                        placeholder={t('myLettersPage.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                        aria-label={t('myLettersPage.searchPlaceholder')}
                    />
                    <select 
                        value={filterStatus} 
                        onChange={(e) => { setFilterStatus(e.target.value as LetterStatus | 'all'); setCurrentPage(1); }}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                        aria-label={t('myLettersPage.allStatus')}
                    >
                        <option value="all">{t('myLettersPage.allStatus')}</option>
                        <option value={LetterStatus.PENDING}>{t(`LetterStatus.PENDING`)}</option>
                        <option value={LetterStatus.REPLIED}>{t(`LetterStatus.REPLIED`)}</option>
                    </select>
                    <select 
                        value={sortBy} 
                        onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none"
                        aria-label={t('myLettersPage.sortNewest')}
                    >
                        <option value="date-desc">{t('myLettersPage.sortNewest')}</option>
                        <option value="date-asc">{t('myLettersPage.sortOldest')}</option>
                        <option value="subject-asc">{t('myLettersPage.sortSubjectAsc')}</option>
                        <option value="subject-desc">{t('myLettersPage.sortSubjectDesc')}</option>
                    </select>
                </div>
            </Card>

            <div className="space-y-4">
                {paginatedLetters.length > 0 ? (
                    paginatedLetters.map(letter => (
                        <Card key={letter.id} className="flex flex-wrap justify-between items-center gap-4">
                            <div className="flex items-center space-x-3">
                                {letter.audioUrl && <span className="text-2xl" title={t('myLettersPage.voiceNote.yourNote')} aria-label={t('myLettersPage.voiceNote.yourNote')}>🎤</span>}
                                <div>
                                    <h3 className="font-bold text-lg">{letter.subject}</h3>
                                    <p className="text-sm text-gray-500">{t('myLettersPage.dateSent')}: {new Date(letter.dateSent).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                    letter.status === LetterStatus.REPLIED ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {t(`LetterStatus.${letter.status}`)}
                                </span>
                                {letter.status === LetterStatus.REPLIED && (
                                    <button onClick={() => handleViewReply(letter)} className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-500 transition-colors">{t('myLettersPage.viewReply')}</button>
                                )}
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card className="text-center text-gray-500 py-8">
                        <p>{t('myLettersPage.noLetters')}</p>
                    </Card>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center space-x-2">
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)} 
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        aria-label={t('myLettersPage.prev')}
                    >
                        {t('myLettersPage.prev')}
                    </button>
                    <span className="font-semibold px-2">{currentPage} / {totalPages}</span>
                    <button 
                        onClick={() => handlePageChange(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        aria-label={t('myLettersPage.next')}
                    >
                        {t('myLettersPage.next')}
                    </button>
                </div>
            )}


            {selectedLetter && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="reply-modal-title">
                    <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h2 id="reply-modal-title" className="text-2xl font-bold">{selectedLetter.subject}</h2>
                            <button onClick={() => setSelectedLetter(null)} className="text-3xl font-light hover:text-red-500 transition-colors" aria-label={t('common.cancel')}>&times;</button>
                        </div>
                        <div className="overflow-y-auto space-y-4 p-1 flex-grow">
                             {/* User's Original Letter */}
                             <div>
                                <h4 className="font-semibold text-text-dark mb-2">{t('adminDashboard.letters.originalLetter')}:</h4>
                                <p className="text-xs text-gray-500 mb-2">
                                    {t('myLettersPage.dateSent')}: {new Date(selectedLetter.dateSent).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}
                                </p>
                                <p className="bg-gray-100 p-4 rounded-lg leading-relaxed">{selectedLetter.body}</p>
                                {selectedLetter.audioUrl && (
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-sm mb-2">{t('myLettersPage.voiceNote.yourNote')}</h4>
                                        <audio src={selectedLetter.audioUrl} controls className="w-full h-10" aria-label={t('myLettersPage.voiceNote.yourNote')}></audio>
                                    </div>
                                )}
                            </div>
                            
                            {/* Moderator's Reply */}
                            {selectedLetter.reply && (
                                <div className="pt-4 border-t border-gray-200">
                                    <h4 className="font-semibold text-primary mb-2">{t('myLettersPage.replyModal.title')}</h4>
                                    {selectedLetter.dateReplied && (
                                        <p className="text-xs text-gray-500 mb-2">
                                            {t('myLettersPage.replyModal.repliedOn')}: {new Date(selectedLetter.dateReplied).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}
                                        </p>
                                    )}
                                    <p className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg leading-relaxed">{selectedLetter.reply}</p>
                                </div>
                            )}
                            
                            {/* Rating Section */}
                            {selectedLetter.status === LetterStatus.REPLIED && (selectedLetter.moderatorRating === undefined || selectedLetter.moderatorRating === null) ? (
                                <div className="pt-4 border-t border-gray-200">
                                    <h4 className="font-semibold text-primary mb-3">{t('myLettersPage.replyModal.ratingPrompt')}</h4>
                                    <div className="flex flex-wrap gap-2 items-center">
                                        {[...Array(10)].map((_, i) => (
                                            <button 
                                                key={i} 
                                                onClick={() => setRating(i + 1)} 
                                                className={`w-10 h-10 rounded-full transition-all duration-200 text-sm font-bold flex items-center justify-center ${rating >= i + 1 ? 'bg-accent text-text-dark scale-110' : 'bg-gray-200 hover:bg-gray-300'}`}
                                                aria-label={t('myLettersPage.replyModal.rateLabel', { ratingValue: i + 1 })}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    {rating > 0 && <button onClick={handleRatingSubmit} className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-600 transition-colors">{t('myLettersPage.replyModal.submitRating')}</button>}
                                </div>
                            ) : (
                                selectedLetter.moderatorRating !== undefined && selectedLetter.moderatorRating !== null && (
                                <div>
                                     <p className="text-center font-semibold bg-green-100 p-3 rounded-md mt-4 border border-green-200">{t('myLettersPage.replyModal.ratingGiven')} {selectedLetter.moderatorRating}/10 {t('myLettersPage.replyModal.ratingSuffix')}</p>
                                      <div className="text-center mt-4 space-x-4">
                                        <button onClick={handleShareToWall} className="bg-yellow-400 text-text-dark px-4 py-2 rounded-lg font-bold hover:bg-yellow-500 transition-colors">
                                            {t('myLettersPage.replyModal.shareToWall')}
                                        </button>
                                        {selectedLetter.isComplex && (
                                            <button onClick={() => setIsChatOpen(true)} className="bg-purple-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-600 transition-colors animate-pulse">
                                               {t('myLettersPage.replyModal.startChat')}
                                            </button>
                                        )}
                                     </div>
                                </div>
                                )
                            )}
                        </div>
                    </Card>
                </div>
            )}
            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default MyLettersPage;
