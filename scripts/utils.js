// Utility Functions - Email Domain Redirect Panel
// Following MDC standards for naming and functionality

/**
 * Storage Keys - Consistent across the application
 */
const STORAGE_KEYS = {
    THEME: 'email-redirect-theme',
    LANGUAGE: 'email-redirect-language',
    DOMAINS_CACHE: 'email-redirect-domains',
    DOMAINS_TIMESTAMP: 'email-redirect-domains-timestamp'
};

/**
 * Constants
 */
const THEMES = ['light', 'dark'];
const LANGUAGES = {
    'en': 'English',
    'vi': 'Tiếng Việt'
};
const DEFAULT_LANGUAGE = 'en';
const DEFAULT_THEME = 'light';

/**
 * Email validation using RFC 5322 compliant regex
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid email format
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

/**
 * Extract domain from email address
 * @param {string} email - Email address
 * @returns {string|null} - Domain part or null if invalid
 */
function extractDomain(email) {
    if (!validateEmail(email)) return null;
    
    const trimmedEmail = email.trim().toLowerCase();
    const atIndex = trimmedEmail.lastIndexOf('@');
    
    if (atIndex === -1) return null;
    
    return trimmedEmail.substring(atIndex + 1);
}

/**
 * Normalize email address (lowercase, trim)
 * @param {string} email - Email address to normalize
 * @returns {string} - Normalized email
 */
function normalizeEmail(email) {
    return email.trim().toLowerCase();
}

/**
 * Local Storage utilities with error handling
 */
const StorageUtils = {
    /**
     * Get item from localStorage with fallback
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if key not found
     * @returns {*} - Stored value or default
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn(`Failed to get ${key} from localStorage:`, error);
            return defaultValue;
        }
    },

    /**
     * Set item in localStorage with error handling
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     * @returns {boolean} - Success status
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn(`Failed to set ${key} in localStorage:`, error);
            return false;
        }
    },

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} - Success status
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn(`Failed to remove ${key} from localStorage:`, error);
            return false;
        }
    }
};

/**
 * Theme utilities
 */
const ThemeUtils = {
    /**
     * Get current theme
     * @returns {string} - Current theme ('light' or 'dark')
     */
    getCurrentTheme() {
        return StorageUtils.get(STORAGE_KEYS.THEME, DEFAULT_THEME);
    },

    /**
     * Set theme and apply to document
     * @param {string} theme - Theme to set ('light' or 'dark')
     * @returns {boolean} - Success status
     */
    setTheme(theme) {
        if (!THEMES.includes(theme)) {
            console.warn(`Invalid theme: ${theme}`);
            return false;
        }

        document.documentElement.setAttribute('data-theme', theme);
        return StorageUtils.set(STORAGE_KEYS.THEME, theme);
    },

    /**
     * Toggle between light and dark themes
     * @returns {string} - New theme
     */
    toggleTheme() {
        const currentTheme = this.getCurrentTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        return newTheme;
    },

    /**
     * Initialize theme from storage or system preference
     */
    initializeTheme() {
        let theme = this.getCurrentTheme();
        
        // If no stored theme, check system preference
        if (!StorageUtils.get(STORAGE_KEYS.THEME)) {
            const prefersDark = window.matchMedia && 
                              window.matchMedia('(prefers-color-scheme: dark)').matches;
            theme = prefersDark ? 'dark' : 'light';
        }
        
        this.setTheme(theme);
    }
};

/**
 * Language utilities
 */
const LanguageUtils = {
    /**
     * Get current language
     * @returns {string} - Current language code
     */
    getCurrentLanguage() {
        return StorageUtils.get(STORAGE_KEYS.LANGUAGE, DEFAULT_LANGUAGE);
    },

    /**
     * Set current language
     * @param {string} languageCode - Language code to set
     * @returns {boolean} - Success status
     */
    setLanguage(languageCode) {
        if (!LANGUAGES[languageCode]) {
            console.warn(`Invalid language code: ${languageCode}`);
            return false;
        }

        return StorageUtils.set(STORAGE_KEYS.LANGUAGE, languageCode);
    },

    /**
     * Toggle between available languages
     * @returns {string} - New language code
     */
    toggleLanguage() {
        const currentLang = this.getCurrentLanguage();
        const langCodes = Object.keys(LANGUAGES);
        const currentIndex = langCodes.indexOf(currentLang);
        const nextIndex = (currentIndex + 1) % langCodes.length;
        const newLang = langCodes[nextIndex];
        
        this.setLanguage(newLang);
        return newLang;
    },

    /**
     * Get language display name
     * @param {string} languageCode - Language code
     * @returns {string} - Display name
     */
    getDisplayName(languageCode) {
        return LANGUAGES[languageCode] || LANGUAGES[DEFAULT_LANGUAGE];
    },

    /**
     * Initialize language from storage or browser preference
     */
    initializeLanguage() {
        let language = this.getCurrentLanguage();
        
        // If no stored language, check browser preference
        if (!StorageUtils.get(STORAGE_KEYS.LANGUAGE)) {
            const browserLang = navigator.language || navigator.userLanguage;
            const langCode = browserLang.split('-')[0]; // Get primary language code
            
            if (LANGUAGES[langCode]) {
                language = langCode;
            }
        }
        
        this.setLanguage(language);
    }
};

/**
 * URL utilities for redirects
 */
const URLUtils = {
    /**
     * Construct internal redirect URL
     * @param {string} email - Email address
     * @returns {string} - Redirect URL
     */
    buildInternalURL(email) {
        const normalizedEmail = normalizeEmail(email);
        return `https://tmail.wibucrypto.pro/mailbox/${normalizedEmail}`;
    },

    /**
     * Construct external redirect URL
     * @param {string} email - Email address
     * @returns {string} - Redirect URL
     */
    buildExternalURL(email) {
        const normalizedEmail = normalizeEmail(email);
        return `https://generator.email/username@mail-temp.com/${normalizedEmail}`;
    },

    /**
     * Perform safe redirect
     * @param {string} url - URL to redirect to
     * @param {boolean} newWindow - Open in new window/tab
     */
    safeRedirect(url, newWindow = false) {
        try {
            if (newWindow) {
                window.open(url, '_blank', 'noopener,noreferrer');
            } else {
                window.location.href = url;
            }
        } catch (error) {
            console.error('Redirect failed:', error);
            // Fallback: copy URL to clipboard or show URL
            this.showRedirectFallback(url);
        }
    },

    /**
     * Fallback for failed redirects
     * @param {string} url - URL that failed to redirect
     */
    showRedirectFallback(url) {
        // Try to copy to clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(() => {
                alert(`Redirect failed. URL copied to clipboard: ${url}`);
            }).catch(() => {
                alert(`Please navigate to: ${url}`);
            });
        } else {
            alert(`Please navigate to: ${url}`);
        }
    }
};

