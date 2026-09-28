'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TagIcon } from '@heroicons/react/24/outline';
import {
    HomeIcon, ShoppingBagIcon, ClipboardDocumentListIcon,
    ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon, PhotoIcon, ArrowPathIcon, TicketIcon
} from '@heroicons/react/24/outline';
const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: HomeIcon },
    { href: '/admin/urunler', label: 'Ürünler', icon: ShoppingBagIcon },
    { href: '/admin/bannerlar', label: 'Bannerlar', icon: PhotoIcon },
    { href: '/admin/siparisler', label: 'Siparişler', icon: ClipboardDocumentListIcon },
    { href: '/admin/iadeler', label: 'İade Talepleri', icon: ArrowPathIcon },
    { href: '/admin/kuponlar', label: 'Kuponlar', icon: TicketIcon },
];
export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLoginPage, setIsLoginPage] = useState(false);

    useEffect(() => {
        if (pathname === '/admin/login') {
            setIsLoginPage(true);
            return;
        }
        setIsLoginPage(false);

    }, [pathname, router]);//

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.replace('/admin/login');
    };

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Mobile toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded-lg shadow-lg"
            >
                {sidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>

            {/* Overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white flex flex-col transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                    }`}
            >
                <div className="p-6 border-b border-gray-800">
                    <Link href="/admin" className="text-2xl font-bold text-rose-500">
                        Butik<span className="text-white">Admin</span>
                    </Link>
                </div>
                <nav className="flex-1 py-4">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center px-6 py-3 mx-2 rounded-lg transition ${active ? 'bg-rose-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                                    }`}
                            >
                                <Icon className="h-5 w-5 mr-3" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition"
                    >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                        <span className="font-medium">Çıkış Yap</span>
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center border-b border-gray-100">
                    <h2 className="text-lg font-semibold ml-12 md:ml-0">Admin Paneli</h2>
                    <div className="flex items-center space-x-4">
                        <Link href="/" target="_blank" className="text-sm text-gray-600 hover:text-rose-600">
                            Siteyi Görüntüle →
                        </Link>
                        <div className="w-9 h-9 bg-rose-600 text-white rounded-full flex items-center justify-center font-semibold">
                            A
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}
