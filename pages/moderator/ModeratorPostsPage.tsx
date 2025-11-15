import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import PostCard from '../../components/PostCard';
import Card from '../../components/ui/Card';
import { useLanguage } from '../../context/LanguageContext';

interface PostFormInputs {
    content: string;
    isPublic: boolean;
}

const ModeratorPostsPage: React.FC = () => {
    const { user } = useAuth();
    const { posts, addPost } = useData();
    const { t } = useLanguage();
    const { register, handleSubmit, reset } = useForm<PostFormInputs>();

    // Filter posts to only show those by the current moderator
    const moderatorPosts = posts
        .filter(p => p.userId === user?.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const onPostSubmit: SubmitHandler<PostFormInputs> = (data) => {
        if (user && data.content.trim()) {
            addPost({ userId: user.id, content: data.content, isPublic: data.isPublic });
            reset(); // Clear the form after submission
        } else if (!user) {
            alert(t('common.loginRequired'));
        } else {
            alert(t('common.emptyContentWarning'));
        }
    };

    return (
        <div className="space-y-6 page-fade-in">
            <h1 className="text-3xl font-bold mb-4">{t('moderatorPostsPage.title')}</h1>

            <Card>
                <form onSubmit={handleSubmit(onPostSubmit)} className="space-y-4">
                    <div className="flex items-start space-x-3">
                        <img src={user?.profilePicture || `https://www.gravatar.com/avatar/${user?.id}?d=identicon`} alt="Profile" className="w-12 h-12 rounded-full object-cover"/>
                        <textarea
                            {...register("content", { required: true })}
                            placeholder={t('moderatorPostsPage.postPlaceholder')}
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                            rows={3}
                        ></textarea>
                    </div>
                    <div className="flex justify-between items-center pl-14">
                        <div className="flex items-center">
                            <input type="checkbox" id="isPublic" {...register("isPublic")} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                            <label htmlFor="isPublic" className="ml-2 text-sm text-gray-600">{t('moderatorPostsPage.shareToFeed')}</label>
                        </div>
                        <button type="submit" className="bg-primary text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-600">
                            {t('moderatorPostsPage.postButton')}
                        </button>
                    </div>
                </form>
            </Card>

            <div className="space-y-6">
                {moderatorPosts.length > 0 ? (
                    moderatorPosts.map(post => <PostCard key={post.id} post={post} />)
                ) : (
                    <Card className="text-center text-gray-500 p-8">
                        <p>{t('moderatorPostsPage.noPosts')}</p>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default ModeratorPostsPage;