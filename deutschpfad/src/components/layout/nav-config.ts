export interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: string;
  description?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navigation: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard", description: "Your progress at a glance" },
      { href: "/courses", label: "Courses", icon: "GraduationCap", description: "A1 to B2 curriculum" },
      { href: "/daily", label: "Daily lessons", icon: "CalendarCheck", description: "Today's study plan" },
    ],
  },
  {
    label: "Core skills",
    items: [
      { href: "/grammar", label: "Grammar", icon: "SpellCheck" },
      { href: "/vocabulary", label: "Vocabulary", icon: "BookMarked" },
      { href: "/reading", label: "Reading", icon: "BookOpen" },
      { href: "/listening", label: "Listening", icon: "Headphones" },
      { href: "/speaking", label: "Speaking", icon: "Mic" },
      { href: "/writing", label: "Writing", icon: "PenLine" },
      { href: "/pronunciation", label: "Pronunciation", icon: "AudioLines" },
    ],
  },
  {
    label: "Reference",
    items: [
      { href: "/dictionary", label: "Dictionary", icon: "Search" },
      { href: "/verbs", label: "Verb conjugation", icon: "Repeat" },
      { href: "/flashcards", label: "Flashcards", icon: "Layers" },
    ],
  },
  {
    label: "Practice",
    items: [
      { href: "/exercises", label: "Exercises", icon: "Dumbbell" },
      { href: "/quizzes", label: "Quizzes", icon: "ListChecks" },
      { href: "/exams", label: "Mock exams", icon: "ClipboardCheck" },
      { href: "/goethe", label: "Goethe preparation", icon: "Award" },
      { href: "/telc", label: "TELC preparation", icon: "BadgeCheck" },
      { href: "/ausbildung", label: "Ausbildung", icon: "Briefcase", badge: "New" },
    ],
  },
  {
    label: "Materials",
    items: [
      { href: "/library", label: "PDF library", icon: "Library" },
      { href: "/downloads", label: "Download center", icon: "Download" },
      { href: "/bookmarks", label: "Bookmarks", icon: "Bookmark" },
      { href: "/notes", label: "Notes", icon: "NotebookPen" },
    ],
  },
  {
    label: "Plan & track",
    items: [
      { href: "/planner", label: "Study planner", icon: "CalendarRange" },
      { href: "/calendar", label: "Calendar", icon: "CalendarDays" },
      { href: "/statistics", label: "Statistics", icon: "BarChart3" },
      { href: "/achievements", label: "Achievements", icon: "Trophy" },
    ],
  },
  {
    label: "Community",
    items: [
      { href: "/community", label: "Study groups", icon: "Users" },
      { href: "/discussion", label: "Discussion", icon: "MessagesSquare" },
      { href: "/help", label: "Help center", icon: "LifeBuoy" },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/profile", label: "Profile", icon: "User" },
      { href: "/settings", label: "Settings", icon: "Settings" },
      { href: "/admin", label: "Admin panel", icon: "ShieldCheck" },
    ],
  },
];

export const flatNav = navigation.flatMap((group) => group.items);

export const quickActions: NavItem[] = [
  { href: "/daily", label: "Start today's lesson", icon: "Play" },
  { href: "/flashcards", label: "Review flashcards", icon: "Layers" },
  { href: "/exams", label: "Take a mock exam", icon: "ClipboardCheck" },
  { href: "/writing", label: "Write and get feedback", icon: "PenLine" },
];
