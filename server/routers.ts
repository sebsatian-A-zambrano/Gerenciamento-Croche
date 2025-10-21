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
    list: protectedProcedure.query(({ ctx }) =>
      getCrocheItems(ctx.user.id)
    ),
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          quantity: z.number().int().min(0),
          price: z.number().min(0),
        })
      )
      .mutation(({ ctx, input }) =>
        createCrocheItem(ctx.user.id, {
          name: input.name,
          quantity: input.quantity,
          price: input.price,
        })
      ),
    update: protectedProcedure
      .input(
        z.object({
          id: z.number().int(),
          name: z.string().min(1),
          quantity: z.number().int().min(0),
          price: z.number().min(0),
        })
      )
      .mutation(({ ctx, input }) =>
        updateCrocheItem(input.id, ctx.user.id, {
          name: input.name,
          quantity: input.quantity,
          price: input.price,
        })
      ),
    delete: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(({ ctx, input }) =>
        deleteCrocheItem(input.id, ctx.user.id)
      ),
  }),
});

export type AppRouter = typeof appRouter;

