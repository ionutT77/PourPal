import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import HangoutList from './components/Hangouts/HangoutList';
import HangoutDetails from './components/Hangouts/HangoutDetails';
import CreateHangout from './components/Hangouts/CreateHangout';
import UserProfile from './components/Profile/UserProfile';
import GroupChat from './components/Chat/GroupChat';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <Switch>
                    <Route path="/login" component={Login} />
                    <Route path="/register" component={Register} />
                    <Route path="/hangouts" exact component={HangoutList} />
                    <Route path="/hangouts/:id" component={HangoutDetails} />
                    <Route path="/create-hangout" component={CreateHangout} />
                    <Route path="/profile" component={UserProfile} />
                    <Route path="/chat" component={GroupChat} />
                    <Route path="/" exact component={HangoutList} />
                </Switch>
            </Router>
        </AuthProvider>
    );
};

export default App;