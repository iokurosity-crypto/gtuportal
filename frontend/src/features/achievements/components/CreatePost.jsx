import React, { useState, useEffect } from "react";
import { postStatus, updatePost } from "@/services/postsAPI";
import moment from "moment";

import PostModal from "./PostModal";
import PostCard from "./PostCard";
import { uploadPostImage } from "@/services/imageUploadAPI";
import { Avatar, AvatarImage, AvatarFallback, Card, CardContent, Button } from "@/components/ui";
import { ImagePlus, Video, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import uuidv4 from "react-uuid";

export default function CreatePost({ currentUser, allStatuses }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [status, setStatus] = useState("");
    const [currentPost, setCurrentPost] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const [postImage, setPostImage] = useState("");

    const sendStatus = async () => {
        if (!status.trim() && !postImage) return toast.error("Post cannot be empty.");

        let object = {
            content: status,
            timeStamp: moment().format("LLL"),
            userEmail: currentUser.email,
            userName: currentUser.name || currentUser.displayName || "Unknown User",
            userPhotoURL: currentUser.photoURL || currentUser.imageLink || "",
            userHeadline: currentUser.headline || currentUser.role || "Alumni",
            postID: uuidv4(),
            userID: currentUser.uid || currentUser.id,
            postImage: postImage,
        };

        await postStatus(object);
        setModalOpen(false);
        setIsEdit(false);
        setStatus("");
        setPostImage("");
    };

    const getEditData = (posts) => {
        setModalOpen(true);
        setStatus(posts?.content || posts?.status);
        setCurrentPost(posts);
        setIsEdit(true);
    };

    return (
        <Card className="border-slate-200 shadow-xl rounded-[2rem] overflow-hidden mb-8 bg-white/90 backdrop-blur-md">
            <CardContent className="p-5 sm:p-6">
                <div className="flex gap-4 mb-4">
                    <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-sm shrink-0">
                        <AvatarImage src={currentUser?.photoURL || currentUser?.imageLink} alt={currentUser?.name} />
                        <AvatarFallback>{(currentUser?.name || currentUser?.displayName)?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <button
                        onClick={() => {
                            setModalOpen(true);
                            setIsEdit(false);
                        }}
                        className="flex-1 text-left px-5 py-3 rounded-[2rem] bg-slate-100 hover:bg-slate-200 transition-all text-slate-500 font-bold border border-slate-200 hover:border-slate-300"
                    >
                        Start a post, inspire the LDCE community...
                    </button>
                </div>

                <div className="flex justify-between sm:justify-start gap-2 sm:gap-6 px-1">
                    <Button
                        variant="ghost"
                        className="h-10 px-4 rounded-xl text-sky-600 hover:bg-sky-50 font-bold group flex-1 sm:flex-none justify-center"
                        onClick={() => { setModalOpen(true); setIsEdit(false); }}
                    >
                        <ImagePlus className="h-5 w-5 sm:mr-2 text-sky-500 group-hover:scale-110 transition-transform" />
                        <span className="hidden sm:inline">Media</span>
                    </Button>
                    <Button
                        variant="ghost"
                        className="h-10 px-4 rounded-xl text-emerald-600 hover:bg-emerald-50 font-bold group flex-1 sm:flex-none justify-center"
                        onClick={() => toast.info("Video upload coming soon!")}
                    >
                        <Video className="h-5 w-5 sm:mr-2 text-emerald-500 group-hover:scale-110 transition-transform" />
                        <span className="hidden sm:inline">Event</span>
                    </Button>
                    <Button
                        variant="ghost"
                        className="h-10 px-4 rounded-xl text-amber-600 hover:bg-amber-50 font-bold group flex-1 sm:flex-none justify-center"
                        onClick={() => toast.info("Event creation coming soon!")}
                    >
                        <CalendarDays className="h-5 w-5 sm:mr-2 text-amber-500 group-hover:scale-110 transition-transform" />
                        <span className="hidden sm:inline">Article</span>
                    </Button>
                </div>
            </CardContent>

            <PostModal
                setStatus={setStatus}
                modalOpen={modalOpen}
                setModalOpen={setModalOpen}
                status={status}
                sendStatus={sendStatus}
                isEdit={isEdit}
                updateStatus={() => {
                    updatePost(currentPost.id, status, postImage);
                    setModalOpen(false);
                }}
                uploadPostImage={uploadPostImage}
                postImage={postImage}
                setPostImage={setPostImage}
                setCurrentPost={setCurrentPost}
                currentPost={currentPost}
            />

            <div className="space-y-6 mt-6">
                {allStatuses?.map((post) => (
                    <PostCard
                        key={post.id} posts={post} currentUser={currentUser} getEditData={getEditData} />
                ))}
            </div>
        </Card>
    );
}
