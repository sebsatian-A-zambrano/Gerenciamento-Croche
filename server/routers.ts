import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getCrocheItems, createCrocheItem, updateCrocheItem, deleteCrocheItem } from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  croche: router({
    // Allow unauthenticated access by falling back to a local user id.
    // This makes the frontend usable without any login flow.
    list: publicProcedure.query(({ ctx }) =>
      getCrocheItems(ctx.user?.id ?? "local")
    ),
    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          quantity: z.number().int().min(0),
          price: z.number().min(0),
        })
      )
      .mutation(({ ctx, input }) =>
        createCrocheItem(ctx.user?.id ?? "local", {
          name: input.name,
          quantity: input.quantity,
          price: input.price,
        })
      ),
    update: publicProcedure
      .input(
        z.object({
          id: z.number().int(),
          name: z.string().min(1),
          quantity: z.number().int().min(0),
          price: z.number().min(0),
        })
      )
      .mutation(({ ctx, input }) =>
        updateCrocheItem(input.id, ctx.user?.id ?? "local", {
          name: input.name,
          quantity: input.quantity,
          price: input.price,
        })
      ),
    delete: publicProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(({ ctx, input }) =>
        deleteCrocheItem(input.id, ctx.user?.id ?? "local")
      ),
  }),
});

export type AppRouter = typeof appRouter;

