/**
 * Mock data for Student Hub - Daily Habit Loop.
 * No backend integration - all data is static for development/preview.
 */

export const userProfile = {
  name: 'Jordan',
  year: 'Junior',
  major: 'Computer Science',
  interests: ['startups', 'tech', 'CS', 'internships'],
} as const;

export type SystemBadge = 'SIS' | 'LMS' | 'Housing' | 'Bursar' | 'Engagement';

export interface QuickWin {
  id: string;
  emoji: string;
  system: SystemBadge;
  title: string;
  whyItMatters: string;
  takesMin: number;
  ctaLabel: string;
  successMessage: string;
}

export const quickWinsStudent: QuickWin[] = [
  {
    id: 'qw1',
    emoji: '⚠️',
    system: 'SIS',
    title: 'Resolve registration hold',
    whyItMatters: 'Bursar hold is blocking spring registration.',
    takesMin: 5,
    ctaLabel: 'View hold',
    successMessage: "Nice — you just unblocked registration.",
  },
  {
    id: 'qw2',
    emoji: '📝',
    system: 'LMS',
    title: 'Submit CS assignment',
    whyItMatters: 'Problem Set 4 due at 11:59pm tonight.',
    takesMin: 45,
    ctaLabel: 'Open assignment',
    successMessage: "Nice — you just avoided a late penalty.",
  },
  {
    id: 'qw3',
    emoji: '💳',
    system: 'Bursar',
    title: 'Balance due Friday',
    whyItMatters: '$420 due to avoid late fees.',
    takesMin: 10,
    ctaLabel: 'Pay now',
    successMessage: "Nice — you just avoided late fees.",
  },
  {
    id: 'qw4',
    emoji: '📋',
    system: 'SIS',
    title: 'Add class from waitlist',
    whyItMatters: "You're #1 on Econ 301 waitlist — spot opened.",
    takesMin: 2,
    ctaLabel: 'Join waitlist',
    successMessage: "Nice — you're in!",
  },
  {
    id: 'qw5',
    emoji: '🎯',
    system: 'LMS',
    title: '20-min study sprint',
    whyItMatters: 'Econ 101 quiz tomorrow covers ch 4–6.',
    takesMin: 20,
    ctaLabel: 'Start sprint',
    successMessage: "Nice — you're prepped.",
  },
  {
    id: 'qw6',
    emoji: '🏠',
    system: 'Housing',
    title: 'Housing renewal',
    whyItMatters: 'Secure your spot for next year.',
    takesMin: 15,
    ctaLabel: 'Review options',
    successMessage: "Nice — you're set for next year.",
  },
];

export const quickWinsAlumni: QuickWin[] = [
  {
    id: 'qwa1',
    emoji: '🎉',
    system: 'Engagement',
    title: 'Reunion RSVP',
    whyItMatters: 'Class of 2020 reunion in 3 weeks.',
    takesMin: 2,
    ctaLabel: 'RSVP now',
    successMessage: "Nice — we'll see you there!",
  },
  {
    id: 'qwa2',
    emoji: '🤝',
    system: 'Engagement',
    title: 'Mentor a student',
    whyItMatters: 'A senior wants career advice from you.',
    takesMin: 5,
    ctaLabel: 'View request',
    successMessage: "Nice — you're making a difference.",
  },
  {
    id: 'qwa3',
    emoji: '🙌',
    system: 'Engagement',
    title: 'Volunteer at career fair',
    whyItMatters: 'Help students practice elevator pitches.',
    takesMin: 3,
    ctaLabel: 'Confirm shift',
    successMessage: "Nice — students will love it.",
  },
  {
    id: 'qwa4',
    emoji: '💼',
    system: 'Engagement',
    title: 'Share an internship',
    whyItMatters: 'Post a role from your company.',
    takesMin: 5,
    ctaLabel: 'Share',
    successMessage: "Nice — you're opening doors.",
  },
  {
    id: 'qwa5',
    emoji: '❤️',
    system: 'Engagement',
    title: 'Give to a cause',
    whyItMatters: 'Support scholarships before fiscal year end.',
    takesMin: 5,
    ctaLabel: 'Learn more',
    successMessage: "Nice — thank you for giving.",
  },
];

