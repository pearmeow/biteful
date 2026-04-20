import { useState, useRef, useCallback} from 'react';

const ZIP_CODE_PATTERN = /^\d{5}$/;

export const extractZipCode = (address = '') => {
    const match = address.trim().match(/\d{5}$/);
    return match ? match[0] : '';
};

export const useLocationSearch = (onLocationFound) => {
    const inputRef = useRef(null);
    const debounceRef = useRef(null);
    const [committedZip, setCommittedZip] = useState("");
    const [zipError, setZipError] = useState("");
    const [geoLoading, setGeoLoading] = useState(false);

    const handleZipChange = (val) => {
        const cleanZip = val.replace(/\D/g, '').slice(0, 5);
        if (inputRef.current) inputRef.current.value = cleanZip;

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (cleanZip.length === 5) {
            setCommittedZip(cleanZip);
        } else if (cleanZip.length === 0) {
            debounceRef.current = setTimeout(() => setCommittedZip(""), 0);
        }
        
        if (zipError) setZipError("");
    };

    const handleMyLocation = () => {
        if (!navigator.geolocation) return alert("Geolocation not supported.");
        
        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setGeoLoading(false);
                onLocationFound({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            },
            () => {
                setGeoLoading(false);
                alert("Location access denied.");
            }
        );
    };

    const resetZip = useCallback(() => {
        if (inputRef.current) {
            inputRef.current.value = "";
        }
        setCommittedZip("");
        setZipError(""); 
    }, []);

    return { 
        inputRef, committedZip, zipError, setZipError, geoLoading, handleZipChange, handleMyLocation, resetZip 
    };
};