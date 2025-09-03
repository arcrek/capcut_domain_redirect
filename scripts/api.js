// API Management - Email Domain Redirect Panel
// Handles domain list fetching, caching, and error handling

/**
 * API Configuration following MDC standards
 */
const API_CONFIG = {
    baseUrl: 'https://tmail.wibucrypto.pro',
    endpoints: {
        domains: '/api/domains/nvf59twbGhxLNeo48ESZ'
    },
    timeout: 10000, // 10 seconds
    retries: 3,
    retryDelay: 1000 // 1 second base delay
};

/**
 * Cache Configuration
 */
const CACHE_CONFIG = {
    refreshInterval: 5 * 60 * 1000, // 5 minutes
    maxAge: 15 * 60 * 1000, // 15 minutes max age
    fallbackTimeout: 30 * 1000 // 30 seconds fallback timeout
};

/**
 * Error Types
 */
const ERROR_TYPES = {
    NETWORK: 'network',
    API: 'api',
    VALIDATION: 'validation',
    CACHE: 'cache',
    TIMEOUT: 'timeout'
};

/**
 * API Manager Class
 */
class APIManager {
    constructor() {
        this.cache = null;
        this.cacheTimestamp = null;
        this.isLoading = false;
        this.loadPromise = null;
        
        // Initialize cache from storage
        this.loadCacheFromStorage();
    }

    /**
     * Load cached domains from localStorage
     */
    loadCacheFromStorage() {
        try {
            const utils = window.EmailRedirectUtils;
            this.cache = utils.StorageUtils.get(utils.STORAGE_KEYS.DOMAINS_CACHE, []);
            this.cacheTimestamp = utils.StorageUtils.get(utils.STORAGE_KEYS.DOMAINS_TIMESTAMP, 0);
        } catch (error) {
            console.warn('Failed to load cache from storage:', error);
            this.cache = [];
            this.cacheTimestamp = 0;
        }
    }

    /**
     * Save domains to localStorage cache
     * @param {Array} domains - Domain list to cache
     */
    saveCacheToStorage(domains) {
        try {
            const utils = window.EmailRedirectUtils;
            const timestamp = Date.now();
            
            utils.StorageUtils.set(utils.STORAGE_KEYS.DOMAINS_CACHE, domains);
            utils.StorageUtils.set(utils.STORAGE_KEYS.DOMAINS_TIMESTAMP, timestamp);
            
            this.cache = domains;
            this.cacheTimestamp = timestamp;
            
            return true;
        } catch (error) {
            console.warn('Failed to save cache to storage:', error);
            return false;
        }
    }

    /**
     * Check if cache is still valid
     * @returns {boolean} - True if cache is valid
     */
    isCacheValid() {
        if (!this.cache || !this.cacheTimestamp) return false;
        
        const age = Date.now() - this.cacheTimestamp;
        return age < CACHE_CONFIG.maxAge;
    }

    /**
     * Check if cache needs refresh
     * @returns {boolean} - True if cache should be refreshed
     */
    shouldRefreshCache() {
        if (!this.cache || !this.cacheTimestamp) return true;
        
        const age = Date.now() - this.cacheTimestamp;
        return age > CACHE_CONFIG.refreshInterval;
    }

    /**
     * Fetch domains from API with timeout and retry logic
     * @param {number} retryCount - Current retry attempt
     * @returns {Promise<Array>} - Promise resolving to domain list
     */
    async fetchDomainsFromAPI(retryCount = 0) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

