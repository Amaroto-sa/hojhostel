"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function SiteLayoutWrapper({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    // During SSR, rendered output must match initial client output.
    // We first render the content without nav/footer if we're not sure,
    // or use a consistent placeholder.
    if (!mounted) {
        return (
            <div className="min-h-screen">
                {children}
            </div>
        );
    }

    const isAdmin = pathname?.startsWith("/admin");

    if (isAdmin) {
        return <>{children}</>;
    }

    return (
        <>
            <Navbar />
            <main className="relative z-10 min-h-screen">{children}</main>
            <Footer />
        </>
    );
}
