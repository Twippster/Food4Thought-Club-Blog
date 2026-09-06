import { type FormEvent, type ReactNode, useState } from 'react';
import { ArrowDownRight, ArrowLeft, ArrowUpRight, Check, Menu, X } from 'lucide-react';
import { Link, Route, Switch, useLocation, useParams, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

type Story = {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  read: string;
  author: string;
};

const stories: Story[] = [
  {
    slug: 'the-lunch-line-is-a-map',
    category: 'school lunch',
    title: 'The lunch line is a map of who gets looked after',
    excerpt: 'What happens when we stop treating a cafeteria like a checkout counter—and start treating it like a commons?',
    date: 'Oct 17, 2024',
    read: '7 min read',
    author: 'Maya Chen',
  },
  {
    slug: 'leftovers-have-a-second-life',
    category: 'leftovers',
    title: 'Leftovers have a second life. We just have to make room for it.',
    excerpt: 'A practical, unglamorous guide to the food that waits in the back of the fridge.',
    date: 'Oct 08, 2024',
    read: '4 min read',
    author: 'Ari Okafor',
  },
  {
    slug: 'the-fridge-between-us',
    category: 'mutual aid',
    title: 'The fridge between us',
    excerpt: 'Inside our school’s tiny, unofficial food shelf—and the students keeping it stocked.',
    date: 'Sep 26, 2024',
    read: '6 min read',
    author: 'Noor Rahman',
  },
  {
    slug: 'five-ways-to-rescue-a-banana',
    category: 'food rescue',
    title: 'Five ways to rescue a banana on the brink',
    excerpt: 'No recipe voiceover. No moral lecture. Just five good exits for a speckled banana.',
    date: 'Sep 14, 2024',
    read: '3 min read',
    author: 'Leo Williams',
  },
  {
    slug: 'ask-for-the-extra-serving',
    category: 'student action',
    title: 'Ask for the extra serving',
    excerpt: 'The most useful thing you can do this week might be a question asked at the right volume.',
    date: 'Sep 04, 2024',
    read: '5 min read',
    author: 'Sofia Patel',
  },
];

const categories = ['all', 'school lunch', 'leftovers', 'mutual aid', 'food rescue', 'student action'];

function Header() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const navigate = (path: string) => {
    setOpen(false);
    setLocation(path);
  };
  return (
    <header className="site-header">
      <div className="container-editorial header-inner">
        <Link href="/" className="brand" data-testid="link-home">
          <span className="brand-mark">F</span>
          <span className="brand-name">food<span>4</span>thought</span>
        </Link>
        <nav className="nav-links" aria-label="Main navigation">
          <Link href="/stories" className="nav-link" data-testid="link-stories">Read the stories</Link>
          <Link href="/stories/food-rescue" className="nav-link" data-testid="link-rescue">Food rescue</Link>
          <Link href="/about" className="nav-link" data-testid="link-about">Our point of view</Link>
        </nav>
        <Link href="/join" className="nav-join" data-testid="link-join">Join the table <ArrowUpRight size={14} /></Link>
        <button className="menu-button" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation" data-testid="button-toggle-menu">
          {open ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>
      <nav className={`mobile-menu ${open ? 'open' : ''}`} aria-label="Mobile navigation">
        <Link href="/stories" className="nav-link" onClick={() => setOpen(false)} data-testid="mobile-link-stories">Read the stories</Link>
        <Link href="/stories/food-rescue" className="nav-link" onClick={() => setOpen(false)} data-testid="mobile-link-rescue">Food rescue</Link>
        <Link href="/about" className="nav-link" onClick={() => setOpen(false)} data-testid="mobile-link-about">Our point of view</Link>
        <button className="button-solid" onClick={() => navigate('/join')} data-testid="mobile-button-join">Join the table <ArrowUpRight size={14} /></button>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container-editorial">
        <div className="footer-top">
          <div>
            <Link href="/" className="brand" data-testid="footer-link-home"><span className="brand-mark">F</span><span className="brand-name">food<span>4</span>thought</span></Link>
            <p className="footer-note">A student-led publication about food, fairness, and the small actions that add up.</p>
          </div>
          <nav className="footer-nav" aria-label="Footer navigation">
            <Link href="/stories" data-testid="footer-link-stories">Stories</Link>
            <Link href="/join" data-testid="footer-link-join">Join us</Link>
            <Link href="/about" data-testid="footer-link-about">About</Link>
          </nav>
        </div>
        <div className="footer-bottom"><span>Made between classes, with care.</span><span className="mono">© 2024 F4T CLUB</span></div>
      </div>
    </footer>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return <div className="page-shell"><Header />{children}<Footer /></div>;
}

function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email.trim()) setJoined(true);
  };
  if (joined) return <div className="newsletter-success" data-testid="status-newsletter-success"><Check size={17} /> You’re on the list. We’ll bring the good stuff next week.</div>;
  return (
    <form className="newsletter-form" onSubmit={submit} data-testid={compact ? 'form-newsletter-compact' : 'form-newsletter'}>
      <label htmlFor={compact ? 'compact-email' : 'email'}>{compact ? 'Get the weekly dispatch' : 'An occasional note from the club'}</label>
      <div className="newsletter-row">
        <input id={compact ? 'compact-email' : 'email'} className="newsletter-input" type="email" required placeholder="your@email.com" value={email} onChange={(event) => setEmail(event.target.value)} data-testid={compact ? 'input-newsletter-compact' : 'input-newsletter'} />
        <button className="newsletter-submit" type="submit" data-testid={compact ? 'button-newsletter-compact' : 'button-newsletter'}>Sign me up</button>
      </div>
      {!compact && <span className="newsletter-fine">No spam. No guilt. Just one thoughtful dispatch, when we have something worth saying.</span>}
    </form>
  );
}

