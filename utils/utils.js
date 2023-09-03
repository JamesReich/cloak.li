export function validateUrl(value) {
    try {
        new URL(value);
        return true;
    } catch (err) {
        return false;
    }
}
