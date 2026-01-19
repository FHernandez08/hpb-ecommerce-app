import { useEffect, useState } from "react";
import axios from "axios"
import { Link, useNavigate } from "react-router-dom";

export default function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [pageStatus, setPageStatus] = useState('loading');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    async function fetchBookings() {
        try {
            setPageStatus("loading");
            let list;

            const response = await axios.get('/api/bookings/me', {
                withCredentials: true,
            });

            const data = response.data;

            if (Array.isArray(data)) {
                list = data
            }
            else {
                list = data.bookings || []
            }
            
            setBookings(list)
            setPageStatus("ready")
        }
        catch (error) {
            setError(error.message)
            setPageStatus("error")
        }
    }

    useEffect(() => {
        fetchBookings()
    }, [])

    // early returns //
    // loading state
    if (pageStatus === "loading") {
        return (
            <div className="page">
                <p>Loading bookings...</p>
            </div>
        );
    }

    // error state
    if (pageStatus === "error") {
        return (
            <div className="page">
                <p>Error: {error}</p>
                <button onClick={fetchBookings}>Retry</button>
            </div>
        );
    }

    // empty state
    if (pageStatus === "ready" && bookings.length === 0) {
        return (
            <div className="page">
                <p>No bookings yet.</p>
                <Link to="/bookings/new">Create a booking</Link>
            </div>
        );
    }

    // success state (list)
    return (
        <div className="page">
            <h2>My Bookings</h2>

            <div style={{ marginTop: "12px" }}>
                <Link to="/bookings/new">
                    <button type="button">Create a booking</button>
                </Link>
            </div>


            <ul>
                {
                    bookings.map((booking) => (
                        <li
                            key={booking.id}
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate(`/bookings/${booking.id}`)}
                        >
                            <strong>ID:</strong> {booking.id} <br />
                            <strong>Status:</strong> {booking.status} <br />
                            <strong>Start:</strong> {booking.event_start_at}
                        </li>
                    ))
                }
            </ul>
        </div>
    )
}