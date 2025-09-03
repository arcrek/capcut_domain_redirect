// Main Application Logic - Email Domain Redirect Panel
// Orchestrates all components and handles user interactions

/**
 * Main Application Class
 */
class EmailRedirectApp {
    constructor() {
        this.elements = {};
        this.isInitialized = false;
        this.currentEmail = '';
        this.isProcessing = false;
        
        // Bind methods to preserve context
        this.handleEmailSubmit = this.handleEmailSubmit.bind(this);
        this.handleEmailInput = this.handleEmailInput.bind(this);
        this.handleThemeToggle = this.handleThemeToggle.bind(this);
        this.handleLanguageToggle = this.handleLanguageToggle.bind(this);
        this.handleKeyboard = this.handleKeyboard.bind(this);
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    /**
     * Initialize the application
     */
    async initialize() {
        try {
            // Get DOM elements
            this.getElements();
            
            // Initialize utilities and themes
            this.initializeTheme();
            
            // Wait for i18n to be ready
            await this.waitForI18n();
            
            // Initialize language
            await this.initializeLanguage();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize API (background loading)
            this.initializeAPI();
            
            // Set initial UI state
            this.updateUI();
            
            this.isInitialized = true;
            console.info('Email Redirect App initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize application');
        }
    }

    /**
     * Get DOM elements and cache them
     */
    getElements() {
        const utils = window.EmailRedirectUtils;
        
        this.elements = {
            emailInput: utils.DOMUtils.getElementById('email-input'),
            submitButton: utils.DOMUtils.querySelector('.email-panel__button--primary'),
            languageToggle: utils.DOMUtils.querySelector('.language-toggle'),
            languageText: utils.DOMUtils.querySelector('.language-toggle__text'),
            themeToggle: utils.DOMUtils.querySelector('.theme-toggle'),
            themeText: utils.DOMUtils.querySelector('.theme-toggle__text'),
            themeIcon: utils.DOMUtils.querySelector('.theme-toggle__icon'),
            statusMessage: utils.DOMUtils.getElementById('status-message'),
            loadingSpinner: utils.DOMUtils.getElementById('loading-spinner')
        };

        // Validate critical elements
        const critical = ['emailInput', 'submitButton', 'languageToggle', 'themeToggle'];
        const missing = critical.filter(key => !this.elements[key]);
        
        if (missing.length > 0) {
            throw new Error(`Missing critical elements: ${missing.join(', ')}`);
        }
    }

    /**
     * Initialize theme system
     */
    initializeTheme() {
        const utils = window.EmailRedirectUtils;
        if (utils) {
            utils.ThemeUtils.initializeTheme();
            this.updateThemeUI();
        }
    }

    /**
     * Wait for i18n manager to be ready
     */
    async waitForI18n() {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max
        
        while (!window.EmailRedirectI18n && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.EmailRedirectI18n) {
            throw new Error('i18n manager not available');
        }
        
        // Wait for manager to be loaded
        while (!window.EmailRedirectI18n.manager.isLoaded && attempts < maxAttempts * 2) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
    }

    /**
     * Initialize language system
     */
    async initializeLanguage() {
        const utils = window.EmailRedirectUtils;
        if (utils) {
            utils.LanguageUtils.initializeLanguage();
        }
        
        // Preload languages for faster switching
        if (window.EmailRedirectI18n) {
            await window.EmailRedirectI18n.manager.preloadLanguages();
        }
        
        this.updateLanguageUI();
    }

    /**
     * Initialize API in background
     */
    initializeAPI() {
        if (window.EmailRedirectAPI) {
            // Start background loading of domain list
            window.EmailRedirectAPI.getDomains().catch(error => {
                console.warn('Failed to preload domain list:', error);
            });
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const utils = window.EmailRedirectUtils;
        
        // Email form submission
        utils.DOMUtils.addEventListener(this.elements.submitButton, 'click', this.handleEmailSubmit);
        
        // Email input changes
        const debouncedInput = utils.debounce(this.handleEmailInput, 300);
        utils.DOMUtils.addEventListener(this.elements.emailInput, 'input', debouncedInput);
        utils.DOMUtils.addEventListener(this.elements.emailInput, 'blur', this.handleEmailInput);
        
        // Enter key submission
        utils.DOMUtils.addEventListener(this.elements.emailInput, 'keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleEmailSubmit();
            }
        });
        
        // Theme toggle
        utils.DOMUtils.addEventListener(this.elements.themeToggle, 'click', this.handleThemeToggle);
        
        // Language toggle
        utils.DOMUtils.addEventListener(this.elements.languageToggle, 'click', this.handleLanguageToggle);
        
        // Global keyboard handlers
        utils.DOMUtils.addEventListener(document, 'keydown', this.handleKeyboard);
        
        // Translation update events
        utils.DOMUtils.addEventListener(window, 'translationsApplied', () => {
            this.updateLanguageUI();
        });
        
        // Prevent form submission on enter
        const form = this.elements.emailInput.closest('form');
        if (form) {
            utils.DOMUtils.addEventListener(form, 'submit', (e) => {
                e.preventDefault();
                this.handleEmailSubmit();
            });
        }
    }

