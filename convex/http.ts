import { httpRouter } from "convex/server";
import { isRecord } from "effect/Predicate";
import { z } from "zod";
import { api } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { setExternalId } from "./clerk";

const http = httpRouter();

// const schema = z.object({
//   id: z.string().refine((e) => e.startsWith("user_")),
//   first_name: z.string().min(2).max(100),
//   last_name: z.string().min(2).max(100),
//   username: z.string().min(2, "Username missing"),
//   email_addresses: z
//     .array(z.object({ email_address: z.string().email() }))
//     .min(1),
//   phone_numbers: z.array(
//     z.object({
//       phone_number: z.string().min(10).max(20),
//     }),
//   ),
// });

const schema = z.object({
  id: z.string().refine((e) => e.startsWith("user_")),
  first_name: z.string().min(1).max(100).nullable().optional(),
  last_name: z.string().min(1).max(100).nullable().optional(),
  username: z.string().min(2, "Username missing").nullable().optional(),
  email_addresses: z
    .array(z.object({ email_address: z.string().email() }))
    .min(1),
  phone_numbers: z
    .array(
      z.object({
        phone_number: z.string().min(10).max(20),
      }),
    )
    .optional()
    .default([]),
});

const handleEvents = httpAction(async (ctx, res) => {
  const event = await res.json();

  if (event.type === "user.created") {
    console.info("User signed up");
    const clerk_user = await schema.parseAsync(event?.data);

    console.info("Updating Convex user database");
    // const convex_user_id = await ctx.runMutation(api.auth.createUser, {
    //   email: clerk_user.email_addresses[0].email_address,
    //   username: clerk_user.username,
    //   firstName: clerk_user.first_name,
    //   lastName: clerk_user.last_name,
    //   phone: clerk_user.phone_numbers?.[0]?.phone_number ?? undefined,
    // });

    const email = clerk_user.email_addresses[0].email_address;
    const fallbackUsername = email.split("@")[0];

    const convex_user_id = await ctx.runMutation(api.auth.createUser, {
      email,
      username: clerk_user.username ?? fallbackUsername,
      firstName: clerk_user.first_name ?? "",
      lastName: clerk_user.last_name ?? "",
      phone: clerk_user.phone_numbers?.[0]?.phone_number ?? undefined,
    });

    console.info("Linking Convex User to Clerk User", clerk_user.id);

    const response = await setExternalId({
      clerkUserId: clerk_user.id,
      convexUserId: convex_user_id,
    });

    console.info(
      { isRecord: isRecord(response) },
      "Expecting an object but got a `Response` Object",
    );
    console.info("Linked Convex User to Clerk User");
    return Response.json({ message: "OK", data: "User linking complete" });
  }

  return Response.json({ message: "OK" });
});

http.route({
  method: "POST",
  path: "/events/convex",
  handler: handleEvents,
});

export default http;
