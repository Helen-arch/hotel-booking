export const getReservations = () => {
  return fetch('/hotel-booking/src/reservations.json')
    .then(response => response.json())
    .catch(error => {
      throw new Error(error);
    });
};
