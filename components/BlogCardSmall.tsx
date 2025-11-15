import React, { useState } from 'react';
import { Blog, User, Comment } from '../types';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Card from './ui/Card'; // Assuming Card is in components/ui

interface BlogCardSmallProps {
    blog: Blog;
    user: User | null;
    onNavigate: () => void;
}

const BlogCardSmall: React.FC<BlogCardSmallProps> = ({ blog, user, onNavigate }) => {
    const { toggleLikeBlog, addCommentToBlog, users } = useData();
    const { t, language } = useLanguage();
    const { user: currentUser } = useAuth(); // Use currentUser for checks
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');

    const likes = blog.likes || [];
    const comments = blog.comments || [];
    const isLiked = currentUser ? likes.includes(currentUser.id) : false;

    const handleLike = () => {
        if (currentUser) {
            toggleLikeBlog(blog.id, currentUser.id);
        } else {
            alert(t('common.loginRequired'));
        }
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentUser && commentText.trim()) {
            const success = addCommentToBlog(blog.id, { userId: currentUser.id, text: commentText });
            if (success) {
                setCommentText('');
            }
        } else if (!currentUser) {
            alert(t('common.loginRequired'));
        } else {
            alert(t('common.emptyContentWarning'));
        }
    };

    const handleShare = async () => {
        const shareText = `"${blog.title}" by ${blog.author} - Read more at ${window.location.href}#/blog/${blog.id}`;
        try {
            await navigator.clipboard.writeText(shareText);
            alert(t('common.copiedToClipboard'));
        } catch (err) {
            console.error('Failed to copy: ', err);
            alert(t('common.shareFailed'));
        }
    };

    const getUserById = (userId: string) => users.find(u => u.id === userId);

    return (
        <Card className="flex flex-col h-full">
            <img src={blog.imageUrl} alt={blog.title} className="rounded-t-lg w-full h-40 object-cover cursor-pointer" onClick={onNavigate} />
            <div className="p-4 flex flex-col flex-grow">
                <span className="text-xs font-bold text-primary mb-1">{blog.category}</span>
                <h3 className="font-bold text-lg mb-2 cursor-pointer hover:underline" onClick={onNavigate}>{blog.title}</h3>
                <div className="text-xs text-gray-500 mb-2">
                    <span>{blog.author}</span> &bull; <span>{blog.date}</span>
                </div>
                <p className="text-sm text-gray-600 flex-grow">{blog.excerpt}</p>
                
                <div className="mt-4 flex items-center justify-around border-t pt-3">
                    <button onClick={handleLike} className={`flex items-center space-x-1 text-sm font-semibold ${isLiked ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
                        <span>{likes.length} {t('homePage.blog.likes')}</span>
                    </button>
                    <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-1 text-sm font-semibold text-gray-600 hover:text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <span>{comments.length} {t('homePage.blog.comments')}</span>
                    </button>
                    <button onClick={handleShare} className="flex items-center space-x-1 text-sm font-semibold text-gray-600 hover:text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                        <span>{t('homePage.blog.share')}</span>
                    </button>
                </div>

                {showComments && (
                    <div className="mt-4 space-y-3 pt-3 border-t">
                        {currentUser ? (
                            <form onSubmit={handleCommentSubmit} className="flex items-start space-x-2">
                                <img src={currentUser.profilePicture || `https://i.pravatar.cc/150?u=${currentUser.id}`} alt="Your avatar" className="w-8 h-8 rounded-full" />
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder={t('homePage.blog.commentPlaceholder')}
                                    className="flex-grow p-2 text-sm border rounded-full focus:ring-1 focus:ring-primary focus:outline-none"
                                />
                                <button type="submit" className="bg-primary text-white text-sm px-3 py-1 rounded-full">
                                    {t('common.send')}
                                </button>
                            </form>
                        ) : (
                            <p className="text-center text-gray-500 text-sm">{t('homePage.blog.loginToComment')}</p>
                        )}

                        <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                            {comments.length > 0 ? (
                                comments.map((comment: Comment) => {
                                    const commentUser = getUserById(comment.userId);
                                    return (
                                        <div key={comment.id} className="flex items-start space-x-2">
                                            <img src={commentUser?.profilePicture || `https://i.pravatar.cc/150?u=${comment.userId}`} alt={commentUser?.fullName} className="w-8 h-8 rounded-full" />
                                            <div className="bg-gray-100 rounded-lg p-2 text-sm flex-1">
                                                <div className="flex items-baseline space-x-1">
                                                    <p className="font-semibold">{commentUser?.fullName}</p>
                                                    <p className="text-xs text-gray-400" title={new Date(comment.timestamp).toString()}>
                                                        {new Date(comment.timestamp).toLocaleTimeString(language === 'bn' ? 'bn-BD' : 'en-US')}
                                                    </p>
                                                </div>
                                                <p>{comment.text}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-gray-500 text-sm text-center">{t('homePage.blog.noComments')}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
             <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #ccc;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #bbb;
                }
            `}</style>
        </Card>
    );
};

export default BlogCardSmall;