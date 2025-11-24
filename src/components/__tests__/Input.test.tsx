import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Input } from '../../../components/ui/input';

describe('Input Component', () => {
  describe('Rendering', () => {
    it('should render input element', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('should apply default styles', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('h-9');
      expect(input).toHaveClass('w-full');
      expect(input).toHaveClass('rounded-md');
      expect(input).toHaveClass('border');
    });

    it('should accept custom className', () => {
      render(<Input className="custom-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input');
    });
  });

  describe('Input Types', () => {
    it('should render as text input by default', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      // Input component doesn't set type by default, browser defaults to text
      expect(input.getAttribute('type')).toBeNull();
    });

    it('should render as email input', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should render as password input', () => {
      render(<Input type="password" />);
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it('should render as number input', () => {
      render(<Input type="number" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('should render as search input', () => {
      render(<Input type="search" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('type', 'search');
    });
  });

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:cursor-not-allowed');
    });

    it('should not accept input when disabled', async () => {
      const user = userEvent.setup();
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      await user.type(input, 'test');
      expect(input).toHaveValue('');
    });

    it('should be readonly when readonly prop is true', () => {
      render(<Input readOnly value="readonly text" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });

    it('should be required when required prop is true', () => {
      render(<Input required />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });
  });

  describe('User Interactions', () => {
    it('should accept text input', async () => {
      const user = userEvent.setup();
      render(<Input />);
      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello World');
      expect(input).toHaveValue('Hello World');
    });

    it('should call onChange handler', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      await user.type(input, 'test');
      expect(handleChange).toHaveBeenCalled();
    });

    it('should call onFocus handler', () => {
      const handleFocus = jest.fn();
      render(<Input onFocus={handleFocus} />);
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('should call onBlur handler', () => {
      const handleBlur = jest.fn();
      render(<Input onBlur={handleBlur} />);
      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.blur(input);
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('should clear input value', async () => {
      const user = userEvent.setup();
      render(<Input />);
      const input = screen.getByRole('textbox');
      await user.type(input, 'test');
      expect(input).toHaveValue('test');
      await user.clear(input);
      expect(input).toHaveValue('');
    });
  });

  describe('Controlled Component', () => {
    it('should work as controlled component', async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const [value, setValue] = React.useState('');
        return (
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        );
      };
      const { container } = render(<TestComponent />);
      const input = container.querySelector('input');
      if (input) {
        await user.type(input, 'controlled');
        expect(input).toHaveValue('controlled');
      }
    });

    it('should update value when prop changes', () => {
      const { rerender } = render(<Input value="initial" onChange={() => {}} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('initial');
      
      rerender(<Input value="updated" onChange={() => {}} />);
      expect(input).toHaveValue('updated');
    });
  });

  describe('Validation', () => {
    it('should support maxLength attribute', () => {
      render(<Input maxLength={10} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxLength', '10');
    });

    it('should support minLength attribute', () => {
      render(<Input minLength={5} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('minLength', '5');
    });

    it('should support pattern attribute', () => {
      render(<Input pattern="[0-9]*" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('pattern', '[0-9]*');
    });
  });

  describe('Accessibility', () => {
    it('should support aria-label', () => {
      render(<Input aria-label="Search input" />);
      const input = screen.getByLabelText('Search input');
      expect(input).toBeInTheDocument();
    });

    it('should support aria-describedby', () => {
      render(
        <>
          <Input aria-describedby="helper-text" />
          <span id="helper-text">Helper text</span>
        </>
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'helper-text');
    });

    it('should support aria-invalid for error states', () => {
      render(<Input aria-invalid="true" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should be keyboard accessible', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      input.focus();
      expect(input).toHaveFocus();
    });
  });

  describe('Custom Props', () => {
    it('should accept custom data attributes', () => {
      render(<Input data-testid="custom-input" data-custom="value" />);
      const input = screen.getByTestId('custom-input');
      expect(input).toHaveAttribute('data-custom', 'value');
    });

    it('should accept id attribute', () => {
      render(<Input id="email-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'email-input');
    });

    it('should accept name attribute', () => {
      render(<Input name="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'email');
    });

    it('should accept autoComplete attribute', () => {
      render(<Input autoComplete="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('autoComplete', 'email');
    });
  });
});
