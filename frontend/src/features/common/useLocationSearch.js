import { startTransition, useState, useRef, useCallback } from 'react';
import { getCoordsFromPosition, getCurrentPosition, normalizeZip } from './utils/locationUtils';

export const useLocationSearch = (onLocationFound) => {
    const inputRef = useRef(null);
    const [committedZip, setCommittedZip] = useState("");
    const [zipError, setZipError] = useState("");
    const [geoLoading, setGeoLoading] = useState(false);

    const handleZipChange = (val) => {
        const cleanZip = normalizeZip(val);
        if (inputRef.current) inputRef.current.value = cleanZip;

        if (cleanZip.length === 0) {
            setCommittedZip("");
        }

        if (zipError) setZipError("");
    };

    const commitZip = useCallback((zip) => {
        const cleanZip = normalizeZip(zip || "");
        startTransition(() => {
            setCommittedZip(cleanZip);
        });
    }, []);

    const handleMyLocation = async () => {
        setGeoLoading(true);
        try {
            const position = await getCurrentPosition();
            const coords = getCoordsFromPosition(position);
            onLocationFound(coords);
            return coords;
        } catch (error) {
            alert(error.message === "Geolocation not supported." ? error.message : "Location access denied.");
            return null;
        } finally {
            setGeoLoading(false);
        }
    };

    const resetZip = useCallback(() => {
        if (inputRef.current) {
            inputRef.current.value = "";
        }
        setCommittedZip("");
        setZipError(""); 
    }, []);

    return { 
        inputRef, committedZip, zipError, setZipError, geoLoading, handleZipChange, handleMyLocation, resetZip, commitZip
    };
};
