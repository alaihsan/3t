import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Users, History, Tag, Target, ClipboardList } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Al Quran',
        url: '/quran',
        icon: BookOpen,
    },
    {
        title: 'Kelas',
        url: '/classrooms',
        icon: Users,
    },
    {
        title: 'Riwayat Bacaan',
        url: '/reading-histories',
        icon: History,
    },
    {
        title: 'Pengaturan Label',
        url: '/correction-labels',
        icon: Tag,
    },
    {
        title: 'Target Belajar',
        url: '/student-goals',
        icon: Target,
    },
    {
        title: 'Rekap Nilai',
        url: '/rekap-nilai',
        icon: ClipboardList,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Saran & Perbaikan',
        url: '/suggestions',
        icon: Folder,
    },
    {
        title: 'Dokumentasi',
        url: '/documentation',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
