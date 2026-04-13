/**
 * Check if current time is within maintenance window
 * Maintenance: 14 April 2026 00:00 - 23:00 (Indonesian Time UTC+7)
 * After 23:00, pages will be restored
 * @returns {boolean} true if in maintenance window
 */
export function isInMaintenanceWindow() {
  const now = new Date();
  
  // Get current time in Indonesian timezone (UTC+7)
  const indonesiaOffset = 7 * 60; // UTC+7 in minutes
  const utcTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
  const indonesiaTime = new Date(utcTime.getTime() + (indonesiaOffset * 60000));
  
  // Maintenance date: 14 April 2026
  const maintenanceStart = new Date(2026, 3, 14, 0, 0, 0); // April 14, 00:00
  const maintenanceEnd = new Date(2026, 3, 14, 23, 0, 0);   // April 14, 23:00
  
  return indonesiaTime >= maintenanceStart && indonesiaTime < maintenanceEnd;
}

/**
 * Get maintenance info
 * @returns {object} maintenance info with status and time remaining
 */
export function getMaintenanceInfo() {
  const now = new Date();
  
  // Get current time in Indonesian timezone (UTC+7)
  const indonesiaOffset = 7 * 60;
  const utcTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
  const indonesiaTime = new Date(utcTime.getTime() + (indonesiaOffset * 60000));
  
  const maintenanceEnd = new Date(2026, 3, 14, 23, 0, 0);
  
  const timeRemaining = maintenanceEnd - indonesiaTime;
  
  return {
    isActive: isInMaintenanceWindow(),
    endTime: maintenanceEnd,
    timeRemaining: timeRemaining > 0 ? timeRemaining : 0,
  };
}
