import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SidebarLeft from '../components/SidebarLeft';
import SidebarRight from '../components/SidebarRight';
import TopHeader from '../components/TopHeader';
import MobileNav from '../components/MobileNav';
import CreatePostModal from '../components/CreatePostModal';

export default function AppLayout() {
  const location = useLocation();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Derive title from pathname
  const getPageTitle = () => {
    if (location.pathname === '/') return 'Home Feed';
    if (location.pathname.startsWith('/explore')) return 'Explore People';
    if (location.pathname.startsWith('/profile')) return 'Profile';
    return 'Vibely';
  };

  return (
    <div className="app-layout">
      <div className="app-container">
        {/* Left Desktop Navigation */}
        <SidebarLeft onOpenCreateModal={() => setIsCreateModalOpen(true)} />

        {/* Center Main Feed Column */}
        <main className="feed-column">
          <TopHeader title={getPageTitle()} />
          <div style={{ padding: '20px 20px 40px 20px', flex: 1 }}>
            <Outlet context={{ openCreateModal: () => setIsCreateModalOpen(true) }} />
          </div>
        </main>

        {/* Right Desktop Sidebar */}
        <SidebarRight />

        {/* Mobile Bottom Navigation */}
        <MobileNav onOpenCreateModal={() => setIsCreateModalOpen(true)} />

        {/* Global Post Creation Modal */}
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>
    </div>
  );
}
