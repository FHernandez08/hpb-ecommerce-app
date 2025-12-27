// booking duration logic
// inputs = event_start_at, duration_minutes

function validMinutes(minutes) {
    const mins = Number(minutes);

    if (Number.isFinite(mins) && Number.isInteger(mins)) {
        return mins;
    }
}

function bookingDurationLogic(event_start_at, duration_minutes) {
    const validatedMinutes = validMinutes(duration_minutes);
    const parsedStartTime = Date.parse(event_start_at);
    
    if (Number.isNaN(parsedStartTime)) {
        throw new Error("Invalid event_start_at")
    }
    else {
        const start = new Date(parsedStartTime);

        if (start.getTime() <= Date.now()) {
            throw new Error("event_start_at must be in the future");
        }
        else {
            if (!Number.isInteger(validatedMinutes)) {
                throw new Error("duration_minutes must be an integer!")
            }
            else {
                const end = new Date(start.getTime() + validatedMinutes * 60 * 1000);

                if (validatedMinutes >= 60 && validatedMinutes <= 600 && validatedMinutes % 60 === 0) {

                    // confirms standard booking
                    if (validatedMinutes <= 240) {
                        const standardBookingObject = {
                            duration_minutes: validatedMinutes,
                            is_custom_duration: false,
                            is_standard_duration: true,
                            package_minutes: validatedMinutes,
                            ends_at: end.toISOString()
                        };

                        return standardBookingObject;
                    }

                    // confirms custom booking - duration_minutes > 240
                    else {
                        const customBookingObject = {
                            duration_minutes: validatedMinutes,
                            is_custom_duration: true,
                            is_standard_duration: false,
                            package_minutes: null,
                            ends_at: end.toISOString()
                        };

                        return customBookingObject;
                    }
                }
                else {
                    throw new Error("duration_minutes must be 60-600 in 60-minute increments");
                }
            }
        }
    }
};

export default bookingDurationLogic;