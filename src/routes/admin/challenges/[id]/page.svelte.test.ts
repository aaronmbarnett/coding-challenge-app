import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ChallengePage from './+page.svelte';
import { mockChallenge, mockTestCases } from '$lib/test-fixtures';

describe('Challenge Detail Page', () => {
  const mockData = {
    challenge: mockChallenge,
    testCases: mockTestCases
  };

  it('should render without form errors', async () => {
    render(ChallengePage, {
      props: {
        data: mockData,
        form: null
      }
    });

    // Should render main content without error alerts
    const title = page.getByText('Two Sum Problem');
    await expect.element(title).toBeInTheDocument();

    // Should not show any error alerts when form is null
    const errorAlert = page.getByText('Error');
    await expect.element(errorAlert).not.toBeInTheDocument();
  });

  it('should display error alert when form has error message', async () => {
    const formWithError = {
      message: 'Cannot delete challenge with existing attempts/sessions. Data preservation required.'
    };

    render(ChallengePage, {
      props: {
        data: mockData,
        form: formWithError
      }
    });

    // Should display error alert
    const errorAlert = page.getByText('Error');
    await expect.element(errorAlert).toBeInTheDocument();

    const errorMessage = page.getByText('Cannot delete challenge with existing attempts/sessions. Data preservation required.');
    await expect.element(errorMessage).toBeInTheDocument();
  });

  it('should display error alert when form has constraint violation message', async () => {
    const formWithError = {
      message: 'Cannot delete challenge with existing submissions. Data preservation required.'
    };

    render(ChallengePage, {
      props: {
        data: mockData,
        form: formWithError
      }
    });

    // Should display error alert with submissions message
    const errorAlert = page.getByText('Error');
    await expect.element(errorAlert).toBeInTheDocument();

    const errorMessage = page.getByText('Cannot delete challenge with existing submissions. Data preservation required.');
    await expect.element(errorMessage).toBeInTheDocument();
  });

  it('should display error alert when challenge not found', async () => {
    const formWithError = {
      message: 'Challenge not found'
    };

    render(ChallengePage, {
      props: {
        data: mockData,
        form: formWithError
      }
    });

    const errorAlert = page.getByText('Error');
    await expect.element(errorAlert).toBeInTheDocument();

    const errorMessage = page.getByText('Challenge not found');
    await expect.element(errorMessage).toBeInTheDocument();
  });

  it('should render challenge header and content alongside error alert', async () => {
    const formWithError = {
      message: 'Failed to delete challenge'
    };

    render(ChallengePage, {
      props: {
        data: mockData,
        form: formWithError
      }
    });

    // Should show error alert
    const errorAlert = page.getByText('Error');
    await expect.element(errorAlert).toBeInTheDocument();

    // Should still render main page content
    const title = page.getByText('Two Sum Problem');
    await expect.element(title).toBeInTheDocument();

    const editLinks = page.getByText('Edit Challenge');
    // Should have edit links (header and sidebar) - just verify they exist
    await expect.element(editLinks.first()).toBeInTheDocument();

    const deleteButton = page.getByRole('button', { name: 'Delete' });
    await expect.element(deleteButton).toBeInTheDocument();
  });

  it('should handle different form error messages', async () => {
    const formWithError = {
      message: 'Challenge ID is required'
    };

    render(ChallengePage, {
      props: {
        data: mockData,
        form: formWithError
      }
    });

    const errorMessage = page.getByText('Challenge ID is required');
    await expect.element(errorMessage).toBeInTheDocument();

    // Verify alert styling (should be error type)
    const errorAlert = page.getByText('Error');
    await expect.element(errorAlert).toBeInTheDocument();
  });
});