function normalizePhone(phone) {
    if (!phone) return null;
    
    // Remove all non-digits
    let cleaned = phone.toString().replace(/\D/g, '');
    
    // Check if empty
    if (cleaned.length === 0) return null;
    
    // If starts with '08', replace with '628'
    if (cleaned.startsWith('08')) {
        cleaned = '62' + cleaned.substring(1);
    }
    
    // If starts with '8', assume '628'
    if (cleaned.startsWith('8')) {
        cleaned = '62' + cleaned;
    }
    
    // Must start with 62
    if (!cleaned.startsWith('62')) {
        return null;
    }
    
    // Append WhatsApp suffix
    return cleaned + '@s.whatsapp.net';
}

module.exports = { normalizePhone };
