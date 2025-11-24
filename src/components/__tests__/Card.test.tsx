import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from '../../../components/ui/card';

describe('Card Components', () => {
  describe('Card', () => {
    it('should render card element', () => {
      render(<Card data-testid="card">Card Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toBeInTheDocument();
    });

    it('should apply default styles', () => {
      render(<Card data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('rounded-xl');
      expect(card).toHaveClass('border');
      expect(card).toHaveClass('bg-card');
      expect(card).toHaveClass('flex');
      expect(card).toHaveClass('flex-col');
    });

    it('should accept custom className', () => {
      render(<Card className="custom-card" data-testid="card">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-card');
      expect(card).toHaveClass('rounded-xl'); // Should still have default classes
    });

    it('should render children', () => {
      render(
        <Card>
          <div data-testid="child">Child Content</div>
        </Card>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('should accept custom HTML attributes', () => {
      render(<Card data-testid="card" data-custom="value">Content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('data-custom', 'value');
    });
  });

  describe('CardHeader', () => {
    it('should render card header', () => {
      render(<CardHeader data-testid="header">Header</CardHeader>);
      const header = screen.getByTestId('header');
      expect(header).toBeInTheDocument();
    });

    it('should apply default styles', () => {
      render(<CardHeader data-testid="header">Header</CardHeader>);
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('grid');
      expect(header).toHaveClass('gap-2');
      expect(header).toHaveClass('px-6');
    });

    it('should accept custom className', () => {
      render(<CardHeader className="custom-header" data-testid="header">Header</CardHeader>);
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('custom-header');
    });
  });

  describe('CardTitle', () => {
    it('should render card title', () => {
      render(<CardTitle>Title Text</CardTitle>);
      expect(screen.getByText('Title Text')).toBeInTheDocument();
    });

    it('should apply default styles', () => {
      render(<CardTitle data-testid="title">Title</CardTitle>);
      const title = screen.getByTestId('title');
      expect(title).toHaveClass('font-semibold');
      expect(title).toHaveClass('leading-none');
    });

    it('should accept custom className', () => {
      render(<CardTitle className="custom-title" data-testid="title">Title</CardTitle>);
      const title = screen.getByTestId('title');
      expect(title).toHaveClass('custom-title');
    });

    it('should render as div by default', () => {
      render(<CardTitle>Title</CardTitle>);
      const title = screen.getByText('Title');
      expect(title.tagName).toBe('DIV');
    });
  });

  describe('CardDescription', () => {
    it('should render card description', () => {
      render(<CardDescription>Description text</CardDescription>);
      expect(screen.getByText('Description text')).toBeInTheDocument();
    });

    it('should apply default styles', () => {
      render(<CardDescription data-testid="description">Description</CardDescription>);
      const description = screen.getByTestId('description');
      expect(description).toHaveClass('text-sm');
      expect(description).toHaveClass('text-muted-foreground');
    });

    it('should accept custom className', () => {
      render(<CardDescription className="custom-desc" data-testid="description">Description</CardDescription>);
      const description = screen.getByTestId('description');
      expect(description).toHaveClass('custom-desc');
    });

    it('should render as div by default', () => {
      render(<CardDescription>Description</CardDescription>);
      const description = screen.getByText('Description');
      expect(description.tagName).toBe('DIV');
    });
  });

  describe('CardContent', () => {
    it('should render card content', () => {
      render(<CardContent data-testid="content">Content</CardContent>);
      const content = screen.getByTestId('content');
      expect(content).toBeInTheDocument();
    });

    it('should apply default styles', () => {
      render(<CardContent data-testid="content">Content</CardContent>);
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('px-6');
    });

    it('should accept custom className', () => {
      render(<CardContent className="custom-content" data-testid="content">Content</CardContent>);
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('custom-content');
    });

    it('should render children', () => {
      render(
        <CardContent>
          <div data-testid="child">Child</div>
        </CardContent>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });

  describe('CardFooter', () => {
    it('should render card footer', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>);
      const footer = screen.getByTestId('footer');
      expect(footer).toBeInTheDocument();
    });

    it('should apply default styles', () => {
      render(<CardFooter data-testid="footer">Footer</CardFooter>);
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('flex');
      expect(footer).toHaveClass('items-center');
      expect(footer).toHaveClass('px-6');
    });

    it('should accept custom className', () => {
      render(<CardFooter className="custom-footer" data-testid="footer">Footer</CardFooter>);
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('custom-footer');
    });
  });

  describe('Complete Card Composition', () => {
    it('should render complete card with all components', () => {
      render(
        <Card data-testid="card">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card Description')).toBeInTheDocument();
      expect(screen.getByText('Card Content')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });

    it('should work with partial composition', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title Only</CardTitle>
          </CardHeader>
          <CardContent>Content Only</CardContent>
        </Card>
      );

      expect(screen.getByText('Title Only')).toBeInTheDocument();
      expect(screen.getByText('Content Only')).toBeInTheDocument();
    });

    it('should work with custom content', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Custom Card</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
              <li>Item 3</li>
            </ul>
          </CardContent>
        </Card>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should support custom aria attributes', () => {
      render(
        <Card aria-label="Product card" data-testid="card">
          Content
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('aria-label', 'Product card');
    });

    it('should support role attribute', () => {
      render(
        <Card role="article" data-testid="card">
          Content
        </Card>
      );
      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('role', 'article');
    });
  });
});
