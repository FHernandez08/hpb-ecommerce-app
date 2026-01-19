import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";

export default function BookingNew() {
    const navigate = useNavigate();

    // form fields
    const [productId, setProductId] = useState("");
    const [eventStartAt, setEventStartAt] = useState("");
    const [durationMinutes, setDurationMinutes] = useState(120);
    const [notes, setNotes] = useState("");
    const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [zip, setZip] = useState("");

    // page state
    const [pageStatus, setPageStatus] = useState("ready");
    const [error, setError] = useState("");

    const productOptions = [
        { id: "", label: "Select a package..." },
        { id: "6f8a0c0b-3d64-4d9a-8a2b-8f8c4b2a1a11", label: "Classic Booth" },
        { id: "a12b9e42-0f93-4b63-9c7f-1f5b88e71a32", label: "360 Booth" },
        { id: "d91b3c8f-8a44-4f02-8c2e-4c2bb8a19e77", label: "Green Screen Booth" }
    ]

    function toIsoFromDatetimeLocal(value) {
        if (!value) return "";
        const d = new Date(value);
        return d.toISOString();
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setPageStatus("submitting");

        try {
            const payload = {
                product_id: Number(productId),
                event_start_at: toIsoFromDatetimeLocal(eventStartAt),
                duration_minutes: Number(durationMinutes),
                notes: notes.trim() || null,
                timezone,
                city: city.trim() || null,
                state: state.trim() || null,
                zip: zip.trim() || null,
            };

            const response = await api.post("/bookings", payload, {
                withCredentials: true,
            });

            const newId = response.data?.booking?.id;
            if (!newId) {
                setError("Booking created, but no booking id was returned.");
                setPageStatus("error");
                return;
            }

            navigate(`/bookings/${newId}`);
        }
        catch (err) {
            setError(err.response?.data?.message || err.response?.data || err.message || "Failed to create booking");
            setPageStatus("error");
            setPageStatus("ready");
        }
    }

    return (
        <div className="page">
            <h2>Create Booking</h2>

            {error ? (
                <div className="card">
                    <p><strong>Error:</strong> {String(error)}</p>
                </div>
            ) : null}

            <form className="card" onSubmit={handleSubmit}>
                <div>
                    <label>Package</label>
                    <select value={productId} onChange={(e) => setProductId(e.target.value)} required>
                        {productOptions.map((p) => (
                            <option key={p.id || "empty"} value={p.id}>
                                {p.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ marginTop: "12px" }}>
                    <label>Event start</label>
                    <input 
                        type="datetime-local"
                        value={eventStartAt}
                        onChange={(e) => setEventStartAt(e.target.value)}
                        required
                    />
                </div>

                <div style={{ marginTop: "12px" }}>
                    <label>Duration (minutes)</label>
                    <input 
                        type="number"
                        min="60"
                        step="30"
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(e.target.value)}
                        required
                    />
                </div>

                <div style={{ marginTop: "12px" }}>
                    <label>Timezone</label>
                    <input value={timezone} onChange={(e) => setTimezone(e.target.value)} required />
                </div>

                <div style={{ marginTop: "12px" }}>
                    <label>City</label>
                    <input value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>

                <div style={{ marginTop: "12px" }}>
                    <label>State</label>
                    <input value={state} onChange={(e) => setState(e.target.value)} required />
                </div>

                <div style={{ marginTop: "12px" }}>
                    <label>ZIP</label>
                    <input value={zip} onChange={(e) => setZip(e.target.value)} required />
                </div>

                <div style={{ marginTop: "12px" }}>
                    <label>Notes (optional)</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
                </div>

                <div style={{ marginTop: "12px" }}>
                    <button type="submit" disabled={pageStatus === "submitting"}>
                        {pageStatus === "submitting" ? "Creating..." : "Create Booking"}
                    </button>
                    <span style={{ marginLeft: "12px" }}>
                        <Link to="/bookings/me">Cancel</Link>
                    </span>
                </div>

            </form>
        </div>
    );
}