import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import Card from '../components/ui/Card';

const SupportGroupsPage: React.FC = () => {
    const { supportGroups } = useData();
    const { t } = useLanguage();

    return (
        <div className="bg-background-light min-h-screen">
            <Header />
            <main className="container mx-auto px-4 py-16 page-fade-in">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-text-dark">{t('supportGroups.title')}</h1>
                    <p className="mt-4 text-lg text-text-dark/80 max-w-2xl mx-auto">{t('supportGroups.subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {supportGroups.map(group => (
                        <Card key={group.id} className="flex flex-col overflow-hidden">
                            <img src={group.coverImage} alt={group.name} className="w-full h-40 object-cover" />
                            <div className="p-6 flex flex-col flex-grow">
                                <h2 className="text-2xl font-bold mb-2">{group.name}</h2>
                                <p className="text-gray-600 text-sm mb-4 flex-grow">{group.description}</p>
                                <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
                                    <span>{group.memberCount.toLocaleString()} {t('supportGroups.members')}</span>
                                    {group.isPrivate && <span className="font-semibold text-red-500">Private</span>}
                                </div>
                                <Link to={`/groups/${group.id}`} className="mt-auto text-center w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors">
                                    {t('supportGroups.enterGroup')}
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default SupportGroupsPage;
