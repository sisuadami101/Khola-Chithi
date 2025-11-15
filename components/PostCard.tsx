import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Post, Comment } from '../types';
import { useLanguage } from '../context/LanguageContext';

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
    const { user } = useAuth();
    const { users, deletePost, toggleLikePost, addCommentToPost, updatePost, reportPost, hidePost, dismissReport } = useData();
    const { language } = useLanguage();
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(post.content);

    const author = users.find(u => u.id === post.userId);
    const isLiked = user ? post.likes.includes(user.id) : false;

    const handleDelete = () => {
        if (window.confirm("আপনি কি নিশ্চিতভাবে এই পোস্টটি মুছে ফেলতে চান?")) {
            deletePost(post.id);
        }
    };

    const handleLike = () => {
        if(user) toggleLikePost(post.id, user.id);
        else alert("আপনাকে লগইন করতে হবে।");
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(user && commentText.trim()) {
            addCommentToPost(post.id, {userId: user.id, text: commentText});
            setCommentText('');
        }
    };
    
    const handleSaveEdit = () => {
        if (editedContent.trim()) {
            updatePost(post.id, editedContent);
            setIsEditing(false);
        } else {
            alert("পোস্ট খালি রাখা যাবে না।");
        }
    };
    
    const handleReport = () => {
        if (!user) {
            alert("আপনাকে লগইন করতে হবে।");
            return;
        }
        if (post.reportedBy?.includes(user.id)) {
            alert("আপনি ইতিমধ্যে এই পোস্টটি রিপোর্ট করেছেন।");
            return;
        }
        if (window.confirm("আপনি কি এই পোস্টটি রিপোর্ট করতে চান? অ্যাডমিন এটি পর্যালোচনা করবে।")) {
            reportPost(post.id, user.id);
            alert("পোস্টটি রিপোর্ট করা হয়েছে।");
        }
    };

    const handleShare = async () => {
        const shareText = `"${post.content}" - ${author?.fullName} (kholachitthi.com থেকে)`;
        try {
            await navigator.clipboard.writeText(shareText);
            alert("পোস্ট ক্লিপবোর্ডে কপি করা হয়েছে!");
        } catch (err) {
            console.error('Failed to copy: ', err);
            alert("শেয়ার করতে সমস্যা হয়েছে।");
        }
    };

    return (
        <div className={`bg-white p-4 rounded-lg shadow-md transition-all ${post.isHidden ? 'opacity-50 bg-gray-100' : ''}`}>
            <div className="flex items-start space-x-3">
                <img src={author?.profilePicture || `https://i.pravatar.cc/150?u=${author?.id}`} alt={author?.fullName} className="w-12 h-12 rounded-full object-cover"/>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-bold">{author?.fullName}</p>
                            <p className="text-xs text-gray-500" title={new Date(post.timestamp).toString()}>
                                {new Date(post.timestamp).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                            </p>
                        </div>
                         <div className="flex items-center space-x-2">
                            {user?.id === post.userId && (
                                <>
                                 <button onClick={() => setIsEditing(!isEditing)} className="text-gray-400 hover:text-blue-500 text-sm p-1">সম্পাদনা</button>
                                 <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 text-lg font-bold p-1">&times;</button>
                                </>
                            )}
                         </div>
                    </div>
                     {isEditing ? (
                        <div className="my-3">
                            <textarea
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                className="w-full p-2 border rounded-lg"
                                rows={3}
                            />
                            <div className="flex justify-end space-x-2 mt-2">
                                <button onClick={() => setIsEditing(false)} className="text-sm px-3 py-1 rounded bg-gray-200">বাতিল</button>
                                <button onClick={handleSaveEdit} className="text-sm px-3 py-1 rounded bg-primary text-white">সংরক্ষণ</button>
                            </div>
                        </div>
                    ) : (
                        <p className="my-3 whitespace-pre-wrap">{post.content}</p>
                    )}

                     {/* MODERATION INFO */}
                    {(user?.type === 'admin' || user?.type === 'moderator') && (post.isReported || post.isHidden) && (
                        <div className={`my-2 p-2 rounded-md text-sm ${post.isHidden ? 'bg-gray-200 text-gray-600' : 'bg-yellow-100 text-yellow-800'}`}>
                            {post.isHidden && <p className="font-bold">This post is hidden from public view.</p>}
                            {post.isReported && <p><span className="font-bold">Reported:</span> This post was reported by {post.reportedBy?.length || 0} user(s).</p>}
                        </div>
                    )}

                    <div className="flex flex-wrap justify-between items-center border-t pt-2 gap-2">
                        <button onClick={handleLike} className={`flex items-center space-x-1 text-sm font-semibold ${isLiked ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}>
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
                           <span>{post.likes.length} সহানুভূতি</span>
                        </button>
                        <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-1 text-sm font-semibold text-gray-600 hover:text-primary">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                             <span>{post.comments.length} কমেন্ট</span>
                        </button>
                         <button onClick={handleShare} className="flex items-center space-x-1 text-sm font-semibold text-gray-600 hover:text-primary">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367-2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                             <span>শেয়ার</span>
                         </button>
                         {user?.id !== post.userId && (
                             <button onClick={handleReport} className="flex items-center space-x-1 text-sm font-semibold text-gray-600 hover:text-red-500" title="রিপোর্ট করুন">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
                                <span>রিপোর্ট</span>
                             </button>
                         )}
                    </div>
                </div>
            </div>

            {/* MODERATION ACTIONS */}
            {(user?.type === 'admin' || user?.type === 'moderator') && (
                <div className="mt-3 pt-3 border-t border-dashed border-red-200 flex items-center justify-end space-x-4">
                    <span className="text-xs font-bold text-red-700">Moderation Tools:</span>
                    {post.isReported && !post.isHidden && (
                        <button
                            onClick={() => dismissReport(post.id)}
                            className="text-sm font-semibold text-green-600 hover:underline"
                        >
                            Dismiss Report
                        </button>
                    )}
                    <button
                        onClick={() => hidePost(post.id, !post.isHidden)}
                        className="text-sm font-semibold text-yellow-600 hover:underline"
                    >
                        {post.isHidden ? 'Unhide Post' : 'Hide Post'}
                    </button>
                </div>
            )}

            {showComments && (
                 <div className="mt-4 pl-14 space-y-2">
                    {user && (
                         <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2">
                            <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="কমেন্ট করুন..." className="w-full text-sm p-2 border rounded-full focus:ring-1 focus:ring-primary focus:outline-none"/>
                            <button type="submit" className="bg-primary text-white text-sm px-3 py-1 rounded-full">পাঠান</button>
                         </form>
                    )}
                    {post.comments.map((comment: Comment) => {
                        const cUser = users.find(u => u.id === comment.userId);
                        return (
                            <div key={comment.id} className="flex items-start space-x-2">
                                <img src={cUser?.profilePicture || `https://i.pravatar.cc/150?u=${cUser?.id}`} alt={cUser?.fullName} className="w-8 h-8 rounded-full object-cover"/>
                                <div className="bg-gray-100 rounded-lg p-2 text-sm flex-1">
                                    <div className="flex items-baseline space-x-2">
                                        <p className="font-semibold">{cUser?.fullName}</p>
                                        <p className="text-xs text-gray-400" title={new Date(comment.timestamp).toString()}>
                                            {new Date(comment.timestamp).toLocaleTimeString(language === 'bn' ? 'bn-BD' : 'en-US', { hour: 'numeric', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <p>{comment.text}</p>
                                </div>
                            </div>
                        )
                    })}
                     {post.comments.length === 0 && <p className="text-xs text-gray-500 mt-2">এখনো কোনো কমেন্ট নেই।</p>}
                </div>
            )}
        </div>
    )
};

export default PostCard;
