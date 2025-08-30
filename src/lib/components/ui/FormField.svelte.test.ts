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

    it('should apply base styling classes', async () => {
      render(FormField, { props: { label: 'Styled Field', name: 'styled' } });
      
      const input = page.getByRole('textbox', { name: 'Styled Field' });
      
      await expect.element(input).toHaveClass(/w-full/);
      await expect.element(input).toHaveClass(/rounded-md/);
      await expect.element(input).toHaveClass(/border/);
      await expect.element(input).toHaveClass(/border-gray-300/);
      await expect.element(input).toHaveClass(/px-3/);
      await expect.element(input).toHaveClass(/py-2/);
    });

    it('should have focus styling classes', async () => {
      render(FormField, { props: { label: 'Focus Field', name: 'focus' } });
      
      const input = page.getByRole('textbox', { name: 'Focus Field' });
      
      await expect.element(input).toHaveClass(/focus:ring-2/);
      await expect.element(input).toHaveClass(/focus:ring-blue-500/);
      await expect.element(input).toHaveClass(/focus:outline-none/);
    });

    it('should have label styling classes', async () => {
      render(FormField, { props: { label: 'Styled Label', name: 'label' } });
      
      const label = page.getByText('Styled Label');
      
      await expect.element(label).toHaveClass(/mb-1/);
      await expect.element(label).toHaveClass(/block/);
      await expect.element(label).toHaveClass(/text-sm/);
      await expect.element(label).toHaveClass(/font-medium/);
      await expect.element(label).toHaveClass(/text-gray-700/);
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
});