export interface TomorrowHook {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export const tomorrowHooksStudent: TomorrowHook[] = [
  {
    id: 'th1',
    label: 'New internships drop at 9am',
    description: '3 software roles matching your interests.',
    icon: 'fa-solid fa-briefcase',
  },
  {
    id: 'th2',
    label: 'Registration closes in 3 days',
    description: 'Add/drop ends Friday.',
    icon: 'fa-solid fa-calendar',
  },
  {
    id: 'th3',
    label: 'Study group forming tomorrow',
    description: 'Econ 101 midterm prep.',
    icon: 'fa-solid fa-users',
  },
];

export const tomorrowHooksAlumni: TomorrowHook[] = [
  {
    id: 'tha1',
    label: 'Reunion early bird ends tomorrow',
    description: 'Save $20 on tickets.',
    icon: 'fa-solid fa-ticket',
  },
  {
    id: 'tha2',
    label: 'Mentor matching opens at noon',
    description: '2 students waiting for you.',
    icon: 'fa-solid fa-handshake',
  },
];

export type FeedCategory = 'Event' | 'Internship' | 'Club' | 'Study' | 'Career';

export interface FeedItem {
  id: string;
  category: FeedCategory;
  tags: string[];
  icon: string;
  gradient: string;
  headline: string;
  description: string;
  socialProof: string;
  avatarInitials: string[];
  cta: string;
}

export const feedItemsStudent: FeedItem[] = [
  {
    id: 'f1',
    category: 'Event',
    tags: ['Tech', 'Networking'],
    icon: 'fa-solid fa-users',
    gradient: 'from-purple-500 to-indigo-600',
    headline: 'Tech industry panel',
    description: 'Hear from engineers at Google, Meta, and local startups.',
    socialProof: '47 going',
    avatarInitials: ['JK', 'SM', 'AL'],
    cta: 'RSVP',
  },
  {
    id: 'f2',
    category: 'Internship',
    tags: ['Software', 'CS'],
    icon: 'fa-solid fa-briefcase',
    gradient: 'from-amber-500 to-orange-600',
    headline: '3 internships matching your major',
    description: 'Software, product, and data roles posted this week.',
    socialProof: 'Trending',
    avatarInitials: [],
    cta: 'View',
  },
  {
    id: 'f3',
    category: 'Club',
    tags: ['Startups', 'Entrepreneurship'],
    icon: 'fa-solid fa-star',
    gradient: 'from-emerald-500 to-teal-600',
    headline: 'Entrepreneurship Club',
    description: 'Pitch night next week — great for aspiring founders.',
    socialProof: '3 friends joined',
    avatarInitials: ['TR', 'NP', 'JK'],
    cta: 'Join',
  },
  {
    id: 'f4',
    category: 'Study',
    tags: ['Econ', 'Study'],
    icon: 'fa-solid fa-book',
    gradient: 'from-blue-500 to-cyan-600',
    headline: 'Econ 101 study group',
    description: 'Forming for midterm prep. First meet tomorrow.',
    socialProof: '8 interested',
    avatarInitials: ['AL', 'MJ'],
    cta: 'Save',
  },
  {
    id: 'f5',
    category: 'Career',
    tags: ['Career', 'Resume'],
    icon: 'fa-solid fa-graduation-cap',
    gradient: 'from-rose-500 to-pink-600',
    headline: 'Resume review drop-in',
    description: 'Career services walk-in every Tuesday.',
    socialProof: 'Free',
    avatarInitials: [],
    cta: 'View schedule',
  },
  {
    id: 'f6',
    category: 'Event',
    tags: ['Tech', 'Career'],
    icon: 'fa-solid fa-laptop-code',
    gradient: 'from-violet-500 to-purple-600',
    headline: 'Hackathon kickoff',
    description: '48-hour build. Prizes for top 3.',
    socialProof: '23 signed up',
    avatarInitials: ['SC', 'ER'],
    cta: 'RSVP',
  },
];

export const feedItemsAlumni: FeedItem[] = [
  {
    id: 'fa1',
    category: 'Event',
    tags: ['Reunion', 'Networking'],
    icon: 'fa-solid fa-calendar-star',
    gradient: 'from-purple-500 to-indigo-600',
    headline: 'Reunion weekend',
    description: 'Connect with classmates and celebrate.',
    socialProof: '120 attending',
    avatarInitials: ['DK', 'JW', 'SC'],
    cta: 'RSVP',
  },
  {
    id: 'fa2',
    category: 'Career',
    tags: ['Mentorship', 'Tech'],
    icon: 'fa-solid fa-handshake',
    gradient: 'from-amber-500 to-orange-600',
    headline: 'Mentor a student',
    description: '15-min coffee chats with students in your field.',
    socialProof: '12 requests',
    avatarInitials: [],
    cta: 'View',
  },
  {
    id: 'fa3',
    category: 'Event',
    tags: ['Volunteer', 'Career'],
    icon: 'fa-solid fa-hands-helping',
    gradient: 'from-emerald-500 to-teal-600',
    headline: 'Career fair volunteer',
    description: 'Help students practice pitches.',
    socialProof: '5 spots left',
    avatarInitials: ['ER'],
    cta: 'Sign up',
  },
];

export interface PersonToMeet {
  id: string;
  name: string;
  role: string;
  initials: string;
  hook: string;
  whyMatched: string;
  tags: string[];
  matchPercent: number;
}

export const peopleToMeetStudent: PersonToMeet[] = [
  {
    id: 'p1',
    name: 'Sarah Chen',
    role: 'Alumni',
    initials: 'SC',
    hook: 'Software engineer at Google. Loves mentoring.',
    whyMatched: 'Both into startups + CS',
    tags: ['Tech', 'Mentorship'],
    matchPercent: 92,
  },
  {
    id: 'p2',
    name: 'Marcus Johnson',
    role: 'Student',
    initials: 'MJ',
    hook: 'Finance major. Looking for internship tips.',
    whyMatched: 'Shared leadership interests',
    tags: ['Finance', 'Leadership'],
    matchPercent: 88,
  },
  {
    id: 'p3',
    name: 'Elena Rodriguez',
    role: 'Alumni',
    initials: 'ER',
    hook: 'Marketing at a startup. Happy to chat.',
    whyMatched: 'Both into startups + marketing',
    tags: ['Marketing', 'Startups'],
    matchPercent: 85,
  },
];

export const peopleToMeetAlumni: PersonToMeet[] = [
  {
    id: 'pa1',
    name: 'David Kim',
    role: 'Alumni',
    initials: 'DK',
    hook: 'VC. Interested in student startups.',
    whyMatched: 'Both into investing + startups',
    tags: ['Investing', 'Startups'],
    matchPercent: 94,
  },
  {
    id: 'pa2',
    name: 'Jessica Wong',
    role: 'Alumni',
    initials: 'JW',
    hook: 'Product lead. Mentors in tech.',
    whyMatched: 'Both into product + tech',
    tags: ['Product', 'Tech'],
    matchPercent: 89,
  },
];

export interface HotDiscussion {
  id: string;
  title: string;
  replyCount: number;
  preview: string;
  cta: string;
}

export const hotDiscussionsStudent: HotDiscussion[] = [
  {
    id: 'h1',
    title: 'Best study spots on campus',
    replyCount: 34,
    preview: 'Library 4th floor is quiet but...',
    cta: 'Jump in',
  },
  {
    id: 'h2',
    title: 'Internship tips from seniors',
    replyCount: 21,
    preview: 'Start applying early, they said...',
    cta: 'Jump in',
  },
  {
    id: 'h3',
    title: 'Balancing clubs and coursework',
    replyCount: 18,
    preview: 'Time blocking helped me...',
    cta: 'Jump in',
  },
];

export const hotDiscussionsAlumni: HotDiscussion[] = [
  {
    id: 'ha1',
    title: 'Career transitions after graduation',
    replyCount: 42,
    preview: 'Took me 2 years to find my path...',
    cta: 'Jump in',
  },
  {
    id: 'ha2',
    title: 'Staying connected with campus',
    replyCount: 28,
    preview: 'Reunions are the best way...',
    cta: 'Jump in',
  },
];

export const journeyMilestones = [
  { label: 'Joined club', icon: 'fa-solid fa-user-plus' },
  { label: 'First event', icon: 'fa-solid fa-star' },
  { label: 'Met mentor', icon: 'fa-solid fa-handshake' },
  { label: 'Applied to internship', icon: 'fa-solid fa-paper-plane' },
  { label: 'LinkedIn updated', icon: 'fa-brands fa-linkedin' },
] as const;

export const checkInOptions = [
  { id: 'good', label: 'Good', emoji: '👍' },
  { id: 'stressed', label: 'Stressed', emoji: '😓' },
  { id: 'help', label: 'Need help', emoji: '🆘' },
] as const;

export const advisorBulletsByCheckIn: Record<string, string[]> = {
  good: [
    '1 hold blocking registration — fix it',
    '$420 due Friday',
    'CS assignment tonight + quiz tomorrow',
  ],
  stressed: [
    'Take a 5-min break — you got this',
    'Office hours tomorrow at 2pm',
    'Wellness resources available 24/7',
  ],
  help: [
    'Connect with a peer mentor today',
    'Academic support drop-in is open',
    "We're here to help — reach out anytime",
  ],
};

