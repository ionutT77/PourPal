import React, { useState } from 'react';
import './HangoutFilters.css';

const HangoutFilters = ({ onFilterChange, initialFilters }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState(initialFilters || {
        startDate: '',
        endDate: '',
        radius: 50,
        lat: null,
        lon: null,
        useLocation: false
    });
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLocationToggle = () => {
        if (filters.useLocation) {
            // Turn off location
            setFilters(prev => ({
                ...prev,
                useLocation: false,
                lat: null,
                lon: null
            }));
        } else {
            // Turn on location
            setLocationLoading(true);
            setLocationError(null);

            if (!navigator.geolocation) {
                setLocationError("Geolocation is not supported by your browser");
                setLocationLoading(false);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFilters(prev => ({
                        ...prev,
                        useLocation: true,
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    }));
                    setLocationLoading(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setLocationError("Unable to retrieve your location");
                    setLocationLoading(false);
                }
            );
        }
    };

    const handleApply = () => {
        onFilterChange(filters);
    };

    const handleReset = () => {
        const resetFilters = {
            startDate: '',
            endDate: '',
            radius: 50,
            lat: null,
            lon: null,
            useLocation: false
        };
        setFilters(resetFilters);
        onFilterChange(resetFilters);
    };

    return (
        <div className="filters-container">
            <div className="filters-header" onClick={() => setIsOpen(!isOpen)}>
                <h3>🔍 Advanced Filters</h3>
                <span className={`toggle-icon ${isOpen ? 'open' : ''}`}>▼</span>
            </div>

            {isOpen && (
                <div className="filters-content">
                    <div className="filter-row">
                        {/* Date Range Filter */}
                        <div className="filter-group">
                            <label>Date Range</label>
                            <div className="date-inputs">
                                <input
                                    type="date"
                                    name="startDate"
                                    value={filters.startDate}
                                    onChange={handleInputChange}
                                    className="date-input"
                                    placeholder="Start Date"
                                />
                                <input
                                    type="date"
                                    name="endDate"
                                    value={filters.endDate}
                                    onChange={handleInputChange}
                                    className="date-input"
                                    placeholder="End Date"
                                />
                            </div>
                        </div>

                        {/* Location Filter */}
                        <div className="filter-group">
                            <label>Location & Distance</label>
                            <div className="location-controls">
                                <button
                                    className={`location-btn ${filters.useLocation ? 'active' : ''}`}
                                    onClick={handleLocationToggle}
                                    disabled={locationLoading}
                                >
                                    {locationLoading ? 'Getting Location...' : (
                                        <>
                                            <span>📍</span>
                                            {filters.useLocation ? 'Using Current Location' : 'Use Current Location'}
                                        </>
                                    )}
                                </button>

                                {locationError && <span className="error-text">{locationError}</span>}

                                {filters.useLocation && (
                                    <div className="radius-slider-container">
                                        <input
                                            type="range"
                                            name="radius"
                                            min="1"
                                            max="100"
                                            value={filters.radius}
                                            onChange={handleInputChange}
                                            className="radius-slider"
                                        />
                                        <span className="radius-value">Within {filters.radius} km</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="filter-actions">
                        <button className="reset-btn" onClick={handleReset}>Reset All</button>
                        <button className="apply-btn" onClick={handleApply}>Apply Filters</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HangoutFilters;
