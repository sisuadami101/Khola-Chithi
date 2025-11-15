
export interface User {
  id: string;
  fullName: string;
  email: string;
  type: 'user' | 'moderator' | 'admin';
  password?: string;
  profilePicture?: string;
  phone?: string;
  paymentInfo?: {
    bkash?: string;
    nagad?: string;
    rocket?: string;
  };
  isActive?: boolean; // For moderators
  serialNumber?: string; // For moderators
  reputationPoints?: number;
  badges?: string[];
  moods?: { mood: string; date: string; }[];
  warnings?: { message: string, date: string, by: 'moderator' | 'admin', issuerId?: string }[]; // Added for user warnings
  suspendedUntil?: string; // ISO date string
  awardedBadges?: { badgeId: string; awardedBy: string; date: string }[];
  // Monetization fields
  subscriptionStatus?: 'none' | 'premium_monthly' | 'premium_yearly';
  subscriptionEndDate?: string;
  engagementPoints?: number; // For users
  performancePoints?: { month: string; points: number; details: { type: string; points: number; date: string }[] }[]; // For moderators
  lastMemoryPostDate?: string; // To track last Wall of Memories post for cooldown
  lastLetterSentDate?: string; // To track last letter sent for cooldown
}

export interface Comment {
    id: string;
    userId: string;
    text: string;
    timestamp: string;
}

export interface Post {
    id: string;
    userId: string;
    content: string;
    timestamp: string;
    likes: string[]; // array of userIds
    comments: Comment[];
    isPublic?: boolean; // For community feed
    isReported?: boolean; // For admin review
    reportedBy?: string[]; // array of userIds who reported this
    isHidden?: boolean;
    escalatedToAdmin?: boolean;
}

export interface Blog {
  id: number;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  imageUrl: string;
  views: number;
  category: string;
  content: string; // Added for full blog post view
  likes?: string[]; // array of userIds
  comments?: Comment[];
  status?: 'draft' | 'pending' | 'published' | 'rejected'; // For moderator blog submissions
  submittedBy?: string; // User ID of moderator who submitted it
}

export interface Review {
  id: number;
  name: string;
  avatarUrl: string;
  text: string;
}

export interface Donor {
    id: string;
    // User-provided info
    name: string;
    email: string;
    phone: string;
    amount: number;
    message: string;
    isAnonymous: boolean;
    
    // Payment info
    paymentMethod: string; // e.g., 'Bkash', 'Nagad'
    transactionId: string;
    senderInfo: string; // The number/account they sent from
    proofImageUrl: string; // base64 encoded string for the screenshot
    
    // System info
    date: string; // ISO string for when donation was submitted
    status: 'pending' | 'approved' | 'rejected' | 'review' | 'fraud';
    adminNotes?: string; // For admin to add internal notes
}


export interface PaymentMethod {
    id: string;
    type: 'mobile' | 'bank';
    provider: string; // 'Bkash', 'Nagad', 'DBBL Bank'
    details: {
        number?: string; // for mobile
        name?: string; // for bank
        account?: string; // for bank
        branch?: string; // for bank
    };
    isActive: boolean;
}

export enum LetterStatus {
    PENDING = 'PENDING',
    REPLIED = 'REPLIED'
}

export interface Letter {
    id: string;
    userId: string; // Link letter to a user
    subject: string;
    body: string;
    audioUrl?: string; // For voice notes
    dateSent: string;
    status: LetterStatus;
    reply?: string;
    dateReplied?: string;
    moderatorId?: string; // To track which moderator is replying
    moderatorRating?: number; // Added for user rating (1-10)
    isComplex?: boolean; // Flag for enabling chat
}

export interface ModeratorApplication {
    id: string;
    fullName: string;
    age: number;
    phone: string;
    email: string;
    address: string;
    profession: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
}

export interface Badge {
    id: string;
    icon: string; // Emoji or SVG string
    nameKey: string;
    descriptionKey: string;
}

export interface Resource {
    id: string;
    title: string;
    description: string;
    url: string;
    category: string;
}

