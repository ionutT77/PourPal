import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import HangoutList from './components/Hangouts/HangoutList';
import HangoutDetails from './components/Hangouts/HangoutDetails';
import CreateHangout from './components/Hangouts/CreateHangout';
import UserProfile from './components/Profile/UserProfile';
import PublicProfile from './components/Profile/PublicProfile';
import GroupChat from './components/Chat/GroupChat';
import FriendsPage from './components/Friends/FriendsPage';
import PrivacyPolicy from './components/Legal/PrivacyPolicy';
import PrivateChat from './components/Chat/PrivateChat';
import ConversationsList from './components/Chat/ConversationsList';
import LandingPage from './components/Landing/LandingPage';

const AppContent = () => {
    const { isAuthenticated } = useAuth();

    return (
        <>
            {/* Show navbar only for authenticated users or on auth/privacy pages */}
            <Route path={['/login', '/register', '/privacy-policy', '/hangouts', '/create-hangout', '/profile', '/friends', '/messages', '/chat']} component={Navbar} />

            <Switch>
                <Route path="/login" component={Login} />
                <Route path="/register" component={Register} />
                <Route path="/privacy-policy" component={PrivacyPolicy} />

                {/* Protected routes - show only when authenticated */}
                <Route path="/hangouts" exact component={HangoutList} />
                <Route path="/hangouts/:id" component={HangoutDetails} />
                <Route path="/create-hangout" component={CreateHangout} />
                <Route path="/profile" exact component={UserProfile} />
                <Route path="/profile/:userId" component={PublicProfile} />
                <Route path="/friends" component={FriendsPage} />
                <Route path="/messages" exact component={ConversationsList} />
                <Route path="/chat/:userId" component={PrivateChat} />
                <Route path="/chat" component={GroupChat} />

                {/* Default route - landing page for unauthenticated, hangouts for authenticated */}
                <Route path="/" exact>
                    {isAuthenticated ? <HangoutList /> : <LandingPage />}
                </Route>
            </Switch>
        </>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
};

export default App;
