// Main app component

import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

import Home from './pages/public/Home.jsx';
import Login from './pages/public/Login.jsx';
import Register from './pages/public/Register.jsx';
import Profile from './pages/authed/Profile.jsx';
import BookingNew from './pages/authed/BookingNew.jsx'
import MyBookings from './pages/authed/MyBookings.jsx';
import BookingDetail from './pages/authed/BookingDetail.jsx'
import AdminBookings from './pages/admin/AdminBookings.jsx';
import AdminBookingDetail from './pages/admin/AdminBookingDetail.jsx'

export default function App() {
    const { status, user, isAuthenticated, logout } = useAuth();

    return (
        <div>
            <nav>
                <ul>
                    <li>Status: {status}</li>
                </ul>
                <ul>
                    <li>User: {user?.email ?? "none"}</li>
                </ul>
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    {
                        isAuthenticated ? (
                            <>
                                <li>
                                    <Link to="/profile">Profile</Link>
                                </li>
                                <li>
                                    <Link to="/bookings/me">My Bookings</Link>
                                </li>
                                <li>
                                    <button onClick={logout}>Log Out</button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li>
                                    <Link to="/login">Login</Link>
                                </li>
                                <li>
                                    <Link to="/register">Register</Link>
                                </li>
                            </>
                        )
                    }
                </ul>
            </nav>
            <hr />
            {/* Routes define the mapping of URLs to components */}
            <Routes>
                <Route path='/' element={<Home />}/>
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />              
                <Route path='/profile' element={<Profile />} />
                <Route path='/bookings/new' element={<BookingNew />} />
                <Route path='/bookings/me' element={<MyBookings />} />
                <Route path='/bookings/:id' element={<BookingDetail />} />
                <Route path='/admin/bookings' element={<AdminBookings />} />
                <Route path='/admin/bookings/:id' element={<AdminBookingDetail />} />
            </Routes>
        </div>
    )
}