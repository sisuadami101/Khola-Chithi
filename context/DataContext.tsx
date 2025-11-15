import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, Letter, Blog, Review, Donor, ModeratorApplication, LetterStatus, Post, Comment, Badge, Resource, PlatformSettings, GratitudeEntry, PaymentMethod, SubscriptionPlan, RevenueData, ModeratorPayout, UserReward, Memory, SupportGroup, GroupPost, ChatSession, ChatMessage, AdSlot, AdCreative, AdCampaign, AdSlotType } from '../types';

// Helper to load state from localStorage
const loadState = <T,>(key: string, initialState: T): T => {
    try {
        const serializedState = localStorage.getItem(key);
        if (serializedState === null) {
            return initialState;
        }
        return JSON.parse(serializedState);
    } catch (error) {
        console.error(`Error loading state from localStorage for key "${key}":`, error);
        return initialState;
    }
};

// Helper to save state to localStorage
const saveState = <T,>(key: string, state: T): void => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem(key, serializedState);
    } catch (error) {
        console.error(`Error saving state to localStorage for key "${key}":`, error);
    }
};

// --- MOCK DATA INITIALIZATION ---
const initialUsers: User[] = [
    { id: 'user_1', fullName: 'Test User', email: 'user@test.com', type: 'user', password: 'password123', phone: '0123456789', profilePicture: `https://i.pravatar.cc/150?u=user_1`, reputationPoints: 150, moods: [{mood: "সুখী", date: new Date().toISOString().split('T')[0]}], warnings: [{ message: 'Test warning from admin', date: new Date().toISOString(), by: 'admin', issuerId: 'admin_1' }], awardedBadges: [{badgeId: 'badge_1', awardedBy: 'mod_1', date: new Date().toISOString()}], subscriptionStatus: 'none', engagementPoints: 25, paymentInfo: { bkash: '01711223344' }, lastMemoryPostDate: new Date(Date.now() - 86400000 * 10).toISOString(), lastLetterSentDate: new Date(Date.now() - 86400000 * 0.5).toISOString() }, // Example: last letter 12 hours ago
    { id: 'mod_1', fullName: 'Moderator One', email: 'mod_one123@test.com', type: 'moderator', password: 'modpass', isActive: true, serialNumber: 'mod_one123', reputationPoints: 500, warnings: [], awardedBadges: [], performancePoints: [{month: '2024-07', points: 150, details: []}], paymentInfo: { nagad: '01811223355' }, lastMemoryPostDate: new Date(Date.now() - 86400000 * 5).toISOString() }, // Example: last post 5 days ago
    { id: 'mod_mostakim860_id', fullName: 'Mostakim Moderator', email: 'mod_mostakim860@test.com', type: 'moderator', password: '7v9vvlfr', isActive: true, serialNumber: 'mod_mostakim860', reputationPoints: 400, warnings: [], awardedBadges: [], performancePoints: [{month: '2024-07', points: 120, details: []}], paymentInfo: { bkash: '01911223366' }, lastMemoryPostDate: new Date(Date.now() - 86400000 * 2).toISOString() }, // Example: last post 2 days ago
    { id: 'admin_1', fullName: 'SojiB', email: 'admin@test.com', type: 'admin', password: '7542sojibA' },
    { id: 'user_premium', fullName: 'Premium User', email: 'premium@test.com', type: 'user', password: 'password123', phone: '01511223344', profilePicture: `https://i.pravatar.cc/150?u=user_premium`, reputationPoints: 300, moods: [], warnings: [], awardedBadges: [], subscriptionStatus: 'premium_monthly', engagementPoints: 50, lastMemoryPostDate: new Date(Date.now() - 86400000 * 20).toISOString(), lastLetterSentDate: new Date(Date.now() - 86400000 * 1).toISOString() }, 
];

const initialLetters: Letter[] = [
    { id: 'l1', userId: 'user_1', subject: 'আমার ক্যারিয়ার নিয়ে আমি চিন্তিত', dateSent: '2024-07-25T10:00:00Z', status: LetterStatus.REPLIED, body: "...", reply: "প্রিয় বন্ধু, আপনার চিঠিটি পেয়ে আমরা আনন্দিত। ক্যারিয়ার নিয়ে চিন্তা হওয়া খুবই স্বাভাবিক।...", moderatorId: 'mod_1', moderatorRating: 8, dateReplied: '2024-07-25T18:00:00Z' },
    { id: 'l2', userId: 'user_1', subject: 'আমি খুব একাকী বোধ করি', dateSent: '2024-08-01T11:00:00Z', status: LetterStatus.PENDING, body: "আমার চারপাশে অনেক মানুষ, কিন্তু তারপরেও আমার খুব একা লাগে। আমি জানি না কেন এমন হয়। এই অনুভূতি থেকে কীভাবে বের হয়ে আসব?" },
    { id: 'l3', userId: 'user_1', subject: 'পারিবারিক সমস্যা', dateSent: '2024-07-23T12:00:00Z', status: LetterStatus.REPLIED, body: "...", reply: "আপনার পারিবারিক সমস্যার কথা শুনে আমরা দুঃখিত।...", moderatorId: 'mod_1', isComplex: true, dateReplied: '2024-07-24T12:00:00Z', moderatorRating: 9 },
    { id: 'l4', userId: 'user_1', subject: 'ভবিষ্যত নিয়ে উদ্বেগ', dateSent: '2024-08-01T09:00:00Z', status: LetterStatus.REPLIED, body: "ভবিষ্যত নিয়ে খুব চিন্তায় আছি, কি করব বুঝতে পারছি না।", reply: "ভবিষ্যত নিয়ে চিন্তা হওয়া স্বাভাবিক, তবে হতাশ হবেন না। ছোট ছোট পদক্ষেপ নিয়ে এগিয়ে যান।", moderatorId: 'mod_1', moderatorRating: 7, dateReplied: '2024-08-01T14:00:00Z' },
];

