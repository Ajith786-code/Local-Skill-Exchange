import { Link } from 'react-router-dom';
import { ArrowLeftRight, ArrowRight, Heart, MessageSquare, Search, ShieldCheck, Sparkles, UserPlus, Users, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const steps = [
  { icon: UserPlus, title: 'Create your profile', text: 'List the skills you can teach and the skills you want to learn.' },
  { icon: Sparkles, title: 'Get matched', text: 'We highlight people who teach what you want and want what you teach.' },
  { icon: ArrowLeftRight, title: 'Send a request', text: 'Propose a swap. The other person can accept or decline.' },
  { icon: MessageSquare, title: 'Chat and learn', text: 'Once accepted, use the built-in chat to plan your sessions.' },
];

const examples = [
  { a: { name: 'Rahul', teaches: 'Guitar', wants: 'Excel' }, b: { name: 'Priya', teaches: 'Excel', wants: 'Guitar' } },
  { a: { name: 'Arjun', teaches: 'Cooking', wants: 'Photography' }, b: { name: 'Meera', teaches: 'Photography', wants: 'Cooking' } },
  { a: { name: 'Karthik', teaches: 'Python', wants: 'Spanish' }, b: { name: 'Sneha', teaches: 'Spanish', wants: 'Python' } },
];

const benefits = [
  { icon: Wallet, title: 'No money involved', text: 'Your time and knowledge are the currency. Nobody pays, nobody profits.' },
  { icon: Users, title: 'Learn from real people', text: 'Find neighbours in your city who can teach you in person or online.' },
  { icon: Heart, title: 'Teaching deepens learning', text: 'Explaining what you know is one of the best ways to master it.' },
  { icon: ShieldCheck, title: 'Privacy first', text: 'Emails and contact details are never public. Talk through built-in chat.' },
];

export default function LandingPage() {
  const { user } = useAuth();
  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="badge bg-brand-100 text-brand-800">Learn · Teach · Exchange</span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Share Your Skills. Learn Something New.</h1>
            <p className="mt-4 max-w-xl text-lg text-slate-600">
              Local Skill Exchange connects people who want to swap skills without paying each other. You teach guitar, someone teaches you Excel. Everyone wins.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={user ? '/dashboard' : '/register'} className="btn-primary px-6 py-3 text-base">
                Get started <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link to="/discover" className="btn-secondary px-6 py-3 text-base">
                <Search className="h-5 w-5" aria-hidden="true" /> Explore skills
              </Link>
            </div>
          </div>
          <div className="card p-6" aria-label="Example of a skill exchange">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Example mutual match</p>
            <div className="mt-4 grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
              <div className="rounded-xl bg-brand-50 p-4 text-center">
                <p className="font-semibold text-slate-900">{examples[0].a.name}</p>
                <p className="mt-1 text-sm text-slate-600">teaches <strong className="text-brand-700">{examples[0].a.teaches}</strong></p>
              </div>
              <ArrowLeftRight className="mx-auto h-6 w-6 text-brand-600" aria-hidden="true" />
              <div className="rounded-xl bg-amber-50 p-4 text-center">
                <p className="font-semibold text-slate-900">{examples[0].b.name}</p>
                <p className="mt-1 text-sm text-slate-600">teaches <strong className="text-amber-700">{examples[0].b.teaches}</strong></p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">Both want what the other offers, so the platform flags them as a mutual match.</p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <h2 className="text-center text-3xl font-bold text-slate-900">How it works</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-slate-500">Four simple steps from sign-up to your first lesson.</p>
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="card p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <span className="text-sm font-semibold text-slate-400">Step {i + 1}</span>
              </div>
              <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="examples" className="scroll-mt-20 bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-slate-900">Example skill exchanges</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-slate-500">Illustrations of the kind of swaps people can arrange. These are examples, not real members.</p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {examples.map(({ a, b }) => (
              <article key={a.name} className="card p-5">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <div><p className="font-semibold text-slate-900">{a.name}</p><p className="text-brand-700">teaches {a.teaches}</p></div>
                  <ArrowLeftRight className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />
                  <div className="text-right"><p className="font-semibold text-slate-900">{b.name}</p><p className="text-amber-700">teaches {b.teaches}</p></div>
                </div>
                <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">{a.name} wants {a.wants}; {b.name} wants {b.wants}.</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="benefits" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <h2 className="text-center text-3xl font-bold text-slate-900">Why exchange skills?</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-5">
              <Icon className="h-6 w-6 text-brand-600" aria-hidden="true" />
              <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-4xl rounded-2xl bg-brand-700 px-6 py-12 text-center text-white">
          <h2 className="text-3xl font-bold">Ready to swap a skill?</h2>
          <p className="mx-auto mt-2 max-w-xl text-brand-100">Create a free profile in a minute and see who in your city can teach you something new.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to={user ? '/dashboard' : '/register'} className="btn bg-white px-6 py-3 text-base text-brand-800 hover:bg-brand-50">Join Local Skill Exchange</Link>
            <Link to="/discover" className="btn border border-white/40 px-6 py-3 text-base text-white hover:bg-white/10">Browse skills</Link>
          </div>
        </div>
      </section>
    </>
  );
}
