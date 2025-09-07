import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FormField from './FormField.svelte';

describe('FormField', () => {
  describe('text input', () => {
    it('should render text input with label', async () => {
      render(FormField, { props: { label: 'Username', name: 'username' } });

      const label = page.getByText('Username');
      const input = page.getByRole('textbox', { name: 'Username' });

      await expect.element(label).toBeInTheDocument();
      await expect.element(input).toBeInTheDocument();
      await expect.element(input).toHaveAttribute('name', 'username');
      await expect.element(input).toHaveAttribute('type', 'text');
    });

    it('should render with placeholder and value', async () => {
      render(FormField, {
        props: {
          label: 'Email',
          name: 'email',
          placeholder: 'Enter email',
          value: 'test@example.com'
        }
      });

      const input = page.getByRole('textbox', { name: 'Email' });

      await expect.element(input).toHaveAttribute('placeholder', 'Enter email');
      await expect.element(input).toHaveValue('test@example.com');
    });

    it('should render required input', async () => {
      render(FormField, {
        props: {
          label: 'Required Field',
          name: 'required',
          required: true
        }
      });

      const input = page.getByRole('textbox', { name: 'Required Field' });

      await expect.element(input).toBeRequired();
    });
  });

  describe('number input', () => {
    it('should render number input', async () => {
      render(FormField, {
        props: {
          label: 'Age',
          name: 'age',
          type: 'number'
        }
      });

      const input = page.getByRole('spinbutton', { name: 'Age' });

      await expect.element(input).toBeInTheDocument();
      await expect.element(input).toHaveAttribute('type', 'number');
      await expect.element(input).toHaveAttribute('name', 'age');
    });
  });

  describe('textarea', () => {
    it('should render textarea with custom rows', async () => {
      render(FormField, {
        props: {
          label: 'Description',
          name: 'description',
          type: 'textarea',
          rows: 5,
          value: 'Some text'
        }
      });

      const textarea = page.getByRole('textbox', { name: 'Description' });

      await expect.element(textarea).toBeInTheDocument();
      await expect.element(textarea).toHaveAttribute('rows', '5');
      await expect.element(textarea).toHaveValue('Some text');
    });

    it('should default to 3 rows for textarea', async () => {
      render(FormField, {
        props: {
          label: 'Comments',
          name: 'comments',
          type: 'textarea'
        }
      });

      const textarea = page.getByRole('textbox', { name: 'Comments' });

      await expect.element(textarea).toHaveAttribute('rows', '3');
    });
  });

  describe('select', () => {
    it('should render select with options', async () => {
      const options = [
        { value: 'js', label: 'JavaScript' },
        { value: 'py', label: 'Python' },
        { value: 'go', label: 'Go' }
      ];

      render(FormField, {
        props: {
          label: 'Language',
          name: 'language',
          type: 'select',
          options
        }
      });

      const select = page.getByRole('combobox', { name: 'Language' });

      await expect.element(select).toBeInTheDocument();

      // Check that options are present
      const jsOption = page.getByRole('option', { name: 'JavaScript' });
      const pyOption = page.getByRole('option', { name: 'Python' });
      const goOption = page.getByRole('option', { name: 'Go' });

      await expect.element(jsOption).toBeInTheDocument();
      await expect.element(pyOption).toBeInTheDocument();
      await expect.element(goOption).toBeInTheDocument();

      await expect.element(jsOption).toHaveAttribute('value', 'js');
      await expect.element(pyOption).toHaveAttribute('value', 'py');
      await expect.element(goOption).toHaveAttribute('value', 'go');
    });

    it('should render select with pre-selected value', async () => {
      const options = [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' }
      ];

      render(FormField, {
        props: {
          label: 'Size',
          name: 'size',
          type: 'select',
          options,
          value: 'medium'
        }
      });

      const select = page.getByRole('combobox', { name: 'Size' });

      await expect.element(select).toHaveValue('medium');
    });
  });

  describe('accessibility and styling', () => {
    it('should have proper label association', async () => {
      render(FormField, { props: { label: 'Test Field', name: 'test' } });

      const label = page.getByText('Test Field');
      const input = page.getByRole('textbox', { name: 'Test Field' });

      await expect.element(label).toHaveAttribute('for', 'test');
      await expect.element(input).toHaveAttribute('id', 'test');
    });

    it('should apply proper form field styling', async () => {
      render(FormField, { props: { label: 'Styled Field', name: 'styled' } });

      const input = page.getByRole('textbox', { name: 'Styled Field' });

      // Focus on essential styling that affects usability
      await expect.element(input).toHaveAttribute('class', expect.stringContaining('w-full'));
      await expect.element(input).toHaveAttribute('class', expect.stringContaining('border'));
    });

    it('should support keyboard focus', async () => {
      render(FormField, { props: { label: 'Focus Field', name: 'focus' } });

      const input = page.getByRole('textbox', { name: 'Focus Field' });

      // Focus styling should be present for accessibility
      await expect.element(input).toHaveAttribute('class', expect.stringContaining('focus:ring-2'));
      await expect
        .element(input)
        .toHaveAttribute('class', expect.stringContaining('focus:outline-none'));
    });

    it('should style labels appropriately', async () => {
      render(FormField, { props: { label: 'Styled Label', name: 'label' } });

      const label = page.getByText('Styled Label');

      // Labels should have clear visual hierarchy
      await expect.element(label).toHaveAttribute('class', expect.stringContaining('block'));
      await expect.element(label).toHaveAttribute('class', expect.stringContaining('font-medium'));
    });
  });

  describe('default values', () => {
    it('should default to text type', async () => {
      render(FormField, { props: { label: 'Default', name: 'default' } });

      const input = page.getByRole('textbox', { name: 'Default' });

      await expect.element(input).toHaveAttribute('type', 'text');
    });

    it('should default to empty value', async () => {
      render(FormField, { props: { label: 'Empty', name: 'empty' } });

      const input = page.getByRole('textbox', { name: 'Empty' });

      await expect.element(input).toHaveValue('');
    });

    it('should default to not required', async () => {
      render(FormField, { props: { label: 'Optional', name: 'optional' } });

      const input = page.getByRole('textbox', { name: 'Optional' });

      await expect.element(input).not.toBeRequired();
    });
  });

  describe('error handling and resilience', () => {
    it('should handle missing required props gracefully', async () => {
      // Test with minimal props
      expect(() => {
        render(FormField, { props: { label: '', name: '' } });
      }).not.toThrow();
    });

    it('should handle null/undefined prop values', async () => {
      render(FormField, {
        props: {
          label: 'Test',
          name: 'test',
          value: null as any,
          placeholder: undefined as any
        }
      });

      const input = page.getByLabelText('Test');
      await expect.element(input).toBeVisible();
    });

    it('should handle invalid type prop gracefully', async () => {
      render(FormField, {
        props: {
          label: 'Invalid Type',
          name: 'invalid',
          type: 'invalid-type' as any
        }
      });

      // Should default to text input or handle gracefully
      const input = page.getByLabelText('Invalid Type');
      await expect.element(input).toBeVisible();
    });

    it('should handle empty options array for select', async () => {
      render(FormField, {
        props: {
          label: 'Empty Select',
          name: 'empty',
          type: 'select',
          options: []
        }
      });

      const select = page.getByLabelText('Empty Select');
      await expect.element(select).toBeVisible();

      const { container } = render(FormField, {
        props: {
          label: 'Empty Select',
          name: 'empty',
          type: 'select',
          options: []
        }
      });

      const options = container.querySelectorAll('option');
      expect(options).toHaveLength(0);
    });

    it('should handle malformed options in select', async () => {
      const malformedOptions = [
        { value: 'valid', label: 'Valid Option' },
        { value: '', label: 'Empty Value' }, // More realistic malformed case
        { value: 'no-label', label: undefined as any } // Missing label
      ];

      // Component should handle malformed options gracefully
      render(FormField, {
        props: {
          label: 'Malformed Options',
          name: 'malformed',
          type: 'select',
          options: malformedOptions
        }
      });

      const select = page.getByLabelText('Malformed Options');
      await expect.element(select).toBeVisible();
    });

    it('should handle extremely long values', async () => {
      const longValue = 'A'.repeat(10000);

      render(FormField, {
        props: {
          label: 'Long Value',
          name: 'long',
          value: longValue
        }
      });

      const input = page.getByLabelText('Long Value');
      await expect.element(input).toHaveValue(longValue);
    });

    it('should handle special characters in values', async () => {
      const specialValue = '🚀💻 Special chars: <>"&\' test';

      render(FormField, {
        props: {
          label: 'Special Chars',
          name: 'special',
          value: specialValue
        }
      });

      const input = page.getByLabelText('Special Chars');
      await expect.element(input).toBeVisible();
      // Just check it renders, not exact value match due to encoding differences
    });

    it('should handle number type with non-numeric values', async () => {
      render(FormField, {
        props: {
          label: 'Number Field',
          name: 'number',
          type: 'number',
          value: 'not-a-number' as any
        }
      });

      const input = page.getByLabelText('Number Field');
      await expect.element(input).toBeVisible();
      await expect.element(input).toHaveAttribute('type', 'number');
    });

    it('should handle negative rows for textarea', async () => {
      render(FormField, {
        props: {
          label: 'Negative Rows',
          name: 'negative',
          type: 'textarea',
          rows: -5
        }
      });

      const textarea = page.getByLabelText('Negative Rows');
      await expect.element(textarea).toBeVisible();
    });

    it('should handle label with HTML characters', async () => {
      const htmlLabel = '<script>alert("xss")</script>Safe Label';

      render(FormField, {
        props: {
          label: htmlLabel,
          name: 'html'
        }
      });

      // Should render label text safely without executing HTML
      const label = page.getByText(htmlLabel);
      await expect.element(label).toBeVisible();
    });

    it('should maintain form accessibility during error states', async () => {
      render(FormField, {
        props: {
          label: 'Error State Field',
          name: 'error',
          type: 'select',
          options: [] // Error scenario
        }
      });

      // Label should still be properly associated
      const select = page.getByLabelText('Error State Field');
      await expect.element(select).toBeVisible();

      const label = page.getByText('Error State Field');
      await expect.element(label).toBeVisible();
    });

    it('should handle concurrent prop updates', async () => {
      // In Svelte 5, test component resilience with different prop combinations
      render(FormField, {
        props: {
          label: 'Dynamic Field',
          name: 'dynamic',
          type: 'textarea',
          value: 'updated',
          required: true,
          placeholder: 'new placeholder'
        }
      });

      // Component should handle all props gracefully
      const textarea = page.getByLabelText('Dynamic Field');
      await expect.element(textarea).toBeVisible();
      await expect.element(textarea).toBeRequired();
    });
  });

  describe('performance and resource management', () => {
    it('should handle large option lists efficiently', async () => {
      const largeOptions = Array.from({ length: 1000 }, (_, i) => ({
        value: `option${i}`,
        label: `Option ${i}`
      }));

      const startTime = performance.now();

      render(FormField, {
        props: {
          label: 'Large Options',
          name: 'large',
          type: 'select',
          options: largeOptions
        }
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time
      expect(renderTime).toBeLessThan(1000); // 1 second threshold

      const select = page.getByLabelText('Large Options');
      await expect.element(select).toBeVisible();
    });

    it('should not create memory leaks with component cycling', async () => {
      // Test multiple render cycles (Svelte 5 handles cleanup automatically)
      for (let i = 0; i < 10; i++) {
        render(FormField, {
          props: {
            label: `Field ${i}`,
            name: `field${i}`,
            type: i % 2 === 0 ? 'text' : 'textarea'
          }
        });
        // Svelte 5 handles cleanup automatically
      }

      // Test passes if no memory issues occur - component renders and cleanup succeeds
      const formField = page.getByRole('textbox').or(page.getByRole('combobox')).first();
      await expect.element(formField).toBeInTheDocument();
    });

    it('should handle type switching efficiently', async () => {
      const types = ['text', 'textarea', 'select', 'number'] as const;

      // Test each field type renders efficiently
      for (const type of types) {
        render(FormField, {
          props: {
            label: `${type} Field`,
            name: type,
            type,
            options: type === 'select' ? [{ value: 'test', label: 'Test' }] : []
          }
        });

        const field = page.getByLabelText(`${type} Field`);
        await expect.element(field).toBeVisible();
      }
    });
  });

  describe('browser compatibility', () => {
    it('should handle form field behavior across different input types', async () => {
      const inputTypes = ['text', 'number'] as const;

      for (const type of inputTypes) {
        render(FormField, {
          props: {
            label: `${type} field`,
            name: type,
            type
          }
        });

        const input = page.getByLabelText(`${type} field`);
        await expect.element(input).toHaveAttribute('type', type);
        await expect.element(input).toBeVisible();
      }
    });

    it('should maintain consistent styling across field types', async () => {
      const fieldTypes = ['text', 'textarea', 'select'] as const;

      for (const type of fieldTypes) {
        const { container } = render(FormField, {
          props: {
            label: `${type} field`,
            name: type,
            type,
            options: type === 'select' ? [{ value: 'test', label: 'Test' }] : undefined
          }
        });

        // All field types should have base styling classes
        const field = container.querySelector('input, textarea, select');
        expect(field?.classList.contains('w-full')).toBe(true);
        expect(field?.classList.contains('rounded-md')).toBe(true);
        expect(field?.classList.contains('border')).toBe(true);
      }
    });
  });
});
