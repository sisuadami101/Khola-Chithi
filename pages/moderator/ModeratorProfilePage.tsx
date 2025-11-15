import React, { useState, useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Card from '../../components/ui/Card';
import { useLanguage } from '../../context/LanguageContext';
import { User } from '../../types'; // Import User type

interface ProfileFormInputs {
    fullName: string;
    phone: string;
    profilePicture?: string;
}

interface PaymentInfoInputs {
    bkash?: string;
    nagad?: string;
    rocket?: string;
}

const ModeratorProfilePage: React.FC = () => {
    const { user, updateCurrentUser } = useAuth();
    const { updateUser } = useData();
    const { t } = useLanguage();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);

    const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors }, reset: resetProfile } = useForm<ProfileFormInputs>({
        defaultValues: {
            fullName: user?.fullName || '',
            phone: user?.phone || '',
            profilePicture: user?.profilePicture || '',
        }
    });

    const { register: registerPayment, handleSubmit: handleSubmitPayment, formState: { errors: paymentErrors }, reset: resetPayment } = useForm<PaymentInfoInputs>({
        defaultValues: {
            bkash: user?.paymentInfo?.bkash || '',
            nagad: user?.paymentInfo?.nagad || '',
            rocket: user?.paymentInfo?.rocket || '',
        }
    });

    React.useEffect(() => {
        resetProfile({
            fullName: user?.fullName || '',
            phone: user?.phone || '',
            profilePicture: user?.profilePicture || '',
        });
        resetPayment({
            bkash: user?.paymentInfo?.bkash || '',
            nagad: user?.paymentInfo?.nagad || '',
            rocket: user?.paymentInfo?.rocket || '',
        });
    }, [user, resetProfile, resetPayment]);


    const onSubmitProfile: SubmitHandler<ProfileFormInputs> = (data) => {
        if (user) {
            const updatedUserData: Partial<User> = { 
                ...data, 
                profilePicture: imagePreview || user.profilePicture 
            };
            updateCurrentUser(updatedUserData);
            updateUser(user.id, updatedUserData);
            setUpdateSuccess(true);
            setTimeout(() => setUpdateSuccess(false), 3000);
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
            setTimeout(() => setUpdateSuccess(false), 3000);
        }
    };

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

    const inputClass = "w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none";

    return (
        <div className="space-y-8 page-fade-in">
            <h1 className="text-3xl font-bold mb-4">{t('moderatorProfilePage.title')}</h1>

            <Card className="flex flex-col items-center p-6">
                <div className="relative group mb-4">
                    <img src={imagePreview || user?.profilePicture || `https://www.gravatar.com/avatar/${user?.id}?d=identicon`} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"/>
                    <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"> {t('common.change')} </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/png, image/jpeg, image/gif"/>
                </div>
                <h2 className="text-xl font-bold">{user?.fullName}</h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <h2 className="text-xl font-bold mb-4">{t('moderatorProfilePage.profileInfoTitle')}</h2>
                    <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
                        <div>
                            <label className="block font-semibold mb-1 text-sm">{t('moderatorProfilePage.fullName')}</label>
                            <input type="text" {...registerProfile("fullName", { required: t('common.fullNameRequired') })} className={inputClass} />
                            {profileErrors.fullName && <p className="text-red-500 text-sm mt-1">{profileErrors.fullName.message}</p>}
                        </div>
                        <div>
                            <label className="block font-semibold mb-1 text-sm">{t('moderatorProfilePage.phone')}</label>
                            <input type="tel" {...registerProfile("phone")} className={inputClass} />
                        </div>
                        <button type="submit" className="w-full bg-accent text-text-dark py-2 rounded-lg font-bold hover:bg-yellow-500 transition-colors">
                            {t('common.save')}
                        </button>
                        {updateSuccess && <p className="text-green-600 text-sm text-center mt-2">{t('moderatorProfilePage.updateSuccess')}</p>}
                    </form>
                </Card>

                <Card>
                    <h2 className="text-xl font-bold mb-4">{t('moderatorProfilePage.paymentInfoTitle')}</h2>
                    <p className="text-sm text-gray-600 mb-4">{t('moderatorProfilePage.paymentInfoDescription')}</p>
                    <form onSubmit={handleSubmitPayment(onSubmitPayment)} className="space-y-4">
                        <div>
                            <label className="block font-semibold mb-1 text-sm">{t('moderatorProfilePage.bkash')}</label>
                            <input type="text" {...registerPayment("bkash")} className={inputClass} placeholder="01XXXXXXXXX" />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1 text-sm">{t('moderatorProfilePage.nagad')}</label>
                            <input type="text" {...registerPayment("nagad")} className={inputClass} placeholder="01XXXXXXXXX" />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1 text-sm">{t('moderatorProfilePage.rocket')}</label>
                            <input type="text" {...registerPayment("rocket")} className={inputClass} placeholder="01XXXXXXXXX" />
                        </div>
                        <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-blue-600 transition-colors">
                            {t('common.save')} {t('moderatorProfilePage.paymentInfoText')}
                        </button>
                        {updateSuccess && <p className="text-green-600 text-sm text-center mt-2">{t('moderatorProfilePage.updateSuccess')}</p>}
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default ModeratorProfilePage;