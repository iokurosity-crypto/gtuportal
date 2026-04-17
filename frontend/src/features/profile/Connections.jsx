import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import api from "@/services/axios";
import { Avatar, AvatarImage, AvatarFallback, Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { Users, MessageCircle, Calendar, MapPin, Briefcase, GraduationCap, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Connections = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const [connections, setConnections] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('accepted'); // accepted | pending | sent

    useEffect(() => {
        if (!auth.isLoggedIn) return;
        fetchConnections();
    }, [auth.isLoggedIn]);

    const fetchConnections = async () => {
        setLoading(true);
        try {
            // Fetch accepted connections
            const connectionsRes = await api.get('/connections');
            if (connectionsRes.data) {
                const formattedConnections = connectionsRes.data.map(conn => {
                    const user = conn.user || conn;
                    return {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        profilePhoto: user.profilePhoto,
                        currentJobTitle: user.currentJobTitle,
                        currentCompany: user.currentCompany,
                        department: user.department,
                        batch: user.batch,
                        location: user.currentLocation,
                        connectedAt: conn.connectedAt || conn.updatedAt
                    };
                });
                setConnections(formattedConnections);
            }

            // Fetch incoming requests
            const incomingRes = await api.get('/connections/incoming');
            if (incomingRes.data && Array.isArray(incomingRes.data)) {
                setPendingRequests(incomingRes.data.map(req => ({
                    id: req._id,
                    fromUser: req.fromUser,
                    createdAt: req.createdAt
                })));
            }

            // Fetch outgoing requests
            const outgoingRes = await api.get('/connections/outgoing');
            if (outgoingRes.data && Array.isArray(outgoingRes.data)) {
                setSentRequests(outgoingRes.data.map(req => ({
                    id: req._id,
                    toUser: req.toUser,
                    createdAt: req.createdAt
                })));
            }
        } catch (error) {
            console.error('Error fetching connections:', error);
            toast.error('Failed to load connections');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async (requestId, fromUserId) => {
        try {
            await api.post(`/connections/${requestId}/accept`);
            toast.success('Connection accepted!');
            fetchConnections();
        } catch (error) {
            console.error('Error accepting request:', error);
            toast.error('Failed to accept connection request');
        }
    };

    const handleRejectRequest = async (requestId) => {
        try {
            await api.delete(`/connections/${requestId}/reject`);
            toast.success('Connection rejected');
            fetchConnections();
        } catch (error) {
            console.error('Error rejecting request:', error);
            toast.error('Failed to reject connection request');
        }
    };

    const handleRemoveConnection = async (connectionId) => {
        try {
            await api.delete(`/connections/${connectionId}`);
            toast.success('Connection removed');
            fetchConnections();
        } catch (error) {
            console.error('Error removing connection:', error);
            toast.error('Failed to remove connection');
        }
    };

    const handleMessage = (userId) => {
        navigate(`/chat/${userId}`);
    };

    if (loading) {
        return (
            <div className="container max-w-4xl mx-auto px-4 py-20 min-h-screen">
                <div className="text-center">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading connections...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-4xl mx-auto px-4 py-8 min-h-screen">
            <div className="flex items-center gap-3 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Users className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">My Network</h1>
                    <p className="text-muted-foreground">Manage your connections and requests</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-4 mb-8 border-b">
                <button
                    onClick={() => setActiveTab('accepted')}
                    className={`pb-3 px-4 font-semibold transition-colors ${
                        activeTab === 'accepted'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Connections ({connections.length})
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`pb-3 px-4 font-semibold transition-colors ${
                        activeTab === 'pending'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Requests ({pendingRequests.length})
                </button>
                <button
                    onClick={() => setActiveTab('sent')}
                    className={`pb-3 px-4 font-semibold transition-colors ${
                        activeTab === 'sent'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                    Sent ({sentRequests.length})
                </button>
            </div>

            {/* Connections Tab */}
            {activeTab === 'accepted' && (
                <>
                    {connections.length === 0 ? (
                        <Card className="border-slate-200 shadow-xl overflow-hidden rounded-[2rem]">
                            <CardContent className="p-12 text-center">
                                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="h-8 w-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">No connections yet</h3>
                                <p className="text-muted-foreground mb-4">Start connecting with fellow alumni to build your network</p>
                                <Button onClick={() => navigate('/directory')}>
                                    Find Alumni
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {connections.map((connection) => (
                                <Card key={connection.id} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-lg">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <Avatar className="h-16 w-16">
                                                <AvatarImage src={connection.profilePhoto} alt={connection.name} />
                                                <AvatarFallback className="text-lg">
                                                    {connection.name?.[0]?.toUpperCase() || 'A'}
                                                </AvatarFallback>
                                            </Avatar>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="text-lg font-semibold text-slate-900 truncate">
                                                            {connection.name}
                                                        </h3>
                                                        <p className="text-sm text-slate-600 mt-1">
                                                            {connection.currentJobTitle} at {connection.currentCompany}
                                                        </p>
                                                        
                                                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
                                                            {connection.batch && (
                                                                <div className="flex items-center gap-1">
                                                                    <GraduationCap className="h-3 w-3" />
                                                                    <span>Batch {connection.batch}</span>
                                                                </div>
                                                            )}
                                                            {connection.department && (
                                                                <div className="flex items-center gap-1">
                                                                    <Briefcase className="h-3 w-3" />
                                                                    <span>{connection.department}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex gap-2 ml-4">
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => navigate(`/profile/${connection.id}`)}
                                                        >
                                                            View Profile
                                                        </Button>
                                                        <Button 
                                                            size="sm"
                                                            onClick={() => handleMessage(connection.id)}
                                                        >
                                                            <MessageCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button 
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleRemoveConnection(connection.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Pending Requests Tab */}
            {activeTab === 'pending' && (
                <>
                    {pendingRequests.length === 0 ? (
                        <Card className="border-slate-200 shadow-xl overflow-hidden rounded-[2rem]">
                            <CardContent className="p-12 text-center">
                                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="h-8 w-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">No pending requests</h3>
                                <p className="text-muted-foreground">You don't have any incoming connection requests</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {pendingRequests.map((request) => (
                                <Card key={request.id} className="border-yellow-200 shadow-sm hover:shadow-md transition-shadow rounded-lg bg-yellow-50">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <Avatar className="h-16 w-16">
                                                <AvatarImage src={request.fromUser.profilePhoto} alt={request.fromUser.name} />
                                                <AvatarFallback className="text-lg">
                                                    {request.fromUser.name?.[0]?.toUpperCase() || 'A'}
                                                </AvatarFallback>
                                            </Avatar>
                                            
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-slate-900 truncate">
                                                    {request.fromUser.name} wants to connect
                                                </h3>
                                                <p className="text-sm text-slate-600 mt-1">{request.fromUser.email}</p>
                                                {request.fromUser.department && (
                                                    <p className="text-xs text-slate-500 mt-1">{request.fromUser.department} • Batch {request.fromUser.batch}</p>
                                                )}
                                                
                                                <div className="flex gap-2 mt-4">
                                                    <Button 
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => handleAcceptRequest(request.id, request.fromUser._id)}
                                                    >
                                                        Accept
                                                    </Button>
                                                    <Button 
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleRejectRequest(request.id)}
                                                    >
                                                        Reject
                                                    </Button>
                                                    <Button 
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => navigate(`/profile/${request.fromUser._id}`)}
                                                    >
                                                        View Profile
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Sent Requests Tab */}
            {activeTab === 'sent' && (
                <>
                    {sentRequests.length === 0 ? (
                        <Card className="border-slate-200 shadow-xl overflow-hidden rounded-[2rem]">
                            <CardContent className="p-12 text-center">
                                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="h-8 w-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">No sent requests</h3>
                                <p className="text-muted-foreground">Start connecting with alumni from the directory</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {sentRequests.map((request) => (
                                <Card key={request.id} className="border-blue-200 shadow-sm hover:shadow-md transition-shadow rounded-lg bg-blue-50">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            <Avatar className="h-16 w-16">
                                                <AvatarImage src={request.toUser.profilePhoto} alt={request.toUser.name} />
                                                <AvatarFallback className="text-lg">
                                                    {request.toUser.name?.[0]?.toUpperCase() || 'A'}
                                                </AvatarFallback>
                                            </Avatar>
                                            
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-slate-900 truncate">
                                                    {request.toUser.name}
                                                </h3>
                                                <p className="text-sm text-slate-600 mt-1">Pending your acceptance</p>
                                                {request.toUser.department && (
                                                    <p className="text-xs text-slate-500 mt-1">{request.toUser.department} • Batch {request.toUser.batch}</p>
                                                )}
                                                
                                                <div className="flex gap-2 mt-4">
                                                    <Button 
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => navigate(`/profile/${request.toUser._id}`)}
                                                    >
                                                        View Profile
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Connections;
