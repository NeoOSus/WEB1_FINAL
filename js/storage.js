// All browser storage reads and writes go through this small safety wrapper.
class BrowserStore {
    static get(key, fallbackValue) {
        try {
            const savedValue = localStorage.getItem(key);
            return savedValue === null ? fallbackValue : JSON.parse(savedValue);
        } catch (error) {
            console.warn(`Saved data for ${key} could not be read. Starting fresh.`);
            return fallbackValue;
        }
    }

    static save(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            return false;
        }
    }
}
