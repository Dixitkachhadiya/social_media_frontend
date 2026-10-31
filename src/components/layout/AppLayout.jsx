import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileNav from './MobileNav';
import { AnnouncementBanner, VerifyEmailBanner } from './Banners';

export default function AppLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <AnnouncementBanner />
        <VerifyEmailBanner />
        <main className="mx-auto w-full max-w-[1120px] flex-1 px-4 pt-5 pb-24 sm:px-6 md:pb-10">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
