/**
 * Dependency Injection Container
 * Manages dependencies and their lifecycle
 */

class Container {
    constructor() {
        this.bindings = new Map();
        this.instances = new Map();
        this.singletons = new Set();
    }

    /**
     * Bind a dependency
     * @param {string} key - Dependency key
     * @param {Function|Object} value - Factory function or instance
     * @param {boolean} singleton - Whether to cache as singleton
     */
    bind(key, value, singleton = false) {
        this.bindings.set(key, value);

        if (singleton) {
            this.singletons.add(key);
        }
    }

    /**
     * Bind as singleton
     * @param {string} key - Dependency key
     * @param {Function|Object} value - Factory function or instance
     */
    singleton(key, value) {
        this.bind(key, value, true);
    }

    /**
     * Resolve a dependency
     * @param {string} key - Dependency key
     * @returns {*} Resolved instance
     */
    resolve(key) {
        // Check if already instantiated singleton
        if (this.instances.has(key)) {
            return this.instances.get(key);
        }

        // Get binding
        if (!this.bindings.has(key)) {
            throw new Error(`Dependency "${key}" not found in container`);
        }

        const binding = this.bindings.get(key);
        let instance;

        // Resolve based on type
        if (typeof binding === 'function') {
            // Call factory function
            instance = binding(this);
        } else {
            // Use value directly
            instance = binding;
        }

        // Cache if singleton
        if (this.singletons.has(key)) {
            this.instances.set(key, instance);
        }

        return instance;
    }

    /**
     * Check if dependency exists
     * @param {string} key - Dependency key
     * @returns {boolean}
     */
    has(key) {
        return this.bindings.has(key);
    }

    /**
     * Remove a binding
     * @param {string} key - Dependency key
     */
    unbind(key) {
        this.bindings.delete(key);
        this.instances.delete(key);
        this.singletons.delete(key);
    }

    /**
     * Clear all bindings
     */
    clear() {
        this.bindings.clear();
        this.instances.clear();
        this.singletons.clear();
    }

    /**
     * Get all binding keys
     * @returns {string[]}
     */
    keys() {
        return Array.from(this.bindings.keys());
    }
}

// Export singleton instance
module.exports = new Container();
