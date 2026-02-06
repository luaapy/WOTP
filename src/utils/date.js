/**
 * Date and time utility functions
 */
class DateHelper {
    /**
     * Get date range for analytics queries
     * @param {number} days - Number of days to go back
     * @returns {Object} Start and end dates
     */
    static getDateRange(days = 7) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        return { startDate, endDate };
    }

    /**
     * Format date to ISO string
     * @param {Date} date - Date to format
     * @returns {string}
     */
    static toISO(date) {
        return date.toISOString();
    }

    /**
     * Check if date is in the past
     * @param {Date|string} date - Date to check
     * @returns {boolean}
     */
    static isPast(date) {
        return new Date(date) < new Date();
    }

    /**
     * Check if date is in the future
     * @param {Date|string} date - Date to check
     * @returns {boolean}
     */
    static isFuture(date) {
        return new Date(date) > new Date();
    }

    /**
     * Add minutes to a date
     * @param {Date} date - Base date
     * @param {number} minutes - Minutes to add
     * @returns {Date}
     */
    static addMinutes(date, minutes) {
        const result = new Date(date);
        result.setMinutes(result.getMinutes() + minutes);
        return result;
    }

    /**
     * Get time difference in seconds
     * @param {Date} start - Start date
     * @param {Date} end - End date
     * @returns {number}
     */
    static diffInSeconds(start, end) {
        return Math.floor((new Date(end) - new Date(start)) / 1000);
    }

    /**
     * Format duration in human-readable format
     * @param {number} seconds - Duration in seconds
     * @returns {string}
     */
    static formatDuration(seconds) {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    }

    /**
     * Get start of day
     * @param {Date} date - Date
     * @returns {Date}
     */
    static startOfDay(date) {
        const result = new Date(date);
        result.setHours(0, 0, 0, 0);
        return result;
    }

    /**
     * Get end of day
     * @param {Date} date - Date
     * @returns {Date}
     */
    static endOfDay(date) {
        const result = new Date(date);
        result.setHours(23, 59, 59, 999);
        return result;
    }
}

module.exports = DateHelper;
