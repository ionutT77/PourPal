import React, { useState, useEffect, useRef } from 'react';
import { LOCATIONIQ_API_KEY, LOCATIONIQ_BASE_URL } from '../../config/locationiq';
import './LocationAutocomplete.css';

const LocationAutocomplete = ({ value, onChange, onLocationSelect }) => {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const debounceTimer = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch suggestions from LocationIQ API
    const fetchSuggestions = async (searchQuery) => {
        if (!searchQuery || searchQuery.length < 3) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }

        setLoading(true);
        try {
            const url = `${LOCATIONIQ_BASE_URL}/autocomplete.php?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(searchQuery)}&limit=5&format=json`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch suggestions');
            }

            const data = await response.json();
            setSuggestions(data);
            setShowDropdown(data.length > 0);
        } catch (error) {
            console.error('Error fetching location suggestions:', error);
            setSuggestions([]);
            setShowDropdown(false);
        } finally {
            setLoading(false);
        }
    };

    // Handle input change with debouncing
    const handleInputChange = (e) => {
        const newQuery = e.target.value;
        setQuery(newQuery);
        onChange(newQuery);

        // Clear previous timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Set new timer for API call (300ms delay)
        debounceTimer.current = setTimeout(() => {
            fetchSuggestions(newQuery);
        }, 300);
    };

    // Handle suggestion selection
    const handleSelectSuggestion = (suggestion) => {
        const locationName = suggestion.display_name;
        setQuery(locationName);
        onChange(locationName);
        setShowDropdown(false);
        setSuggestions([]);

        // Pass location data to parent component
        if (onLocationSelect) {
            onLocationSelect({
                venue_location: locationName,
                latitude: parseFloat(suggestion.lat),
                longitude: parseFloat(suggestion.lon)
            });
        }
    };

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (!showDropdown || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSelectSuggestion(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowDropdown(false);
                setSelectedIndex(-1);
                break;
            default:
                break;
        }
    };

    return (
        <div className="location-autocomplete" ref={dropdownRef}>
            <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="e.g., Starbucks Downtown, Central Park, My Place"
                className="location-input"
                required
            />

            {loading && (
                <div className="location-loading">
                    <span className="spinner-small"></span>
                    Searching...
                </div>
            )}

            {showDropdown && suggestions.length > 0 && (
                <div className="location-dropdown">
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={suggestion.place_id}
                            className={`location-suggestion ${index === selectedIndex ? 'selected' : ''}`}
                            onClick={() => handleSelectSuggestion(suggestion)}
                            onMouseEnter={() => setSelectedIndex(index)}
                        >
                            <div className="suggestion-icon">📍</div>
                            <div className="suggestion-details">
                                <div className="suggestion-name">
                                    {suggestion.address?.name || suggestion.display_name.split(',')[0]}
                                </div>
                                <div className="suggestion-address">
                                    {suggestion.display_name}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LocationAutocomplete;
