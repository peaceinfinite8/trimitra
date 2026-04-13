/**
 * Check if current time is within maintenance window
 * Maintenance: 14 April 2026 00:00 - 23:00 (Indonesian Time UTC+7)
 * After 23:00, pages will be restored
 * @returns {boolean} true if in maintenance window
 */
export function isInMaintenanceWindow() {
    const now = new Date();
    
    // Get current date/time in Indonesia timezone
    const formatter = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    const parts = formatter.formatToParts(now);
    const dateMap = {};
    parts.forEach(({ type, value }) => {
        dateMap[type] = value;
    });
    
    const year = parseInt(dateMap.year);
    const month = parseInt(dateMap.month) - 1; // 0-based
    const day = parseInt(dateMap.day);
    const hour = parseInt(dateMap.hour);
    
    // Maintenance: April 14, 2026 from 00:00 to 23:00
    const isOnMaintenanceDate = year === 2026 && month === 3 && day === 14;
    const isBeforeMaintenanceEnd = hour < 23;
    
    return isOnMaintenanceDate && isBeforeMaintenanceEnd;
}

/**
 * Get maintenance info
 * @returns {object} maintenance info with status and time remaining
 */
export function getMaintenanceInfo() {
    const now = new Date();
    
    const formatter = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    const parts = formatter.formatToParts(now);
    const dateMap = {};
    parts.forEach(({ type, value }) => {
        dateMap[type] = value;
    });
    
    const year = parseInt(dateMap.year);
    const month = parseInt(dateMap.month) - 1;
    const day = parseInt(dateMap.day);
    const hour = parseInt(dateMap.hour);
    const minute = parseInt(dateMap.minute);
    const second = parseInt(dateMap.second);
    
    // Calculate time remaining until 23:00 on April 14
    const maintenanceEnd = new Date();
    maintenanceEnd.setHours(23, 0, 0, 0);
    
    const timeRemaining = maintenanceEnd - now;
    
    return {
        isActive: isInMaintenanceWindow(),
        endTime: maintenanceEnd,
        timeRemaining: timeRemaining > 0 ? timeRemaining : 0,
    };
}