const initialBlogs: Blog[] = [
    { id: 1, title: 'মানসিক স্বাস্থ্যের যত্ন', author: 'ড. রহমান', date: 'জুলাই ২৫, ২০২৪', excerpt: 'মানসিক স্বাস্থ্যের যত্ন নেওয়া শারীরিক স্বাস্থ্যের মতোই জরুরি...', imageUrl: 'https://picsum.photos/400/250?random=1', views: 1024, category: 'মানসিক স্বাস্থ্য', content: 'সম্পূর্ণ ব্লগ পোস্ট এখানে থাকবে... বিস্তারিত আলোচনা এবং টিপস সহ। মানসিক স্বাস্থ্যের যত্ন নেওয়া শারীরিক স্বাস্থ্যের মতোই জরুরি।', likes: ['user_1'], comments: [], status: 'published' },
    { id: 2, title: 'ক্যারিয়ারের চাপ মোকাবেলা', author: 'তাসনিয়া আহমেদ', date: 'জুলাই ২২, ২০২৪', excerpt: 'কর্মক্ষেত্রে চাপ একটি সাধারণ বিষয়, তবে এটি মোকাবেলা করার উপায় আছে...', imageUrl: 'https://picsum.photos/400/250?random=2', views: 850, category: 'ক্যারিয়ার', content: 'সম্পূর্ণ ব্লগ পোস্ট এখানে থাকবে... বিস্তারিত আলোচনা এবং টিপস সহ। কর্মক্ষেত্রে চাপ একটি সাধারণ বিষয়, তবে এটি মোকাবেলা করার উপায় আছে।', likes: [], comments: [], status: 'published' },
    { id: 3, title: 'নতুন ব্লগ পোস্ট (মডারেটর কর্তৃক)', author: 'Moderator One', date: 'আগস্ট ১, ২০২৪', excerpt: 'এটি একটি নতুন ব্লগ পোস্ট যা মডারেটর কর্তৃক জমা দেওয়া হয়েছে।', imageUrl: 'https://picsum.photos/400/250?random=3', views: 0, category: 'সাধারণ', content: 'এই ব্লগ পোস্টটি মডারেটর ওয়ান লিখেছেন এবং অ্যাডমিনের অনুমোদনের অপেক্ষায় আছে।', likes: [], comments: [], status: 'pending', submittedBy: 'mod_1' },
    { id: 4, title: 'সম্পর্কের টানাপোড়েন', author: 'সানজিদা ইসলাম', date: 'আগস্ট ২, ২০২৪', excerpt: 'সম্পর্কে ভুল বোঝাবুঝি কীভাবে সমাধান করবেন...', imageUrl: 'https://picsum.photos/400/250?random=4', views: 600, category: 'সম্পর্ক', content: 'সম্পূর্ণ ব্লগ পোস্ট এখানে থাকবে... বিস্তারিত আলোচনা এবং টিপস সহ।', likes: [], comments: [], status: 'published' },
    { id: 5, title: 'নিজেকে ভালোবাসুন', author: 'ড. ফারিহা', date: 'আগস্ট ৩, ২০২৪', excerpt: 'নিজের প্রতি যত্নশীল হওয়া কেন গুরুত্বপূর্ণ...', imageUrl: 'https://picsum.photos/400/250?random=5', views: 720, category: 'মানসিক স্বাস্থ্য', content: 'সম্পূর্ণ ব্লগ পোস্ট এখানে থাকবে... নিজের প্রতি যত্নশীল হওয়া কেন গুরুত্বপূর্ণ।', likes: [], comments: [], status: 'published' },
    { id: 6, title: 'সময় ব্যবস্থাপনার কৌশল', author: 'আরিফ হোসেন', date: 'আগস্ট ৪, ২০২৪', excerpt: 'কর্ম ও ব্যক্তিগত জীবনে সময়কে কীভাবে কার্যকরভাবে ব্যবহার করবেন...', imageUrl: 'https://picsum.photos/400/250?random=6', views: 910, category: 'ক্যারিয়ার', content: 'সম্পূর্ণ ব্লগ পোস্ট এখানে থাকবে... সময় ব্যবস্থাপনার কৌশল।', likes: [], comments: [], status: 'published' },
    { id: 7, title: 'বন্ধুত্ব টিকিয়ে রাখার উপায়', author: 'নাসরিন আক্তার', date: 'আগস্ট ৫, ২০২৪', excerpt: 'দীর্ঘস্থায়ী বন্ধুত্বের জন্য কিছু গুরুত্বপূর্ণ টিপস...', imageUrl: 'https://picsum.photos/400/250?random=7', views: 550, category: 'সম্পর্ক', content: 'সম্পূর্ণ ব্লগ পোস্ট এখানে থাকবে... বন্ধুত্ব টিকিয়ে রাখার উপায়।', likes: [], comments: [], status: 'published' },
    { id: 8, title: 'ডিজিটাল ডিটক্স: মানসিক শান্তির পথ', author: 'ড. জামান', date: 'আগ আগস্ট ৬, ২০২৪', excerpt: 'ডিজিটাল ডিভাইসের অতিরিক্ত ব্যবহার থেকে মুক্তি পাওয়ার উপায়...', imageUrl: 'https://picsum.photos/400/250?random=8', views: 1100, category: 'মানসিক স্বাস্থ্য', content: 'সম্পূর্ণ ব্লগ পোস্ট এখানে থাকবে... ডিজিটাল ডিটক্স: মানসিক শান্তির পথ।', likes: [], comments: [], status: 'published' },
    { id: 9, title: 'নতুন কিছু শেখার গুরুত্ব', author: 'মেহজাবিন চৌধুরী', date: 'আগস্ট ৭, ২০২৪', excerpt: 'আজীবন শেখার অভ্যাস কীভাবে আপনার জীবনকে সমৃদ্ধ করে...', imageUrl: 'https://picsum.photos/400/250?random=9', views: 680, category: 'ক্যারিয়ার', content: 'সম্পূর্ণ ব্লগ পোস্ট এখানে থাকবে... নতুন কিছু শেখার গুরুত্ব।', likes: [], comments: [], status: 'published' },
    { id: 10, title: 'যোগাযোগের সঠিক পদ্ধতি', author: 'রাফি উদ্দিন', date: 'আগস্ট ৮, ২০২৪', excerpt: 'সম্পর্কে স্বচ্ছ যোগাযোগের গুরুত্ব এবং কৌশল...', imageUrl: 'https://picsum.photos/400/250?random=10', views: 820, category: 'সম্পর্ক', content: 'সম্পূর্ণ ব্লগ পোস্ট এখানে থাকবে... যোগাযোগের সঠিক পদ্ধতি।', likes: [], comments: [], status: 'published' },
    { id: 11, title: 'স্ট্রেস কমানোর সহজ উপায়', author: 'ড. আনিসা', date: 'আগস্ট ৯, ২০২৪', excerpt: 'প্রতিদিনের জীবন থেকে স্ট্রেস কমানোর কিছু কার্যকর পদ্ধতি...', imageUrl: 'https://picsum.photos/400/250?random=11', views: 770, category: 'মানসিক স্বাস্থ্য', content: 'সম্পূর্ণ ব্লগ পোস্ট এখানে থাকবে... স্ট্রেস কমানোর সহজ উপায়।', likes: [], comments: [], status: 'published' },
    // New Blog Posts
    { id: 12, title: 'প্রতিদিনের অভ্যাস: শান্ত মনের জন্য', author: 'ড. শান্তা রহমান', date: 'আগস্ট ১০, ২০২৪', excerpt: 'মানসিক শান্তি বজায় রাখতে কিছু সহজ অভ্যাস গড়ে তুলুন।', imageUrl: 'https://picsum.photos/400/250?random=12', views: 950, category: 'মানসিক স্বাস্থ্য', content: 'আপনার দৈনন্দিন জীবনে ছোট ছোট পরিবর্তন এনে মানসিক চাপ কমানো এবং প্রশান্তি বাড়ানো সম্ভব। মেডিটেশন, প্রকৃতির কাছাকাছি সময় কাটানো, এবং নিয়মিত ব্যায়াম মানসিক স্বাস্থ্যের জন্য অত্যন্ত উপকারী। পর্যাপ্ত ঘুম নিশ্চিত করুন এবং পুষ্টিকর খাবার গ্রহণ করুন।', likes: [], comments: [], status: 'published' },
    { id: 13, title: 'ক্যারিয়ার পরিবর্তনে নেভিগেট: একটি নির্দেশিকা', author: 'শাফিন আল মামুন', date: 'আগস্ট ১১, ২০২৪', excerpt: 'ক্যারিয়ার পরিবর্তনে সঠিক সিদ্ধান্ত নেওয়ার কৌশল এবং পরামর্শ।', imageUrl: 'https://picsum.photos/400/250?random=13', views: 780, category: 'ক্যারিয়ার', content: 'কর্মজীবনে পরিবর্তন আনা একটি সাহসী সিদ্ধান্ত হতে পারে। এই প্রক্রিয়াটিকে সফল করতে আপনার আগ্রহ, দক্ষতা এবং বাজারের চাহিদা বিশ্লেষণ করুন। নতুন দক্ষতা অর্জন করুন, নেটওয়ার্কিং করুন এবং পরামর্শদাতা খুঁজুন। নিজের ওপর বিশ্বাস রাখুন এবং চ্যালেঞ্জ মোকাবেলার জন্য প্রস্তুত থাকুন।', likes: [], comments: [], status: 'published' },
    { id: 14, title: 'শক্তিশালী সম্পর্ক তৈরি: যোগাযোগের টিপস', author: 'ফারজানা ইয়াসমিন', date: 'আগস্ট ১২, ২০২৪', excerpt: 'সুস্থ এবং মজবুত সম্পর্ক গড়ে তোলার জন্য কার্যকরী যোগাযোগ কৌশল।', imageUrl: 'https://picsum.photos/400/250?random=14', views: 1050, category: 'সম্পর্ক', content: 'যেকোনো সম্পর্কের ভিত্তি হলো কার্যকর যোগাযোগ। খোলাখুলি কথা বলুন, মনোযোগ দিয়ে শুনুন এবং অন্যের অনুভূতিকে সম্মান করুন। ভুল বোঝাবুঝি এড়াতে স্পষ্ট এবং সৎ থাকুন। নিয়মিতভাবে একে অপরের সাথে মানসম্মত সময় কাটান এবং একে অপরের প্রতি কৃতজ্ঞতা প্রকাশ করুন।', likes: [], comments: [], status: 'published' },
];

// Add missing initialApplications constant
const initialApplications: ModeratorApplication[] = [];

const initialPosts: Post[] = [
    { id: 'post_1', userId: 'user_1', content: 'আজকের দিনটা খুব সুন্দর!', timestamp: new Date(Date.now() - 86400000).toISOString(), likes: [], comments: [], isPublic: true, isReported: false, reportedBy: [] },
    { id: 'post_2', userId: 'user_1', content: 'এই প্ল্যাটফর্মটি ব্যবহার করে খুব ভালো লাগছে। মনের কথাগুলো বলার একটা দারুণ জায়গা।', timestamp: new Date().toISOString(), likes: ['mod_1'], comments: [{id: 'c1', userId: 'mod_1', text: 'শুনে ভালো লাগলো!', timestamp: new Date().toISOString()}], isPublic: false, isReported: true, reportedBy: ['mod_1'], isHidden: false, escalatedToAdmin: false },
    { id: 'post_3', userId: 'mod_1', content: 'মডারেটর হিসেবে কাজ করে ভালো লাগছে। সবার উপকারে আসতে পেরে আনন্দিত।', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), likes: ['user_1'], comments: [], isPublic: true, isReported: false, reportedBy: [] },
];

