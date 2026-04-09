import { test, expect } from '@playwright/test';
import { Mailbox } from '../../tests/utils/mailbox';

// Mocking global fetch
const originalFetch = global.fetch;

test.describe('Mailbox Unit Tests', () => {
  let mailbox: Mailbox;
  const mockPage = {
    goto: async (url: string) => ({ url, ok: true }),
  } as any;

  test.beforeEach(() => {
    mailbox = new Mailbox(mockPage);
  });

  test.afterAll(() => {
    global.fetch = originalFetch;
  });

  test('createRandomEmail (via AuthPageObject if we were testing it) but logically we can check email format', () => {
    // This is just a placeholder for now, focused on Mailbox
  });

  test('getInviteEmail should return data when fetch is successful', async () => {
    const mockEmail = 'test@example.com';
    const mockResponse = {
      messages: [{ ID: '123' }]
    };
    const mockMessageDetail = {
      HTML: '<html><body><a href="http://magic-link.com">Confirm</a></body></html>'
    };

    global.fetch = (async (url: string) => {
      if (url.includes('/api/v1/search')) {
        return {
          ok: true,
          json: async () => mockResponse,
        } as Response;
      }
      if (url.includes('/api/v1/message/123')) {
        return {
          ok: true,
          json: async () => mockMessageDetail,
        } as Response;
      }
      return { ok: false } as Response;
    }) as any;

    const result = await mailbox.getInviteEmail(mockEmail, { deleteAfter: false });
    expect(result).toEqual(mockMessageDetail);
  });

  test('getInviteEmail should return undefined if no messages found', async () => {
    global.fetch = async () => ({
      ok: true,
      json: async () => ({ messages: [] }),
    } as Response) as any;

    const result = await mailbox.getInviteEmail('empty@example.com', { deleteAfter: false });
    expect(result).toBeUndefined();
  });

  test('visitMailbox should parse HTML and call page.goto with the link', async () => {
    const mockEmail = 'test@example.com';
    const mockMessageDetail = {
      HTML: '<html><body><a href="http://magic-link.com">Confirm</a></body></html>'
    };

    // spy on getInviteEmail
    (mailbox as any).getInviteEmail = async () => mockMessageDetail;

    let navigatedUrl = '';
    mockPage.goto = async (url: string) => {
      navigatedUrl = url;
      return null;
    };

    await mailbox.visitMailbox(mockEmail, { deleteAfter: false });
    expect(navigatedUrl).toBe('http://magic-link.com');
  });

  test('visitMailbox should throw if no link found in HTML', async () => {
    const mockMessageDetail = {
      HTML: '<html><body>No link here</body></html>'
    };

    (mailbox as any).getInviteEmail = async () => mockMessageDetail;

    await expect(mailbox.visitMailbox('nolink@example.com', { deleteAfter: false }))
      .rejects.toThrow('No link found in email');
  });
});