function StoryCard({ story, variant }: { story: Story; variant: 'main' | 'secondary' | 'tertiary' }) {
  return (
    <Link href={`/story/${story.slug}`} className={`story-card ${variant} reveal`} data-testid={`card-story-${story.slug}`}>
      <span className="story-meta eyebrow">{story.category} · {story.read}</span>
      <span className="story-graphic" aria-hidden="true" />
      <h3>{story.title}</h3>
      <p>{story.excerpt}</p>
      <span className="story-arrow"><ArrowUpRight size={21} /></span>
    </Link>
  );
}

function Home() {
  return (
    <Shell>
      <main>
        <section className="hero">
          <div className="container-editorial hero-grid">
            <div className="reveal">
              <div className="hero-kicker eyebrow">A school club publication</div>
              <h1 className="display">Less waste.<br /><em>More table.</em></h1>
              <p className="hero-dek">Food4Thought is a student-led publication asking better questions about what we eat, what we save, and who gets to eat well.</p>
              <div className="hero-cta-row">
                <Link href="/stories" className="button-solid" data-testid="hero-link-stories">Read something good <ArrowDownRight size={15} /></Link>
                <Link href="/join" className="button-outline" data-testid="hero-link-join">Join the club</Link>
              </div>
              <p className="hero-note mono">Stories from the cafeteria, the community fridge, and everywhere in between.</p>
            </div>
            <div className="hero-art reveal delay-2" aria-label="Illustration of a community table">
              <span className="hero-side-note eyebrow">Issue no. 04 / Fall 2024</span>
              <div className="art-paper">
                <div className="art-title">A place<br />for <span>every</span><br />plate.</div>
                <div className="art-lines"><i /><i /><i /></div>
              </div>
              <div className="art-sticker">NOTHING<br />WASTED<br />HERE</div>
            </div>
          </div>
        </section>
        <div className="ticker"><div className="container-editorial ticker-inner"><span className="ticker-item mono"><i className="ticker-dot" /> New from the lunchroom</span><span className="ticker-item mono">Take what you need. Leave what you can.</span><span className="ticker-item mono">Read / share / act</span></div></div>
        <section className="section">
          <div className="container-editorial">
            <div className="section-heading reveal">
              <div><div className="eyebrow" style={{ color: 'hsl(var(--accent))' }}>The latest</div><h2 className="display">Good food<br />has a story.</h2></div>
              <p>Not hot takes. Real voices and useful ideas from the people making room for one another.</p>
            </div>
            <div className="stories-grid">
              <StoryCard story={stories[0]} variant="main" />
              <StoryCard story={stories[1]} variant="secondary" />
              <StoryCard story={stories[2]} variant="tertiary" />
            </div>
          </div>
        </section>
        <section className="manifesto">
          <div className="container-editorial manifesto-grid">
            <div className="reveal"><div className="eyebrow">Our working theory</div><h2 className="display">Food is<br />a verb.</h2></div>
            <div className="manifesto-copy reveal delay-1">
              <p>It moves. It gets shared, stretched, saved, cooked again. Food is never just an object on a tray. It is labor, memory, access, and care in a paper boat.</p>
              <div className="manifesto-list">
                <div><b>01</b><span>We notice what gets left behind.</span></div>
                <div><b>02</b><span>We make useful things easier to do.</span></div>
                <div><b>03</b><span>We believe a full table is a public good.</span></div>
              </div>
            </div>
          </div>
        </section>
        <section className="section dispatch" id="dispatch">
          <div className="container-editorial dispatch-grid">
            <div className="reveal"><div className="eyebrow">The weekly dispatch</div><h2 className="display">Bring a little more care to your inbox.</h2><p className="dispatch-copy">A short note every Friday with one story, one doable idea, and one reason not to give up on the world yet.</p></div>
            <div className="reveal delay-2"><NewsletterForm compact /></div>
          </div>
        </section>
      </main>
    </Shell>
  );
}

