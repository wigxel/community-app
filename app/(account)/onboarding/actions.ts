"use server";

import { api } from "~/convex/_generated/api";
import { fetchAuthMutation, isAuthenticated } from "~/lib/auth-server";

export async function createProfileAction({
  firstName,
  lastName,
  username,
}: {
  firstName: string;
  lastName: string;
  username: string;
}) {
  const isAuth = await isAuthenticated();

  if (!isAuth) {
    throw new Error("You must be logged in to perform this action.");
  }

  const result = await fetchAuthMutation(api.profiles.createProfile, {
    firstName,
    lastName,
    username,
  });

  return result;
}
