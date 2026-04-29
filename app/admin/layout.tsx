"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Users, Menu, Moon, Sun, LogOut, Settings, ClipboardList, LayoutDashboard } from "lucide-react";import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { href: "/admin", label: "Inicio", icon: LayoutDashboard },
  { href: "/events", label: "Vista Eventos", icon: Calendar },
  { href: "/admin/managers", label: "Managers", icon: Users },
  { href: "/admin/my-requests", label: "Mis Peticiones", icon: ClipboardList },
  { href: "/admin/setup", label: "Configuración", icon: Settings },
];

function NavLink({ href, label, icon: Icon, isActive, onClick }: {
  href: string; label: string; icon: React.ElementType;
  isActive: boolean; onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return <Button variant="ghost" size="icon" className="text-sidebar-foreground"><Sun className="h-4 w-4" /></Button>;
  return (
    <Button variant="ghost" size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="text-sidebar-foreground hover:bg-sidebar-accent"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
          <span className="text-lg font-bold text-white">UV</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-tight">Admin</span>
          <span className="text-xs text-sidebar-foreground/70">Univalle</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} isActive={pathname === item.href} onClick={onNavClick} />
        ))}
      </nav>
      {user && (
        <div className="border-t border-sidebar-border p-3 space-y-1">
          <p className="px-3 text-xs text-sidebar-foreground/60 truncate">{user.name}</p>
          <p className="px-3 text-xs text-sidebar-foreground/40">Admin</p>
        </div>
      )}
      <div className="border-t border-sidebar-border p-3 flex items-center justify-between">
        <ThemeToggle />
        <Button variant="ghost" size="icon" onClick={logout}
          className="text-sidebar-foreground hover:bg-sidebar-accent">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { user, loading } = useAuth();

  React.useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/login';
    }
  }, [user, loading]);

  if (loading || !user) return null;
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden w-64 md:flex flex-col">
        <SidebarContent />
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="sr-only"><SheetTitle>Menú</SheetTitle></SheetHeader>
              <SidebarContent onNavClick={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
        </header>
        <main className="flex-1 overflow-auto bg-muted/30 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
