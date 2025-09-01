import { page } from '@vitest/browser/context';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TestCaseForm from './TestCaseForm.svelte';

describe('TestCaseForm', () => {
  const baseProps = {
    challengeId: 'challenge-123',
    form: null,
    onCancel: vi.fn()
  };

  describe('form structure and content', () => {
    it('should render form heading', async () => {
      render(TestCaseForm, { props: baseProps });

      const heading = page.getByRole('heading', { name: 'Add New Test Case' });
      await expect.element(heading).toBeVisible();
    });

    it('should render test type selection', async () => {
      render(TestCaseForm, { props: baseProps });

      const ioRadio = page.getByRole('radio', { name: 'Input/Output' });
      const harnessRadio = page.getByRole('radio', { name: 'Test Harness' });

      await expect.element(ioRadio).toBeVisible();
      await expect.element(harnessRadio).toBeVisible();
      await expect.element(ioRadio).toBeChecked();
    });

    it('should render weight field with default value', async () => {
      render(TestCaseForm, { props: baseProps });

      const weightField = page.getByLabelText('Weight');
      await expect.element(weightField).toBeVisible();
      await expect.element(weightField).toHaveValue('1');
    });

    it('should render hidden checkbox', async () => {
      render(TestCaseForm, { props: baseProps });

      const hiddenCheckbox = page.getByRole('checkbox', { name: 'Hidden from candidates' });
      await expect.element(hiddenCheckbox).toBeVisible();
      await expect.element(hiddenCheckbox).not.toBeChecked();
    });

    it('should render form actions', async () => {
      render(TestCaseForm, { props: baseProps });

      const submitButton = page.getByRole('button', { name: 'Add Test Case' });
      const cancelButton = page.getByRole('button', { name: 'Cancel' });

      await expect.element(submitButton).toBeVisible();
      await expect.element(cancelButton).toBeVisible();
    });
  });

  describe('test type switching', () => {
    it('should show IO fields when IO type is selected', async () => {
      render(TestCaseForm, { props: baseProps });

      const ioRadio = page.getByRole('radio', { name: 'Input/Output' });
      await ioRadio.click();

      const inputField = page.getByLabelText('Input');
      const outputField = page.getByLabelText('Expected Output');

      await expect.element(inputField).toBeVisible();
      await expect.element(outputField).toBeVisible();
      await expect.element(inputField).toHaveAttribute('required');
      await expect.element(outputField).toHaveAttribute('required');
    });

    it('should show harness field when harness type is selected', async () => {
      render(TestCaseForm, { props: baseProps });

      const harnessRadio = page.getByRole('radio', { name: 'Test Harness' });
      await harnessRadio.click();

      const harnessField = page.getByLabelText('Test Harness Code');
      await expect.element(harnessField).toBeVisible();
      await expect.element(harnessField).toHaveAttribute('required');
    });

    it('should switch between field types correctly', async () => {
      render(TestCaseForm, { props: baseProps });

      // Initially IO fields are shown
      const inputField = page.getByLabelText('Input');
      const outputField = page.getByLabelText('Expected Output');
      await expect.element(inputField).toBeVisible();
      await expect.element(outputField).toBeVisible();

      // Switch to harness
      const harnessRadio = page.getByRole('radio', { name: 'Test Harness' });
      await harnessRadio.click();

      const harnessField = page.getByLabelText('Test Harness Code');
      await expect.element(harnessField).toBeVisible();

      // IO fields should no longer be visible
      await expect.element(inputField).not.toBeVisible();
      await expect.element(outputField).not.toBeVisible();
    });

    it('should maintain field state when switching types', async () => {
      render(TestCaseForm, { props: baseProps });

      // Fill weight field
      const weightField = page.getByLabelText('Weight');
      await weightField.fill('3');

      // Check hidden checkbox
      const hiddenCheckbox = page.getByRole('checkbox', { name: 'Hidden from candidates' });
      await hiddenCheckbox.click();

      // Switch test type
      const harnessRadio = page.getByRole('radio', { name: 'Test Harness' });
      await harnessRadio.click();

      // Common fields should maintain state
      await expect.element(weightField).toHaveValue('3');
      await expect.element(hiddenCheckbox).toBeChecked();
    });
  });

  describe('form field behavior', () => {
    it('should have proper placeholders for IO fields', async () => {
      render(TestCaseForm, { props: baseProps });

      const inputField = page.getByLabelText('Input');
      const outputField = page.getByLabelText('Expected Output');

      await expect.element(inputField).toHaveAttribute('placeholder', '[1, 2, 3]');
      await expect.element(outputField).toHaveAttribute('placeholder', '6');
    });

    it('should have proper placeholder for harness field', async () => {
      render(TestCaseForm, { props: baseProps });

      const harnessRadio = page.getByRole('radio', { name: 'Test Harness' });
      await harnessRadio.click();

      const harnessField = page.getByLabelText('Test Harness Code');
      await expect.element(harnessField).toHaveAttribute('placeholder', 'assert solution([1,2,3]) == 6');
    });

    it('should handle user input in fields', async () => {
      render(TestCaseForm, { props: baseProps });

      const inputField = page.getByLabelText('Input');
      const outputField = page.getByLabelText('Expected Output');
      const weightField = page.getByLabelText('Weight');

      await inputField.fill('[2, 4, 6]');
      await outputField.fill('12');
      await weightField.fill('5');

      await expect.element(inputField).toHaveValue('[2, 4, 6]');
      await expect.element(outputField).toHaveValue('12');
      await expect.element(weightField).toHaveValue('5');
    });
  });

  describe('form validation and errors', () => {
    it('should display error message when provided', async () => {
      const propsWithError = {
        ...baseProps,
        form: { message: 'Input is required' }
      };

      render(TestCaseForm, { props: propsWithError });

      const errorMessage = page.getByText('Input is required');
      await expect.element(errorMessage).toBeVisible();
    });

    it('should not display error when form is null', async () => {
      render(TestCaseForm, { props: baseProps });

      // Should not have any error messages visible
      const formHeading = page.getByRole('heading', { name: 'Add New Test Case' });
      await expect.element(formHeading).toBeVisible();
    });

    it('should have required fields marked appropriately', async () => {
      render(TestCaseForm, { props: baseProps });

      // IO fields should be required
      const inputField = page.getByLabelText('Input');
      const outputField = page.getByLabelText('Expected Output');
      await expect.element(inputField).toHaveAttribute('required');
      await expect.element(outputField).toHaveAttribute('required');

      // Switch to harness
      const harnessRadio = page.getByRole('radio', { name: 'Test Harness' });
      await harnessRadio.click();

      const harnessField = page.getByLabelText('Test Harness Code');
      await expect.element(harnessField).toHaveAttribute('required');
    });
  });

  describe('form submission and actions', () => {
    it('should have correct form attributes', async () => {
      render(TestCaseForm, { props: baseProps });

      const submitButton = page.getByRole('button', { name: 'Add Test Case' });
      await expect.element(submitButton).toBeVisible();
      await expect.element(submitButton).toHaveAttribute('type', 'submit');
    });

    it('should call onCancel when cancel button is clicked', async () => {
      const onCancel = vi.fn();
      render(TestCaseForm, { props: { ...baseProps, onCancel } });

      const cancelButton = page.getByRole('button', { name: 'Cancel' });
      await cancelButton.click();

      expect(onCancel).toHaveBeenCalledOnce();
    });

    it('should have proper button types', async () => {
      render(TestCaseForm, { props: baseProps });

      const submitButton = page.getByRole('button', { name: 'Add Test Case' });
      const cancelButton = page.getByRole('button', { name: 'Cancel' });

      await expect.element(submitButton).toHaveAttribute('type', 'submit');
      await expect.element(cancelButton).toHaveAttribute('type', 'button');
    });
  });

  describe('accessibility and semantics', () => {
    it('should have proper form labels', async () => {
      render(TestCaseForm, { props: baseProps });

      // All form fields should have accessible labels
      const inputField = page.getByLabelText('Input');
      const outputField = page.getByLabelText('Expected Output');
      const weightField = page.getByLabelText('Weight');
      const hiddenCheckbox = page.getByLabelText('Hidden from candidates');

      await expect.element(inputField).toBeVisible();
      await expect.element(outputField).toBeVisible();
      await expect.element(weightField).toBeVisible();
      await expect.element(hiddenCheckbox).toBeVisible();
    });

    it('should have proper radio button grouping', async () => {
      render(TestCaseForm, { props: baseProps });

      const ioRadio = page.getByRole('radio', { name: 'Input/Output' });
      const harnessRadio = page.getByRole('radio', { name: 'Test Harness' });

      await expect.element(ioRadio).toHaveAttribute('name', 'kind');
      await expect.element(harnessRadio).toHaveAttribute('name', 'kind');
    });

    it('should maintain focus flow for keyboard users', async () => {
      render(TestCaseForm, { props: baseProps });

      const ioRadio = page.getByRole('radio', { name: 'Input/Output' });
      const harnessRadio = page.getByRole('radio', { name: 'Test Harness' });

      // Elements should be accessible
      await expect.element(ioRadio).toBeVisible();
      await expect.element(harnessRadio).toBeVisible();
    });

    it('should have proper heading hierarchy', async () => {
      render(TestCaseForm, { props: baseProps });

      const heading = page.getByRole('heading', { name: 'Add New Test Case', level: 2 });
      await expect.element(heading).toBeVisible();
    });
  });

  describe('integration scenarios', () => {
    it('should handle different challenge IDs', async () => {
      render(TestCaseForm, { 
        props: { 
          ...baseProps, 
          challengeId: 'challenge-456' 
        } 
      });

      const formHeading = page.getByRole('heading', { name: 'Add New Test Case' });
      await expect.element(formHeading).toBeVisible();
      // Challenge ID would be used in form processing, not directly visible
    });

    it('should work with complex form states', async () => {
      render(TestCaseForm, { props: baseProps });

      // Fill out complete IO form
      const inputField = page.getByLabelText('Input');
      const outputField = page.getByLabelText('Expected Output');
      const weightField = page.getByLabelText('Weight');
      const hiddenCheckbox = page.getByLabelText('Hidden from candidates');

      await inputField.fill('[[1,2],[3,4]]');
      await outputField.fill('[[1,3],[2,4]]');
      await weightField.fill('3');
      await hiddenCheckbox.click();

      // All values should be maintained
      await expect.element(inputField).toHaveValue('[[1,2],[3,4]]');
      await expect.element(outputField).toHaveValue('[[1,3],[2,4]]');
      await expect.element(weightField).toHaveValue('3');
      await expect.element(hiddenCheckbox).toBeChecked();
    });

    it('should handle harness test case workflow', async () => {
      render(TestCaseForm, { props: baseProps });

      // Switch to harness type
      const harnessRadio = page.getByRole('radio', { name: 'Test Harness' });
      await harnessRadio.click();

      const harnessField = page.getByLabelText('Test Harness Code');
      const weightField = page.getByLabelText('Weight');

      await harnessField.fill('assert transpose([[1,2],[3,4]]) == [[1,3],[2,4]]');
      await weightField.fill('2');

      await expect.element(harnessField).toHaveValue('assert transpose([[1,2],[3,4]]) == [[1,3],[2,4]]');
      await expect.element(weightField).toHaveValue('2');
    });
  });
});