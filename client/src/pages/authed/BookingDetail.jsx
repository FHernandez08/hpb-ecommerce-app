import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

export default function BookingDetail() {
    const [booking, setBooking] = useState(null);
    const [pageStatus, setPageStatus] = useState("loading");
    const [error, setError] = useState('');
    const [payStatus, setPayStatus] = useState("idle");
    const [payError, setPayError] = useState("");

    const { id } = useParams();
    const canPay = booking?.status === "requested";

    async function fetchBookingDetail() {
        try {
            const response = await axios.get(`/api/bookings/${id}`, { withCredentials: true });

            if (response.status === 200) {
                setBooking(response.data.booking ?? response.data);
                setPageStatus("ready");
            }
        }
        catch (error) {
            if (error.response?.status === 404) {
                setPageStatus("not_found")
            }
            else {
                setPageStatus("error")
                setError(error.response?.data?.message || error.message || "Something went wrong")
            }
        }
    }

    async function PayPalHandler() {
        try {
            setPayError("");
            setPayStatus("loading");

            if (!booking?.id) {
                setPayError("Booking id missing")
                setPayStatus("error")
                return;
            }

            const response = await axios.post('/api/payments/paypal/create-order', { bookingId: booking.id }, {
                withCredentials: true
            })

            const approvalUrl = response.data?.approvalUrl;

            if (!approvalUrl) {
                setPayError("PayPal approval URL missing.")
                setPayStatus("error")
                return;
            }
            else {
                setPayStatus("redirecting");
                window.location.href = approvalUrl;
            }
        }
        catch (error) {
            setPayError(error.response?.data?.message || error.response?.data || error.message)
            setPayStatus("error")
        }
    }

    useEffect(() => {
        fetchBookingDetail()
    }, [id])

    // loading state
    if (pageStatus === "loading") {
        return (
            <div className="page">
                <p>Loading booking...</p>
            </div>
        );
    }

    // error state
    if (pageStatus === "error") {
        return (
            <div className="page">
                <p>Error: {error}</p>
                <button onClick={fetchBookingDetail}>Retry</button>
            </div>
        );
    }

    // not found state
    if (pageStatus === "not_found") {
        return (
            <div className="page">
                <h2>Booking not found</h2>
                <p>This booking may not exist, or you may not have access to it.</p>
                <Link to="/bookings/me">Back to my bookings</Link>
            </div>
        )
    }


    // ready state
    if (pageStatus === "ready") {
        return (
            <div className="page">
                <h2>Booking Detail</h2>

                <div className="card">
                    <p><strong>ID:</strong>{booking?.id ?? "N/A"}</p>
                    <p><strong>Status:</strong> {booking?.status ?? "N/A"}</p>
                    <p><strong>Start:</strong>{booking?.event_start_at ?? "N/A"}</p>
                    <p><strong>Duration:</strong> {booking?.duration_minutes ?? "N/A"}</p>

                    <p><strong>Total:</strong>{booking?.total ?? booking?.pricing?.total ?? "N/A"}</p>
                </div>

                <div className="card">
                    <h3>Payments</h3>

                    {!canPay ? (
                        <p>
                        Payment is only available when the booking status is <strong>requested</strong>.
                        </p>
                    ) : (
                        <>
                            <p>This booking is payable. Click below to continue to PayPal.</p>

                            <button
                                type="button"
                                onClick={PayPalHandler}
                                disabled={payStatus === "loading"}
                            >
                                {payStatus === "loading" ? "Redirecting to PayPal..." : "Pay with PayPal"}
                            </button>

                            {payStatus === "error" && payError ? (
                                <p style={{ marginTop: "10px" }}>
                                <strong>Payment error:</strong> {payError}
                                </p>
                            ) : null}
                        </>
                    )}
                </div>

                <div style={ { marginTop: "12px" } }>
                    <Link to="/bookings/me">Back to My Bookings</Link>
                </div>
            </div>
        )
    }
}