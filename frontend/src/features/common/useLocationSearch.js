import { startTransition, useState, useRef, useCallback} from 'react';
import { getCoordsFromPosition, getCurrentPosition, normalizeZip } from './utils/locationUtils';

export const useLocationSearch = (onLocationFound) => {
    const inputRef = useRef(null);
    const debounceRef = useRef(null);
    const [committedZip, setCommittedZip] = useState("");
    const [zipError, setZipError] = useState("");
    const [geoLoading, setGeoLoading] = useState(false);

    const handleZipChange = (val) => {
        const cleanZip = normalizeZip(val);
        if (inputRef.current) inputRef.current.value = cleanZip;

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (cleanZip.length === 0) {
            debounceRef.current = setTimeout(() => setCommittedZip(""), 0);
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
            onLocationFound(getCoordsFromPosition(position));
        } catch (error) {
            alert(error.message === "Geolocation not supported." ? error.message : "Location access denied.");
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