function Stories() {
  const params = useParams<{ category?: string }>();
  const selected = params.category ? decodeURIComponent(params.category).replaceAll('-', ' ') : 'all';
  const filtered = selected === 'all' ? stories : stories.filter((story) => story.category === selected);
  return (
    <Shell>
      <main>
        <section className="browse-header"><div className="container-editorial reveal"><div className="eyebrow" style={{ color: 'hsl(var(--accent))' }}>The archive / {filtered.length} stories</div><h1 className="display">Read the<br /><em style={{ color: 'hsl(var(--accent))', fontStyle: 'normal' }}>{selected === 'all' ? 'whole thing.' : selected + '.'}</em></h1><p className="dispatch-copy">Dispatches from students, cooks, lunch monitors, and neighbors who believe the way we share food can change the shape of a day.</p><div className="category-tabs">{categories.map((category) => <Link key={category} href={category === 'all' ? '/stories' : `/stories/${category.replaceAll(' ', '-')}`} className={`category-tab ${selected === category ? 'active' : ''}`} data-testid={`tab-category-${category.replaceAll(' ', '-')}`}>{category}</Link>)}</div></div></section>
        <section className="browse-list"><div className="container-editorial">{filtered.map((story, index) => <Link href={`/story/${story.slug}`} className="browse-row reveal" key={story.slug} data-testid={`row-story-${story.slug}`}><span className="browse-index">0{index + 1}</span><span><h2>{story.title}</h2><p>{story.excerpt}</p></span><span className="browse-date">{story.date}<br /><br />{story.read}<ArrowUpRight size={15} /></span></Link>)}{filtered.length === 0 && <div className="browse-row"><span className="eyebrow">Nothing here yet.</span><span><h2>We’re still listening.</h2><p>Try another corner of the archive.</p></span></div>}</div></section>
      </main>
    </Shell>
  );
}

