// lib/discussion.ts
import { getSession } from './auth';
const API_URL = process.env.NEXT_PUBLIC_API_URL as string;

export interface Discussion {
  id: string;
  user_id: string;
  username: string;
  title: string;
  content: string;
  replies: Reply[];
  created_at: string;
}

export interface Reply {
  id: string | null;
  user_id: string;
  username: string;
  content: string;
  created_at: string;
}

export const getDiscussions = async (): Promise<Discussion[]> => {
  const session = await getSession();
  const response = await fetch(`${API_URL}/discussions`, {
    headers: {
      'Authorization': `Bearer ${session?.token || ''}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch discussions');
  }

  return response.json();
};
const getLocalISOString = () => {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset();
  const localTime = new Date(now.getTime() - (timezoneOffset * 60000));
  return localTime.toISOString();
};

// lib/discussion.ts
export const createDiscussion = async (title: string, content: string): Promise<void> => {
  const session = await getSession();

  const createdAt = getLocalISOString();

  const response = await fetch(`${API_URL}/discussions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.token || ''}`,
    },
    body: JSON.stringify({
      title,
      content,
      created_at: createdAt,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create discussion');
  }
};
export const createReply = async (discussionId: string, content: string): Promise<void> => {
  const session = await getSession();

  const createdAt = getLocalISOString();

  const response = await fetch(`${API_URL}/discussions/${discussionId}/reply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.token || ''}`,
    },
    body: JSON.stringify({
      content,
      created_at: createdAt,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create reply');
  }
};

// lib/discussion.ts
export const updateDiscussion = async (discussionId: string, title: string, content: string): Promise<void> => {
  const session = await getSession();
  const createdAt = getLocalISOString();

  const response = await fetch(`${API_URL}/discussions/${discussionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.token || ''}`,
    },
    body: JSON.stringify({
      title,
      content,
      created_at: createdAt,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update discussion');
  }
};

export const deleteDiscussion = async (discussionId: string): Promise<void> => {
  const session = await getSession();

  const response = await fetch(`${API_URL}/discussions/${discussionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session?.token || ''}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete discussion');
  }
};