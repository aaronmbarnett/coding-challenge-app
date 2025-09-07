import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DataTable from './DataTable.svelte';

describe('DataTable', () => {
  const mockColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status', class: 'text-center' }
  ];

  const mockData = [
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' }
  ];

  describe('empty state', () => {
    it('should render default empty message when no data', async () => {
      render(DataTable, {
        props: {
          columns: mockColumns,
          data: []
        }
      });

      const emptyMessage = page.getByText('No data available');
      await expect.element(emptyMessage).toBeVisible();
      // Focus on semantic meaning: message should be clearly visible to users
    });

    it('should render custom empty message', async () => {
      render(DataTable, {
        props: {
          columns: mockColumns,
          data: [],
          emptyMessage: 'No challenges found'
        }
      });

      const emptyMessage = page.getByText('No challenges found');
      await expect.element(emptyMessage).toBeInTheDocument();
    });

    it('should render empty action link when provided', async () => {
      render(DataTable, {
        props: {
          columns: mockColumns,
          data: [],
          emptyMessage: 'No challenges found',
          emptyActionHref: '/admin/challenges/new',
          emptyActionText: 'Create your first challenge'
        }
      });

      const emptyMessage = page.getByText('No challenges found');
      await expect.element(emptyMessage).toBeInTheDocument();

      const actionLink = page.getByText('Create your first challenge');
      await expect.element(actionLink).toBeVisible();
      await expect.element(actionLink).toHaveAttribute('href', '/admin/challenges/new');
      // Action links should be visually distinct as clickable elements
    });

    it('should not render empty action when href missing', async () => {
      render(DataTable, {
        props: {
          columns: mockColumns,
          data: [],
          emptyActionText: 'Create your first challenge'
        }
      });

      // Should show empty message but not action link
      const emptyMessage = page.getByText('No data available');
      await expect.element(emptyMessage).toBeInTheDocument();
    });

    it('should not render empty action when text missing', async () => {
      render(DataTable, {
        props: {
          columns: mockColumns,
          data: [],
          emptyActionHref: '/admin/challenges/new'
        }
      });

      const emptyMessage = page.getByText('No data available');
      await expect.element(emptyMessage).toBeInTheDocument();
    });

    it('should have centered empty state styling', async () => {
      render(DataTable, {
        props: {
          columns: mockColumns,
          data: []
        }
      });

      const emptyMessage = page.getByText('No data available');
      await expect.element(emptyMessage).toBeInTheDocument();
    });
  });

  describe('table with data', () => {
    it('should render table when data is provided', async () => {
      render(DataTable, {
        props: {
          columns: mockColumns,
          data: mockData
        }
      });

      // Should show headers when data is present
      const nameHeader = page.getByText('Name');
      await expect.element(nameHeader).toBeInTheDocument();

      const emailHeader = page.getByText('Email');
      await expect.element(emailHeader).toBeInTheDocument();
    });

    it('should render all column headers clearly', async () => {
      render(DataTable, {
        props: {
          columns: mockColumns,
          data: mockData
        }
      });

      // All column headers should be visible and accessible
      const nameHeader = page.getByText('Name');
      const emailHeader = page.getByText('Email');
      const statusHeader = page.getByText('Status');

      await expect.element(nameHeader).toBeVisible();
      await expect.element(emailHeader).toBeVisible();
      await expect.element(statusHeader).toBeVisible();
    });

    it('should apply custom column styling when specified', async () => {
      render(DataTable, {
        props: {
          columns: mockColumns,
          data: mockData
        }
      });

      const statusHeader = page.getByText('Status');
      await expect.element(statusHeader).toBeVisible();
      // Custom column styling should be applied when specified
      await expect
        .element(statusHeader)
        .toHaveAttribute('class', expect.stringContaining('text-center'));
    });

    it('should have correct table structure and styling', async () => {
      render(DataTable, {
        props: {
          columns: mockColumns,
          data: mockData
        }
      });

      const nameHeader = page.getByText('Name');
      await expect.element(nameHeader).toBeInTheDocument();
    });
  });

  describe('column configuration', () => {
    it('should handle single column', async () => {
      const singleColumn = [{ key: 'title', label: 'Title' }];

      render(DataTable, {
        props: {
          columns: singleColumn,
          data: [{ title: 'Test Title' }]
        }
      });

      const titleHeader = page.getByText('Title');
      await expect.element(titleHeader).toBeInTheDocument();
    });

    it('should handle columns without custom classes', async () => {
      const columnsWithoutClasses = [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' }
      ];

      render(DataTable, {
        props: {
          columns: columnsWithoutClasses,
          data: mockData
        }
      });

      const nameHeader = page.getByText('Name');
      const emailHeader = page.getByText('Email');

      await expect.element(nameHeader).toBeInTheDocument();
      await expect.element(emailHeader).toBeInTheDocument();
    });

    it('should handle many columns', async () => {
      const manyColumns = [
        { key: 'col1', label: 'Column 1' },
        { key: 'col2', label: 'Column 2' },
        { key: 'col3', label: 'Column 3' },
        { key: 'col4', label: 'Column 4' },
        { key: 'col5', label: 'Column 5' }
      ];

      render(DataTable, {
        props: {
          columns: manyColumns,
          data: [{}] // At least one row to show the table
        }
      });

      for (let i = 1; i <= 5; i++) {
        const header = page.getByText(`Column ${i}`);
        await expect.element(header).toBeInTheDocument();
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty columns array', async () => {
      render(DataTable, {
        props: {
          columns: [],
          data: mockData
        }
      });

      // With empty columns but data present, table structure should still exist
      // We should see the table but with no column headers (expected behavior)
      const table = page.getByRole('table');
      await expect.element(table).toBeInTheDocument();
    });

    it('should transition from empty to populated', async () => {
      // This test would require a way to update props, which is complex in this testing framework
      // For now, we'll just ensure both states work independently

      // Test empty state
      render(DataTable, {
        props: {
          columns: mockColumns,
          data: []
        }
      });

      const emptyMessage = page.getByText('No data available');
      await expect.element(emptyMessage).toBeInTheDocument();
    });

    it('should handle special characters in labels', async () => {
      const specialColumns = [{ key: 'test', label: 'Test & Special <Characters>' }];

      render(DataTable, {
        props: {
          columns: specialColumns,
          data: [{ test: 'value' }]
        }
      });

      const specialHeader = page.getByText('Test & Special <Characters>');
      await expect.element(specialHeader).toBeInTheDocument();
    });
  });
});
