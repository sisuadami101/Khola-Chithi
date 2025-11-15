

import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useData } from '../context/DataContext';
import PostCard from '../components/PostCard';
import Card from '../components/ui/Card';
import { User } from '../types';
import AdDisplay from '../components/AdDisplay'; // NEW IMPORT

const LeaderboardCard: React.FC = () => {
    const { users } = useData();
    const topUsers = users
        .filter(u => u.type === 'user')
        .sort((a, b) => (b.engagementPoints || 0) - (a.engagementPoints || 0))
        .slice(0, 5);

    return (
        <Card>
            <h3 className="font-bold text-lg mb-4 border-b pb-2">সাপ্তাহিক লিডারবোর্ড</h3>
            <div className="space-y-4">
                {topUsers.map((user, index) => (
                    <div key={user.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <span className="font-bold text-lg text-gray-400">{index + 1}</span>
                            <img src={user.profilePicture || `https://i.pravatar.cc/150?u=${user.id}`} alt={user.fullName} className="w-10 h-10 rounded-full object-cover"/>
                            <div>
                                <p className="font-semibold text-sm">{user.fullName}</p>
                                <p className="text-xs text-primary font-bold">{user.engagementPoints || 0} পয়েন্ট</p>
                            </div>
                        </div>
                        {index === 0 && <span className="text-2xl" title="Top User">🥇</span>}
                        {index === 1 && <span className="text-2xl" title="Second Place">🥈</span>}
                        {index === 2 && <span className="text-2xl" title="Third Place">🥉</span>}
                    </div>
                ))}
            </div>
        </Card>
    );
};


const CommunityFeedPage: React.FC = () => {
    const { posts, users, resources } = useData();

    const publicPosts = posts
        .filter(p => p.isPublic && !p.isHidden)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
    const activeUsers = users.filter(u => u.type === 'user').slice(0, 5); // Example: show top 5 active users

    return (
        <div className="bg-background-light">
            <Header />
            <main className="container mx-auto px-4 py-16 page-fade-in">
                <div className="text-center mb-12">
                     <h1 className="text-4xl md:text-5xl font-bold text-text-dark">কমিউনিটি ফিড</h1>
                     <p className="mt-4 text-lg text-text-dark/80 max-w-2xl mx-auto">সবার সাথে শেয়ার করা পোস্টগুলো এখানে দেখুন এবং আলোচনায় অংশ নিন।</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Main Feed */}
                    <div className="md:col-span-3 space-y-6">
                        {publicPosts.length > 0 ? (
                            publicPosts.map(post => <PostCard key={post.id} post={post} />)
                        ) : (
                            <Card className="text-center p-8">
                                <p className="text-gray-500">কমিউনিটি ফিডে এখনো কোনো পোস্ট শেয়ার করা হয়নি।</p>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside className="md:col-span-1 space-y-6">
                        <LeaderboardCard />
                        {/* Ad Slot: Community Feed Sidebar Ad */}
                        <AdDisplay slotId="community_sidebar_ad" className="w-full h-64" />
                        <Card>
                           <h3 className="font-bold text-lg mb-4 border-b pb-2">রিসোর্স লাইব্রেরি</h3>
                           <div className="space-y-3">
                               {resources.map(res => (
                                   <div key={res.id} className="border-b pb-2">
                                       <a href={res.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-sm text-primary hover:underline">{res.title}</a>
                                       <p className="text-xs text-gray-500">{res.description}</p>
                                   </div>
                               ))}
                           </div>
                        </Card>
                         <Card>
                           <h3 className="font-bold text-lg mb-4 border-b pb-2">কমিউনিটি নির্দেশিকা</h3>
                           <ul className="text-sm space-y-2 list-disc list-inside text-gray-600">
                               <li>একে অপরের প্রতি শ্রদ্ধাশীল থাকুন।</li>
                               <li>কোনো প্রকার ঘৃণামূলক বক্তব্য গ্রহণযোগ্য নয়।</li>
                               <li>ব্যক্তিগত তথ্য শেয়ার করা থেকে বিরত থাকুন।</li>
                               <li>সহানুভূতিশীল এবং সহায়ক হন।</li>
                           </ul>
                        </Card>
                    </aside>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CommunityFeedPage;