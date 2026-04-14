/**
 * Check if current time is within maintenance window
 * Maintenance: 14 April 2026 00:00 - 15 April 2026 12:00 (Indonesian Time UTC+7)
 * After 12:00 on 15 April, pages will be restored
 * @returns {boolean} true if in maintenance window
 */
export const MAINTENANCE_START = new Date('2026-04-14T00:00:00+07:00');
export const MAINTENANCE_END = new Date('2026-04-15T12:00:00+07:00');

export function isInMaintenanceWindow() {
    const now = new Date();

    return now >= MAINTENANCE_START && now < MAINTENANCE_END;
}

/**
 * Get maintenance info
 * @returns {object} maintenance info with status and time remaining
 */
export function getMaintenanceInfo() {
    const now = new Date();

    const timeRemaining = MAINTENANCE_END - now;

    return {
        isActive: isInMaintenanceWindow(),
        endTime: MAINTENANCE_END,
        timeRemaining: timeRemaining > 0 ? timeRemaining : 0,
    };
}
