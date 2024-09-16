import { z } from "zod";

import { storyRouter } from "./router/story";
import { baseProcedure, createTRPCRouter } from "./trpc";

// Deployed to /trpc/edge/**
export const edgeRouter = createTRPCRouter({
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
