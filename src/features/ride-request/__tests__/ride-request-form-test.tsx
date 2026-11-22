import { fireEvent, render, screen } from '@testing-library/react-native';
import { RideRequestForm } from '../components/ride-request-form';

describe('RideRequestForm', () => {
  it('keeps submission disabled until both locations are provided', async () => {
    await render(<RideRequestForm onSubmit={jest.fn()} />);

    const submitButton = screen.getByRole('button', { name: 'Find a van' });

    expect(submitButton).toBeDisabled();
    fireEvent.changeText(screen.getByLabelText('Pickup location'), '   ');
    expect(submitButton).toBeDisabled();
    fireEvent.changeText(screen.getByLabelText('Pickup location'), 'Main St');
    expect(submitButton).toBeDisabled();
  });

  it('submits trimmed pickup and drop-off locations', async () => {
    const onSubmit = jest.fn();
    await render(<RideRequestForm onSubmit={onSubmit} />);

    fireEvent.changeText(screen.getByLabelText('Pickup location'), '  Main St  ');
    fireEvent.changeText(screen.getByLabelText('Drop-off location'), 'City Hall');
    fireEvent.press(screen.getByRole('button', { name: 'Find a van' }));

    expect(onSubmit).toHaveBeenCalledWith({
      pickup: 'Main St',
      dropoff: 'City Hall',
    });
  });
});
