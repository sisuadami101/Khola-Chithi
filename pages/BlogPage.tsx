
import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Card from '../components/ui/Card';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';

const BLOGS_PER_PAGE = 9; // Number of blogs to display per page
const categories = ['all', 'mentalhealth', 'career', 'relationship', 'general']; // Use generic keys

const BlogPage: React.FC = () => {
    const { blogs } = useData();
    const { t, language } = useLanguage();
    const [selectedCategory, setSelectedCategory] = useState('all'); // Default to 'all'
    const [currentPage, setCurrentPage] = useState(1);
    
    const publishedBlogs = useMemo(() => blogs.filter(blog => blog.status === 'published'), [blogs]);

    const filteredBlogs = useMemo(() => {
        const filtered = selectedCategory === 'all' 
            ? publishedBlogs 
            : publishedBlogs.filter(blog => blog.category.toLowerCase().replace(/\s/g, '') === selectedCategory);
        // Reset to first page when category changes
        setCurrentPage(1); 
        return filtered;
    }, [publishedBlogs, selectedCategory]);

    // Calculate pagination
    const totalPages = Math.ceil(filteredBlogs.length / BLOGS_PER_PAGE);
    const paginatedBlogs = useMemo(() => {
        const startIndex = (currentPage - 1) * BLOGS_PER_PAGE;
        const endIndex = startIndex + BLOGS_PER_PAGE;
        return filteredBlogs.slice(startIndex, endIndex);
    }, [filteredBlogs, currentPage]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top on page change
        }
    };


    return (
        <div className="bg-background-light">
            <Header />
            <main className="container mx-auto px-4 py-16">
                <h1 className="text-4xl md:text-5xl font-bold text-text-dark text-center mb-12">{t('blogPage.title')}</h1>
                
                <div className="flex justify-center mb-8 space-x-2 md:space-x-4">
                    {categories.map(category => (
                        <button 
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full font-semibold transition-colors text-sm md:text-base ${
                                selectedCategory === category 
                                ? 'bg-primary text-white' 
                                : 'bg-white text-text-dark hover:bg-secondary'
                            }`}
                        >
                            {t(`blogPage.categories.${category}`)}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {paginatedBlogs.length > 0 ? (
                        paginatedBlogs.map(blog => (
                            <Card key={blog.id} className="flex flex-col">
                                <div className="relative">
                                    <img src={blog.imageUrl} alt={blog.title} className="rounded-t-lg w-full h-48 object-cover"/>
                                    <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">👁️ {blog.views}</span>
                                </div>
                                <div className="p-4 flex flex-col flex-grow">
                                    <span className="text-xs font-bold text-primary mb-1">{t(`blogPage.categories.${blog.category.toLowerCase().replace(/\s/g, '')}`)}</span>
                                    <h3 className="font-bold text-xl mb-2">{blog.title}</h3>
                                    <div className="text-xs text-gray-500 mb-2">
                                        <span>{blog.author}</span> &bull; <span>{new Date(blog.date).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 flex-grow">{blog.excerpt}</p>
                                    <Link to={`/blog/${blog.id}`} className="mt-4 text-primary font-bold self-start hover:underline">{t('blogPage.readFull')}</Link>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <p className="md:col-span-3 text-center text-gray-500">{t('blogPage.noBlogsFound')}</p>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mt-12">
                        <button 
                            onClick={() => handlePageChange(currentPage - 1)} 
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-white border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            aria-label={t('blogPage.prev')}
                        >
                            &larr; {t('blogPage.prev')}
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button 
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-4 py-2 border rounded-md ${currentPage === page ? 'bg-primary text-white' : 'bg-white text-text-dark hover:bg-gray-50'}`}
                                aria-label={t('blogPage.page', { page })}
                            >
                                {page}
                            </button>
                        ))}
                        <button 
                            onClick={() => handlePageChange(currentPage + 1)} 
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-white border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            aria-label={t('blogPage.next')}
                        >
                            {t('blogPage.next')} &rarr;
                        </button>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default BlogPage;