const initialDonors: Donor[] = [
    { id: 'donor_1', name: 'শুভাকাঙ্ক্ষী ১', email: 'donor1@test.com', phone: '01111111111', amount: 500, message: 'এই মহৎ উদ্যোগের সাথে থাকতে পেরে ভালো লাগছে।', isAnonymous: false, paymentMethod: 'Bkash', transactionId: 'BK12345XYZ', senderInfo: '01111111111', proofImageUrl: 'https://picsum.photos/200/300?random=donor1', date: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'approved' },
    { id: 'donor_2', name: 'একজন Helper', email: 'donor2@test.com', phone: '01222222222', amount: 1000, message: 'আপনাদের কাজ প্রশংসার যোগ্য। এগিয়ে যান।', isAnonymous: true, paymentMethod: 'Nagad', transactionId: 'NG67890ABC', senderInfo: '01222222222', proofImageUrl: 'https://picsum.photos/200/300?random=donor2', date: new Date(Date.now() - 86400000).toISOString(), status: 'approved' },
    { id: 'donor_3', name: 'শুভাকাঙ্ক্ষী ২', email: 'donor3@test.com', phone: '01333333333', amount: 250, message: 'অনেক অনেক শুভকামনা।', isAnonymous: false, paymentMethod: 'Bank', transactionId: 'BANKREF456', senderInfo: 'City Bank AC# 12345', proofImageUrl: 'https://picsum.photos/200/300?random=donor3', date: new Date(Date.now() - 86400000 * 3).toISOString(), status: 'pending' },
];

const initialPaymentMethods: PaymentMethod[] = [
    { id: 'pm_1', type: 'mobile', provider: 'Bkash', details: { number: '01700000000' }, isActive: true },
    { id: 'pm_2', type: 'mobile', provider: 'Nagad', details: { number: '01800000000' }, isActive: true },
    { id: 'pm_3', type: 'bank', provider: 'City Bank', details: { name: 'Kholachithi Foundation', account: '123456789012', branch: 'Gulshan' }, isActive: true },
];

const initialBadges: Badge[] = [
    { id: 'badge_1', icon: '💡', nameKey: 'badges.lightOfHope.name', descriptionKey: 'badges.lightOfHope.description' },
    { id: 'badge_2', icon: '🤗', nameKey: 'badges.empatheticFriend.name', descriptionKey: 'badges.empatheticFriend.description' },
    { id: 'badge_3', icon: '🎤', nameKey: 'badges.braveVoice.name', descriptionKey: 'badges.braveVoice.description' },
    { id: 'badge_4', icon: '🌱', nameKey: 'badges.firstStep.name', descriptionKey: 'badges.firstStep.description' },
];

const initialResources: Resource[] = [
    { id: 'res_1', title: 'মানসিক চাপে কী করবেন?', description: 'চাপ মোকাবেলা করার জন্য কিছু কার্যকরী কৌশল।', url: '#', category: 'মানসিক স্বাস্থ্য' },
    { id: 'res_2', title: 'বিষণ্ণতা থেকে মুক্তির উপায়', description: 'বিষণ্ণতা মোকাবেলার জন্য বিশেষজ্ঞের পরামর্শ।', url: '#', category: 'মানসিক স্বাস্থ্য' },
];

const initialPlatformSettings: PlatformSettings = {
    siteAnnouncement: { 
        message: 'আমাদের প্ল্যাটফর্মে নতুন "কৃতজ্ঞতা জার্নাল" ফিচার যোগ করা হয়েছে!', 
        isActive: true, 
        type: 'info',
        scheduledDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
        endDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0], // 7 days from now
    },
    pointSystem: {
      user: { writeLetter: 5, writePost: 2, receiveLike: 1, giveGoodRating: 3 },
      moderator: { replyToLetter: 10, replyFast: 2, receiveGoodRating: 5, receiveBadRating: -3, reviewReportedPost: 3 }
    },
    revenueShare: { moderators: 0.35, users: 0.10 },
    moderatorEmailDomain: '@kholachitthi.com' 
};

const initialGratitudeEntries: GratitudeEntry[] = [
    { id: 'ge_1', userId: 'user_1', content: 'আজকের সুন্দর আবহাওয়ার জন্য আমি কৃতজ্ঞ।', date: new Date().toISOString() }
];

const initialMemories: Memory[] = [
    { id: 'mem_1', userId: 'user_1', letterId: 'l1', content: 'এই উত্তরটি পেয়ে আমার মনে অনেক সাহস এসেছে। আমি বুঝতে পেরেছি যে আমি একা নই। ধন্যবাদ খোলা চিঠি।', timestamp: new Date().toISOString(), status: 'approved', likes: ['mod_1'] },
    { id: 'mem_2', userId: 'mod_1', letterId: undefined, content: 'অন্যদের সাহায্য করতে পেরে আমি খুব আনন্দিত। এই কমিউনিটি আমারও উপকারে আসছে।', timestamp: new Date(Date.now() - 86400000 * 8).toISOString(), status: 'pending', likes: [] }
];

const initialSubscriptionPlans: SubscriptionPlan[] = [
    { id: 'plan_monthly', name: 'মাসিক প্ল্যান', price: 99, duration: 'monthly', features: ['Ad-free experience', 'Send 3 letters per day', 'Exclusive profile badge'] },
    { id: 'plan_yearly', name: 'বাৎসরিক প্ল্যান', price: 999, duration: 'yearly', features: ['All monthly features', 'Access to exclusive content', 'Priority support'] },
];

const initialRevenueData: RevenueData[] = [
    { month: '2024-07', ads: 5000, donations: 8000, subscriptions: 2000 },
];

const initialModeratorPayouts: ModeratorPayout[] = [];
const initialUserRewards: UserReward[] = [];

// NEW MOCK DATA
const initialSupportGroups: SupportGroup[] = [
    { id: 'group_1', name: 'পরীক্ষার চাপ মোকাবেলা', description: 'ছাত্রছাত্রীদের পরীক্ষার চাপ, পড়াশোনা এবং মানসিক স্বাস্থ্য নিয়ে আলোচনার একটি নিরাপদ জায়গা।', coverImage: 'https://picsum.photos/600/200?random=11', memberCount: 152, isPrivate: false },
    { id: 'group_2', name: 'নতুন பெற்றோদের জন্য সাপোর্ট', description: 'নতুন বাবা-মায়েরা তাদের অভিজ্ঞতা, আনন্দ এবং চ্যালেঞ্জগুলো এখানে শেয়ার করতে পারেন।', coverImage: 'https://picsum.photos/600/200?random=12', memberCount: 89, isPrivate: true },
    { id: 'group_3', name: 'একাকীত্ব ও বিষণ্ণতা', description: 'যারা একাকীত্ব বা বিষণ্ণতায় ভুগছেন, তাদের জন্য একটি সহানুভূতিশীল কমিউনিটি।', coverImage: 'https://picsum.photos/600/200?random=13', memberCount: 234, isPrivate: false },
];

const initialGroupPosts: GroupPost[] = [
    { id: 'gp_1', groupId: 'group_1', userId: 'user_1', content: 'সামনে ফাইনাল পরীক্ষা, অনেক চাপে আছি। কীভাবে ফোকাস ধরে রাখব বুঝতে পারছি না।', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), likes: [], comments: [] },
    { id: 'gp_2', groupId: 'group_1', userId: 'mod_1', content: 'ধৈর্য ধরুন। ছোট ছোট ব্রেক নিয়ে পড়ুন। আর নিজের স্বাস্থ্যের যত্ন নিন। শুভকামনা!', timestamp: new Date(Date.now() - 86400000).toISOString(), likes: ['user_1'], comments: [] },
    { id: 'gp_3', groupId: 'group_2', userId: 'user_1', content: 'আমার বাচ্চা রাতে একদম ঘুমায় না। আমি ক্লান্ত হয়ে পড়ছি। কোনো পরামর্শ?', timestamp: new Date().toISOString(), likes: [], comments: [] },
];

const initialChatSessions: ChatSession[] = [
    {
        id: 'chat_l3', // corresponds to a letter id
        letterId: 'l3',
        userId: 'user_1',
        moderatorId: 'mod_1',
        isActive: true,
        messages: [
            { id: 'cm_1', senderId: 'mod_1', text: 'আপনার চিঠির বিষয়ে আরও আলোচনার জন্য এই চ্যাটটি শুরু করা হয়েছে।', timestamp: new Date(Date.now() - 300000).toISOString() },
            { id: 'cm_2', senderId: 'user_1', text: 'ধন্যবাদ। আমি প্রস্তুত।', timestamp: new Date(Date.now() - 180000).toISOString() },
        ]
    }
];

// --- INITIAL AD MOCK DATA ---
const initialAdSlots: AdSlot[] = [
    { id: 'home_banner_top', name: 'Homepage Top Banner', description: 'Large banner at the top of the homepage', type: AdSlotType.BANNER, dimensions: { width: 970, height: 250 }, isActive: true },
    { id: 'community_sidebar_ad', name: 'Community Feed Sidebar Ad', description: 'Sidebar ad on the community feed page', type: AdSlotType.SIDEBAR, dimensions: { width: 300, height: 250 }, isActive: true },
    { id: 'blog_in_content_ad', name: 'Blog In-Content Ad', description: 'Ad displayed within blog post content', type: AdSlotType.IN_CONTENT, dimensions: { width: 728, height: 90 }, isActive: true },
    { id: 'moderator_sidebar_ad', name: 'Moderator Dashboard Sidebar Ad', description: 'Sidebar ad in the moderator dashboard', type: AdSlotType.SIDEBAR, dimensions: { width: 300, height: 250 }, isActive: false },
    { id: 'homepage_hero_ad', name: 'Homepage Hero Ad', description: 'Top banner below the hero section on the homepage', type: AdSlotType.BANNER, dimensions: { width: 970, height: 250 }, isActive: true },
];

