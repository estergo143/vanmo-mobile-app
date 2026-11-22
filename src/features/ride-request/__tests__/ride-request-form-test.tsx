import { fireEvent, render, screen } from '@testing-library/react-native';
import { RideRequestForm } from '../components/ride-request-form';

describe('RideRequestForm', () => {
  it('keeps submission disabled until both locations are provided', async () => {
    const { getByRole, getByLabelText } = await render(
      <RideRequestForm onSubmit={jest.fn()} />,
    );

    expect(getByRole('button', { name: 'Find a van' })).toBeDisabled();
    await fireEvent.changeText(getByLabelText('Pickup location'), '   ');
    expect(getByRole('button', { name: 'Find a van' })).toBeDisabled();
    await fireEvent.changeText(getByLabelText('Pickup location'), 'Main St');
    expect(getByRole('button', { name: 'Find a van' })).toBeDisabled();
  });

  it('submits trimmed pickup and drop-off locations', async () => {
    const onSubmit = jest.fn();
    const { getByRole, getByLabelText } = await render(
      <RideRequestForm onSubmit={onSubmit} />,
    );

    await fireEvent.changeText(getByLabelText('Pickup location'), '  Main St  ');
    await fireEvent.changeText(getByLabelText('Drop-off location'), 'City Hall');
    await fireEvent.press(getByRole('button', { name: 'Find a van' }));

    expect(onSubmit).toHaveBeenCalledWith({
      pickup: 'Main St',
      dropoff: 'City Hall',
    });
  });
});
