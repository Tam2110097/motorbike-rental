import React, { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
    const [bookingData, setBookingData] = useState(() => {
        const saved = localStorage.getItem('bookingData');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Ensure both motorbikes and motorbikeTypes are arrays
            return {
                ...parsed,
                motorbikes: parsed.motorbikes || [],
            };
        }
        return { motorbikes: [] };
    });

    useEffect(() => {
        localStorage.setItem('bookingData', JSON.stringify(bookingData));
    }, [bookingData]);

    return (
        <BookingContext.Provider value={{ bookingData, setBookingData }}>
            {children}
        </BookingContext.Provider>
    );
};

export const useBooking = () => useContext(BookingContext);
