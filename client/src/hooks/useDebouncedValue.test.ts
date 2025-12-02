import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useDebouncedValue } from './useDebouncedValue';

describe('useDebouncedValue', () => {
  it('deve retornar o valor inicial imediatamente', () => {
    const { result } = renderHook(() => useDebouncedValue('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('deve debounce o valor após o delay', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebouncedValue(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );

    expect(result.current).toBe('initial');

    // Atualizar valor
    rerender({ value: 'updated', delay: 500 });
    
    // Ainda deve ser o valor inicial (não passou o delay)
    expect(result.current).toBe('initial');

    // Aguardar o delay
    await waitFor(() => expect(result.current).toBe('updated'), { timeout: 600 });
  });

  it('deve cancelar o debounce anterior se o valor mudar novamente', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 500),
      { initialProps: { value: 'initial' } }
    );

    // Primeira atualização
    rerender({ value: 'first' });
    
    // Segunda atualização antes do delay
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 250));
    });
    rerender({ value: 'second' });

    // Aguardar delay completo
    await waitFor(() => expect(result.current).toBe('second'), { timeout: 600 });
    
    // Nunca deve ter sido 'first'
    expect(result.current).not.toBe('first');
  });

  it('deve funcionar com diferentes tipos de valores', async () => {
    // String
    const { result: stringResult } = renderHook(() => useDebouncedValue('test', 100));
    expect(stringResult.current).toBe('test');

    // Number
    const { result: numberResult } = renderHook(() => useDebouncedValue(42, 100));
    expect(numberResult.current).toBe(42);

    // Boolean
    const { result: boolResult } = renderHook(() => useDebouncedValue(true, 100));
    expect(boolResult.current).toBe(true);

    // Object
    const obj = { name: 'test' };
    const { result: objResult } = renderHook(() => useDebouncedValue(obj, 100));
    expect(objResult.current).toEqual(obj);
  });

  it('deve usar delay padrão de 500ms se não especificado', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    
    // Não deve ter mudado antes de 500ms
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
    });
    expect(result.current).toBe('initial');

    // Deve ter mudado após 500ms
    await waitFor(() => expect(result.current).toBe('updated'), { timeout: 200 });
  });
});
