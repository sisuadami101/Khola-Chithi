
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import Card from '../../components/ui/Card';

const UserRewardsPage: React.FC = () => {
    const { user } = useAuth();
    const { userRewards, platformSettings } = useData();
    const { t } = useLanguage();

    const currentUserRewards = userRewards.filter(r => r.userId === user?.id);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">{t('userRewardsPage.title')}</h1>

            <Card className="text-center p-8 bg-gradient-to-r from-blue-100 to-indigo-100">
                <h2 className="text-lg font-semibold text-gray-600">{t('userRewardsPage.currentPoints')}</h2>
                <p className="text-6xl font-bold text-primary my-2">{user?.engagementPoints || 0}</p>
                <p className="text-sm text-gray-500">Keep engaging to earn more!</p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <h3 className="text-xl font-bold mb-4">{t('userRewardsPage.howToEarn')}</h3>
                    <ul className="space-y-3">
                        <li className="flex justify-between"><span>{t('userRewardsPage.pointsSystem.writeLetter')}</span> <span className="font-bold text-green-600">+{platformSettings.pointSystem.user.writeLetter} {t('adminDashboard.monetization.points')}</span></li>
                        <li className="flex justify-between"><span>{t('userRewardsPage.pointsSystem.writePost')}</span> <span className="font-bold text-green-600">+{platformSettings.pointSystem.user.writePost} {t('adminDashboard.monetization.points')}</span></li>
                        <li className="flex justify-between"><span>{t('userRewardsPage.pointsSystem.receiveLike')}</span> <span className="font-bold text-green-600">+{platformSettings.pointSystem.user.receiveLike} {t('adminDashboard.monetization.points')}</span></li>
                        <li className="flex justify-between"><span>{t('userRewardsPage.pointsSystem.giveGoodRating')}</span> <span className="font-bold text-green-600">+{platformSettings.pointSystem.user.giveGoodRating} {t('adminDashboard.monetization.points')}</span></li>
                    </ul>
                </Card>
                <Card>
                    <h3 className="text-xl font-bold mb-4">{t('userRewardsPage.rewardHistory')}</h3>
                    {currentUserRewards.length > 0 ? (
                         <table className="w-full text-sm">
                            <thead><tr className="text-left text-xs text-gray-500 uppercase">
                                <th className="p-2">Period</th><th className="p-2">Points</th><th className="p-2">Amount</th><th className="p-2">Status</th>
                            </tr></thead>
                            <tbody>
                                {currentUserRewards.map(r => (
                                    <tr key={r.id} className="border-t">
                                        <td className="p-2">{r.year} {r.period}</td>
                                        <td>{r.totalPoints}</td>
                                        <td>৳{r.amount.toFixed(2)}</td>
                                        <td>{r.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-gray-500 text-center py-4">{t('userRewardsPage.noRewards')}</p>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default UserRewardsPage;
