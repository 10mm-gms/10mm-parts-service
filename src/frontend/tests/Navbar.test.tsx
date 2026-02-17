import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../src/components/Navbar';
import React from 'react';

// Mock the logo import
vi.mock('../src/assets/logo.svg', () => ({
    default: 'test-file-stub'
}));

describe('Navbar Component', () => {
    it('renders the 10mm logo instead of PARTS_PRO text', () => {
        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        // Check that logo image is present
        const logoImg = screen.getByAltText('10mm Logo');
        expect(logoImg).toBeDefined();
        expect(logoImg.getAttribute('src')).toContain('test-file-stub');

        // Confirm text logo is gone
        const textLogo = screen.queryByText('PARTS_PRO');
        expect(textLogo).toBeNull();
    });
});
