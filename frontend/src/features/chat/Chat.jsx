import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Chat.jsx - Redirects to full page chat
 * The chat icon in navbar now navigates directly to /chat route
 * which loads ChatRoom component with full page layout
 */
const Chat = () => {
    const navigate = useNavigate();

    React.useEffect(() => {
        // Redirect to full page chat
        navigate('/chat', { replace: true });
    }, [navigate]);

    return null;
};

export default Chat;
