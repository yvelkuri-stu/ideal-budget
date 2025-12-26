import Link from 'next/link';
import { Camera, Plus, BarChart2, MessageSquare, Settings } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import content from '@/locales/en.json';
import RecentBills from '@/components/dashboard/RecentBills';
import SpendingChart from '@/components/dashboard/SpendingChart';

export default function Home() {
  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
      {/* Header */}
      <header className="flex-center" style={{ flexDirection: 'column', marginBottom: '3rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/settings" style={{ color: 'var(--color-text-muted)', transition: 'color var(--transition-speed)' }}>
            <Settings size={24} />
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          {content.app.title}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
          {content.app.subtitle}
        </p>
      </header>

      {/* Quick Actions Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <Link href="/scan" className="glass-panel" style={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--color-primary-glow)',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <div style={{
            background: 'var(--color-primary)',
            padding: '1rem',
            borderRadius: '50%',
            marginBottom: '1rem',
            color: 'white'
          }}>
            <Camera size={28} />
          </div>
          <span style={{ fontWeight: 600 }}>{content.home.action_scan}</span>
        </Link>

        <Link href="/add" className="glass-panel" style={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'var(--color-surface)',
            border: '2px solid var(--color-text-muted)',
            padding: '1rem',
            borderRadius: '50%',
            marginBottom: '1rem',
            color: 'var(--color-text-main)'
          }}>
            <Plus size={28} />
          </div>
          <span style={{ fontWeight: 600 }}>{content.home.action_entering}</span>
        </Link>
      </div>

      <section>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>{content.home.recent_activity}</h2>
        <SpendingChart />
        <RecentBills />
      </section>

      {/* Navigation Tabs (Preview) */}
      <nav className="glass-panel" style={{
        position: 'fixed',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 2rem)',
        maxWidth: '400px',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '1rem',
        zIndex: 100
      }}>
        <Link href="/" style={{ color: 'var(--color-primary)' }}>
          <div className="flex-center" style={{ flexDirection: 'column', fontSize: '0.8rem', gap: '4px' }}>
            <BarChart2 size={24} />
            <span>Home</span>
          </div>
        </Link>
        <Link href="/coach" style={{ color: 'var(--color-text-muted)' }}>
          <div className="flex-center" style={{ flexDirection: 'column', fontSize: '0.8rem', gap: '4px' }}>
            <MessageSquare size={24} />
            <span>Coach</span>
          </div>
        </Link>
      </nav>
    </div>
  );
}
