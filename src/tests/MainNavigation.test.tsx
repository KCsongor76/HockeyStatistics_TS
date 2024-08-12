import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {BrowserRouter as Router} from 'react-router-dom';
import MainNavigation from '../components/MainNavigation';

describe('MainNavigation Component', () => {
    test('renders the correct links when signed in', () => {
        render(
            <Router>
                <MainNavigation isSignedIn={true}/>
            </Router>
        );

        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Start Game')).toBeInTheDocument();
        expect(screen.queryByText('Admin Login')).not.toBeInTheDocument();
        expect(screen.getByText('Previous Games')).toBeInTheDocument();
        expect(screen.getByText('Teams')).toBeInTheDocument();
        expect(screen.getByText('Players')).toBeInTheDocument();
        expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    test('renders the correct links when not signed in', () => {
        render(
            <Router>
                <MainNavigation isSignedIn={false}/>
            </Router>
        );

        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Start Game')).toBeInTheDocument();
        expect(screen.getByText('Admin Login')).toBeInTheDocument();
        expect(screen.queryByText('Previous Games')).not.toBeInTheDocument();
        expect(screen.queryByText('Teams')).not.toBeInTheDocument();
        expect(screen.queryByText('Players')).not.toBeInTheDocument();
        expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });

    test('toggles the menu when nav toggle is clicked', () => {
        render(
            <Router>
                <MainNavigation isSignedIn={false}/>
            </Router>
        );

        const navToggle = screen.getByRole('button');
        const menu = screen.getByRole('list');

        // Initially, the menu should be hidden
        expect(menu).not.toHaveClass('show');

        // Click the toggle to open the menu
        fireEvent.click(navToggle);
        expect(menu).toHaveClass('show');

        // Click the toggle again to close the menu
        fireEvent.click(navToggle);
        expect(menu).not.toHaveClass('show');
    });

    test('applies the active class to the nav toggle when menu is open', () => {
        render(
            <Router>
                <MainNavigation isSignedIn={false}/>
            </Router>
        );

        const navToggle = screen.getByRole('button');

        // Initially, the toggle should not have the active class
        expect(navToggle).not.toHaveClass('active');

        // Click the toggle to open the menu
        fireEvent.click(navToggle);
        expect(navToggle).toHaveClass('active');

        // Click the toggle again to close the menu
        fireEvent.click(navToggle);
        expect(navToggle).not.toHaveClass('active');
    });
});
