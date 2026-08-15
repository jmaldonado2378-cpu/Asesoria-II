import Sidebar from './Sidebar';
import { ConnectionBanner } from './ui/ConnectionBanner';

export default function Layout({ children }) {
    return (
        <div className="flex min-h-screen print:min-h-0 print:block print:h-auto print:bg-white"
            style={{ background: 'var(--bg-main)' }}>
            <ConnectionBanner />
            <Sidebar />
            <main className="flex-1 overflow-auto print:overflow-visible print:h-auto ml-[72px]">
                {children}
            </main>
        </div>
    );
}