function Article() {
  const { slug } = useParams<{ slug: string }>();
  const story = stories.find((item) => item.slug === slug) ?? stories[0];
  return (
    <Shell>
      <main>
        <div className="container-editorial article-header reveal"><Link href="/stories" className="eyebrow" style={{ color: 'hsl(var(--accent))', textDecoration: 'none' }} data-testid="link-back-stories"><ArrowLeft size={14} /> Back to all stories</Link><div className="eyebrow" style={{ marginTop: 40 }}>{story.category} / field notes</div><h1 className="display">{story.title}</h1><p className="article-dek">{story.excerpt} This is the part where we stay with the question a little longer.</p><div className="article-byline"><span className="byline-avatar">{story.author.split(' ').map((part) => part[0]).join('')}</span><span>Words by <strong>{story.author}</strong><br /><span style={{ color: 'hsl(var(--muted-foreground))' }}>{story.date} · {story.read}</span></span></div></div>
        <div className="container-editorial article-layout">
          <aside className="article-aside"><div className="sticky-note"><span className="eyebrow">Keep this close</span><p>Share this story with someone who eats lunch at your school.</p><button className="button-outline" onClick={() => navigator.clipboard?.writeText(window.location.href)} data-testid="button-share-story">Copy link <ArrowUpRight size={13} /></button></div></aside>
          <article className="article-body" data-testid={`article-body-${story.slug}`}>
            <p>At 12:18, the lunchroom changes key. The first rush has passed. A few paper boats are empty; a few are untouched. Someone is peeling an orange with the concentration of a person repairing a small machine.</p>
            <p>We talk about food waste like it is a pile, a statistic, a problem with a tidy edge. At school, it is more ordinary than that. It is the unopened milk. The apple that rolls under the bench. The extra slice that nobody wanted until somebody asks.</p>
            <blockquote>“A full table is not a reward for getting everything right. It is how we practice looking after each other.”</blockquote>
            <div className="article-break" aria-label="A graphic reading save the scraps" />
            <p>The fix is not a perfect lunchroom. Perfect systems are mostly an excuse to wait. The fix is a second bin, labeled clearly. A shelf with a sign that says take what you need. A student willing to ask the cafeteria team what happens to the food at the end of the day—and willing to listen to the answer.</p>
            <p>We started small. Every Thursday, two of us stay ten minutes after the bell. We log what is left, pack what can be packed, and call the community fridge on Oak Street. The first week, it was three containers. Last week, it was nineteen. The number matters less than the habit: food does not disappear just because the bell rings.</p>
            <p>There is no gold star at the end of this. Just better odds. Better odds that someone gets dinner. Better odds that the work of growing, cooking, and carrying food is treated with the respect it deserves. Better odds that when we say “everyone,” we mean the person sitting beside us.</p>
            <div className="article-tags"><span className="tag">#schoollunch</span><span className="tag">#mutualaid</span><span className="tag">#startsmall</span></div>
          </article>
        </div>
      </main>
    </Shell>
  );
}

function Join() {
  return (
    <Shell>
      <main className="join-page">
        <div className="container-editorial">
          <div className="join-grid">
            <div className="reveal"><div className="eyebrow" style={{ color: 'hsl(var(--accent))' }}>No experience required</div><h1 className="display">Pull up<br />a chair.</h1><p className="lead">Food4Thought is a club for curious people who want to make their school a little more generous. Write, photograph, cook, organize, ask questions—or just show up.</p></div>
            <div className="join-box reveal delay-2"><h2 className="display">Get the dispatch.</h2><p className="dispatch-copy">Start with our Friday note. If you want to do more, reply to any issue and we’ll find a place for you.</p><NewsletterForm /></div>
          </div>
          <div className="join-benefits reveal delay-3"><div className="join-benefit"><b>01 / REPORT</b><p>Tell the story behind the tray.</p></div><div className="join-benefit"><b>02 / SHARE</b><p>Make a useful idea contagious.</p></div><div className="join-benefit"><b>03 / SHOW UP</b><p>Turn care into a calendar event.</p></div></div>
        </div>
      </main>
    </Shell>
  );
}

function About() {
  return (
    <Shell>
      <main className="join-page"><div className="container-editorial"><div className="reveal"><div className="eyebrow" style={{ color: 'hsl(var(--accent))' }}>Our point of view</div><h1 className="display">No one should<br /><em style={{ color: 'hsl(var(--accent))', fontStyle: 'normal' }}>eat alone.</em></h1><p className="lead">We are students making a publication about food waste because the issue is both enormous and right in front of us. We believe the best work starts with attention: notice what is there, ask who is missing, and make one more portion than you think you need.</p></div><div className="manifesto-list" style={{ marginTop: 70, maxWidth: 680 }}><div><b>01</b><span>We are not here to make anyone feel guilty about a banana.</span></div><div><b>02</b><span>We care about practical action, and the people doing it.</span></div><div><b>03</b><span>We leave the door open. There is always room for one more.</span></div></div></div></main>
    </Shell>
  );
}

function Router() {
  return <ErrorBoundary><Switch><Route path="/" component={Home} /><Route path="/stories" component={Stories} /><Route path="/stories/:category" component={Stories} /><Route path="/story/:slug" component={Article} /><Route path="/join" component={Join} /><Route path="/about" component={About} /><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;