import { ReactNode } from "react";
import "@/app/globals.css";
import NavbarWrapper from "@/components/navbar-wrapper";


export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50 antialiased">
            <NavbarWrapper />
            {children}
        </div>
    )
}
