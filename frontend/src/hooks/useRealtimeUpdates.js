import { useEffect } from 'react';
import { useRealTime } from '@/contexts/RealTimeContext';

export function useRealtimeUpdates(onPhotoUpdate) {
  const { socket } = useRealTime();

  useEffect(() => {
    if (!socket) return;

    socket.on('profile-picture-updated', (event) => {
      console.log('Real-time: Profile picture updated!', event);
      if (onPhotoUpdate) {
        onPhotoUpdate({
          type: 'profile-picture',
          userId: event.userId,
          url: event.profilePicture,
          timestamp: event.timestamp
        });
      }
    });

    socket.on('cover-photo-updated', (event) => {
      console.log('Real-time: Cover photo updated!', event);
      if (onPhotoUpdate) {
        onPhotoUpdate({
          type: 'cover-photo',
          userId: event.userId,
          url: event.coverPhoto,
          timestamp: event.timestamp
        });
      }
    });

    socket.on('new-post', (post) => {
      console.log('Real-time: New post with photo!', post);
      if (post.image && onPhotoUpdate) {
        onPhotoUpdate({
          type: 'post-photo',
          postId: post._id,
          url: post.image,
          author: post.authorId?.name,
          timestamp: post.createdAt
        });
      }
    });

    return () => {
      socket.off('profile-picture-updated');
      socket.off('cover-photo-updated');
      socket.off('new-post');
    };
  }, [onPhotoUpdate]);

  return socket;
}
