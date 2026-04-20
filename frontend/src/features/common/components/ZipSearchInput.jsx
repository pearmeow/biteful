import React from 'react';

const ZipSearchInput = ({ 
    inputRef, 
    onChange, 
    onSearch, 
    onGeoClick, 
    loading, 
    error 
}) => (
    <div className="pantry-location-container">
        <div className="pantry-input-wrapper">
            <div className="pantry-search-button-sq" onClick={onSearch}>🔍</div>
            <input 
                ref={inputRef}
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="Enter 5-digit ZIP code"
                className="pantry-zip-input"
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            />
            <div className={`pantry-geo-button-sq ${loading ? 'is-loading' : ''}`} onClick={onGeoClick}>
                {loading ? <span className="pantry-spinner"></span> : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="geo-icon-svg">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M12 2v3m0 14v3m10-10h-3M5 12H2"></path>
                        <circle cx="12" cy="12" r="7"></circle>
                    </svg>
                )}
            </div>
        </div>
        {error && <p className="pantry-zip-error">{error}</p>}
    </div>
);

export default React.memo(ZipSearchInput);