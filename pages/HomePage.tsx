
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Card from '../components/ui/Card';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';
import { useData } from '../context/DataContext';
import { Blog, Review, Memory, User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import BlogCardSmall from '../components/BlogCardSmall'; // Confirmed: This import path is relative and correct.
import AdDisplay from '../components/AdDisplay'; // NEW IMPORT

// Local helper for scroll animations
const useScrollAnimation = (animationClass: string, threshold = 0.1) => {
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate__animated', animationClass);
            observer.unobserve(entry.target); // Stop observing once animated
          }
        });
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [animationClass, threshold]);

  return ref;
};

// Mock Data
const mockReviews: Review[] = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    name: i % 3 === 0 ? 'Anonymous' : `User ${i+1}`,
    avatarUrl: `https://i.pravatar.cc/80?img=${i+10}`,
    text: 'এই প্ল্যাটফর্মটি আমার কঠিন সময়ে অনেক সাহায্য করেছে। আমি কৃতজ্ঞ।',
}));

const MemoryNote: React.FC<{ memory: Memory, index: number }> = ({ memory, index }) => {
    const { t } = useLanguage();
    const rotations = ['-2deg', '1deg', '-1deg', '2deg', '-1.5deg', '1.5deg', '0.5deg', '-0.5deg', '0deg']; // Added more rotations
    const rotation = rotations[index % rotations.length];

    return (
        <Card 
            className="bg-[#FFFFF0] p-6 rounded shadow-lg text-left relative h-full flex flex-col transition-transform hover:scale-105"
            style={{ transform: `rotate(${rotation})` }}
        >
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full shadow-inner border-2 border-red-700 z-10" aria-hidden="true"></div>
            <p className="italic text-text-dark/90 mb-4 pt-4 flex-grow">"{memory.content}"</p>
            <p className="text-right font-semibold text-sm text-gray-600">~ {t('wallOfMemoriesPage.anonymous')}</p>
        </Card>
    );
};


