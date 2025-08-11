
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, User, LayoutGrid } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/leaderboard", icon: LayoutGrid, label: "Leaderboard" },
    { href: "/profile", icon: User, label: "Profile" },
]

export function BottomNav() {
    const pathname = usePathname()

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-sm border-t border-border">
            <nav className="flex justify-around items-center h-full">
                {navItems.map((item) => {
                    const isActive = (item.href === "/" && pathname === item.href) || (item.href !== "/" && pathname.startsWith(item.href));
                    
                    return (
                        <Link key={item.label} href={item.href} className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-primary transition-colors">
                            <item.icon className={cn("w-6 h-6", isActive && "text-primary")} />
                            <span className={cn("text-xs mt-1.5", isActive && "text-primary font-medium")}>{item.label}</span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
