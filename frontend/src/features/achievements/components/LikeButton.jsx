import React, { useMemo, useState } from "react";
import { likePost, getLikesByUser, postComment, getComments } from "@/services/postsAPI";
import { format } from "date-fns";
import { Heart, MessageCircle, Send } from "lucide-react";
import { Button, Input, Avatar, AvatarImage, AvatarFallback } from "@/components/ui";

export default function LikeButton({ userId, postId, currentUser }) {
    const [likesCount, setLikesCount] = useState(0);
    const [showCommentBox, setShowCommentBox] = useState(false);
    const [liked, setLiked] = useState(false);
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState([]);

    const handleLike = () => {
        likePost(userId, postId, liked);
    };

    const addComment = () => {
        if (!comment.trim()) return;
        postComment(postId, comment, format(new Date(), "PPpp"), currentUser?.name || currentUser?.displayName, currentUser?.photoURL || currentUser?.imageLink);
        setComment("");
    };

    useMemo(() => {
        getLikesByUser(userId, postId, setLiked, setLikesCount);
        getComments(postId, setComments);
    }, [userId, postId]);

    return (
        <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3 px-2 text-xs text-slate-500 font-medium">
                <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
                <span>{comments.length} Comments</span>
            </div>

            <div className="flex gap-2 mb-4">
                <Button
                    variant="ghost"
                    className={`flex-1 gap-2 rounded-xl transition-all ${liked ? 'text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700' : 'text-slate-600 hover:bg-slate-100'}`}
                    onClick={handleLike}
                >
                    <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
                    Like
                </Button>
                <Button
                    variant="ghost"
                    className={`flex-1 gap-2 rounded-xl transition-all ${showCommentBox ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100'}`}
                    onClick={() => setShowCommentBox(!showCommentBox)}
                >
                    <MessageCircle className="h-5 w-5" />
                    Comment
                </Button>
            </div>

            {showCommentBox && (
                <div className="space-y-4 bg-slate-50 p-4 rounded-2xl">
                    <div className="flex gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={currentUser?.photoURL || currentUser?.imageLink} />
                            <AvatarFallback>{(currentUser?.name || currentUser?.displayName)?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex gap-2">
                            <Input
                                placeholder="Write a comment..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="rounded-full bg-white border-slate-200"
                                onKeyDown={(e) => { if (e.key === 'Enter') addComment() }}
                            />
                            <Button size="icon" onClick={addComment} disabled={!comment.trim()} className="rounded-full shrink-0">
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {comments.length > 0 && (
                        <div className="space-y-4 mt-4">
                            {comments.map((cmt) => (
                                <div key={cmt.id} className="flex gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={cmt.photoURL} />
                                        <AvatarFallback>{cmt.name?.[0] || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold text-sm text-slate-800">{cmt.name}</p>
                                            <span className="text-[10px] text-slate-400 font-medium">{cmt.timeStamp}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 mt-1">{cmt.comment}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}


