"use client";

import { useState, useEffect } from "react";
import { ListTodo } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { isAuthenticated } from "@/lib/auth";

export default function Navbar() {
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        setLoggedIn(isAuthenticated());
    }, []);

    return (
        <nav className="border-b border-[#5a189a]/30 bg-[#240046]/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center px-4 justify-between">
                <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-white">
                 <ListTodo/>
                TaskFlow
                </Link>
               <div className="flex items-center gap-4">
                 {loggedIn ? (
                   <Link href="/dashboard">
                     <Button className="bg-[#5a189a] text-white hover:bg-[#7b2cbf]">
                       Go to Dashboard
                     </Button>
                   </Link>
                 ) : (
                   <>
                     <Link href="/auth/sign-in">
                       <Button
                         variant="ghost"
                         className="text-[#c77dff] hover:bg-[#5a189a]/20 hover:text-white">
                         Log In
                       </Button>
                     </Link>
                     <Link href="/auth/sign-up">
                       <Button className="bg-[#5a189a] text-white hover:bg-[#7b2cbf]">
                         Start for free
                       </Button>
                     </Link>
                   </>
                 )}
               </div>
            </div>
        </nav>
    )
}