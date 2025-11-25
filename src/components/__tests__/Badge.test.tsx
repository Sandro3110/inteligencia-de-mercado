// @ts-ignore - TODO: Fix TypeScript error
import { render, screen } from '@testing-library/react';
import { Badge } from '../../../components/ui/badge';

describe('Badge Component', () => {
  describe('Rendering', () => {
    it('should render badge with text', () => {
      render(<Badge>New</Badge>);
      // @ts-ignore - TODO: Fix TypeScript error
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('should render as span by default', () => {
      render(<Badge data-testid="badge">Badge</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge.tagName).toBe('SPAN');
    });

    it('should apply default styles', () => {
      render(<Badge data-testid="badge">Badge</Badge>);
      const badge = screen.getByTestId('badge');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(badge).toHaveClass('inline-flex');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(badge).toHaveClass('items-center');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(badge).toHaveClass('rounded-md'); // Refactored component uses rounded-md
      // @ts-ignore - TODO: Fix TypeScript error
      expect(badge).toHaveClass('border');
    });
  });

  describe('Variants', () => {
    it('should apply default variant styles', () => {
      render(<Badge data-testid="badge">Default</Badge>);
      const badge = screen.getByTestId('badge');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(badge).toHaveClass('border-transparent');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(badge).toHaveClass('bg-primary');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(badge).toHaveClass('text-primary-foreground');
    });

    it('should apply secondary variant styles', () => {
      render(<Badge variant="secondary" data-testid="badge">Secondary</Badge>);
      const badge = screen.getByTestId('badge');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(badge).toHaveClass('border-transparent');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(badge).toHaveClass('bg-secondary');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(badge).toHaveClass('text-secondary-foreground');
    });

    it('should apply destructive variant styles', () => {
      render(<Badge variant="destructive" data-testid="badge">Destructive</Badge>);
      const badge = screen.getByTestId('badge');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(badge).toHaveClass('border-transparent');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(badge).toHaveClass('bg-destructive');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(badge).toHaveClass('text-white'); // Refactored component uses text-white
    });

    it('should apply outline variant styles', () => {
      render(<Badge variant="outline" data-testid="badge">Outline</Badge>);
      const badge = screen.getByTestId('badge');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(badge).toHaveClass('text-foreground');
    });
  });

  describe('Custom Props', () => {
    it('should accept custom className', () => {
      render(<Badge className="custom-badge" data-testid="badge">Badge</Badge>);
      const badge = screen.getByTestId('badge');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(badge).toHaveClass('custom-badge');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(badge).toHaveClass('inline-flex'); // Should still have default classes
    });

    it('should accept custom HTML attributes', () => {
      render(<Badge data-testid="badge" data-custom="value">Badge</Badge>);
      const badge = screen.getByTestId('badge');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(badge).toHaveAttribute('data-custom', 'value');
    });

    it('should accept id attribute', () => {
      render(<Badge id="status-badge" data-testid="badge">Badge</Badge>);
      const badge = screen.getByTestId('badge');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(badge).toHaveAttribute('id', 'status-badge');
    });
  });

  describe('Content Types', () => {
    it('should render text content', () => {
      render(<Badge>Text Badge</Badge>);
      // @ts-ignore - TODO: Fix TypeScript error
      expect(screen.getByText('Text Badge')).toBeInTheDocument();
    });

    it('should render numeric content', () => {
      render(<Badge>42</Badge>);
      // @ts-ignore - TODO: Fix TypeScript error
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render with icon', () => {
      render(
        <Badge>
          <span data-testid="icon">🔥</span>
          Hot
        </Badge>
      );
      // @ts-ignore - TODO: Fix TypeScript error
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      // @ts-ignore - TODO: Fix TypeScript error
      expect(screen.getByText('Hot')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <Badge>
          <span>Count:</span>
          <span>5</span>
        </Badge>
      );
      // @ts-ignore - TODO: Fix TypeScript error
      expect(screen.getByText('Count:')).toBeInTheDocument();
      // @ts-ignore - TODO: Fix TypeScript error
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('Use Cases', () => {
    it('should work as status indicator', () => {
      render(<Badge variant="secondary">Active</Badge>);
      // @ts-ignore - TODO: Fix TypeScript error
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should work as notification badge', () => {
      render(<Badge variant="destructive">3</Badge>);
      // @ts-ignore - TODO: Fix TypeScript error
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should work as category tag', () => {
      render(<Badge variant="outline">Technology</Badge>);
      // @ts-ignore - TODO: Fix TypeScript error
      expect(screen.getByText('Technology')).toBeInTheDocument();
    });

    it('should work in lists', () => {
      render(
        <div>
          <Badge>Tag 1</Badge>
          <Badge>Tag 2</Badge>
          <Badge>Tag 3</Badge>
        </div>
      );
      // @ts-ignore - TODO: Fix TypeScript error
      expect(screen.getByText('Tag 1')).toBeInTheDocument();
      // @ts-ignore - TODO: Fix TypeScript error
      expect(screen.getByText('Tag 2')).toBeInTheDocument();
      // @ts-ignore - TODO: Fix TypeScript error
      expect(screen.getByText('Tag 3')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should support aria-label', () => {
      render(<Badge aria-label="Status indicator">Active</Badge>);
      const badge = screen.getByLabelText('Status indicator');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(badge).toBeInTheDocument();
    });

    it('should support role attribute', () => {
      render(<Badge role="status" data-testid="badge">Loading</Badge>);
      const badge = screen.getByTestId('badge');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(badge).toHaveAttribute('role', 'status');
    });

    it('should support aria-live for dynamic content', () => {
      render(<Badge aria-live="polite" data-testid="badge">5 new</Badge>);
      const badge = screen.getByTestId('badge');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(badge).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Styling Combinations', () => {
    it('should combine variant with custom styles', () => {
      render(
        <Badge
          variant="secondary"
          className="text-lg font-bold"
          data-testid="badge"
        >
          Custom
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(badge).toHaveClass('bg-secondary');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(badge).toHaveClass('text-lg');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(badge).toHaveClass('font-bold');
    });

    it('should support hover effects with custom classes', () => {
      render(
        <Badge className="hover:scale-110" data-testid="badge">
          Hover me
        </Badge>
      );
      const badge = screen.getByTestId('badge');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(badge).toHaveClass('hover:scale-110');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      render(<Badge data-testid="badge"></Badge>);
      const badge = screen.getByTestId('badge');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(badge).toBeInTheDocument();
      // @ts-ignore - TODO: Fix TypeScript error
      expect(badge).toBeEmptyDOMElement();
    });

    it('should handle very long text', () => {
      const longText = 'This is a very long badge text that might overflow';
      render(<Badge>{longText}</Badge>);
      // @ts-ignore - TODO: Fix TypeScript error
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should handle special characters', () => {
      render(<Badge>{"<>&\"'"}</Badge>);
      // @ts-ignore - TODO: Fix TypeScript error
      expect(screen.getByText('<>&"\'')).toBeInTheDocument();
    });
  });
});
