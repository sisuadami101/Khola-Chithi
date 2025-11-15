
import React, { useState, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import PostCard from '../../components/PostCard'; 
import Card from '../../components/ui/Card';
import { useLanguage } from '../../context/LanguageContext';
import UserLevelProgress from '../../components/UserLevelProgress';
import { Badge, User } from '../../types'; // Import Badge type and User

interface ProfileFormInputs {
    fullName: string;
    phone: string;
}
interface PostFormInputs {
    content: string;
    isPublic: boolean;
}
interface PaymentInfoInputs {
    bkash?: string;
    nagad?: string;
    rocket?: string;
}


const moods = [
    { labelKey: 'userProfilePage.moodHappy', emoji: '😊' },
    { labelKey: 'userProfilePage.moodSad', emoji: '😔' },
    { labelKey: 'userProfilePage.moodNeutral', emoji: '😐' },
    { labelKey: 'userProfilePage.moodInspired', emoji: '🥰' },
    { labelKey: 'userProfilePage.moodAngry', emoji: '😠' },
];

const MoodCalendar: React.FC = () => {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    // Ensure dateKey format matches how it's stored in DataContext
    const moodsByDate = (user?.moods || []).reduce((acc, mood) => {
        // The date stored in DataContext is YYYY-MM-DD
        acc[mood.date] = mood.mood; 
        return acc;
    }, {} as Record<string, string>);

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay(); // 0 for Sunday, 1 for Monday etc.

    const days = Array.from({ length: endOfMonth.getDate() }, (_, i) => i + 1);
    const blanks = Array.from({ length: startDay }, (_, i) => i);

    const dayNames = [
        'userProfilePage.moodCalendar.sun', 
        'userProfilePage.moodCalendar.mon', 
        'userProfilePage.moodCalendar.tue', 
        'userProfilePage.moodCalendar.wed', 
        'userProfilePage.moodCalendar.thu', 
        'userProfilePage.moodCalendar.fri', 
        'userProfilePage.moodCalendar.sat'
    ];

    return (
        <Card>
            <h3 className="font-bold text-lg mb-4 text-center">{today.toLocaleString(language === 'bn' ? 'bn-BD' : 'en-US', { month: 'long', year: 'numeric' })}</h3>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {dayNames.map(dayKey => (
                    <div key={dayKey} className="font-semibold">{t(dayKey)}</div>
                ))}
                {blanks.map(i => <div key={`blank-${i}`} aria-hidden="true"></div>)}
                {days.map(day => {
                    // Create date key in YYYY-MM-DD format for lookup
                    const date = new Date(today.getFullYear(), today.getMonth(), day);
                    const dateKey = date.toISOString().split('T')[0];
                    const mood = moodsByDate[dateKey];
                    const moodEmoji = moods.find(m => t(m.labelKey) === mood)?.emoji || ''; // Find emoji by translated label

                    return (
                        <div key={day} className={`h-10 flex flex-col items-center justify-center rounded-full relative ${mood ? 'bg-secondary' : 'bg-gray-100'}`} title={mood}>
                            <span>{day}</span>
                            {moodEmoji && <span className="absolute text-lg -top-1 -right-1" role="img" aria-label={mood}>{moodEmoji}</span>}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

const GratitudeJournal: React.FC = () => {
    const { user } = useAuth();
    const { gratitudeEntries, addGratitudeEntry, deleteGratitudeEntry } = useData();
    const { t, language } = useLanguage();
    const [entry, setEntry] = useState('');
    const userEntries = gratitudeEntries.filter(e => e.userId === user?.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (user && entry.trim()) {
            addGratitudeEntry(user.id, entry);
            setEntry('');
        }
    };
    
    return (
        <div className="space-y-4">
            <Card>
                <form onSubmit={handleSubmit} className="space-y-2">
                    <label htmlFor="gratitude-entry" className="block font-semibold mb-1">{t('userProfilePage.gratitudeJournal.prompt')}</label>
                    <textarea id="gratitude-entry" value={entry} onChange={e => setEntry(e.target.value)} className="w-full p-2 border rounded-lg" rows={3} aria-label={t('userProfilePage.gratitudeJournal.prompt')}></textarea>
                    <button type="submit" className="bg-accent text-text-dark px-4 py-2 rounded-lg font-bold">{t('userProfilePage.gratitudeJournal.add')}</button>
                </form>
            </Card>
            <div className="space-y-2">
                {userEntries.map(e => (
                    <Card key={e.id} className="flex justify-between items-start">
                        <div>
                            <p>{e.content}</p>
                            <p className="text-xs text-gray-500 mt-1">{new Date(e.date).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}</p>
                        </div>
                        <button onClick={() => deleteGratitudeEntry(e.id)} className="text-red-500 text-xl" aria-label={t('common.delete')}>&times;</button>
                    </Card>
                ))}
            </div>
        </div>
    )
};


const UserProfilePage: React.FC = () => {
    const { user, updateCurrentUser } = useAuth();
    const { updateUser, posts, letters, addPost, logUserMood, badges, users: allUsers } = useData(); // Added allUsers
    const { t, language } = useLanguage();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState<'posts' | 'journal' | 'calendar' | 'warnings'>('posts');
    const [updateSuccess, setUpdateSuccess] = useState(false);

    // Fix: Aliased the `useForm` return values for the profile form to avoid name conflicts and ensure correct usage.
    const { register: registerProfileForm, handleSubmit: handleSubmitProfileForm, formState: { errors: profileErrors }, reset: resetProfileForm } = useForm<ProfileFormInputs>({ defaultValues: { fullName: user?.fullName || '', phone: user?.phone || '' } });
    const { register: registerPostForm, handleSubmit: handleSubmitPostForm, reset: resetPostForm } = useForm<PostFormInputs>();
    const { register: registerPaymentForm, handleSubmit: handleSubmitPaymentForm, formState: { errors: paymentErrors }, reset: resetPaymentForm } = useForm<PaymentInfoInputs>({
        defaultValues: {
            bkash: user?.paymentInfo?.bkash || '',
            nagad: user?.paymentInfo?.nagad || '',
            rocket: user?.paymentInfo?.rocket || '',
        }
    });

    // Reset forms when user data changes (e.g., after login or external update)
    React.useEffect(() => {
        resetProfileForm({
            fullName: user?.fullName || '',
            phone: user?.phone || '',
        });
        resetPaymentForm({
            bkash: user?.paymentInfo?.bkash || '',
            nagad: user?.paymentInfo?.nagad || '',
            rocket: user?.paymentInfo?.rocket || '',
        });
    }, [user, resetProfileForm, resetPaymentForm]);


    const userPosts = posts.filter(p => p.userId === user?.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const userLettersCount = letters.filter(l => l.userId === user?.id).length;

    const onSubmitProfile: SubmitHandler<ProfileFormInputs> = (data) => {
        if (user) {
            const updatedUserData = { ...data, profilePicture: imagePreview || user.profilePicture };
            updateCurrentUser(updatedUserData);
            updateUser(user.id, updatedUserData);
            setUpdateSuccess(true);
            setTimeout(() => setUpdateSuccess(false), 3000); // Hide message after 3 seconds
            setImagePreview(null);
        }
    };
    
    const onSubmitPayment: SubmitHandler<PaymentInfoInputs> = (data) => {
        if (user) {
            const updatedPaymentInfo: Partial<User> = {
                paymentInfo: {
                    bkash: data.bkash || undefined,
                    nagad: data.nagad || undefined,
                    rocket: data.rocket || undefined,
                }
            };
            updateCurrentUser(updatedPaymentInfo);
            updateUser(user.id, updatedPaymentInfo);
            setUpdateSuccess(true);
            setTimeout(() => setUpdateSuccess(false), 3000); // Hide message after 3 seconds
        }
    };

    const onPostSubmit: SubmitHandler<PostFormInputs> = (data) => {
        if(user && data.content.trim()) {
            addPost({userId: user.id, content: data.content, isPublic: data.isPublic});
            resetPostForm();
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && ['image/jpeg', 'image/png'].includes(file.type) && file.size < 1048576) {
            const reader = new FileReader();
            reader.onloadend = () => { setImagePreview(reader.result as string); };
            reader.readAsDataURL(file);
        } else {
            alert(t('userProfilePage.imageUploadError'));
        }
    };
    
    const handleMoodLog = async (moodLabelKey: string) => {
        if (user) {
            const mood = t(moodLabelKey); // Get translated mood string
            await logUserMood(user.id, mood);
            // After updating global state, find the updated user and refresh AuthContext
            const updatedUserFromData = allUsers.find(u => u.id === user.id);
            if (updatedUserFromData) {
                // IMPORTANT: updateCurrentUser should be called with a Partial<User> that reflects
                // the *change* to the user object, specifically the updated moods.
                updateCurrentUser({ moods: updatedUserFromData.moods });
            }
            alert(t('userProfilePage.moodLogged', { mood }));
        }
    };
    
    const awardedBadges = (user?.awardedBadges || [])
        .map(ab => badges.find(b => b.id === ab.badgeId))
        .filter((badge): badge is Badge => badge !== undefined); // Type guard to filter out undefined

    const inputClass = "w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none";
    const errorClass = "text-red-500 text-sm mt-1";

    return (
        <div className="space-y-8 page-fade-in">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-40 bg-gray-200 bg-cover bg-center" style={{backgroundImage: "url('https://picsum.photos/1000/200')"}}></div>
                <div className="p-4 sm:p-6">
                    <div className="flex items-end -mt-16">
                        <div className="relative group">
                            <img src={imagePreview || user?.profilePicture || `https://www.gravatar.com/avatar/${user?.id}?d=identicon`} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-white"/>
                            <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-label={t('common.change')}> {t('common.change')} </button>
                            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/png, image/jpeg, image/gif"/>
                        </div>
                        <div className="ml-4">
                            <h1 className="text-2xl font-bold">{user?.fullName}</h1>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                    </div>
                     <div className="mt-4 flex flex-wrap justify-around border-t pt-4 text-center gap-4">
                        <div><p className="font-bold">{userPosts.length}</p><p className="text-sm text-gray-500">{t('userProfilePage.posts')}</p></div>
                        <div><p className="font-bold">{userLettersCount}</p><p className="text-sm text-gray-500">{t('userProfilePage.letters')}</p></div>
                        <div><p className="font-bold text-primary">{user?.engagementPoints || 0}</p><p className="text-sm text-gray-500">{t('userProfilePage.engagementPoints')}</p></div>
                    </div>
                </div>
            </div>
            
            <UserLevelProgress />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-8">
                    <Card>
                        <h2 className="text-xl font-bold mb-4">{t('userProfilePage.moodJournalTitle')}</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2 text-md">{t('userProfilePage.moodPrompt')}</h3>
                                <div className="flex flex-wrap gap-2">
                                {moods.map(m => (
                                    <button key={m.labelKey} onClick={() => handleMoodLog(m.labelKey)} className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 hover:bg-secondary transition-colors text-sm" aria-label={t(m.labelKey)}>
                                        <span role="img" aria-hidden="true">{m.emoji}</span><span>{t(m.labelKey)}</span>
                                    </button>
                                ))}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h2 className="text-xl font-bold mb-4">{t('userProfilePage.achievementsTitle')}</h2>
                        {awardedBadges.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {awardedBadges.map(badge => (
                                    <span 
                                        key={badge.id} 
                                        title={t(badge.descriptionKey)} 
                                        className="bg-accent text-text-dark text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 cursor-pointer"
                                        aria-label={t(badge.nameKey)}
                                    > 
                                        <span role="img" aria-hidden="true">{badge.icon}</span> {t(badge.nameKey)} 
                                    </span>
                                ))}
                            </div>
                        ): <p className="text-sm text-gray-500">{t('userProfilePage.noBadges')}</p>}
                    </Card>

                    <Card>
                        <h2 className="text-xl font-bold mb-4">{t('userProfilePage.profileInfoTitle')}</h2>
                        <form onSubmit={handleSubmitProfileForm(onSubmitProfile)} className="space-y-4">
                            <div>
                                <label htmlFor="profile-fullName" className="block font-semibold mb-1 text-sm">{t('userProfilePage.fullName')}</label>
                                <input id="profile-fullName" type="text" {...registerProfileForm("fullName", { required: t('common.fullNameRequired') })} className={inputClass} />
                                {profileErrors.fullName && <p className={errorClass}>{profileErrors.fullName.message}</p>}
                            </div>
                            <div>
                                <label htmlFor="profile-phone" className="block font-semibold mb-1 text-sm">{t('userProfilePage.phone')}</label>
                                <input id="profile-phone" type="tel" {...registerProfileForm("phone")} className={inputClass} />
                            </div>
                            <div>
                                <button type="submit" className="w-full bg-accent text-text-dark py-2 rounded-lg font-bold hover:bg-yellow-500 transition-colors">
                                    {t('common.save')}
                                </button>
                                {updateSuccess && <p className="text-green-600 text-sm text-center mt-2">{t('userProfilePage.profileUpdateSuccess')}</p>}
                            </div>
                        </form>
                    </Card>

                    {/* NEW: User Payment Information Card */}
                    <Card>
                        <h2 className="text-xl font-bold mb-4">{t('userProfilePage.paymentInfoTitle')}</h2>
                        <p className="text-sm text-gray-600 mb-4">{t('userProfilePage.paymentInfoDescription')}</p>
                        <form onSubmit={handleSubmitPaymentForm(onSubmitPayment)} className="space-y-4">
                            <div>
                                <label htmlFor="payment-bkash" className="block font-semibold mb-1 text-sm">{t('userProfilePage.bkash')}</label>
                                <input id="payment-bkash" type="text" {...registerPaymentForm("bkash")} className={inputClass} placeholder="01XXXXXXXXX" />
                            </div>
                            <div>
                                <label htmlFor="payment-nagad" className="block font-semibold mb-1 text-sm">{t('userProfilePage.nagad')}</label>
                                <input id="payment-nagad" type="text" {...registerPaymentForm("nagad")} className={inputClass} placeholder="01XXXXXXXXX" />
                            </div>
                            <div>
                                <label htmlFor="payment-rocket" className="block font-semibold mb-1 text-sm">{t('userProfilePage.rocket')}</label>
                                <input id="payment-rocket" type="text" {...registerPaymentForm("rocket")} className={inputClass} placeholder="01XXXXXXXXX" />
                            </div>
                            <div>
                                <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors">
                                    {t('common.save')}
                                </button>
                                {updateSuccess && <p className="text-green-600 text-sm text-center mt-2">{t('userProfilePage.profileUpdateSuccess')}</p>}
                            </div>
                        </form>
                    </Card>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <div className="flex border-b">
                        {['posts', 'journal', 'calendar', 'warnings'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 font-semibold ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`} aria-controls={`tab-panel-${tab}`} role="tab" aria-selected={activeTab === tab}>
                                { {posts: t('userProfilePage.tabPosts'), journal: t('userProfilePage.tabJournal'), calendar: t('userProfilePage.tabCalendar'), warnings: t('userProfilePage.tabWarnings')}[tab] }
                            </button>
                        ))}
                    </div>

                    <div id={`tab-panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
                        {activeTab === 'posts' && (
                            <div className="space-y-6">
                                <Card>
                                    <form onSubmit={handleSubmitPostForm(onPostSubmit)} className="space-y-4">
                                        <div className="flex items-start space-x-3">
                                            <img src={user?.profilePicture || `https://www.gravatar.com/avatar/${user?.id}?d=identicon`} alt="Profile" className="w-12 h-12 rounded-full object-cover"/>
                                            <textarea id="post-content" {...registerPostForm("content", { required: true })} placeholder={t('userProfilePage.postPlaceholder')} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" rows={3} aria-label={t('userProfilePage.postPlaceholder')}></textarea>
                                        </div>
                                        <div className="flex justify-between items-center pl-14">
                                            <div className="flex items-center">
                                                <input type="checkbox" id="isPublic" {...registerPostForm("isPublic")} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                                                <label htmlFor="isPublic" className="ml-2 text-sm text-gray-600">{t('userProfilePage.shareToFeed')}</label>
                                            </div>
                                            <button type="submit" className="bg-primary text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-600">{t('userProfilePage.postButton')}</button>
                                        </div>
                                    </form>
                                </Card>
                                {userPosts.map(post => <PostCard key={post.id} post={post}/>)}
                                {userPosts.length === 0 && (
                                    <Card className="text-center text-gray-500 p-8"><p>{t('userProfilePage.noPosts')}</p></Card>
                                )}
                            </div>
                        )}
                        {activeTab === 'journal' && <GratitudeJournal />}
                        {activeTab === 'calendar' && <MoodCalendar />}
                        {activeTab === 'warnings' && (
                            <div className="space-y-4">
                                {user?.warnings && user.warnings.length > 0 ? (
                                    user.warnings.map((warning, index) => {
                                        const issuer = allUsers.find(u => u.id === warning.issuerId);
                                        return (
                                            <Card key={index} className="border-l-4 border-red-500 p-4">
                                                <p className="font-semibold">{t('userProfilePage.warnings.reason')}: {warning.message}</p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {t('userProfilePage.warnings.issuedBy')}: {issuer?.fullName || (warning.by === 'admin' ? 'Admin' : 'Unknown Moderator')}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(warning.date).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US')}
                                                </p>
                                            </Card>
                                        );
                                    })
                                ) : (
                                    <Card className="text-center text-gray-500 p-8">
                                        <p>{t('userProfilePage.warnings.noWarnings')}</p>
                                    </Card>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default UserProfilePage;
