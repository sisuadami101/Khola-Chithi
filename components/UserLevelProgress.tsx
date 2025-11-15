
import React from 'react';
import { useAuth } from '../context/AuthContext';
import Card from './ui/Card';
import { useLanguage } from '../context/LanguageContext';

const levels = [
    { nameKey: 'levels.newFriend.name', minPoints: 0, nextLevelPoints: 100 },
    { nameKey: 'levels.trustedEar.name', minPoints: 101, nextLevelPoints: 300 },
    { nameKey: 'levels.guide.name', minPoints: 301, nextLevelPoints: 600 },
    { nameKey: 'levels.lightOfHope.name', minPoints: 601, nextLevelPoints: Infinity },
];

const UserLevelProgress: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const points = user?.engagementPoints || 0;

    const currentLevel = levels.slice().reverse().find(l => points >= l.minPoints) || levels[0];
    const levelIndex = levels.findIndex(l => l.nameKey === currentLevel.nameKey);
    
    const pointsInLevel = points - currentLevel.minPoints;
    const pointsForNextLevel = currentLevel.nextLevelPoints - currentLevel.minPoints;
    const progress = currentLevel.nextLevelPoints === Infinity ? 100 : Math.round((pointsInLevel / pointsForNextLevel) * 100);

    return (
        <Card>
            <div className="flex justify-between items-center mb-2">
                <div className="font-bold">
                    {t('userProfilePage.levelProgress.level')} {levelIndex + 1}: <span className="text-primary">{t(currentLevel.nameKey)}</span>
                </div>
                <div className="text-sm font-semibold">
                    {points} / {currentLevel.nextLevelPoints === Infinity ? t('userProfilePage.levelProgress.max') : currentLevel.nextLevelPoints} {t('userProfilePage.points')}
                </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                    className="bg-accent h-4 rounded-full transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
            {currentLevel.nextLevelPoints !== Infinity &&
                <p className="text-xs text-right mt-1 text-gray-500">
                    {t('userProfilePage.levelProgress.nextLevel')}: {currentLevel.nextLevelPoints - points} {t('userProfilePage.points')} {t('userProfilePage.levelProgress.remaining')}
                </p>
            }
        </Card>
    );
};

export default UserLevelProgress;
