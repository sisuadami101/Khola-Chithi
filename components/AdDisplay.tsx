
import React, { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import { AdCreative } from '../types';
import { useAuth } from '../context/AuthContext'; // NEW IMPORT

interface AdDisplayProps {
    slotId: string;
    className?: string;
}

const AdDisplay: React.FC<AdDisplayProps> = ({ slotId, className }) => {
    const { getAdForSlot, logAdImpression, logAdClick } = useData();
    const { user } = useAuth(); // NEW: Get current user for subscription check
    const [adCreative, setAdCreative] = useState<AdCreative | undefined>(undefined);

    useEffect(() => {
        // Pass user?.id to getAdForSlot for premium user ad filtering
        const ad = getAdForSlot(slotId, user?.id); 
        if (ad) {
            setAdCreative(ad);
            logAdImpression(ad.id); // Log impression when ad is displayed
        } else {
            setAdCreative(undefined);
        }
    }, [slotId, getAdForSlot, logAdImpression, user?.id]); // NEW: Add user.id to dependencies

    const handleClick = () => {
        if (adCreative) {
            logAdClick(adCreative.id); // Log click when ad is clicked
            window.open(adCreative.targetUrl, '_blank');
        }
    };

    if (!adCreative) {
        return null; // Don't render anything if no ad is available for this slot (e.g., premium user, no active ad)
    }

    const baseClasses = `cursor-pointer flex items-center justify-center overflow-hidden border border-gray-200 bg-gray-50 text-gray-500 text-sm font-semibold rounded-lg ${className}`;

    const renderCreative = () => {
        switch (adCreative.type) {
            case 'image':
                return <img src={adCreative.content} alt={adCreative.name} className="object-cover w-full h-full" />;
            case 'video':
                return <video src={adCreative.content} controls className="object-cover w-full h-full" />;
            case 'html':
                return <div dangerouslySetInnerHTML={{ __html: adCreative.content }} className="w-full h-full flex items-center justify-center text-center p-2" />;
            default:
                return <span>Ad Content</span>;
        }
    };

    return (
        <div className={baseClasses} onClick={handleClick} role="button" aria-label={`Advertisement: ${adCreative.name}`}>
            {renderCreative()}
        </div>
    );
};

export default AdDisplay;