const initialAdCampaigns: AdCampaign[] = [
    { id: 'campaign_q3_sale', name: 'Q3 Summer Sale', startDate: new Date(2024, 6, 1).toISOString(), endDate: new Date(2024, 8, 30).toISOString(), status: 'active', priority: 10 },
    { id: 'campaign_new_app', name: 'New App Launch', startDate: new Date(2024, 7, 15).toISOString(), endDate: new Date(2024, 10, 15).toISOString(), status: 'active', priority: 5 },
    { id: 'campaign_inactive', name: 'Old Campaign', startDate: new Date(2023, 0, 1).toISOString(), endDate: new Date(2023, 1, 1).toISOString(), status: 'completed', priority: 1 },
    { id: 'campaign_spring_promo', name: 'Spring Promotion', startDate: new Date().toISOString(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), status: 'active', priority: 8 },
];

const initialAdCreatives: AdCreative[] = [
    { id: 'creative_summer_banner', name: 'Summer Banner 970x250', campaignId: 'campaign_q3_sale', type: 'image', content: 'https://picsum.photos/970/250?random=1', targetUrl: 'https://example.com/summer-sale', status: 'active', impressions: 1200, clicks: 80, allowedSlotTypes: [AdSlotType.BANNER], audience: ['all'] },
    { id: 'creative_app_sidebar', name: 'App Sidebar 300x250', campaignId: 'campaign_new_app', type: 'image', content: 'https://picsum.photos/300/250?random=2', targetUrl: '/user/profile', status: 'active', impressions: 800, clicks: 45, allowedSlotTypes: [AdSlotType.SIDEBAR], audience: ['public_only'] },
    { id: 'creative_q3_blog_banner', name: 'Q3 Blog Banner 728x90', campaignId: 'campaign_q3_sale', type: 'image', content: 'https://picsum.photos/728/90?random=3', targetUrl: 'https://example.com/q3-offer', status: 'active', impressions: 600, clicks: 30, allowedSlotTypes: [AdSlotType.IN_CONTENT], audience: ['all'] },
    { id: 'creative_html_ad', name: 'HTML Dynamic Ad', campaignId: 'campaign_new_app', type: 'html', content: '<div style="background-color: #eee; padding: 10px; text-align: center; border: 1px dashed #ccc;"><b>Exclusive Offer!</b><br>Limited Time Only.</div>', targetUrl: 'https://example.com/html-offer', status: 'active', impressions: 400, clicks: 20, allowedSlotTypes: [AdSlotType.BANNER, AdSlotType.SIDEBAR, AdSlotType.IN_CONTENT], audience: ['all'] },
    { id: 'creative_special_offer_html', name: 'Special Offer HTML', campaignId: 'campaign_new_app', type: 'html', content: '<div style="background-color: #e0f7fa; padding: 10px; text-align: center;"><b>Limited Time Offer!</b></div>', targetUrl: 'https://example.com/offer', status: 'active', impressions: 0, clicks: 0, allowedSlotTypes: [AdSlotType.IN_CONTENT], audience: ['logged_in_users'] },
    { id: 'creative_welcome_banner', name: 'Welcome Banner', campaignId: 'campaign_q3_sale', type: 'image', content: 'https://picsum.photos/1920/1080?random=homepage_banner', targetUrl: '/', status: 'active', impressions: 0, clicks: 0, allowedSlotTypes: [AdSlotType.BANNER], audience: ['public_only'] },
    { id: 'creative_welcome_banner_html', name: 'Welcome Banner HTML', campaignId: 'campaign_q3_sale', type: 'html', content: '<div style="background-color: #f0f9fa; padding: 15px; text-align: center; border-radius: 8px;"><b>Welcome to KholaChithi!</b> Your anonymous space to share and heal.</div>', targetUrl: '/', status: 'active', impressions: 0, clicks: 0, allowedSlotTypes: [AdSlotType.BANNER], audience: ['public_only'] },
];


// --- CONTEXT INTERFACE ---
interface DataContextType {
    users: User[];
    letters: Letter[];
    blogs: Blog[];
    donors: Donor[];
    applications: ModeratorApplication[];
    posts: Post[];
    badges: Badge[];
    resources: Resource[];
    platformSettings: PlatformSettings;
    gratitudeEntries: GratitudeEntry[];
    memories: Memory[];
    paymentMethods: PaymentMethod[];
    subscriptionPlans: SubscriptionPlan[];
    revenueData: RevenueData[];
    moderatorPayouts: ModeratorPayout[];
    userRewards: UserReward[];
    supportGroups: SupportGroup[];
    groupPosts: GroupPost[];
    chatSessions: ChatSession[];
    adSlots: AdSlot[];
    adCreatives: AdCreative[];
    adCampaigns: AdCampaign[];
    addUser: (user: Omit<User, 'id'>) => void;
    updateUser: (userId: string, data: Partial<User>) => void;
    deleteUser: (userId: string) => void;
    warnUser: (userId: string, message: string, by: 'admin' | 'moderator', issuerId?: string) => void;
    suspendUser: (userId: string, days: number) => void;
    toggleModeratorStatus: (moderatorId: string) => void;
    addLetter: (letter: Omit<Letter, 'id' | 'dateSent' | 'status'>) => void;
    updateLetter: (letterId: string, data: Partial<Letter>) => void;
    getLettersSentInLast24Hours: (userId: string) => number;
    addApplication: (app: ModeratorApplication) => void;
    approveApplication: (app: ModeratorApplication) => void;
    rejectApplication: (applicationId: string) => void;
    addDonation: (donation: Omit<Donor, 'id' | 'date' | 'status'>) => void;
    updateDonationStatus: (donationId: string, status: Donor['status'], adminNotes?: string) => void;
    deleteDonation: (donorId: string) => void;
    addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => void;
    updatePaymentMethod: (methodId: string, data: Partial<PaymentMethod>) => void;
    deletePaymentMethod: (methodId: string) => void;
    addPost: (postData: { userId: string, content: string, isPublic?: boolean }) => void;
    updatePost: (postId: string, newContent: string) => void;
    deletePost: (postId: string) => void;
    toggleLikePost: (postId: string, userId: string) => void;
    addCommentToPost: (postId: string, comment: Omit<Comment, 'id' | 'timestamp'>) => void;
    reportPost: (postId: string, userId: string) => void;
    hidePost: (postId: string, isHidden: boolean) => void;
    dismissReport: (postId: string) => void;
    escalatePost: (postId: string, escalate: boolean) => void;
    addBlog: (blog: Omit<Blog, 'id' | 'status' | 'date' | 'views' | 'likes' | 'comments'>, submittedBy: string) => void;
    updateBlog: (blogId: number, data: Partial<Blog>) => void;
    deleteBlog: (blogId: number) => void;
    toggleLikeBlog: (blogId: number, userId: string) => void;
    addCommentToBlog: (blogId: number, comment: Omit<Comment, 'id' | 'timestamp'>) => boolean;
    approveBlog: (blogId: number) => void;
    rejectBlog: (blogId: number) => void;
    addBadge: (badge: Omit<Badge, 'id'>) => void;
    deleteBadge: (badgeId: string) => void;
    awardBadgeToUser: (userId: string, badgeId: string, awardedBy: string) => void;
    addResource: (resource: Omit<Resource, 'id'>) => void;
    deleteResource: (resourceId: string) => void;
    updatePlatformSettings: (settings: PlatformSettings) => void;
    addGratitudeEntry: (userId: string, content: string) => void;
    deleteGratitudeEntry: (entryId: string) => void;
    logUserMood: (userId: string, mood: string) => void;
    addMemory: (memoryData: { userId: string, letterId?: string, content: string }) => boolean;
    approveMemory: (memoryId: string) => void;
    deleteMemory: (memoryId: string) => void;
    editMemory: (memoryId: string, newContent: string) => void;
    toggleLikeMemory: (memoryId: string, userId: string) => void;
    subscribeUser: (userId: string, plan: SubscriptionPlan) => void;
    addMonthlyRevenue: (revenue: RevenueData) => void;
    calculateAndSetModeratorPayouts: (month: string) => void;
    updatePayoutStatus: (payoutId: string, status: ModeratorPayout['status']) => void;
    calculateAndSetUserRewards: (year: number, period: 'H1' | 'H2') => void;
    updateUserRewardStatus: (rewardId: string, status: UserReward['status']) => void;
    addSupportGroup: (group: Omit<SupportGroup, 'id'>) => void;
    updateSupportGroup: (groupId: string, data: Partial<SupportGroup>) => void;
    deleteSupportGroup: (groupId: string) => void;
    getSupportGroupById: (groupId: string) => SupportGroup | undefined;
    getGroupPosts: (groupId: string) => GroupPost[];
    addChatSession: (session: Omit<ChatSession, 'id' | 'messages' | 'isActive'>) => ChatSession;
    getChatSession: (sessionId: string) => ChatSession | undefined;
    addChatMessage: (sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
    addAdSlot: (slot: Omit<AdSlot, 'id'>) => void;
    updateAdSlot: (slotId: string, data: Partial<AdSlot>) => void;
    deleteAdSlot: (slotId: string) => void;
    addAdCreative: (creative: Omit<AdCreative, 'id' | 'impressions' | 'clicks'>) => void;
    updateAdCreative: (creativeId: string, data: Partial<AdCreative>) => void;
    deleteAdCreative: (creativeId: string) => void;
    addAdCampaign: (campaign: Omit<AdCampaign, 'id'>) => void;
    updateAdCampaign: (campaignId: string, data: Partial<AdCampaign>) => void;
    deleteAdCampaign: (campaignId: string) => void;
    getAdForSlot: (slotId: string, userId?: string) => AdCreative | undefined;
    logAdImpression: (creativeId: string) => void;
    logAdClick: (creativeId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>(() => loadState('users', initialUsers));
    const [letters, setLetters] = useState<Letter[]>(() => loadState('letters', initialLetters));
    const [blogs, setBlogs] = useState<Blog[]>(() => loadState('blogs', initialBlogs));
    const [donors, setDonors] = useState<Donor[]>(() => loadState('donors', initialDonors));
    const [applications, setApplications] = useState<ModeratorApplication[]>(() => loadState('applications', initialApplications));
    const [posts, setPosts] = useState<Post[]>(() => loadState('posts', initialPosts));
    const [badges, setBadges] = useState<Badge[]>(() => loadState('badges', initialBadges));
    const [resources, setResources] = useState<Resource[]>(() => loadState('resources', initialResources));
    const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(() => loadState('platformSettings', initialPlatformSettings));
    const [gratitudeEntries, setGratitudeEntries] = useState<GratitudeEntry[]>(() => loadState('gratitudeEntries', initialGratitudeEntries));
    const [memories, setMemories] = useState<Memory[]>(() => loadState('memories', initialMemories));
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => loadState('paymentMethods', initialPaymentMethods));
    const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(() => loadState('subscriptionPlans', initialSubscriptionPlans));
    const [revenueData, setRevenueData] = useState<RevenueData[]>(() => loadState('revenueData', initialRevenueData));
    const [moderatorPayouts, setModeratorPayouts] = useState<ModeratorPayout[]>(() => loadState('moderatorPayouts', initialModeratorPayouts));
    const [userRewards, setUserRewards] = useState<UserReward[]>(() => loadState('userRewards', initialUserRewards));
    const [supportGroups, setSupportGroups] = useState<SupportGroup[]>(() => loadState('supportGroups', initialSupportGroups));
    const [groupPosts, setGroupPosts] = useState<GroupPost[]>(() => loadState('groupPosts', initialGroupPosts));
    const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => loadState('chatSessions', initialChatSessions));
    const [adSlots, setAdSlots] = useState<AdSlot[]>(() => loadState('adSlots', initialAdSlots));
    const [adCreatives, setAdCreatives] = useState<AdCreative[]>(() => loadState('adCreatives', initialAdCreatives));
    const [adCampaigns, setAdCampaigns] = useState<AdCampaign[]>(() => loadState('adCampaigns', initialAdCampaigns));


