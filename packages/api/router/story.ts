import type { TRPCRouterRecord } from '@trpc/server';
import { z } from 'zod';

import { protectedProcedure, publicProcedure } from '../trpc';

export const storyRouter = {
  allNodes: publicProcedure.query(({ ctx }) => {
    try {
      ctx.db.executeQuery('SELECT * FROM story');
    } catch (error) {
      console.error('Error executing query');
      console.log(error);
    }
  }),
} satisfies TRPCRouterRecord;
