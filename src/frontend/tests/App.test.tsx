import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../src/App';

test('renders parts dashboard', () => {
  render(<App />);
  const titleElement = screen.getByText(/Parts Dashboard/i);
  expect(titleElement).toBeInTheDocument();
});