    // --- useEffects for localStorage persistence ---
    useEffect(() => saveState('users', users), [users]);
    useEffect(() => saveState('letters', letters), [letters]);
    useEffect(() => saveState('blogs', blogs), [blogs]);
    useEffect(() => saveState('donors', donors), [donors]);
    useEffect(() => saveState('applications', applications), [applications]);
    useEffect(() => saveState('posts', posts), [posts]);
    useEffect(() => saveState('badges', badges), [badges]);
    useEffect(() => saveState('resources', resources), [resources]);
    useEffect(() => saveState('platformSettings', platformSettings), [platformSettings]);
    useEffect(() => saveState('gratitudeEntries', gratitudeEntries), [gratitudeEntries]);
    useEffect(() => saveState('memories', memories), [memories]);
    useEffect(() => saveState('paymentMethods', paymentMethods), [paymentMethods]);
    useEffect(() => saveState('subscriptionPlans', subscriptionPlans), [subscriptionPlans]);
    useEffect(() => saveState('revenueData', revenueData), [revenueData]);
    useEffect(() => saveState('moderatorPayouts', moderatorPayouts), [moderatorPayouts]);
    useEffect(() => saveState('userRewards', userRewards), [userRewards]);
    useEffect(() => saveState('supportGroups', supportGroups), [supportGroups]);
    useEffect(() => saveState('groupPosts', groupPosts), [groupPosts]);
    useEffect(() => saveState('chatSessions', chatSessions), [chatSessions]);
    useEffect(() => saveState('adSlots', adSlots), [adSlots]);
    useEffect(() => saveState('adCreatives', adCreatives), [adCreatives]);
    useEffect(() => saveState('adCampaigns', adCampaigns), [adCampaigns]);


    // --- User Management ---
    const addUser = (userData: Omit<User, 'id'>) => {
        const newUser: User = { id: `user_${Date.now()}`, ...userData };
        setUsers(prev => [...prev, newUser]);
    };

