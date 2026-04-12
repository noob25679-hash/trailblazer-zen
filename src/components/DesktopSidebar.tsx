import { useApp } from '@/context/AppContext';
import { Compass, Map, TrendingUp, User, Camera, Bookmark, ClipboardList, Store, Activity, Plus, Square, PanelLeftClose, PanelLeft } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';

type Screen = 'feed' | 'map' | 'saved' | 'logs' | 'profile' | 'sensors' | 'rank' | 'shop' | 'camera';

const mainNav: { id: Screen; label: string; icon: typeof Compass }[] = [
  { id: 'feed', label: 'Discover', icon: Compass },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'rank', label: 'Ranks', icon: TrendingUp },
  { id: 'profile', label: 'Profile', icon: User },
];

const moreNav: { id: Screen; label: string; icon: typeof Compass }[] = [
  { id: 'saved', label: 'Saved', icon: Bookmark },
  { id: 'logs', label: 'Logs', icon: ClipboardList },
  { id: 'shop', label: 'Shop', icon: Store },
  { id: 'camera', label: 'Camera', icon: Camera },
];

export default function DesktopSidebar() {
  const { screen, setScreen, isTracking } = useApp();
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === 'collapsed';

  const handleStartTrek = () => {
    if (isTracking) {
      setScreen('sensors');
    } else {
      window.dispatchEvent(new CustomEvent('openStartTrek'));
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-3">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <span className="font-display text-xl tracking-wider text-primary">TREKR</span>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Start Trek button */}
        <div className="px-3 py-2">
          <button
            onClick={handleStartTrek}
            className={`w-full flex items-center justify-center gap-2 rounded-lg py-2.5 font-mono text-xs tracking-wider uppercase font-semibold transition-all ${
              isTracking
                ? 'bg-destructive text-white'
                : 'bg-primary text-primary-foreground'
            } ${collapsed ? 'px-0' : 'px-4'}`}
          >
            {isTracking ? <Square className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {!collapsed && (isTracking ? 'Tracking' : 'Start Trek')}
          </button>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={screen === item.id}
                    onClick={() => setScreen(item.id)}
                    tooltip={item.label}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>More</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {moreNav.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={screen === item.id}
                    onClick={() => setScreen(item.id)}
                    tooltip={item.label}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {isTracking && (
          <button
            onClick={() => setScreen('sensors')}
            className="w-full flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-destructive transition-colors hover:bg-destructive/20"
          >
            <Activity className="h-4 w-4 animate-pulse" />
            {!collapsed && <span className="font-mono text-xs">Live Tracking</span>}
          </button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
