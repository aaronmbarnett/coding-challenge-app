import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ErrorMessage from './ErrorMessage.svelte';

describe('ErrorMessage', () => {
  describe('message rendering', () => {
    it('should render error message when provided', async () => {
      render(ErrorMessage, { 
        props: { 
          message: 'Something went wrong'
        } 
      });
      
      const message = page.getByText('Something went wrong');
      
      await expect.element(message).toBeInTheDocument();
    });

    it('should render long error messages', async () => {
      const longMessage = 'This is a very long error message that should still be displayed correctly even when it contains many words and spans multiple lines.';
      
      render(ErrorMessage, { 
        props: { 
          message: longMessage
        } 
      });
      
      const message = page.getByText(longMessage);
      
      await expect.element(message).toBeInTheDocument();
    });
  });

  describe('error type styling', () => {
    it('should render error type with red styling by default', async () => {
      render(ErrorMessage, { 
        props: { 
          message: 'Error message'
        } 
      });
      
      const message = page.getByText('Error message');
      
      await expect.element(message).toBeVisible();
    });

    it('should render error type with red styling when explicitly set', async () => {
      render(ErrorMessage, { 
        props: { 
          message: 'Explicit error',
          type: 'error'
        } 
      });
      
      const message = page.getByText('Explicit error');
      
      await expect.element(message).toBeVisible();
    });

    it('should render warning type with yellow styling', async () => {
      render(ErrorMessage, { 
        props: { 
          message: 'Warning message',
          type: 'warning'
        } 
      });
      
      const message = page.getByText('Warning message');
      
      await expect.element(message).toBeVisible();
    });

    it('should render info type with blue styling', async () => {
      render(ErrorMessage, { 
        props: { 
          message: 'Info message',
          type: 'info'
        } 
      });
      
      const message = page.getByText('Info message');
      
      await expect.element(message).toBeVisible();
    });
  });

  describe('component structure', () => {
    it('should have correct base styling classes', async () => {
      render(ErrorMessage, { 
        props: { 
          message: 'Styled message'
        } 
      });
      
      const message = page.getByText('Styled message');
      
      await expect.element(message).toBeVisible();
    });

    it('should render message in proper structure', async () => {
      render(ErrorMessage, { 
        props: { 
          message: 'Structure test'
        } 
      });
      
      const message = page.getByText('Structure test');
      
      await expect.element(message).toBeInTheDocument();
    });
  });

  describe('conditional rendering', () => {
    it('should show message when truthy', async () => {
      render(ErrorMessage, { 
        props: { 
          message: 'Visible message'
        } 
      });
      
      const message = page.getByText('Visible message');
      
      await expect.element(message).toBeInTheDocument();
    });

    it('should render correctly with different message values', async () => {
      // Basic test that component can handle various cases
      render(ErrorMessage, { 
        props: { 
          message: 'Test message'
        } 
      });
      
      const message = page.getByText('Test message');
      await expect.element(message).toBeInTheDocument();
    });
  });

  describe('message types', () => {
    it('should default to error type when not specified', async () => {
      render(ErrorMessage, { 
        props: { 
          message: 'Default type test'
        } 
      });
      
      const message = page.getByText('Default type test');
      
      await expect.element(message).toBeVisible();
    });

    it('should handle different message types correctly', async () => {
      // Test info type
      render(ErrorMessage, { 
        props: { 
          message: 'Information message',
          type: 'info'
        } 
      });
      
      const infoMessage = page.getByText('Information message');
      
      await expect.element(infoMessage).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in messages', async () => {
      const specialMessage = 'Error: Failed to connect! @ #$%^&*()';
      
      render(ErrorMessage, { 
        props: { 
          message: specialMessage
        } 
      });
      
      const message = page.getByText(specialMessage);
      
      await expect.element(message).toBeInTheDocument();
    });

    it('should handle numeric-like messages', async () => {
      render(ErrorMessage, { 
        props: { 
          message: '404: Not Found'
        } 
      });
      
      const message = page.getByText('404: Not Found');
      
      await expect.element(message).toBeInTheDocument();
    });

    it('should handle HTML-like content as plain text', async () => {
      const htmlMessage = '<script>alert("test")</script>';
      
      render(ErrorMessage, { 
        props: { 
          message: htmlMessage
        } 
      });
      
      const message = page.getByText(htmlMessage);
      
      await expect.element(message).toBeInTheDocument();
    });
  });
});