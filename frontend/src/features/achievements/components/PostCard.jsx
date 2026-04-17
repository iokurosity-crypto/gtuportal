import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deletePost } from "@/services/postsAPI";
import LikeButton from "./LikeButton";
import { MoreHorizontal, Trash2, Edit2, MessageSquare, Repeat2, Send } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback, Card, CardContent, Button } from "@/components/ui";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui";
import { Dialog, DialogContent } from "@/components/ui";

export default function PostCard({ posts, getEditData, currentUser }) {
    const navigate = useNavigate();
    const [imageModal, setImageModal] = useState(false);

    const isOwner = currentUser?.uid === posts.userID;

    return (
        <Card className="border-slate-200 shadow-sm rounded-lg overflow-hidden mb-2 bg-white transition-all">
            <CardContent className="p-3 pb-0">
                <div className="flex justify-between items-start mb-2 px-1">
                    <div className="flex gap-2">
                        <Avatar
                            className="h-12 w-12 cursor-pointer rounded-sm"
                            onClick={() => navigate(`/profile/${posts.userID}`)}
                        >
                            <AvatarImage src={posts.userPhotoURL} alt={posts.userName} />
                            <AvatarFallback className="rounded-sm bg-slate-100 text-slate-400 font-bold">{posts.userName?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <p
                                className="font-bold text-slate-900 text-sm cursor-pointer hover:text-[#0a66c2] hover:underline"
                                onClick={() => navigate(`/profile/${posts.userID}`)}
                            >
                                {posts.userName}
                            </p>
                            <p className="text-xs text-slate-500 leading-tight">{posts.userHeadline || "Alumni Member"}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{posts.timeStamp}</p>
                        </div>
                    </div>

                    {isOwner && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 hover:bg-slate-100">
                                    <MoreHorizontal className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 rounded-lg shadow-lg border-slate-200">
                                <DropdownMenuItem
                                    onClick={() => getEditData(posts)} className="cursor-pointer font-semibold text-slate-600 focus:bg-slate-50 py-2"
                                >
                                    <Edit2 className="h-4 w-4 mr-2" /> Edit Post
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        if (window.confirm("Are you sure you want to delete this post?")) {
                                            deletePost(posts.id);
                                        }
                                    }}
                                    className="cursor-pointer font-semibold text-rose-600 focus:bg-rose-50 focus:text-rose-700 py-2"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                <div className="px-1 mb-3 text-slate-900 text-sm leading-normal whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: posts.content || posts.status }} />
            </CardContent>

            {posts.postImage && (
                <div
                    className="cursor-pointer bg-slate-50 border-y border-slate-100 flex justify-center"
                    onClick={() => setImageModal(true)}
                >
                    <img
                        src={posts.postImage}
                        className="max-w-full max-h-[500px] object-contain"
                        alt="Post attachment"
                    />
                </div>
            )}

            <div className="px-4 py-1 border-t border-slate-100 flex items-center justify-between">
                <LikeButton
                    userId={currentUser?.uid}
                    postId={posts.id}
                    currentUser={currentUser}
                />
                <Button variant="ghost" className="flex-1 h-12 gap-2 text-slate-500 hover:bg-slate-100 font-semibold rounded-md">
                    <MessageSquare className="h-5 w-5" />
                    <span>Comment</span>
                </Button>
                <Button variant="ghost" className="flex-1 h-12 gap-2 text-slate-500 hover:bg-slate-100 font-semibold rounded-md">
                    <Repeat2 className="h-5 w-5" />
                    <span>Repost</span>
                </Button>
                <Button variant="ghost" className="flex-1 h-12 gap-2 text-slate-500 hover:bg-slate-100 font-semibold rounded-md">
                    <Send className="h-5 w-5" />
                    <span>Send</span>
                </Button>
            </div>

            <Dialog open={imageModal} onOpenChange={setImageModal}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
                    <img
                        src={posts.postImage}
                        className="max-h-[85vh] w-auto max-w-full rounded-lg shadow-2xl"
                        alt="Expanded post content"
                    />
                </DialogContent>
            </Dialog>
        </Card>
    );
}
