export const queryKeys = {
  campaigns: {
    all: (userId: string) => ['campaigns', userId] as const,
    single: (id: string) => ['campaign', id] as const,
  },
  health: ['health'] as const,
} as const;