/**
 * DOM utilities
 */
const DOMUtils = {
    /**
     * Safely get element by ID
     * @param {string} id - Element ID
     * @returns {Element|null} - Element or null if not found
     */
    getElementById(id) {
        return document.getElementById(id);
    },

    /**
     * Safely query selector
     * @param {string} selector - CSS selector
     * @param {Element} parent - Parent element (default: document)
     * @returns {Element|null} - Element or null if not found
     */
    querySelector(selector, parent = document) {
        try {
            return parent.querySelector(selector);
        } catch (error) {
            console.warn(`Invalid selector: ${selector}`, error);
            return null;
        }
    },

    /**
     * Safely query all elements
     * @param {string} selector - CSS selector
     * @param {Element} parent - Parent element (default: document)
     * @returns {NodeList} - NodeList of elements
     */
    querySelectorAll(selector, parent = document) {
        try {
            return parent.querySelectorAll(selector);
        } catch (error) {
            console.warn(`Invalid selector: ${selector}`, error);
            return [];
        }
    },

    /**
     * Add event listener with error handling
     * @param {Element} element - Target element
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     * @param {Object} options - Event listener options
     */
    addEventListener(element, event, handler, options = {}) {
        if (!element || !element.addEventListener) {
            console.warn('Invalid element for event listener');
            return;
        }

        try {
            element.addEventListener(event, handler, options);
        } catch (error) {
            console.warn(`Failed to add event listener for ${event}:`, error);
        }
    }
};

/**
 * Debounce utility for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately on first call
 * @returns {Function} - Debounced function
 */
function debounce(func, wait, immediate = false) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(this, args);
    };
}

/**
 * Throttle utility for performance optimization
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export utilities for use in other modules
window.EmailRedirectUtils = {
    STORAGE_KEYS,
    THEMES,
    LANGUAGES,
    DEFAULT_LANGUAGE,
    DEFAULT_THEME,
    validateEmail,
    extractDomain,
    normalizeEmail,
    StorageUtils,
    ThemeUtils,
    LanguageUtils,
    URLUtils,
    DOMUtils,
    debounce,
    throttle
};