        try {
            const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.domains}`;
            
            const response = await fetch(url, {
                method: 'GET',
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            // Validate response structure
            if (!Array.isArray(data)) {
                throw new Error('Invalid API response: expected array');
            }

            return data;

        } catch (error) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                error.type = ERROR_TYPES.TIMEOUT;
                error.message = 'API request timed out';
            } else if (error.message.includes('Failed to fetch')) {
                error.type = ERROR_TYPES.NETWORK;
                error.message = 'Network connection failed';
            } else {
                error.type = ERROR_TYPES.API;
            }

            // Retry logic
            if (retryCount < API_CONFIG.retries) {
                const delay = API_CONFIG.retryDelay * Math.pow(2, retryCount); // Exponential backoff
                console.warn(`API request failed, retrying in ${delay}ms... (attempt ${retryCount + 1}/${API_CONFIG.retries})`);
                
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.fetchDomainsFromAPI(retryCount + 1);
            }

            throw error;
        }
    }

    /**
     * Get domains with caching and fallback logic
     * @param {boolean} forceRefresh - Force refresh from API
     * @returns {Promise<Array>} - Promise resolving to domain list
     */
    async getDomains(forceRefresh = false) {
        // Return existing loading promise if already loading
        if (this.isLoading && this.loadPromise) {
            return this.loadPromise;
        }

        // Use cache if valid and not forcing refresh
        if (!forceRefresh && this.isCacheValid()) {
            return Promise.resolve(this.cache);
        }

        // Set loading state
        this.isLoading = true;

        // Create loading promise
        this.loadPromise = this.performDomainLoad(forceRefresh);

        try {
            const result = await this.loadPromise;
            return result;
        } finally {
            this.isLoading = false;
            this.loadPromise = null;
        }
    }

    /**
     * Perform the actual domain loading with fallback logic
     * @param {boolean} forceRefresh - Force refresh from API
     * @returns {Promise<Array>} - Promise resolving to domain list
     */
    async performDomainLoad(forceRefresh) {
        try {
            // Try to fetch from API
            const domains = await this.fetchDomainsFromAPI();
            
            // Save to cache
            this.saveCacheToStorage(domains);
            
            return domains;

        } catch (error) {
            console.warn('API fetch failed:', error);

            // Use cached data as fallback if available
            if (this.cache && this.cache.length > 0) {
                console.info('Using cached domain list as fallback');
                return this.cache;
            }

            // No cache available, throw error
            error.fallbackUsed = false;
            throw error;
        }
    }

    /**
     * Check if domain exists in the domain list
     * @param {string} domain - Domain to check
     * @returns {Promise<boolean>} - Promise resolving to true if domain exists
     */
    async isDomainListed(domain) {
        try {
            const domains = await this.getDomains();
            const normalizedDomain = domain.toLowerCase().trim();
            
            return domains.some(listDomain => 
                listDomain.toLowerCase().trim() === normalizedDomain
            );
        } catch (error) {
            console.warn('Failed to check domain:', error);
            // Default to false on error (external redirect)
            return false;
        }
    }

    /**
     * Background refresh of domain cache
     * This runs silently and doesn't throw errors
     */
    async backgroundRefresh() {
        if (!this.shouldRefreshCache()) return;

        try {
            await this.getDomains(true);
            console.info('Domain cache refreshed successfully');
        } catch (error) {
            console.warn('Background refresh failed:', error);
            // Silent failure - cache remains unchanged
        }
    }

    /**
     * Clear cache and force refresh
     */
    clearCache() {
        const utils = window.EmailRedirectUtils;
        utils.StorageUtils.remove(utils.STORAGE_KEYS.DOMAINS_CACHE);
        utils.StorageUtils.remove(utils.STORAGE_KEYS.DOMAINS_TIMESTAMP);
        
        this.cache = [];
        this.cacheTimestamp = 0;
    }

    /**
     * Get cache status information
     * @returns {Object} - Cache status details
     */
    getCacheStatus() {
        const age = this.cacheTimestamp ? Date.now() - this.cacheTimestamp : null;
        
        return {
            hasCachedData: !!(this.cache && this.cache.length > 0),
            cacheAge: age,
            isValid: this.isCacheValid(),
            shouldRefresh: this.shouldRefreshCache(),
            domainCount: this.cache ? this.cache.length : 0,
            lastUpdated: this.cacheTimestamp ? new Date(this.cacheTimestamp) : null
        };
    }
}

/**
 * Create and export API manager instance
 */
const apiManager = new APIManager();

// Schedule background refresh every 5 minutes
setInterval(() => {
    apiManager.backgroundRefresh();
}, CACHE_CONFIG.refreshInterval);

// Export API manager for global access
window.EmailRedirectAPI = {
    manager: apiManager,
    ERROR_TYPES,
    API_CONFIG,
    CACHE_CONFIG,
    
    // Convenience methods
    async getDomains(forceRefresh = false) {
        return apiManager.getDomains(forceRefresh);
    },
    
    async isDomainListed(domain) {
        return apiManager.isDomainListed(domain);
    },
    
    getCacheStatus() {
        return apiManager.getCacheStatus();
    },
    
    clearCache() {
        return apiManager.clearCache();
    }
};
