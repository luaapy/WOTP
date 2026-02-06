const db = require('../db/wodb');

/**
 * Base Repository Pattern
 * Provides common CRUD operations for all entities
 */
class BaseRepository {
    constructor(tableName) {
        this.tableName = tableName;
    }

    async findById(id) {
        const items = await db.read(this.tableName);
        return items.find(item => item.id === id);
    }

    async findOne(query) {
        const items = await db.read(this.tableName);
        return items.find(item => {
            return Object.keys(query).every(key => item[key] === query[key]);
        });
    }

    async findAll(query = {}) {
        const items = await db.read(this.tableName);
        if (Object.keys(query).length === 0) return items;

        return items.filter(item => {
            return Object.keys(query).every(key => item[key] === query[key]);
        });
    }

    async create(data) {
        const items = await db.read(this.tableName);
        const newItem = {
            id: this.generateId(),
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        items.push(newItem);
        await db.write(this.tableName, items);
        return newItem;
    }

    async update(id, data) {
        const items = await db.read(this.tableName);
        const index = items.findIndex(item => item.id === id);

        if (index === -1) return null;

        items[index] = {
            ...items[index],
            ...data,
            updatedAt: new Date().toISOString()
        };

        await db.write(this.tableName, items);
        return items[index];
    }

    async delete(id) {
        const items = await db.read(this.tableName);
        const filtered = items.filter(item => item.id !== id);

        if (filtered.length === items.length) return false;

        await db.write(this.tableName, filtered);
        return true;
    }

    async deleteMany(query) {
        const items = await db.read(this.tableName);
        const filtered = items.filter(item => {
            return !Object.keys(query).every(key => item[key] === query[key]);
        });

        const deletedCount = items.length - filtered.length;
        if (deletedCount > 0) {
            await db.write(this.tableName, filtered);
        }

        return deletedCount;
    }

    async count(query = {}) {
        const items = await this.findAll(query);
        return items.length;
    }

    generateId() {
        return `${this.tableName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

module.exports = BaseRepository;
