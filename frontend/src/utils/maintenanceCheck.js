/**
 * Check if current time is within maintenance window
 * Maintenance: 14 April 2026 00:00 - 23:00
 * After 23:00, pages will be restored
 * @returns {boolean} true if in maintenance window
 */
export function isInMaintenanceWindow() {
  const now = new Date();
  
  // Maintenance date: 14 April 2026
  const maintenanceStart = new Date(2026, 3, 14, 0, 0, 0); // April 14, 00:00
  const maintenanceEnd = new Date(2026, 3, 14, 23, 0, 0);   // April 14, 23:00
  
  return now >= maintenanceStart && now < maintenanceEnd;
}

/**
 * Get maintenance info
 * @returns {object} maintenance info with status and time remaining
 */
export function getMaintenanceInfo() {
  const now = new Date();
  const maintenanceEnd = new Date(2026, 3, 14, 23, 0, 0);
  
  const timeRemaining = maintenanceEnd - now;
  
  return {
    isActive: isInMaintenanceWindow(),
    endTime: maintenanceEnd,
    timeRemaining: timeRemaining > 0 ? timeRemaining : 0,
  };
}