    /**
     * Handle email form submission
     */
    async handleEmailSubmit() {
        if (this.isProcessing) return;

        const email = this.elements.emailInput.value.trim();
        
        if (!email) {
            this.showError('Please enter an email address');
            this.elements.emailInput.focus();
            return;
        }

        const utils = window.EmailRedirectUtils;
        if (!utils.validateEmail(email)) {
            this.showError('Please enter a valid email address');
            this.elements.emailInput.focus();
            return;
        }

        this.isProcessing = true;
        this.showLoading('Checking domain...');
        this.updateUI();

        try {
            const domain = utils.extractDomain(email);
            if (!domain) {
                throw new Error('Could not extract domain from email');
            }

            // Check if domain is in the list
            const isListed = await window.EmailRedirectAPI.isDomainListed(domain);
            
            // Construct appropriate redirect URL
            const redirectUrl = isListed 
                ? utils.URLUtils.buildInternalURL(email)
                : utils.URLUtils.buildExternalURL(email);

            // Show success message briefly before redirect
            this.showSuccess(`Redirecting to ${isListed ? 'internal' : 'external'} email service...`);
            
            // Redirect after short delay
            setTimeout(() => {
                utils.URLUtils.safeRedirect(redirectUrl);
            }, 1500);

        } catch (error) {
            console.error('Email submission error:', error);
            this.showError('Failed to process email. Please try again.');
        } finally {
            this.isProcessing = false;
            this.hideLoading();
            this.updateUI();
        }
    }

    /**
     * Handle email input changes
     */
    handleEmailInput() {
        const email = this.elements.emailInput.value.trim();
        this.currentEmail = email;
        
        // Clear previous messages
        this.hideMessage();
        
        // Update UI state
        this.updateUI();
        
        // Validate email format
        if (email && !window.EmailRedirectUtils.validateEmail(email)) {
            this.elements.emailInput.setAttribute('aria-invalid', 'true');
        } else {
            this.elements.emailInput.setAttribute('aria-invalid', 'false');
        }
    }

    /**
     * Handle theme toggle
     */
    handleThemeToggle() {
        const utils = window.EmailRedirectUtils;
        if (utils) {
            const newTheme = utils.ThemeUtils.toggleTheme();
            this.updateThemeUI();
            
            // Announce to screen readers
            const themeName = newTheme === 'dark' ? 'Dark' : 'Light';
            this.announceToScreenReader(`Switched to ${themeName} mode`);
        }
    }

    /**
     * Handle language toggle
     */
    async handleLanguageToggle() {
        try {
            const newLanguage = await window.EmailRedirectI18n.toggleLanguage();
            this.updateLanguageUI();
            
            // Announce to screen readers
            const langInfo = window.EmailRedirectI18n.getCurrentLanguageInfo();
            this.announceToScreenReader(`Language changed to ${langInfo.name}`);
            
        } catch (error) {
            console.error('Language toggle error:', error);
            this.showError('Failed to change language');
        }
    }

    /**
     * Handle global keyboard shortcuts
     */
    handleKeyboard(event) {
        // Escape key - clear input or cancel action
        if (event.key === 'Escape') {
            if (this.isProcessing) {
                // Cancel processing if possible
                this.isProcessing = false;
                this.hideLoading();
                this.hideMessage();
                this.updateUI();
            } else if (this.currentEmail) {
                // Clear input
                this.elements.emailInput.value = '';
                this.handleEmailInput();
                this.elements.emailInput.focus();
            }
        }
        
        // Ctrl/Cmd + L - focus language toggle
        if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
            event.preventDefault();
            this.elements.languageToggle.focus();
        }
        
