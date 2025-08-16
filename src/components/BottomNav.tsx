
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, User, LayoutGrid, Store } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/leaderboard", icon: LayoutGrid, label: "Leaderboard" },
    { href: "/store", icon: Store, label: "Store" },
    { href: "/profile", icon: User, label: "Profile" },
]

export function BottomNav() {
    const pathname = usePathname()

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-md border-t border-border shadow-lg z-50">
            <nav className="flex justify-around items-center h-full px-1">
                {navItems.map((item) => {
                    const isActive = (item.href === "/dashboard" && pathname === item.href) || (pathname.startsWith(item.href) && item.href !== "/dashboard");
                    
                    return (
                        <Link 
                            key={item.label} 
                            href={item.href} 
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full rounded-lg transition-all duration-200",
                                isActive 
                                    ? "text-primary" 
                                    : "text-muted-foreground hover:text-primary/90 hover:bg-primary/5 active:scale-95"
                            )}
                        >
                            <div className="relative">
                                <item.icon className={cn(
                                    "w-5 h-5 transition-transform duration-200",
                                    isActive ? "scale-110" : "group-hover:scale-105"
                                )} />
                                {isActive && (
                                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-primary rounded-full animate-pulse" />
                                )}
                            </div>
                            <span className={cn(
                                "text-xs mt-1 transition-all duration-200",
                                isActive ? "font-medium" : "group-hover:font-medium"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
