import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Comment, Blog, User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import BlogCardSmall from '../components/BlogCardSmall'; // Re-using BlogCardSmall for related blogs
import Card from '../components/ui/Card';
import AdDisplay from '../components/AdDisplay'; // NEW IMPORT

const SingleBlogPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { blogs, users, toggleLikeBlog, addCommentToBlog } = useData();
    const { user } = useAuth();
    const { language, t } = useLanguage();
    const [commentText, setCommentText] = useState('');
    const navigate = useNavigate();
    const relatedBlogsScrollRef = useRef<HTMLDivElement>(null);
    
    const blog = blogs.find(b => b.id === Number(id));
    const publishedBlogs = blogs.filter(b => b.status === 'published');

    // Dynamic Meta Tags and Page Title
    useEffect(() => {
        if (blog) {
            document.title = `${blog.title} - kholachitthi.com`;
            
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) metaDescription.setAttribute('content', blog.excerpt);

            const ogTitle = document.querySelector('meta[property="og:title"]');
            if (ogTitle) ogTitle.setAttribute('content', blog.title);
            
            const ogDescription = document.querySelector('meta[property="og:description"]');
            if (ogDescription) ogDescription.setAttribute('content', blog.excerpt);
            
            const ogImage = document.querySelector('meta[property="og:image"]');
            if (ogImage) ogImage.setAttribute('content', blog.imageUrl);
            
            const ogUrl = document.querySelector('meta[property="og:url"]');
            if (ogUrl) ogUrl.setAttribute('content', window.location.href);

            // Set Twitter cards as well
            const twitterTitle = document.querySelector('meta[property="twitter:title"]');
            if (twitterTitle) twitterTitle.setAttribute('content', blog.title);
            
            const twitterDescription = document.querySelector('meta[property="twitter:description"]');
            if (twitterDescription) twitterDescription.setAttribute('content', blog.excerpt);
            
            const twitterImage = document.querySelector('meta[property="twitter:image"]');
            if (twitterImage) twitterImage.setAttribute('content', blog.imageUrl);

        } else {
            document.title = `${t('blogPage.notFoundTitle')} - kholachitthi.com`;
        }
        
        // Cleanup function to reset meta tags to default if needed or when component unmounts
        return () => {
            document.title = "kholachitthi.com (খোলা চিঠি)";
            // Reset to default homepage meta content
            const defaultDescription = t('metadata.description');
            const defaultOgTitle = t('metadata.title');
            const defaultOgImage = "https://picsum.photos/1200/630?random=homepage_og";
            const defaultOgUrl = "https://kholachitthi.com/";

            document.querySelector('meta[name="description"]')?.setAttribute('content', defaultDescription);
            document.querySelector('meta[property="og:title"]')?.setAttribute('content', defaultOgTitle);
            document.querySelector('meta[property="og:description"]')?.setAttribute('content', defaultDescription);
            document.querySelector('meta[property="og:image"]')?.setAttribute('content', defaultOgImage);
            document.querySelector('meta[property="og:url"]')?.setAttribute('content', defaultOgUrl);
            document.querySelector('meta[property="twitter:title"]')?.setAttribute('content', defaultOgTitle);
            document.querySelector('meta[property="twitter:description"]')?.setAttribute('content', defaultDescription);
            document.querySelector('meta[property="twitter:image"]')?.setAttribute('content', defaultOgImage);
        };
    }, [blog, t]);


    if (!blog || blog.status !== 'published') { // Only show published blogs
        return (
            <div className="bg-background-light">
                <Header />
                <main className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-4xl font-bold">{t('blogPage.notFoundTitle')}</h1>
                    <p className="mt-4">{t('blogPage.notFoundMessage')}</p>
                    <Link to="/blog" className="mt-6 inline-block text-primary font-bold hover:underline">&larr; {t('blogPage.backToAllBlogs')}</Link>
                </main>
                <Footer />
            </div>
        );
    }
    
    const likes = blog.likes || [];
    const comments = blog.comments || [];
    const isLiked = user ? likes.includes(user.id) : false;

    const handleLike = () => {
        if (user) {
            toggleLikeBlog(blog.id, user.id);
        } else {
            alert(t('common.loginRequired'));
        }
    };

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (user && commentText.trim()) {
            const success = addCommentToBlog(blog.id, { userId: user.id, text: commentText });
            if (success) {
                setCommentText('');
            }
        } else if (!user) {
            alert(t('common.loginRequired'));
        } else {
            alert(t('common.emptyContentWarning'));
        }
    };
    
    const getUserById = (userId: string) => users.find(u => u.id === userId);

    const handleShare = async () => {
        const shareText = `"${blog.title}" by ${blog.author} - Read more at ${window.location.href}`;
        try {
            await navigator.clipboard.writeText(shareText);
            alert(t('common.copiedToClipboard'));
        } catch (err) {
            console.error('Failed to copy: ', err);
            alert(t('common.shareFailed'));
        }
    };

    // Filter related blogs (same category, exclude current blog)
    const relatedBlogs = publishedBlogs.filter(
        (b) => b.category === blog.category && b.id !== blog.id
    );

    const scrollRelatedBlogs = (direction: 'left' | 'right') => {
        if (relatedBlogsScrollRef.current) {
            const scrollAmount = direction === 'left' ? -320 : 320; // BlogCardSmall width + gap
            relatedBlogsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-background-light">
            <Header />
            <main className="container mx-auto px-4 py-16">
                <article className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
                    <header className="mb-8 border-b pb-4">
                        <p className="text-primary font-semibold">{blog.category}</p>
                        <h1 className="text-4xl md:text-5xl font-bold text-text-dark mt-2">{blog.title}</h1>
                        <div className="text-sm text-gray-500 mt-4">
                            <span>{t('blogPage.by')} {blog.author}</span> | <span>{t('blogPage.published')}: {blog.date}</span>
                        </div>
                    </header>
                    <img src={blog.imageUrl} alt={blog.title} className="w-full h-auto max-h-96 object-cover rounded-lg mb-8" />
                    <div className="prose max-w-none text-lg text-text-dark/90 leading-relaxed">
                        <p>{blog.content}</p>
                        {/* Ad Slot: Blog In-Content Ad */}
                        <div className="my-8">
                            <AdDisplay slotId="blog_in_content_ad" className="w-full h-24 md:h-32" />
                        </div>
                        <p className="mt-4">{blog.excerpt}</p>
                    </div>

                    {/* Interaction Section */}
                    <div className="mt-8 pt-6 border-t">
                        <div className="flex items-center justify-around">
                            <button onClick={handleLike} className={`flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors font-semibold ${isLiked ? 'text-primary' : ''}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
                                <span>{likes.length} {t('blogPage.likes')}</span>
                            </button>
                             <div className="flex items-center space-x-2 text-gray-600 font-semibold">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                <span>{comments.length} {t('blogPage.comments')}</span>
                            </div>
                            <button onClick={handleShare} className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors font-semibold">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                                <span>{t('blogPage.share')}</span>
                            </button>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="mt-8">
                        <h3 className="text-xl font-bold mb-4">{t('blogPage.commentsTitle')}</h3>
                        {user ? (
                            <form onSubmit={handleCommentSubmit} className="flex items-start space-x-3 mb-6">
                                <img src={user.profilePicture || `https://i.pravatar.cc/150?u=${user.id}`} alt="Your avatar" className="w-10 h-10 rounded-full"/>
                                <textarea
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder={t('blogPage.commentPlaceholder')}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                                    rows={2}
                                />
                                <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600">{t('common.send')}</button>
                            </form>
                        ) : (
                            <p className="text-center text-gray-500 mb-6">{t('common.loginToComment')}</p>
                        )}
                        <div className="space-y-4">
                            {comments.map((comment: Comment) => {
                                const commentUser = getUserById(comment.userId);
                                return (
                                <div key={comment.id} className="flex items-start space-x-3">
                                     <img src={commentUser?.profilePicture || `https://i.pravatar.cc/150?u=${comment.userId}`} alt={commentUser?.fullName} className="w-10 h-10 rounded-full"/>
                                     <div className="bg-gray-100 p-3 rounded-lg flex-1">
                                         <div className="flex items-baseline space-x-2">
                                            <p className="font-semibold">{commentUser?.fullName}</p>
                                            <p className="text-xs text-gray-500" title={new Date(comment.timestamp).toString()}>
                                                {new Date(comment.timestamp).toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US')}
                                            </p>
                                         </div>
                                         <p className="text-sm">{comment.text}</p>
                                     </div>
                                </div>
                            )})}
                             {comments.length === 0 && <p className="text-gray-500">{t('blogPage.noComments')}</p>}
                        </div>
                    </div>

                </article>

                {/* Related Blogs Section */}
                {relatedBlogs.length > 0 && (
                    <section className="max-w-3xl mx-auto mt-12">
                        <h2 className="text-2xl font-bold text-text-dark mb-6">{t('blogPage.relatedBlogs')}</h2>
                        <div className="relative">
                            <div ref={relatedBlogsScrollRef} className="flex overflow-x-auto space-x-6 pb-4 scroll-smooth snap-x snap-mandatory no-scrollbar">
                                {relatedBlogs.map(relatedBlog => (
                                    <div key={relatedBlog.id} className="flex-shrink-0 w-80 snap-center">
                                        <BlogCardSmall 
                                            blog={relatedBlog} 
                                            user={user as User} 
                                            onNavigate={() => navigate(`/blog/${relatedBlog.id}`)} 
                                        />
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => scrollRelatedBlogs('left')} className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white z-10 hidden md:block" aria-label={t('blogPage.scrollLeft')}>&lt;</button>
                            <button onClick={() => scrollRelatedBlogs('right')} className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white z-10 hidden md:block" aria-label={t('blogPage.scrollRight')}>&gt;</button>
                        </div>
                    </section>
                )}
            </main>
            <Footer />
            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none; /* IE and Edge */
                    scrollbar-width: none; /* Firefox */
                }
            `}</style>
        </div>
    );
};

export default SingleBlogPage;