import React, { useState, useEffect } from "react";
import CreatePost from "./components/CreatePost";
import { getStatus } from "@/services/postsAPI";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui";

export default function FeedPage() {
    const { user } = useAuth();
    const [allStatuses, setAllStatuses] = useState([]);

    useEffect(() => {
        const unsubscribe = getStatus(setAllStatuses);
        return () => unsubscribe();
    }, []);

    return (
        <div className="min-h-screen bg-[#f3f2ef]">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-4">
                    <Card className="border-slate-200 shadow-sm rounded-lg bg-white">
                        <CardContent className="px-4 py-3">
                            <h2 className="text-lg font-bold text-slate-900">Achievement Feed</h2>
                            <p className="text-sm text-slate-500">Share achievements, failures, experiences, and success with alumni.</p>
                        </CardContent>
                    </Card>
                    <div className="sticky top-8 z-10">
                        <CreatePost currentUser={user} allStatuses={allStatuses} />
                    </div>
                </div>
            </div>
        </div>
    );
}
