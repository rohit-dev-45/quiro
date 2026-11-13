"use client";

import { useEffect, useState } from "react";

function greeting(date = new Date()) {
    const hour = date.getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
}

export function HomeGreeting({ firstName }: { firstName?: string }) {
    const [text, setText] = useState<string | null>(null);

    useEffect(() => {
        setText(greeting());
    }, []);

    return (
        <h2 className="font-heading text-3xl font-bold tracking-tight">
            {text ?? "Welcome"}
            {firstName ? `, ${firstName}` : ""}
        </h2>
    );
}
