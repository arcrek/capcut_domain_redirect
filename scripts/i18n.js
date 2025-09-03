// Internationalization (i18n) Manager - Email Domain Redirect Panel
// Handles multi-language support for English and Vietnamese

/**
 * Language data structure and management
 */
class I18nManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.fallbackLanguage = 'en';
        this.isLoaded = false;
        this.loadPromises = {};
        
        // Initialize with current language from storage
        this.initialize();
    }

    /**
     * Initialize i18n manager
     */
    async initialize() {
        const utils = window.EmailRedirectUtils;
        if (utils) {
            this.currentLanguage = utils.LanguageUtils.getCurrentLanguage();
        }
        
        // Load initial language
        await this.loadLanguage(this.currentLanguage);
        this.isLoaded = true;
        
        // Apply translations to DOM
        this.applyTranslations();
    }

    /**
     * Load language file
     * @param {string} languageCode - Language code to load
     * @returns {Promise<Object>} - Promise resolving to translations object
     */
    async loadLanguage(languageCode) {
        // Return existing promise if already loading
        if (this.loadPromises[languageCode]) {
            return this.loadPromises[languageCode];
        }

        // Return cached translations if already loaded
        if (this.translations[languageCode]) {
            return Promise.resolve(this.translations[languageCode]);
        }

        // Create loading promise
        this.loadPromises[languageCode] = this.fetchLanguageFile(languageCode);

        try {
            const translations = await this.loadPromises[languageCode];
            this.translations[languageCode] = translations;
            return translations;
        } finally {
            delete this.loadPromises[languageCode];
        }
    }

    /**
     * Fetch language file from server
     * @param {string} languageCode - Language code to fetch
     * @returns {Promise<Object>} - Promise resolving to translations object
     */
    async fetchLanguageFile(languageCode) {
        try {
            const response = await fetch(`languages/${languageCode}.json`);
            
            if (!response.ok) {
                throw new Error(`Failed to load language file: ${response.status}`);
            }

            const translations = await response.json();
            
            // Validate translation structure
            if (!translations || typeof translations !== 'object') {
                throw new Error('Invalid translation file format');
            }

            return translations;

        } catch (error) {
            console.warn(`Failed to load ${languageCode} translations:`, error);
            
            // Use fallback language if available and different
            if (languageCode !== this.fallbackLanguage && this.translations[this.fallbackLanguage]) {
                console.info(`Using ${this.fallbackLanguage} as fallback for ${languageCode}`);
                return this.translations[this.fallbackLanguage];
            }

            // Return empty object as last resort
            return {};
        }
    }

    /**
     * Get translation for a key
     * @param {string} key - Translation key (dot notation supported)
     * @param {Object} params - Parameters for string interpolation
     * @param {string} languageCode - Specific language code (optional)
     * @returns {string} - Translated string
     */
    t(key, params = {}, languageCode = null) {
        const lang = languageCode || this.currentLanguage;
        const translations = this.translations[lang] || {};
        
        // Get nested value using dot notation
        const value = this.getNestedValue(translations, key);
        
        // Fallback to default language if not found
        if (value === undefined && lang !== this.fallbackLanguage) {
            const fallbackTranslations = this.translations[this.fallbackLanguage] || {};
            const fallbackValue = this.getNestedValue(fallbackTranslations, key);
            if (fallbackValue !== undefined) {
                return this.interpolate(fallbackValue, params);
            }
        }

        // Return key if no translation found
        if (value === undefined) {
            console.warn(`Translation missing for key: ${key}`);
            return key;
        }

        return this.interpolate(value, params);
    }

    /**
     * Get nested object value using dot notation
     * @param {Object} obj - Object to search
     * @param {string} key - Dot notation key
     * @returns {*} - Value or undefined
     */
    getNestedValue(obj, key) {
        return key.split('.').reduce((current, prop) => {
            return current && current[prop] !== undefined ? current[prop] : undefined;
        }, obj);
    }

    /**
     * Interpolate parameters in string
     * @param {string} str - String with placeholders
     * @param {Object} params - Parameters to interpolate
     * @returns {string} - Interpolated string
     */
    interpolate(str, params) {
        return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    /**
     * Change current language
     * @param {string} languageCode - New language code
     * @returns {Promise<boolean>} - Promise resolving to success status
     */
    async changeLanguage(languageCode) {
        try {
            // Load new language
            await this.loadLanguage(languageCode);
            
            // Update current language
            this.currentLanguage = languageCode;
            
            // Save to storage
            const utils = window.EmailRedirectUtils;
            if (utils) {
                utils.LanguageUtils.setLanguage(languageCode);
            }
            
            // Apply translations to DOM
            this.applyTranslations();
            
            // Update HTML lang attribute
            document.documentElement.lang = languageCode;
            
            return true;

        } catch (error) {
            console.error('Failed to change language:', error);
            return false;
        }
    }

    /**
     * Apply translations to DOM elements
     */
    applyTranslations() {
        if (!this.isLoaded) return;

        // Apply text content translations
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (translation && translation !== key) {
                element.textContent = translation;
            }
        });

        // Apply placeholder translations
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.t(key);
            
            if (translation && translation !== key) {
                element.placeholder = translation;
            }
        });

        // Apply aria-label translations
        document.querySelectorAll('[data-i18n-aria]').forEach(element => {
            const key = element.getAttribute('data-i18n-aria');
            const translation = this.t(key);
            
            if (translation && translation !== key) {
                element.setAttribute('aria-label', translation);
            }
        });

        // Apply title translations
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const translation = this.t(key);
            
            if (translation && translation !== key) {
                element.title = translation;
            }
        });

        // Update page title if available
        const titleKey = document.documentElement.getAttribute('data-i18n-title');
        if (titleKey) {
            const title = this.t(titleKey);
            if (title && title !== titleKey) {
                document.title = title;
            }
        }

        // Dispatch custom event for translation update
        window.dispatchEvent(new CustomEvent('translationsApplied', {
            detail: { language: this.currentLanguage }
        }));
    }

    /**
     * Get available languages
     * @returns {Array<string>} - Array of language codes
     */
    getAvailableLanguages() {
        const utils = window.EmailRedirectUtils;
        return utils ? Object.keys(utils.LANGUAGES) : ['en', 'vi'];
    }

    /**
     * Get current language info
     * @returns {Object} - Current language information
     */
    getCurrentLanguageInfo() {
        const utils = window.EmailRedirectUtils;
        return {
            code: this.currentLanguage,
            name: utils ? utils.LanguageUtils.getDisplayName(this.currentLanguage) : 'English',
            isLoaded: !!this.translations[this.currentLanguage]
        };
    }

    /**
     * Toggle to next available language
     * @returns {Promise<string>} - Promise resolving to new language code
     */
    async toggleLanguage() {
        const utils = window.EmailRedirectUtils;
        if (!utils) return this.currentLanguage;

        const newLanguage = utils.LanguageUtils.toggleLanguage();
        await this.changeLanguage(newLanguage);
        return newLanguage;
    }

    /**
     * Preload all available languages
     * @returns {Promise<Array>} - Promise resolving to array of loaded language codes
     */
    async preloadLanguages() {
        const languages = this.getAvailableLanguages();
        const loadPromises = languages.map(lang => this.loadLanguage(lang));
        
        try {
            await Promise.all(loadPromises);
            return languages;
        } catch (error) {
            console.warn('Failed to preload some languages:', error);
            return languages.filter(lang => this.translations[lang]);
        }
    }

    /**
     * Format number according to current locale
     * @param {number} number - Number to format
     * @param {Object} options - Intl.NumberFormat options
     * @returns {string} - Formatted number
     */
    formatNumber(number, options = {}) {
        try {
            return new Intl.NumberFormat(this.currentLanguage, options).format(number);
        } catch (error) {
            return number.toString();
        }
    }

    /**
     * Format date according to current locale
     * @param {Date|string|number} date - Date to format
     * @param {Object} options - Intl.DateTimeFormat options
     * @returns {string} - Formatted date
     */
    formatDate(date, options = {}) {
        try {
            const dateObj = date instanceof Date ? date : new Date(date);
            return new Intl.DateTimeFormat(this.currentLanguage, options).format(dateObj);
        } catch (error) {
            return date.toString();
        }
    }

    /**
     * Get text direction for current language
     * @returns {string} - 'ltr' or 'rtl'
     */
    getTextDirection() {
        // All currently supported languages are LTR
        return 'ltr';
    }
}

// Create and initialize i18n manager
const i18nManager = new I18nManager();

// Export for global access
window.EmailRedirectI18n = {
    manager: i18nManager,
    
    // Convenience methods
    t(key, params, languageCode) {
        return i18nManager.t(key, params, languageCode);
    },
    
    async changeLanguage(languageCode) {
        return i18nManager.changeLanguage(languageCode);
    },
    
    async toggleLanguage() {
        return i18nManager.toggleLanguage();
    },
    
    getCurrentLanguage() {
        return i18nManager.currentLanguage;
    },
    
    getCurrentLanguageInfo() {
        return i18nManager.getCurrentLanguageInfo();
    },
    
    getAvailableLanguages() {
        return i18nManager.getAvailableLanguages();
    },
    
    applyTranslations() {
        return i18nManager.applyTranslations();
    },
    
    formatNumber(number, options) {
        return i18nManager.formatNumber(number, options);
    },
    
    formatDate(date, options) {
        return i18nManager.formatDate(date, options);
    }
};
