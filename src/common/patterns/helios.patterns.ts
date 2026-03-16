export const HeliosBaseRequestPattern = 'helios.service';

export const getHeliosPattern = (pattern: string) => {
  return `${HeliosBaseRequestPattern}:${pattern}`;
};

export enum HeliosPatterns {
  endBooking = 'endBooking',
  cancelBooking = 'cancelBooking',
  commenceBooking = 'commenceBooking',
  getBookingDetails = 'getBookingDetails',
  getAvailabilities = 'getAvailabilities',
  getBookingsForBusiness = 'getBookingsForBusiness',
  hasBookedProviderBefore = 'hasBookedProviderBefore',
  requestBookingReschedule = 'requestBookingReschedule',
  requestBookingCommencement = 'requestBookingCommencement',
  bookingInsights = 'bookingInsights',
  reportNoShowBooking = 'reportNoShowBooking',
}
