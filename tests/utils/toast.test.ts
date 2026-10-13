import { afterEach, describe, expect, it, vi } from 'vitest';
import { TOAST_EVENT, showToast } from '@/utils/toast';

describe('showToast', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('dispatches the message on window', () => {
    const target = new EventTarget();
    const listener = vi.fn();
    vi.stubGlobal('window', target);
    target.addEventListener(TOAST_EVENT, listener);

    showToast('comment posted');

    expect(listener).toHaveBeenCalledOnce();
    expect(listener.mock.calls[0][0]).toMatchObject({
      detail: 'comment posted',
    });
  });
});