const HomePage: React.FC = () => {
    const { blogs, donors, memories } = useData();
    const { t } = useLanguage();
    const totalUsers = useAnimatedCounter(12543);
    const totalModerators = useAnimatedCounter(87);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const donorsScrollRef = React.useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { user } = useAuth(); // Use useAuth to check if user is logged in for blog interactions

    const publicDonors = donors.filter(d => !d.isAnonymous && d.status === 'approved');
    const approvedMemories = memories.filter(m => m.status === 'approved').slice(0, 6);
    const publishedBlogs = blogs.filter(blog => blog.status === 'published');


    const scroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
        if (ref.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    // Refs for scroll animations
    const heroSectionRef = useScrollAnimation('animate__fadeIn', 0.1);
    const aboutSectionRef = useScrollAnimation('animate__fadeInUp', 0.1);
    const whyChooseUsRef = useScrollAnimation('animate__fadeInUp', 0.1);
    const liveStatsRef = useScrollAnimation('animate__fadeInUp', 0.1);
    const blogSectionRef = useScrollAnimation('animate__fadeInUp', 0.1);
    const reviewSectionRef = useScrollAnimation('animate__fadeInUp', 0.1);
    const donationSectionRef = useScrollAnimation('animate__fadeInUp', 0.1);
    const moderatorCtaRef = useScrollAnimation('animate__fadeInUp', 0.1);
    const memoriesSectionRef = useScrollAnimation('animate__fadeInUp', 0.1);

    return (
        <div className="bg-background-light">
            <Header />
            <main>
                {/* Hero Section */}
                <section ref={heroSectionRef} className="relative h-[60vh] md:h-[80vh] flex items-center justify-center text-center text-white overflow-hidden"
                         style={{backgroundImage: "url('https://picsum.photos/1920/1080?random=homepage_hero_namiya_style')", backgroundSize: 'cover', backgroundPosition: 'center'}}>
                    <div className="absolute inset-0 bg-black/60"></div>
                    <div className="relative z-10 p-4">
                        <h1 className="text-4xl md:text-7xl font-heading font-bold animate__animated animate__zoomIn animate__delay-0.5s">{t('homePage.hero.title')}</h1>
                        <p className="text-lg md:text-2xl mt-4 max-w-3xl mx-auto font-body animate__animated animate__fadeInUp animate__delay-1s">{t('homePage.hero.subtitle')}</p>
                        <p className="mt-2 text-md md:text-lg max-w-2xl mx-auto animate__animated animate__fadeInUp animate__delay-1.5s">{t('homePage.hero.description')}</p>
                        <Link to="/register" className="mt-8 inline-block bg-accent text-text-dark px-8 py-4 rounded-lg shadow-lg hover:bg-yellow-500 transition-all font-bold text-xl focus:outline-none focus:ring-4 focus:ring-primary focus:ring-offset-2 focus:ring-offset-gray-800 animate__animated animate__pulse animate__infinite">
                           {t('homePage.hero.cta')}
                        </Link>
                    </div>
                </section>
                
                {/* Ad Slot: Homepage Hero Ad - NEWLY ADDED */}
                <section className="container mx-auto px-4 py-8">
                    <AdDisplay slotId="homepage_hero_ad" className="w-full h-64 md:h-80" />
                </section>

                {/* Ad Slot: Homepage Top Banner */}
                {/* Removed to avoid two banners right after hero, 'homepage_hero_ad' serves a similar purpose now */}
                {/* <section className="container mx-auto px-4 py-8">
                    <AdDisplay slotId="home_banner_top" className="w-full h-64 md:h-80" />
                </section> */}

                {/* About Section */}
                <section ref={aboutSectionRef} className="py-16 md:py-24 bg-white">
                    <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="animate__animated animate__fadeInLeft">
                            <img src="https://picsum.photos/800/600?random=namiya_door" alt="About KholaChithi" className="rounded-xl shadow-lg w-full"/>
                        </div>
                        <div className="text-center md:text-left animate__animated animate__fadeInRight">
                            <h2 className="text-3xl md:text-4xl font-bold text-text-dark">{t('homePage.about.title')}</h2>
                            <p className="mt-4 max-w-prose mx-auto md:mx-0 text-lg">{t('homePage.about.body')}</p>
                            <Link to="/about" className="mt-6 inline-block text-primary font-bold hover:underline">{t('homePage.about.learnMore')} &rarr;</Link>
                        </div>
                    </div>
                </section>

                {/* Why Choose Us? Section */}
                <section ref={whyChooseUsRef} className="py-16 md:py-24 bg-secondary/20">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-12">{t('homePage.whyChooseUs.title')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Card className="flex flex-col items-center p-6 text-center transition-transform hover:scale-105 hover:shadow-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <h3 className="font-heading text-xl font-bold mb-2">{t('homePage.whyChooseUs.card1Title')}</h3>
                                <p className="text-gray-600">{t('homePage.whyChooseUs.card1Body')}</p>
                            </Card>
                            <Card className="flex flex-col items-center p-6 text-center transition-transform hover:scale-105 hover:shadow-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                <h3 className="font-heading text-xl font-bold mb-2">{t('homePage.whyChooseUs.card2Title')}</h3>
                                <p className="text-gray-600">{t('homePage.whyChooseUs.card2Body')}</p>
                            </Card>
                            <Card className="flex flex-col items-center p-6 text-center transition-transform hover:scale-105 hover:shadow-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.002 12.002 0 002.928 12c.072 1.638.745 3.18 1.839 4.341L12 21.033l7.233-6.692c1.094-1.161 1.767-2.703 1.839-4.341a12.002 12.002 0 00-2.13-7.056z" /></svg>
                                <h3 className="font-heading text-xl font-bold mb-2">{t('homePage.whyChooseUs.card3Title')}</h3>
                                <p className="text-gray-600">{t('homePage.whyChooseUs.card3Body')}</p>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Live Stats Section */}
                <section ref={liveStatsRef} className="py-16 md:py-24 bg-secondary/50">
                    <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
                        <div className="animate__animated animate__fadeInLeft">
                            <h3 className="text-3xl font-bold text-text-dark">{t('homePage.stats.usersTitle')}</h3>
                            <span ref={totalUsers.ref} className="text-6xl font-heading font-bold text-primary mt-2 block">{totalUsers.count.toLocaleString('bn-BD')}</span>
                            <p className="text-lg">{t('homePage.stats.usersLabel')}</p>
                        </div>
                        <div className="animate__animated animate__fadeInRight">
                            <h3 className="text-3xl font-bold text-text-dark">{t('homePage.stats.moderatorsTitle')}</h3>
                            <span ref={totalModerators.ref} className="text-6xl font-heading font-bold text-primary mt-2 block">{totalModerators.count.toLocaleString('bn-BD')}</span>
                            <p className="text-lg">{t('homePage.stats.moderatorsLabel')}</p>
                        </div>
                    </div>
                </section>

                {/* Blog Section */}
                <section ref={blogSectionRef} className="py-16 md:py-24">
                    <div className="container mx-auto px-4">
                         <h2 className="text-3xl md:text-4xl font-bold text-text-dark text-center mb-8">{t('homePage.blog.title')}</h2>
                        <div className="relative">
                            <div ref={scrollContainerRef} className="flex overflow-x-auto space-x-6 pb-4 scroll-smooth snap-x snap-mandatory no-scrollbar">
                                {publishedBlogs.map(blog => (
                                    <div key={blog.id} className="flex-shrink-0 w-80 snap-center animate__animated animate__fadeInUp">
                                        <BlogCardSmall blog={blog} user={user as User} onNavigate={() => navigate(`/blog/${blog.id}`)} />
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => scroll(scrollContainerRef, 'left')} className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white z-10 hidden md:block" aria-label={t('blogPage.scrollLeft')}>&lt;</button>
                            <button onClick={() => scroll(scrollContainerRef, 'right')} className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white z-10 hidden md:block" aria-label={t('blogPage.scrollRight')}>&gt;</button>
                        </div>
                        <div className="text-center mt-12">
                            <Link to="/blog" className="inline-block bg-primary text-white px-8 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition-all font-bold text-lg animate__animated animate__fadeInUp">
                                {t('homePage.blog.viewAll')}
                            </Link>
                        </div>
                    </div>
                </section>
                
                {/* Review Section */}
                <section ref={reviewSectionRef} className="py-16 md:py-24 bg-white">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-text-dark text-center mb-12">{t('homePage.reviews.title')}</h2>
                         <div className="flex overflow-hidden group">
                            <div className="flex space-x-8 animate-infinite-scroll group-hover:pause">
                                {mockReviews.concat(mockReviews).map((review, index) => (
                                     <Card key={`${review.id}-${index}`} className="w-64 flex-shrink-0 p-6 shadow-md transition-shadow hover:shadow-lg">
                                        <div className="flex flex-col items-center text-center">
                                            <img src={review.avatarUrl} alt={review.name} className="w-20 h-20 rounded-full object-cover mb-4 border-2 border-primary p-0.5"/>
                                            <h4 className="font-bold text-lg">{review.name}</h4>
                                            <p className="text-sm mt-2 text-gray-600 italic">"{review.text}"</p>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Donation Section */}
                <section ref={donationSectionRef} className="py-16 md:py-24 bg-secondary/50">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-text-dark text-center mb-8">{t('homePage.donation.title')}</h2>
                         <div className="relative">
                            <div ref={donorsScrollRef} className="flex overflow-x-auto space-x-6 pb-4 scroll-smooth snap-x snap-mandatory no-scrollbar">
                                {publicDonors.map(donor => (
                                    <div key={donor.id} className="flex-shrink-0 w-64 snap-center">
                                        <Card className="flex flex-col items-center text-center p-6 h-full transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
                                             <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                                                <span className="text-4xl font-bold text-primary">{donor.name.charAt(0)}</span>
                                             </div>
                                             <h4 className="font-bold text-lg">{donor.name}</h4>
                                             <p className="text-sm mt-2 text-gray-600 italic">"{donor.message}"</p>
                                        </Card>
                                    </div>
                                ))}
                                 {publicDonors.length === 0 && <p className="text-center w-full">{t('homePage.donation.noDonors')}</p>}
                            </div>
                             <button onClick={() => scroll(donorsScrollRef, 'left')} className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white z-10 hidden md:block" aria-label={t('blogPage.scrollLeft')}>&lt;</button>
                            <button onClick={() => scroll(donorsScrollRef, 'right')} className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white z-10 hidden md:block" aria-label={t('blogPage.scrollRight')}>&gt;</button>
                        </div>
                        <div className="text-center mt-12">
                            <h3 className="text-2xl font-bold text-text-dark">{t('homePage.donation.ctaTitle')}</h3>
                            <p className="mt-2 max-w-2xl mx-auto">{t('homePage.donation.ctaBody')}</p>
                            <Link to="/donate" className="mt-6 inline-block bg-accent text-text-dark px-8 py-3 rounded-lg shadow-lg hover:bg-yellow-500 transition-all font-bold text-lg">
                                {t('homePage.donation.ctaButton')}
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Wall of Memories Section */}
                <section ref={memoriesSectionRef} className="py-16 md:py-24 wall-background">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-text-dark mb-12">{t('homePage.memories.title')}</h2>
                        {approvedMemories.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {approvedMemories.map((memory, index) => <MemoryNote key={memory.id} memory={memory} index={index} />)}
                            </div>
                        ) : (
                            <p className="text-gray-600">{t('wallOfMemoriesPage.noMemories')}</p>
                        )}
                        <Link to="/wall-of-memories" className="mt-12 inline-block bg-primary text-white px-8 py-3 rounded-lg shadow-lg hover:bg-blue-600 transition-all font-bold text-lg animate__animated animate__fadeInUp">
                            {t('homePage.memories.viewAll')}
                        </Link>
                    </div>
                </section>

                {/* Become a Moderator CTA Section */}
                <section ref={moderatorCtaRef} className="py-16 md:py-24 text-center bg-white">
                    <div className="container mx-auto px-4 animate__animated animate__fadeInUp">
                        <h2 className="text-3xl md:text-4xl font-bold text-text-dark">{t('homePage.moderatorCta.title')}</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg">{t('homePage.moderatorCta.body')}</p>
                        <Link to="/apply-moderator" className="mt-8 inline-block bg-primary text-white px-8 py-4 rounded-lg shadow-lg hover:bg-blue-600 transition-all font-bold text-xl animate__animated animate__pulse animate__infinite animate__delay-2s">
                            {t('homePage.moderatorCta.cta')}
                        </Link>
                    </div>
                </section>


            </main>
            <Footer />
            <style jsx>{`
                @keyframes infinite-scroll {
                    from { transform: translateX(0); }
                    to { transform: translateX(-100%); }
                }
                .animate-infinite-scroll {
                    animation: infinite-scroll 40s linear infinite;
                }
                .group:hover .pause {
                    animation-play-state: paused;
                }
                @media (prefers-reduced-motion: reduce) {
                  .animate-infinite-scroll {
                    animation-play-state: paused;
                  }
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none; /* IE and Edge */
                    scrollbar-width: none; /* Firefox */
                }
                 .wall-background {
                    background-color: #f0e9e0;
                    background-image: url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E");
                }
            `}</style>
        </div>
    );
};

export default HomePage;