        // Ctrl/Cmd + T - toggle theme
        if ((event.ctrlKey || event.metaKey) && event.key === 't') {
            event.preventDefault();
            this.handleThemeToggle();
        }
    }

    /**
     * Update UI state based on current conditions
     */
    updateUI() {
        const hasEmail = this.currentEmail.length > 0;
        const isValidEmail = hasEmail && window.EmailRedirectUtils.validateEmail(this.currentEmail);
        const canSubmit = isValidEmail && !this.isProcessing;

        // Update submit button
        this.elements.submitButton.disabled = !canSubmit;
        
        // Update aria-pressed for toggles
        const utils = window.EmailRedirectUtils;
        if (utils) {
            const currentTheme = utils.ThemeUtils.getCurrentTheme();
            this.elements.themeToggle.setAttribute('aria-pressed', currentTheme === 'dark');
        }
    }

    /**
     * Update theme UI elements
     */
    updateThemeUI() {
        const utils = window.EmailRedirectUtils;
        if (!utils) return;

        const currentTheme = utils.ThemeUtils.getCurrentTheme();
        const isDark = currentTheme === 'dark';
        
        // Update icon
        if (this.elements.themeIcon) {
            this.elements.themeIcon.textContent = isDark ? '☀️' : '🌙';
        }
        
        // Update aria-pressed
        this.elements.themeToggle.setAttribute('aria-pressed', isDark);
        
        // Update text if available and i18n is ready
        if (this.elements.themeText && window.EmailRedirectI18n) {
            const key = isDark ? 'ui.lightMode' : 'ui.darkMode';
            const text = window.EmailRedirectI18n.t(key);
            if (text && text !== key) {
                this.elements.themeText.textContent = text;
            }
        }
    }

    /**
     * Update language UI elements
     */
    updateLanguageUI() {
        if (!window.EmailRedirectI18n) return;

        const langInfo = window.EmailRedirectI18n.getCurrentLanguageInfo();
        
        // Update language toggle text
        if (this.elements.languageText) {
            this.elements.languageText.textContent = langInfo.code.toUpperCase();
        }
        
        // Update aria-label
        const label = window.EmailRedirectI18n.t('accessibility.languageToggle');
        if (label) {
            this.elements.languageToggle.setAttribute('aria-label', label);
        }
    }

    /**
     * Show loading state
     */
    showLoading(message = 'Loading...') {
        if (this.elements.loadingSpinner) {
            this.elements.loadingSpinner.classList.add('show');
            this.elements.loadingSpinner.setAttribute('aria-hidden', 'false');
            
            const messageElement = this.elements.loadingSpinner.querySelector('span');
            if (messageElement && window.EmailRedirectI18n) {
                const translatedMessage = window.EmailRedirectI18n.t('messages.loading') || message;
                messageElement.textContent = translatedMessage;
            }
        }
        
        this.hideMessage();
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        if (this.elements.loadingSpinner) {
            this.elements.loadingSpinner.classList.remove('show');
            this.elements.loadingSpinner.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    /**
     * Show error message
     */
    showError(message) {
        this.showMessage(message, 'error');
    }

    /**
     * Show info message
     */
    showInfo(message) {
        this.showMessage(message, 'info');
    }

    /**
     * Show status message
     */
    showMessage(message, type = 'info') {
        if (!this.elements.statusMessage) return;

        this.hideLoading();
        
        // Clear previous classes
        this.elements.statusMessage.className = 'status-message';
        this.elements.statusMessage.classList.add(type);
        
        // Set message
        this.elements.statusMessage.textContent = message;
        
        // Announce to screen readers
        this.announceToScreenReader(message);
        
        // Auto-hide after delay for non-error messages
        if (type !== 'error') {
            setTimeout(() => this.hideMessage(), 5000);
        }
    }

    /**
     * Hide status message
     */
    hideMessage() {
        if (this.elements.statusMessage) {
            this.elements.statusMessage.className = 'status-message';
            this.elements.statusMessage.textContent = '';
        }
    }

    /**
     * Announce message to screen readers
     */
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'visually-hidden';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    /**
     * Get application status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isProcessing: this.isProcessing,
            currentEmail: this.currentEmail,
            theme: window.EmailRedirectUtils?.ThemeUtils.getCurrentTheme(),
            language: window.EmailRedirectI18n?.getCurrentLanguage(),
            apiStatus: window.EmailRedirectAPI?.getCacheStatus()
        };
    }
}

// Initialize application when script loads
const emailRedirectApp = new EmailRedirectApp();

// Export for global access and debugging
window.EmailRedirectApp = emailRedirectApp;
