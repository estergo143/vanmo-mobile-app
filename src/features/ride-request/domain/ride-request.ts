export type RideRequest = {
  pickup: string;
  dropoff: string;
};

export function isRideRequestReady(pickup: string, dropoff: string): boolean {
  return pickup.trim().length > 0 && dropoff.trim().length > 0;
}

export function createRideRequest(pickup: string, dropoff: string): RideRequest {
  return {
    pickup: pickup.trim(),
    dropoff: dropoff.trim(),
  };
}
