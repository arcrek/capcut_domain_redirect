// API Management - Email Domain Redirect Panel
// Handles domain list fetching, caching, and error handling

/**
 * API Configuration following MDC standards
 */
const API_CONFIG = {
    baseUrl: 'https://tmail.wibucrypto.pro',
    endpoints: {
        domains: '/api/domains/' + _$x9p()
    },
    timeout: 10000, // 10 seconds
    retries: 3,
    retryDelay: 1000 // 1 second base delay
};

const _e9x = [
    0x86^0xd4, 0x98^0xa6, 0x80^0xe8, 0x57^0x70, 0x5b^0x42, 
    0x94^0xc0, 0x97^0xc6, 0x82^0xf0, 0x63^0x36, 0x88^0xf0,
    0x98^0xc4, 0x6c^0x40, 0x6e^0x60, 0x81^0xb0, 0x8b^0xd2,
    0x56^0x60, 0x5c^0x34, 0x65^0x44, 0x73^0x26, 0x7a^0x28
];
const _r2k = function(){const _=Date.now();return[_&0x7a1f,(_>>4)&0x9e34,(_>>8)&0x45b8,(_>>12)&0x62c7,(_>>16)&0x8d91,(_>>20)&0x3f58,(_>>2)&0x74a2,(_>>6)&0x5e83,(_>>10)&0x91d4,(_>>14)&0x28b6,(_>>18)&0x67f9,(_>>1)&0x4c15,(_>>5)&0x89a7,(_>>9)&0x35e2,(_>>13)&0x6bd8,(_>>17)&0xa194,(_>>3)&0x7e6c,(_>>7)&0x52f3,(_>>11)&0x98d1,(_>>15)&0x43a8];}();
const _s5t = (()=>{let s='';for(let i=0;i<62;i++){s+=String.fromCharCode((i<26?97+i:i<52?65+i-26:48+i-52));}return s;})();

function _h7j(data, seeds) {
    const _poly = (n, i) => ((n * 0x9e3779b9) >>> (i % 8)) & 0xff;
    let output = '';
    for (let i = 0; i < data.length; i++) {
        const keyIdx = (i * 7 + 13) % seeds.length;
        const polyKey = _poly(seeds[keyIdx], i);
        const decoded = data[i] ^ polyKey ^ (i % 2 ? 0x3a : 0x4f) ^ 0x5c;
        output += String.fromCharCode(decoded);
    }
    return output;
}

function _q8n(str) {
    let result = '';
    const rotMatrix = [7, 3, 11, 5, 13, 2, 9, 15, 1, 6, 14, 4, 10, 8, 12, 0];
    for (let i = 0; i < str.length; i++) {
        let char = str.charCodeAt(i);
        const rotIdx = i % rotMatrix.length;
        const rotation = rotMatrix[rotIdx];
        char = ((char << rotation) | (char >>> (8 - rotation))) & 0xff;
        char = char ^ (i % 3 === 0 ? 0x2b : i % 3 === 1 ? 0x1d : 0x39);
        result += String.fromCharCode(char);
    }
    return result;
}

function _l4m(data) {
    const substitution = {};
    for (let i = 0; i < _s5t.length; i++) {
        const srcIdx = (i * 17 + 23) % _s5t.length;
        substitution[String.fromCharCode((i + 65) % 95 + 32)] = _s5t[srcIdx];
    }
    let result = '';
    for (let char of data) {
        result += substitution[char] || char;
    }
    return result;
}

function _$x9p() {
    const _ad = (function(){let start=performance.now();for(let i=0;i<1000;i++){}return performance.now()-start>5;})();
    if(_ad||typeof window.chrome==='undefined'&&typeof navigator.userAgent!=='undefined'&&/HeadlessChrome/.test(navigator.userAgent))return'debug_block_'+Math.random().toString(36);
    const _env = (screen.width*screen.height)^(navigator.hardwareConcurrency||4)^(Date.now()%0xffff)^(Math.random()*0x7fff|0);
    const _gen = new Function('e','k','return String.fromCharCode(e^k^'+(_env&0xff)+'^((k>>'+(_env%8)+')&0x3f))');
    try {
        const _stages = [
            (d,s)=>d.map((v,i)=>_gen(v,s[(i*11+7)%s.length])).join(''),
            (s)=>s.split('').map((c,i)=>String.fromCharCode(c.charCodeAt(0)^(i%2?0x2c:0x1a)^(_env>>8&0xff))).join(''),
            (s)=>{const m={};_s5t.split('').forEach((c,i)=>{m[String.fromCharCode((i*23+41)%95+32)]=c;});return s.split('').map(c=>m[c]||c).join('');},
            (s)=>s.split('').map((c,i)=>{const code=c.charCodeAt(0);return String.fromCharCode(((code*7+19)^(i%3?0xd:0xa)^(_env&0x1f))%95+32);}).join(''),
            (s)=>{const lookup=['nvf59twbGh','xLNeo48ESZ'];return lookup[0]+lookup[1];}
        ];
        let result = _stages[0](_e9x, _r2k);
        for(let i = 1; i < _stages.length - 1; i++) {
            result = _stages[i](result);
        }
        return _stages[_stages.length-1]();
    } catch (error) {
        const _qr = btoa(String.fromCharCode(...Array.from({length:20},(v,i)=>(i*13+47)%95+32))).replace(/[=+/]/g,'');
        const _cs = _qr.split('').reduce((a,c)=>a^c.charCodeAt(0),0x5a);
        return _qr.slice(0,16) + _cs.toString(36).slice(-4);
    }
}

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
