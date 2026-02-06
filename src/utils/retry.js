const logger = require('../utils/logger');

/**
 * Retry utility for handling transient failures
 */
class RetryHelper {
    /**
     * Retry a function with exponential backoff
     * @param {Function} fn - Function to retry
     * @param {Object} options - Retry options
     * @param {number} options.maxAttempts - Maximum retry attempts
     * @param {number} options.initialDelay - Initial delay in ms
     * @param {number} options.maxDelay - Maximum delay in ms
     * @param {Function} options.shouldRetry - Function to determine if should retry
     * @returns {Promise<any>}
     */
    static async retry(fn, options = {}) {
        const {
            maxAttempts = 3,
            initialDelay = 1000,
            maxDelay = 10000,
            shouldRetry = () => true
        } = options;

        let lastError;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;

                if (attempt === maxAttempts || !shouldRetry(error)) {
                    throw error;
                }

                const delay = Math.min(
                    initialDelay * Math.pow(2, attempt - 1),
                    maxDelay
                );

                logger.warn({
                    attempt,
                    maxAttempts,
                    delay,
                    error: error.message
                }, 'Retrying failed operation');

                await this.sleep(delay);
            }
        }

        throw lastError;
    }

    /**
     * Sleep for specified milliseconds
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise<void>}
     */
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = RetryHelper;
