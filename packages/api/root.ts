// import { authRouter } from "./router/auth.ts";
import { z } from "zod";

import { storyRouter } from "./router/story";
import { baseProcedure, createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      console.log("opts: ", opts);
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
  story: storyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
