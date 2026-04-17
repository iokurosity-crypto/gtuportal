import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button } from "@/components/ui";
import { ImagePlus, X, Bold, Italic, List, ListOrdered } from "lucide-react";

const PostModal = ({
    modalOpen,
    setModalOpen,
    sendStatus,
    setStatus,
    status,
    isEdit,
    updateStatus,
    uploadPostImage,
    setPostImage,
    postImage,
    currentPost,
    setCurrentPost,
}) => {
    const [progress, setProgress] = useState(0);

    const handleClose = () => {
        setStatus("");
        setModalOpen(false);
        setPostImage("");
        setCurrentPost({});
        setProgress(0);
    };

    const insertFormatting = (format) => {
        const textarea = document.getElementById('post-textarea');
        if (!textarea) return;
        
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = status.substring(start, end);
        
        let formattedText = selectedText;
        if (format === 'bold') formattedText = `**${selectedText}**`;
        if (format === 'italic') formattedText = `*${selectedText}*`;
        if (format === 'list') formattedText = `\n- ${selectedText}`;
        if (format === 'ordered') formattedText = `\n1. ${selectedText}`;
        
        const newText = status.substring(0, start) + formattedText + status.substring(end);
        setStatus(newText);
    };

    return (
        <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
            <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden border-0 shadow-2xl rounded-3xl">
                <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <DialogTitle className="text-xl font-black text-slate-800">
                            {isEdit ? "Edit your update" : "Share your update"}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6">
                    <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden mb-4">
                        <div className="flex gap-2 p-2 border-b border-slate-200 bg-white">
                            <button type="button" onClick={() => insertFormatting('bold')} className="p-1 hover:bg-slate-100 rounded" title="Bold">
                                <Bold className="h-4 w-4 text-slate-600" />
                            </button>
                            <button type="button" onClick={() => insertFormatting('italic')} className="p-1 hover:bg-slate-100 rounded" title="Italic">
                                <Italic className="h-4 w-4 text-slate-600" />
                            </button>
                            <button type="button" onClick={() => insertFormatting('list')} className="p-1 hover:bg-slate-100 rounded" title="Bullet List">
                                <List className="h-4 w-4 text-slate-600" />
                            </button>
                            <button type="button" onClick={() => insertFormatting('ordered')} className="p-1 hover:bg-slate-100 rounded" title="Numbered List">
                                <ListOrdered className="h-4 w-4 text-slate-600" />
                            </button>
                        </div>
                        <textarea
                            id="post-textarea"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            placeholder="Share your achievement, failure, experience, or success..."
                            className="w-full min-h-[150px] p-4 bg-transparent border-0 resize-none focus:outline-none focus:ring-0 text-slate-700"
                        />
                    </div>

                    {progress > 0 && progress < 100 && (
                        <div className="mb-4">
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-xs text-right text-slate-500 mt-1 font-medium">{progress}% Uploaded</p>
                        </div>
                    )}

                    {(postImage || currentPost?.postImage) && (
                        <div className="relative mb-4 rounded-2xl overflow-hidden border border-slate-200 group">
                            <img
                                className="w-full max-h-[300px] object-cover"
                                src={postImage || currentPost?.postImage}
                                alt="Post Preview"
                            />
                            <button
                                onClick={() => setPostImage("")}
                                className="absolute top-3 right-3 h-8 w-8 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 backdrop-blur-sm"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-4">
                        <label className="cursor-pointer h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-primary transition-colors">
                            <ImagePlus className="h-5 w-5" />
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={(event) => {
                                    if (event.target.files[0]) {
                                        uploadPostImage(event.target.files[0], setPostImage, setProgress);
                                    }
                                }}
                            />
                        </label>

                        <div className="flex gap-3">
                            <Button onClick={handleClose} variant="ghost" className="rounded-xl font-bold">Cancel</Button>
                            <Button
                                onClick={isEdit ? updateStatus : sendStatus}
                                type="primary"
                                disabled={!status.trim() && !postImage && !currentPost?.postImage}
                                className="rounded-xl px-6 bg-primary hover:bg-primary/90 text-white font-bold disabled:opacity-50"
                            >
                                {isEdit ? "Update" : "Share"}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PostModal;