    const updateUser = (userId: string, data: Partial<User>) => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
    };

    const deleteUser = (userId: string) => {
        setUsers(prev => prev.filter(u => u.id !== userId));
    };

    const warnUser = (userId: string, message: string, by: 'admin' | 'moderator', issuerId?: string) => {
        setUsers(prev => prev.map(u => {
            if (u.id === userId) {
                const newWarnings = [...(u.warnings || []), { message, date: new Date().toISOString(), by, issuerId }];
                return { ...u, warnings: newWarnings };
            }
            return u;
        }));
    };

    const suspendUser = (userId: string, days: number) => {
        const suspensionDate = new Date();
        suspensionDate.setDate(suspensionDate.getDate() + days);
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, suspendedUntil: suspensionDate.toISOString() } : u));
    };

    const toggleModeratorStatus = (moderatorId: string) => {
        setUsers(prev => prev.map(u => u.id === moderatorId ? { ...u, isActive: !u.isActive } : u));
    };

    // --- Letter Management ---
    const addLetter = (letterData: Omit<Letter, 'id' | 'dateSent' | 'status'>) => {
        const newLetter: Letter = {
            id: `letter_${Date.now()}`,
            dateSent: new Date().toISOString(),
            status: LetterStatus.PENDING,
            ...letterData,
        };
        setLetters(prev => [...prev, newLetter]);
        // Award points to user for writing a letter
        setUsers(prevUsers => prevUsers.map(u => {
            if (u.id === newLetter.userId) {
                return {
                    ...u,
                    engagementPoints: (u.engagementPoints || 0) + platformSettings.pointSystem.user.writeLetter,
                    lastLetterSentDate: new Date().toISOString(),
                };
            }
            return u;
        }));
    };

    const updateLetter = (letterId: string, data: Partial<Letter>) => {
        setLetters(prev => prev.map(l => {
            if (l.id === letterId) {
                const updatedLetter = { ...l, ...data };

                // Handle moderator points for replying
                if (data.status === LetterStatus.REPLIED && updatedLetter.moderatorId) {
                    const replyTimeDiff = Math.abs(new Date(updatedLetter.dateReplied!).getTime() - new Date(l.dateSent).getTime());
                    const twentyFourHours = 24 * 60 * 60 * 1000;
                    const isFastReply = replyTimeDiff <= twentyFourHours;

                    setUsers(prevUsers => prevUsers.map(u => {
                        if (u.id === updatedLetter.moderatorId) {
                            const currentMonth = new Date().toISOString().slice(0, 7);
                            let performance = u.performancePoints ? [...u.performancePoints] : [];
                            let monthPerformance = performance.find(p => p.month === currentMonth);

                            if (!monthPerformance) {
                                monthPerformance = { month: currentMonth, points: 0, details: [] };
                                performance.push(monthPerformance);
                            }

                            const replyPoints = platformSettings.pointSystem.moderator.replyToLetter;
                            const fastReplyBonus = isFastReply ? platformSettings.pointSystem.moderator.replyFast : 0;
                            const totalEarnedPoints = replyPoints + fastReplyBonus;

                            monthPerformance.points += totalEarnedPoints;
                            monthPerformance.details.push({
                                type: 'replyToLetter',
                                points: replyPoints,
                                date: new Date().toISOString()
                            });
                            if (isFastReply) {
                                monthPerformance.details.push({
                                    type: 'replyFastBonus',
                                    points: fastReplyBonus,
                                    date: new Date().toISOString()
                                });
                            }

                            return { ...u, performancePoints: performance };
                        }
                        return u;
                    }));
                }

                // Handle user points for giving good rating (if data contains moderatorRating)
                if (typeof data.moderatorRating === 'number' && data.moderatorRating >= 8 && updatedLetter.userId) {
                    setUsers(prevUsers => prevUsers.map(u => {
                        if (u.id === updatedLetter.userId) {
                            return { ...u, engagementPoints: (u.engagementPoints || 0) + platformSettings.pointSystem.user.giveGoodRating };
                        }
                        return u;
                    }));
                }
                // Handle moderator points for receiving good/bad rating
                if (typeof data.moderatorRating === 'number' && updatedLetter.moderatorId) {
                    setUsers(prevUsers => prevUsers.map(u => {
                        if (u.id === updatedLetter.moderatorId) {
                            const currentMonth = new Date().toISOString().slice(0, 7);
                            let performance = u.performancePoints ? [...u.performancePoints] : [];
                            let monthPerformance = performance.find(p => p.month === currentMonth);

                            if (!monthPerformance) {
                                monthPerformance = { month: currentMonth, points: 0, details: [] };
                                performance.push(monthPerformance);
                            }

                            if (data.moderatorRating >= 8) {
                                monthPerformance.points += platformSettings.pointSystem.moderator.receiveGoodRating;
                                monthPerformance.details.push({
                                    type: 'receiveGoodRating',
                                    points: platformSettings.pointSystem.moderator.receiveGoodRating,
                                    date: new Date().toISOString()
                                });
                            } else if (data.moderatorRating <= 4) {
                                monthPerformance.points += platformSettings.pointSystem.moderator.receiveBadRating; // Subtract points
                                monthPerformance.details.push({
                                    type: 'receiveBadRating',
                                    points: platformSettings.pointSystem.moderator.receiveBadRating,
                                    date: new Date().toISOString()
                                });
                            }
                            return { ...u, performancePoints: performance };
                        }
                        return u;
                    }));
                }
                return updatedLetter;
            }
            return l;
        }));
    };

    const getLettersSentInLast24Hours = (userId: string) => {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return letters.filter(l => l.userId === userId && new Date(l.dateSent) > twentyFourHoursAgo).length;
    };


    // --- Moderator Application Management ---
    const addApplication = (app: ModeratorApplication) => {
        setApplications(prev => [...prev, app]);
    };

    const approveApplication = (app: ModeratorApplication) => {
        setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: 'approved' } : a));
        // Create a new moderator user
        addUser({
            fullName: app.fullName,
            email: `${app.email.split('@')[0]}${platformSettings.moderatorEmailDomain}`, // Use configured domain
            type: 'moderator',
            password: 'modpass', // Default password, should be changed by admin or first login
            phone: app.phone,
            isActive: true,
            serialNumber: `${app.email.split('@')[0]}`, // Use email prefix as serial number
            reputationPoints: 0,
            warnings: [],
            awardedBadges: [],
            performancePoints: [],
        });
    };

    const rejectApplication = (applicationId: string) => {
        setApplications(prev => prev.map(a => a.id === applicationId ? { ...a, status: 'rejected' } : a));
    };


    // --- Donation Management ---
    const addDonation = (donationData: Omit<Donor, 'id' | 'date' | 'status'>) => {
        const newDonation: Donor = {
            id: `donor_${Date.now()}`,
            date: new Date().toISOString(),
            status: 'pending',
            ...donationData,
        };
        setDonors(prev => [...prev, newDonation]);
    };

    const updateDonationStatus = (donationId: string, status: Donor['status'], adminNotes?: string) => {
        setDonors(prev => prev.map(d => d.id === donationId ? { ...d, status, adminNotes } : d));
    };

    const deleteDonation = (donorId: string) => {
        setDonors(prev => prev.filter(d => d.id !== donorId));
    };


    // --- Payment Method Management (for platform receiving donations) ---
    const addPaymentMethod = (methodData: Omit<PaymentMethod, 'id'>) => {
        const newMethod: PaymentMethod = { id: `pm_${Date.now()}`, ...methodData };
        setPaymentMethods(prev => [...prev, newMethod]);
    };

    const updatePaymentMethod = (methodId: string, data: Partial<PaymentMethod>) => {
        setPaymentMethods(prev => prev.map(m => m.id === methodId ? { ...m, ...data } : m));
    };

    const deletePaymentMethod = (methodId: string) => {
        setPaymentMethods(prev => prev.filter(m => m.id !== methodId));
    };


    // --- Post Management ---
    const addPost = (postData: { userId: string, content: string, isPublic?: boolean }) => {
        const newPost: Post = {
            id: `post_${Date.now()}`,
            timestamp: new Date().toISOString(),
            likes: [],
            comments: [],
            isReported: false,
            reportedBy: [],
            isHidden: false,
            escalatedToAdmin: false,
            ...postData,
        };
        setPosts(prev => [...prev, newPost]);
        // Award points to user for writing a post
        setUsers(prevUsers => prevUsers.map(u => {
            if (u.id === newPost.userId) {
                return { ...u, engagementPoints: (u.engagementPoints || 0) + platformSettings.pointSystem.user.writePost };
            }
            return u;
        }));
    };

    const updatePost = (postId: string, newContent: string) => {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: newContent } : p));
    };

    const deletePost = (postId: string) => {
        setPosts(prev => prev.filter(p => p.id !== postId));
    };

    const toggleLikePost = (postId: string, userId: string) => {
        setPosts(prev => prev.map(p => {
            if (p.id === postId) {
                const updatedLikes = p.likes.includes(userId) ? p.likes.filter(id => id !== userId) : [...p.likes, userId];
                // Award points to post author for receiving a like
                if (!p.likes.includes(userId)) { // Only add points if it's a new like
                    setUsers(prevUsers => prevUsers.map(u => {
                        if (u.id === p.userId) {
                            return { ...u, engagementPoints: (u.engagementPoints || 0) + platformSettings.pointSystem.user.receiveLike };
                        }
                        return u;
                    }));
                }
                return { ...p, likes: updatedLikes };
            }
            return p;
        }));
    };

    const addCommentToPost = (postId: string, commentData: Omit<Comment, 'id' | 'timestamp'>) => {
        const newComment: Comment = {
            id: `comment_${Date.now()}`,
            timestamp: new Date().toISOString(),
            ...commentData,
        };
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p));
    };

    const reportPost = (postId: string, userId: string) => {
        setPosts(prev => prev.map(p => {
            if (p.id === postId) {
                const updatedReportedBy = p.reportedBy ? [...p.reportedBy, userId] : [userId];
                return { ...p, isReported: true, reportedBy: updatedReportedBy };
            }
            return p;
        }));
    };

    const hidePost = (postId: string, isHidden: boolean) => {
        setPosts(prev => prev.map(p => {
            if (p.id === postId) {
                // Award moderator points for reviewing a reported post if hiding it
                if (isHidden && p.isReported && p.moderatorId) { // Assuming moderatorId is set if they interact
                    setUsers(prevUsers => prevUsers.map(u => {
                        if (u.id === p.moderatorId) {
                            const currentMonth = new Date().toISOString().slice(0, 7);
                            let performance = u.performancePoints ? [...u.performancePoints] : [];
                            let monthPerformance = performance.find(p => p.month === currentMonth);
                            if (!monthPerformance) {
                                monthPerformance = { month: currentMonth, points: 0, details: [] };
                                performance.push(monthPerformance);
                            }
                            monthPerformance.points += platformSettings.pointSystem.moderator.reviewReportedPost;
                            monthPerformance.details.push({
                                type: 'reviewReportedPost',
                                points: platformSettings.pointSystem.moderator.reviewReportedPost,
                                date: new Date().toISOString()
                            });
                            return { ...u, performancePoints: performance };
                        }
                        return u;
                    }));
                }
                return { ...p, isHidden, isReported: isHidden ? false : p.isReported, reportedBy: isHidden ? [] : p.reportedBy };
            }
            return p;
        }));
    };

    const dismissReport = (postId: string) => {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, isReported: false, reportedBy: [] } : p));
    };

    const escalatePost = (postId: string, escalate: boolean) => {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, escalatedToAdmin: escalate } : p));
    };

    // --- Blog Management ---
    const addBlog = (blogData: Omit<Blog, 'id' | 'status' | 'date' | 'views' | 'likes' | 'comments'>, submittedBy: string) => {
        const newBlog: Blog = {
            id: blogs.length > 0 ? Math.max(...blogs.map(b => b.id)) + 1 : 1,
            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            views: 0,
            likes: [],
            comments: [],
            status: 'pending', // Awaiting admin approval
            submittedBy,
            ...blogData,
        };
        setBlogs(prev => [...prev, newBlog]);
    };

    const updateBlog = (blogId: number, data: Partial<Blog>) => {
        setBlogs(prev => prev.map(b => b.id === blogId ? { ...b, ...data } : b));
    };

    const deleteBlog = (blogId: number) => {
        setBlogs(prev => prev.filter(b => b.id !== blogId));
    };

    const toggleLikeBlog = (blogId: number, userId: string) => {
        setBlogs(prev => prev.map(b => {
            if (b.id === blogId) {
                const updatedLikes = b.likes?.includes(userId) ? b.likes.filter(id => id !== userId) : [...(b.likes || []), userId];
                return { ...b, likes: updatedLikes };
            }
            return b;
        }));
    };

    const addCommentToBlog = (blogId: number, commentData: Omit<Comment, 'id' | 'timestamp'>) => {
        const newComment: Comment = {
            id: `comment_blog_${Date.now()}`,
            timestamp: new Date().toISOString(),
            ...commentData,
        };
        let success = false;
        setBlogs(prev => prev.map(b => {
            if (b.id === blogId) {
                success = true; // Mark as successful if blog found
                return { ...b, comments: [...(b.comments || []), newComment] };
            }
            return b;
        }));
        return success; // Return true if comment was added to an existing blog
    };

    const approveBlog = (blogId: number) => {
        setBlogs(prev => prev.map(b => b.id === blogId ? { ...b, status: 'published' } : b));
    };

    const rejectBlog = (blogId: number) => {
        setBlogs(prev => prev.map(b => b.id === blogId ? { ...b, status: 'rejected' } : b));
    };

    // --- Badge Management ---
    const addBadge = (badgeData: Omit<Badge, 'id'>) => {
        const newBadge: Badge = { id: `badge_${Date.now()}`, ...badgeData };
        setBadges(prev => [...prev, newBadge]);
    };

    const deleteBadge = (badgeId: string) => {
        setBadges(prev => prev.filter(b => b.id !== badgeId));
    };

    const awardBadgeToUser = (userId: string, badgeId: string, awardedBy: string) => {
        setUsers(prev => prev.map(u => {
            if (u.id === userId) {
                const newAwardedBadges = [...(u.awardedBadges || []), { badgeId, awardedBy, date: new Date().toISOString() }];
                return { ...u, awardedBadges: newAwardedBadges };
            }
            return u;
        }));
    };

    // --- Resource Library Management ---
    const addResource = (resourceData: Omit<Resource, 'id'>) => {
        const newResource: Resource = { id: `res_${Date.now()}`, ...resourceData };
        setResources(prev => [...prev, newResource]);
    };

    const deleteResource = (resourceId: string) => {
        setResources(prev => prev.filter(r => r.id !== resourceId));
    };

    // --- Platform Settings ---
    const updatePlatformSettings = (settings: PlatformSettings) => {
        setPlatformSettings(settings);
    };


    // --- Gratitude Journal ---
    const addGratitudeEntry = (userId: string, content: string) => {
        const newEntry: GratitudeEntry = {
            id: `ge_${Date.now()}`,
            userId,
            content,
            date: new Date().toISOString(),
        };
        setGratitudeEntries(prev => [...prev, newEntry]);
    };

    const deleteGratitudeEntry = (entryId: string) => {
        setGratitudeEntries(prev => prev.filter(e => e.id !== entryId));
    };

    const logUserMood = (userId: string, mood: string) => {
        setUsers(prev => prev.map(u => {
            if (u.id === userId) {
                const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
                const existingMoodIndex = u.moods?.findIndex(m => m.date === today);
                let updatedMoods = u.moods ? [...u.moods] : [];

                if (existingMoodIndex !== undefined && existingMoodIndex !== -1) {
                    updatedMoods[existingMoodIndex] = { mood, date: today };
                } else {
                    updatedMoods.push({ mood, date: today });
                }
                return { ...u, moods: updatedMoods };
            }
            return u;
        }));
    };


    // --- Wall of Memories ---
    const addMemory = (memoryData: { userId: string, letterId?: string, content: string }) => {
        const newMemory: Memory = {
            id: `mem_${Date.now()}`,
            timestamp: new Date().toISOString(),
            status: 'pending', // Requires admin approval
            likes: [],
            ...memoryData,
        };
        setMemories(prev => [...prev, newMemory]);
        // Update user's last memory post date and add engagement points
        setUsers(prevUsers => prevUsers.map(u => {
            if (u.id === memoryData.userId) {
                return {
                    ...u,
                    lastMemoryPostDate: new Date().toISOString(),
                    engagementPoints: (u.engagementPoints || 0) + platformSettings.pointSystem.user.writePost // Reusing writePost points
                };
            }
            return u;
        }));
        return true;
    };

    const approveMemory = (memoryId: string) => {
        setMemories(prev => prev.map(m => m.id === memoryId ? { ...m, status: 'approved' } : m));
    };

    const deleteMemory = (memoryId: string) => {
        setMemories(prev => prev.filter(m => m.id !== memoryId));
    };

    const editMemory = (memoryId: string, newContent: string) => {
        setMemories(prev => prev.map(m => m.id === memoryId ? { ...m, content: newContent } : m));
    };

    const toggleLikeMemory = (memoryId: string, userId: string) => {
        setMemories(prev => prev.map(m => {
            if (m.id === memoryId) {
                const updatedLikes = m.likes.includes(userId) ? m.likes.filter(id => id !== userId) : [...m.likes, userId];
                // Award points to memory author for receiving a like
                if (!m.likes.includes(userId)) { // Only add points if it's a new like
                    setUsers(prevUsers => prevUsers.map(u => {
                        if (u.id === m.userId) {
                            return { ...u, engagementPoints: (u.engagementPoints || 0) + platformSettings.pointSystem.user.receiveLike };
                        }
                        return u;
                    }));
                }
                return { ...m, likes: updatedLikes };
            }
            return m;
        }));
    };


    // --- Subscription Management ---
    const subscribeUser = (userId: string, plan: SubscriptionPlan) => {
        setUsers(prev => prev.map(u => {
            if (u.id === userId) {
                const endDate = new Date();
                if (plan.duration === 'monthly') {
                    endDate.setMonth(endDate.getMonth() + 1);
                } else { // yearly
                    endDate.setFullYear(endDate.getFullYear() + 1);
                }
                return { ...u, subscriptionStatus: plan.id === 'plan_monthly' ? 'premium_monthly' : 'premium_yearly', subscriptionEndDate: endDate.toISOString() };
            }
            return u;
        }));
    };


    // --- Revenue and Payouts ---
    const addMonthlyRevenue = (revenue: RevenueData) => {
        setRevenueData(prev => {
            const existingIndex = prev.findIndex(r => r.month === revenue.month);
            if (existingIndex !== -1) {
                const updated = [...prev];
                updated[existingIndex] = revenue;
                return updated;
            }
            return [...prev, revenue];
        });
    };

    const calculateAndSetModeratorPayouts = (month: string) => {
        const monthRevenue = revenueData.find(r => r.month === month);
        if (!monthRevenue) {
            alert("Revenue data not found for selected month.");
            return;
        }

        const totalPlatformRevenue = monthRevenue.ads + monthRevenue.donations + monthRevenue.subscriptions;
        const moderatorSharePool = totalPlatformRevenue * platformSettings.revenueShare.moderators;

        const moderatorsInMonth = users.filter(u => u.type === 'moderator' && u.performancePoints?.some(p => p.month === month));
        const totalModeratorPoints = moderatorsInMonth.reduce((sum, mod) => {
            return sum + (mod.performancePoints?.find(p => p.month === month)?.points || 0);
        }, 0);

        if (totalModeratorPoints === 0) {
            alert("No moderator activity points for this month.");
            return;
        }

        const newPayouts: ModeratorPayout[] = moderatorsInMonth.map(mod => {
            const modPoints = mod.performancePoints?.find(p => p.month === month)?.points || 0;
            const payoutAmount = (modPoints / totalModeratorPoints) * moderatorSharePool;
            return {
                id: `payout_${month}_${mod.id}`,
                moderatorId: mod.id,
                month,
                totalPoints: modPoints,
                amount: payoutAmount,
                status: 'pending',
            };
        });

        setModeratorPayouts(prev => {
            const filtered = prev.filter(p => p.month !== month); // Remove existing payouts for this month
            return [...filtered, ...newPayouts];
        });
    };

    const updatePayoutStatus = (payoutId: string, status: ModeratorPayout['status']) => {
        setModeratorPayouts(prev => prev.map(p => p.id === payoutId ? { ...p, status } : p));
    };

    const calculateAndSetUserRewards = (year: number, period: 'H1' | 'H2') => {
        const userSharePool = revenueData.reduce((sum, r) => sum + r.ads + r.donations + r.subscriptions, 0) * platformSettings.revenueShare.users;

        const periodStartMonth = period === 'H1' ? 0 : 6; // 0 for Jan, 6 for Jul
        const periodEndMonth = period === 'H1' ? 5 : 11; // 5 for Jun, 11 for Dec

        const usersInPeriod = users.filter(u => u.type === 'user');
        const totalEngagementPointsInPeriod = usersInPeriod.reduce((sum, u) => {
            // Only sum points from the specified year and period months
            return sum + (u.engagementPoints || 0);
        }, 0);

        if (totalEngagementPointsInPeriod === 0) {
            alert("No user engagement points found for this period.");
            return;
        }

        const newRewards: UserReward[] = usersInPeriod.map(u => {
            const userPoints = u.engagementPoints || 0;
            const rewardAmount = (userPoints / totalEngagementPointsInPeriod) * userSharePool;
            return {
                id: `reward_${year}_${period}_${u.id}`,
                userId: u.id,
                period,
                year,
                totalPoints: userPoints,
                amount: rewardAmount,
                status: 'pending',
            };
        });

        setUserRewards(prev => {
            const filtered = prev.filter(r => !(r.year === year && r.period === period));
            return [...filtered, ...newRewards];
        });
    };

    const updateUserRewardStatus = (rewardId: string, status: UserReward['status']) => {
        setUserRewards(prev => prev.map(r => r.id === rewardId ? { ...r, status } : r));
    };


    // --- Support Groups ---
    const addSupportGroup = (groupData: Omit<SupportGroup, 'id'>) => {
        const newGroup: SupportGroup = { id: `group_${Date.now()}`, ...groupData };
        setSupportGroups(prev => [...prev, newGroup]);
    };
    const updateSupportGroup = (groupId: string, data: Partial<SupportGroup>) => {
        setSupportGroups(prev => prev.map(g => g.id === groupId ? { ...g, ...data } : g));
    };
    const deleteSupportGroup = (groupId: string) => {
        setSupportGroups(prev => prev.filter(g => g.id !== groupId));
        setGroupPosts(prev => prev.filter(gp => gp.groupId !== groupId)); // Delete associated posts
    };
    const getSupportGroupById = (groupId: string) => {
        return supportGroups.find(g => g.id === groupId);
    };
    const getGroupPosts = (groupId: string) => {
        return groupPosts.filter(gp => gp.groupId === groupId);
    };


    // --- Chat Sessions ---
    const addChatSession = (sessionData: Omit<ChatSession, 'id' | 'messages' | 'isActive'>) => {
        const newSession: ChatSession = {
            id: `chat_${sessionData.letterId}`, // Link chat session to letter ID for uniqueness
            messages: [],
            isActive: true,
            ...sessionData,
        };
        setChatSessions(prev => [...prev, newSession]);
        return newSession;
    };
    const getChatSession = (sessionId: string) => {
        return chatSessions.find(s => s.id === sessionId);
    };
    const addChatMessage = (sessionId: string, messageData: Omit<ChatMessage, 'id' | 'timestamp'>) => {
        setChatSessions(prev => prev.map(s => {
            if (s.id === sessionId) {
                const newChatMessage: ChatMessage = {
                    id: `cm_${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    ...messageData,
                };
                return { ...s, messages: [...s.messages, newChatMessage] };
            }
            return s;
        }));
    };


    // --- Ad Management ---
    const addAdSlot = (slotData: Omit<AdSlot, 'id'>) => {
        const newSlot: AdSlot = { id: `slot_${Date.now()}`, ...slotData };
        setAdSlots(prev => [...prev, newSlot]);
    };

    const updateAdSlot = (slotId: string, data: Partial<AdSlot>) => {
        setAdSlots(prev => prev.map(s => s.id === slotId ? { ...s, ...data } : s));
    };

    const deleteAdSlot = (slotId: string) => {
        setAdSlots(prev => prev.filter(s => s.id !== slotId));
    };

    const addAdCreative = (creativeData: Omit<AdCreative, 'id' | 'impressions' | 'clicks'>) => {
        const newCreative: AdCreative = { id: `creative_${Date.now()}`, impressions: 0, clicks: 0, ...creativeData };
        setAdCreatives(prev => [...prev, newCreative]);
    };

    const updateAdCreative = (creativeId: string, data: Partial<AdCreative>) => {
        setAdCreatives(prev => prev.map(c => c.id === creativeId ? { ...c, ...data } : c));
    };

    const deleteAdCreative = (creativeId: string) => {
        setAdCreatives(prev => prev.filter(c => c.id !== creativeId));
    };

    const addAdCampaign = (campaignData: Omit<AdCampaign, 'id'>) => {
        const newCampaign: AdCampaign = { id: `campaign_${Date.now()}`, ...campaignData };
        setAdCampaigns(prev => [...prev, newCampaign]);
    };

    const updateAdCampaign = (campaignId: string, data: Partial<AdCampaign>) => {
        setAdCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, ...data } : c));
    };

    const deleteAdCampaign = (campaignId: string) => {
        setAdCampaigns(prev => prev.filter(c => c.id !== campaignId));
    };

    const getAdForSlot = (slotId: string, userId?: string): AdCreative | undefined => {
        const now = new Date();
        const currentUser = users.find(u => u.id === userId);
        const isPremiumUser = currentUser?.subscriptionStatus !== 'none';

        if (isPremiumUser) {
            return undefined; // Premium users see no ads
        }

        const slot = adSlots.find(s => s.id === slotId && s.isActive);
        if (!slot) return undefined;

        const availableCreatives = adCreatives.filter(creative => {
            const campaign = adCampaigns.find(c => c.id === creative.campaignId);
            if (!campaign) return false;

            // Check creative and campaign status
            const isCreativeActive = creative.status === 'active';
            const isCampaignActive = campaign.status === 'active' || campaign.status === 'scheduled';

            if (!isCreativeActive || !isCampaignActive) return false;

            // Check campaign dates
            const campaignStartDate = campaign.startDate ? new Date(campaign.startDate) : null;
            const campaignEndDate = campaign.endDate ? new Date(campaign.endDate) : null;

            if ((campaignStartDate && now < campaignStartDate) || (campaignEndDate && now > campaignEndDate)) {
                return false;
            }

            // Check allowed slot types
            if (!creative.allowedSlotTypes.includes(slot.type)) return false;

            // Check audience targeting
            if (creative.audience && creative.audience.length > 0 && !creative.audience.includes('all')) {
                const userType: 'logged_in_users' | 'moderators_only' | 'public_only' = currentUser 
                    ? (currentUser.type === 'moderator' ? 'moderators_only' : 'logged_in_users') 
                    : 'public_only';
                if (!creative.audience.includes(userType)) return false;
            }

            return true;
        });

        if (availableCreatives.length === 0) return undefined;

        // Sort by campaign priority (higher first), then randomly pick
        availableCreatives.sort((a, b) => {
            const campaignA = adCampaigns.find(c => c.id === a.campaignId);
            const campaignB = adCampaigns.find(c => c.id === b.campaignId);
            return (campaignB?.priority || 0) - (campaignA?.priority || 0);
        });

        // For simplicity, pick the first one after sorting. In a real app, you might implement more complex ad serving logic.
        return availableCreatives[0];
    };

    const logAdImpression = (creativeId: string) => {
        setAdCreatives(prev => prev.map(c => c.id === creativeId ? { ...c, impressions: c.impressions + 1 } : c));
    };

    const logAdClick = (creativeId: string) => {
        setAdCreatives(prev => prev.map(c => c.id === creativeId ? { ...c, clicks: c.clicks + 1 } : c));
    };


    const contextValue: DataContextType = {
        users,
        letters,
        blogs,
        donors,
        applications,
        posts,
        badges,
        resources,
        platformSettings,
        gratitudeEntries,
        memories,
        paymentMethods,
        subscriptionPlans,
        revenueData,
        moderatorPayouts,
        userRewards,
        supportGroups,
        groupPosts,
        chatSessions,
        adSlots,
        adCreatives,
        adCampaigns,
        addUser,
        updateUser,
        deleteUser,
        warnUser,
        suspendUser,
        toggleModeratorStatus,
        addLetter,
        updateLetter,
        getLettersSentInLast24Hours,
        addApplication,
        approveApplication,
        rejectApplication,
        addDonation,
        updateDonationStatus,
        deleteDonation,
        addPaymentMethod,
        updatePaymentMethod,
        deletePaymentMethod,
        addPost,
        updatePost,
        deletePost,
        toggleLikePost,
        addCommentToPost,
        reportPost,
        hidePost,
        dismissReport,
        escalatePost,
        addBlog,
        updateBlog,
        deleteBlog,
        toggleLikeBlog,
        addCommentToBlog,
        approveBlog,
        rejectBlog,
        addBadge,
        deleteBadge,
        awardBadgeToUser,
        addResource,
        deleteResource,
        updatePlatformSettings,
        addGratitudeEntry,
        deleteGratitudeEntry,
        logUserMood,
        addMemory,
        approveMemory,
        deleteMemory,
        editMemory,
        toggleLikeMemory,
        subscribeUser,
        addMonthlyRevenue,
        calculateAndSetModeratorPayouts,
        updatePayoutStatus,
        calculateAndSetUserRewards,
        updateUserRewardStatus,
        addSupportGroup,
        updateSupportGroup,
        deleteSupportGroup,
        getSupportGroupById,
        getGroupPosts,
        addChatSession,
        getChatSession,
        addChatMessage,
        addAdSlot,
        updateAdSlot,
        deleteAdSlot,
        addAdCreative,
        updateAdCreative,
        deleteAdCreative,
        addAdCampaign,
        updateAdCampaign,
        deleteAdCampaign,
        getAdForSlot,
        logAdImpression,
        logAdClick,
    };

    return (
        <DataContext.Provider value={contextValue}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};