export interface PlatformSettings {
    siteAnnouncement: {
        message: string;
        isActive: boolean;
        type: 'info' | 'warning' | 'success';
        scheduledDate?: string; // New: YYYY-MM-DD for scheduling future announcements
        endDate?: string; // New: YYYY-MM-DD for ending announcements
    };
    pointSystem: {
      user: {
        writeLetter: number;
        writePost: number;
        receiveLike: number;
        giveGoodRating: number;
      },
      moderator: {
        replyToLetter: number;
        replyFast: number; // Bonus points for replying within 24 hours
        receiveGoodRating: number; // For ratings >= 8
        receiveBadRating: number; // For ratings <= 4
        reviewReportedPost: number;
      }
    },
    revenueShare: {
        moderators: number; // e.g., 0.35 for 35%
        users: number; // e.g., 0.10 for 10%
    };
    moderatorEmailDomain: string; // NEW: For configurable moderator email domain
}

export interface GratitudeEntry {
    id: string;
    userId: string;
    content: string;
    date: string; // ISO string
}

export interface Memory {
    id: string;
    userId: string;
    letterId?: string; // Optional: Link to a specific letter
    content: string;
    timestamp: string; // ISO string for when it was submitted
    status: 'pending' | 'approved' | 'rejected'; // Added status for admin approval
    likes: string[]; // Array of user IDs who liked it
}

// --- SUPPORT GROUPS ---
export interface SupportGroup {
    id: string;
    name: string;
    description: string;
    coverImage: string;
    memberCount: number;
    isPrivate: boolean;
}

export interface GroupPost {
    id: string;
    groupId: string;
    userId: string;
    content: string;
    timestamp: string;
    likes: string[];
    comments: Comment[];
}

// --- SECURE CHAT ---
export interface ChatMessage {
    id: string;
    senderId: string; // 'user' or 'moderator' special ID, or actual IDs
    text: string;
    timestamp: string;
}

export interface ChatSession {
    id: string;
    letterId: string;
    userId: string;
    moderatorId: string;
    messages: ChatMessage[];
    isActive: boolean;
}


// --- MONETIZATION & REVENUE SHARE ---

export interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    duration: 'monthly' | 'yearly';
    features: string[];
}

export interface RevenueData {
    month: string; // e.g., "2024-07"
    ads: number;
    donations: number;
    subscriptions: number;
}

export interface ModeratorPayout {
    id: string;
    moderatorId: string;
    month: string; // "2024-07"
    totalPoints: number;
    amount: number;
    status: 'pending' | 'paid';
}

export interface UserReward {
    id: string;
    userId: string;
    period: 'H1' | 'H2'; // Half 1 (Jan-Jun), Half 2 (Jul-Dec)
    year: number;
    totalPoints: number;
    amount: number;
    status: 'pending' | 'paid';
}

// Enum for AdSlot types
export enum AdSlotType {
    BANNER = 'BANNER',
    SIDEBAR = 'SIDEBAR',
    IN_CONTENT = 'IN_CONTENT',
    VIDEO = 'VIDEO',
}

// --- AD MANAGEMENT ---
export interface AdSlot {
    id: string;
    name: string; // e.g., "Homepage Top Banner", "Community Feed Sidebar"
    description: string;
    type: AdSlotType; // Using the enum now
    dimensions: { width: number; height: number; }; // Expected dimensions
    isActive: boolean;
}

export interface AdCreative {
    id: string;
    name: string; // e.g., "Summer Sale Image Ad"
    campaignId: string; // Links to an AdCampaign
    type: 'image' | 'video' | 'html';
    content: string; // URL for image/video, or raw HTML string
    targetUrl: string; // URL to navigate to on click
    status: 'active' | 'paused';
    impressions: number; // Tracked count
    clicks: number; // Tracked count
    allowedSlotTypes: AdSlotType[]; // Which specific AdSlotType this creative can appear in (CHANGED TO TYPE)
    audience?: ('all' | 'logged_in_users' | 'moderators_only' | 'public_only')[]; // NEW: Target audience (changed to array)
}

export interface AdCampaign {
    id: string;
    name: string; // e.g., "Q3 Marketing Campaign"
    startDate?: string; // ISO date string, optional, for scheduling
    endDate?: string; // ISO date string, optional, for scheduling
    status: 'active' | 'paused' | 'scheduled' | 'completed';
    priority: number; // Higher number = higher priority
}
