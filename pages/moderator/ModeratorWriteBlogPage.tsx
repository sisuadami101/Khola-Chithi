import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Card from '../../components/ui/Card';
import { useLanguage } from '../../context/LanguageContext';
import { Blog } from '../../types';

interface BlogFormInputs {
    title: string;
    category: string;
    imageUrl: string;
    excerpt: string;
    content: string;
}

const categories = ['মানসিক স্বাস্থ্য', 'ক্যারিয়ার', 'সম্পর্ক', 'সাধারণ'];

const ModeratorWriteBlogPage: React.FC = () => {
    const { user } = useAuth();
    const { addBlog } = useData();
    const { t } = useLanguage();
    const { register, handleSubmit, formState: { errors }, reset } = useForm<BlogFormInputs>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const onSubmit: SubmitHandler<BlogFormInputs> = (data) => {
        if (!user) {
            alert(t('common.loginRequired'));
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => { // Simulate network delay
            const newBlog: Omit<Blog, 'id' | 'status' | 'submittedBy' | 'date' | 'views' | 'likes' | 'comments'> = {
                title: data.title,
                author: user.fullName, // Auto-fill author from current moderator
                category: data.category,
                imageUrl: data.imageUrl,
                excerpt: data.excerpt,
                content: data.content,
            };
            addBlog(newBlog, user.id); // Pass user.id as submittedBy
            setIsSubmitting(false);
            setSubmitSuccess(true);
            reset();
            setTimeout(() => setSubmitSuccess(false), 5000);
        }, 1000);
    };

    const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary";
    const errorClass = "text-red-500 text-sm mt-1";

    return (
        <div className="space-y-6 page-fade-in">
            <h1 className="text-3xl font-bold mb-2">{t('moderatorWriteBlogPage.title')}</h1>
            <p className="text-gray-600 mb-6">{t('moderatorWriteBlogPage.subtitle')}</p>

            {submitSuccess && (
                <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center mb-4">
                    {t('moderatorWriteBlogPage.success')}
                </div>
            )}

            <Card>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="block font-semibold mb-1">{t('moderatorWriteBlogPage.form.title')}</label>
                        <input type="text" {...register("title", { required: t('common.titleRequired') })} className={inputClass} />
                        {errors.title && <p className={errorClass}>{errors.title.message}</p>}
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">{t('moderatorWriteBlogPage.form.category')}</label>
                        <select {...register("category", { required: t('common.categoryRequired') })} className={inputClass}>
                            <option value="">{t('common.selectCategory')}</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        {errors.category && <p className={errorClass}>{errors.category.message}</p>}
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">{t('moderatorWriteBlogPage.form.imageUrl')}</label>
                        <input type="url" {...register("imageUrl", { required: t('common.imageUrlRequired'), pattern: { value: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/, message: t('common.invalidImageUrl') } })} className={inputClass} />
                        {errors.imageUrl && <p className={errorClass}>{errors.imageUrl.message}</p>}
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">{t('moderatorWriteBlogPage.form.excerpt')}</label>
                        <textarea {...register("excerpt", { required: t('common.excerptRequired'), maxLength: { value: 200, message: t('common.excerptTooLong') } })} className={`${inputClass} h-24`}></textarea>
                        {errors.excerpt && <p className={errorClass}>{errors.excerpt.message}</p>}
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">{t('moderatorWriteBlogPage.form.content')}</label>
                        <textarea {...register("content", { required: t('common.contentRequired') })} className={`${inputClass} h-60`}></textarea>
                        {errors.content && <p className={errorClass}>{errors.content.message}</p>}
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-accent text-text-dark py-3 rounded-lg font-bold text-lg hover:bg-yellow-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {isSubmitting ? t('common.submitting') : t('moderatorWriteBlogPage.form.submitForApproval')}
                    </button>
                </form>
            </Card>
        </div>
    );
};

export default ModeratorWriteBlogPage;