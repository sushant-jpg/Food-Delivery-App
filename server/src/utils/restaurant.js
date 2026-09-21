const parseMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const getMinutesInTimezone = (date = new Date(), timeZone = 'Asia/Kathmandu') => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const hours = Number(parts.find((part) => part.type === 'hour')?.value || 0);
  const minutes = Number(parts.find((part) => part.type === 'minute')?.value || 0);
  return hours * 60 + minutes;
};

export const isWithinOpeningHours = (openingTime, closingTime, currentMinutes) => {
  const opening = parseMinutes(openingTime);
  const closing = parseMinutes(closingTime);
  if (opening === closing) return true;
  if (opening < closing) return currentMinutes >= opening && currentMinutes < closing;
  return currentMinutes >= opening || currentMinutes < closing;
};

export const calculateDeliveryFee = (distanceKm, pricing) =>
  Math.round(Math.max(pricing.minimumFee, pricing.baseFee + distanceKm * pricing.perKmRate));

export const calculateEstimatedDeliveryMinutes = (distanceKm, averagePreparationTime = 20) => {
  const travelMinutes = Math.ceil((distanceKm / 15) * 60);
  return Math.max(20, Math.ceil(averagePreparationTime) + travelMinutes);
};

