"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Bell, UserCircle, Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/leaderboard", icon: Bookmark, label: "Leaderboard" },
    { href: "#", icon: Bell, label: "Notifications" },
    { href: "#", icon: UserCircle, label: "Profile" },
]

export function BottomNav() {
    const pathname = usePathname()

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-sm border-t border-gray-200 shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
            <nav className="flex justify-around items-center h-full">
                {navItems.map((item) => {
                    const isActive = (item.href === "/" && pathname === item.href) || (item.href !== "/" && pathname.startsWith(item.href));
                    return (
                        <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center w-full h-full">
                            <item.icon className={cn("w-7 h-7 transition-colors", isActive ? "text-primary" : "text-gray-400")} />
                            {isActive && <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1"></div>}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
