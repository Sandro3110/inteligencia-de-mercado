// @ts-ignore - TODO: Fix TypeScript error
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../../components/ui/button';

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render button with text', () => {
      render(<Button>Click me</Button>);
      // @ts-ignore - TODO: Fix TypeScript error
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('should render as child element when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      const link = screen.getByRole('link');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(link).toBeInTheDocument();
      // @ts-ignore - TODO: Fix TypeScript error
      expect(link).toHaveAttribute('href', '/test');
    });

    it('should apply default variant styles', () => {
      render(<Button>Default</Button>);
      const button = screen.getByRole('button');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(button).toHaveClass('bg-primary');
    });

    it('should apply secondary variant styles', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(button).toHaveClass('bg-secondary');
    });

    it('should apply destructive variant styles', () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByRole('button');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(button).toHaveClass('bg-destructive');
    });

    it('should apply outline variant styles', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(button).toHaveClass('border');
    });

    it('should apply ghost variant styles', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(button).toHaveClass('hover:bg-accent');
    });

    it('should apply link variant styles', () => {
      render(<Button variant="link">Link</Button>);
      const button = screen.getByRole('button');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(button).toHaveClass('underline-offset-4');
    });
  });

  describe('Sizes', () => {
    it('should apply default size styles', () => {
      render(<Button>Default Size</Button>);
      const button = screen.getByRole('button');
      // Default size uses h-9 in the refactored component
      // @ts-ignore - TODO: Fix TypeScript error
      expect(button).toHaveClass('h-9');
    });

    it('should apply small size styles', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      // Small size uses h-8 in the refactored component
      // @ts-ignore - TODO: Fix TypeScript error
      expect(button).toHaveClass('h-8');
    });

    it('should apply large size styles', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      // Large size uses h-10 in the refactored component
      // @ts-ignore - TODO: Fix TypeScript error
      expect(button).toHaveClass('h-10');
    });

    it('should apply icon size styles', () => {
      render(<Button size="icon">🔍</Button>);
      const button = screen.getByRole('button');
      // Icon size uses size-9 (both width and height) in the refactored component
      // @ts-ignore - TODO: Fix TypeScript error
      expect(button).toHaveClass('size-9');
    });
  });

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(button).toBeDisabled();
      // @ts-ignore - TODO: Fix TypeScript error
      expect(button).toHaveClass('disabled:pointer-events-none');
    });

    it('should not trigger onClick when disabled', () => {
      const handleClick = jest.fn();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Interactions', () => {
    it('should call onClick handler when clicked', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should support multiple clicks', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('Custom Props', () => {
    it('should accept and apply custom className', () => {
      render(<Button className="custom-class">Custom</Button>);
      const button = screen.getByRole('button');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(button).toHaveClass('custom-class');
    });

    it('should accept custom HTML attributes', () => {
      render(<Button data-testid="custom-button" aria-label="Custom Label">Custom</Button>);
      const button = screen.getByTestId('custom-button');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(button).toHaveAttribute('aria-label', 'Custom Label');
    });

    it('should support button type attribute', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('Accessibility', () => {
    it('should have button role by default', () => {
      render(<Button>Accessible</Button>);
      // @ts-ignore - TODO: Fix TypeScript error
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should be keyboard accessible', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Keyboard</Button>);
      const button = screen.getByRole('button');
      button.focus();
      // @ts-ignore - TODO: Fix TypeScript error
      expect(button).toHaveFocus();
    });

    it('should support aria-label', () => {
      render(<Button aria-label="Close dialog">×</Button>);
      const button = screen.getByLabelText('Close dialog');
      // @ts-ignore - TODO: Fix TypeScript error
      expect(button).toBeInTheDocument();
    });
  });
});
