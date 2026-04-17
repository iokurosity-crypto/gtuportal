import { db } from './firebase';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  arrayUnion,
  arrayRemove,
  orderBy,
  limit
} from 'firebase/firestore';
import { toast } from 'sonner';

// Real-time listener for post likes
export const setupLikeListener = (postId, setLikeCount, setLiked, userId) => {
  if (!postId) return () => { };

  const postRef = doc(db, 'activities', postId);
  return onSnapshot(postRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      const likes = data.likes || [];
      setLikeCount(likes.length);
      setLiked(likes.includes(userId));
    }
  }, (error) => {
    console.error("Error in like listener:", error);
  });
};

// Toggle like status for a post
export const toggleLike = async (postId, userId, isLiked) => {
  try {
    const postRef = doc(db, 'activities', postId);

    if (isLiked) {
      await updateDoc(postRef, {
        likes: arrayRemove(userId)
      });
    } else {
      await updateDoc(postRef, {
        likes: arrayUnion(userId)
      });

      // Optional: Notify author
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const postData = postSnap.data();
        if (postData.authorId && postData.authorId !== userId) {
          await createNotification({
            userId: postData.authorId,
            type: 'like',
            title: 'New Like',
            message: `Someone liked your post: "${postData.content?.substring(0, 50)}..."`,
            fromUserId: userId,
            postId: postId
          });
        }
      }
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
};

// Internal helper to create notifications
const createNotification = async (notifData) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      ...notifData,
      createdAt: new Date(),
      read: false
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Send notification to connected alumni when someone posts
export const notifyConnectedAlumni = async (postAuthorId, postAuthorName, postContent, postId) => {
  try {
    // Get all connections for the post author
    const connectionsRef = collection(db, 'connections');
    const q = query(
      connectionsRef,
      where('status', '==', 'connected')
    );

    const connectionsSnapshot = await getDocs(q);

    if (connectionsSnapshot.empty) {
      console.log('No connected alumni found for notifications');
      return;
    }

    // Create notifications for each connected alumni
    const notificationsRef = collection(db, 'notifications');
    const notificationPromises = [];

    connectionsSnapshot.forEach((connectionDoc) => {
      const connection = connectionDoc.data();
      const connectedUserId = connection.userId === postAuthorId ? connection.partnerId : connection.userId;

      if (connectedUserId && connectedUserId !== postAuthorId) {
        const notificationData = {
          userId: connectedUserId,
          type: 'new_post',
          title: 'New Post from Your Connection',
          message: `${postAuthorName} shared a new post: "${postContent.substring(0, 100)}${postContent.length > 100 ? '...' : ''}"`,
          fromUserId: postAuthorId,
          fromUserName: postAuthorName,
          postId: postId,
          createdAt: new Date(),
          read: false,
          metadata: {
            postContent: postContent,
            postAuthorId: postAuthorId
          }
        };

        notificationPromises.push(addDoc(notificationsRef, notificationData));
      }
    });

    await Promise.all(notificationPromises);
    console.log(`Sent notifications to ${notificationPromises.length} connected alumni`);

  } catch (error) {
    console.error('Error sending notifications:', error);
  }
};

// Get notifications for a user
export const getUserNotifications = async (userId) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, { read: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

