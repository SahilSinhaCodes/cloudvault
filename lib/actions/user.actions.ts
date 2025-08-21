// lib/actions/user.actions.ts

"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { Query, ID } from "node-appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { parseStringify } from "../utils";

export const signIn = async ({ email, password }: signInParams) => {
  try {
    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);

    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === 'production',
    });

    return parseStringify(session);
  } catch (error: any) {
    console.error("Error signing in:", error);
    // Check for specific Appwrite error for invalid credentials
    if (error.type === "user_invalid_credentials") {
      return { error: "Invalid email or password." };
    }
    return { error: "An unknown error occurred." };
  }
};

export const signUp = async ({ password, ...userData }: SignUpParams) => {
  const { email, fullName } = userData;
  let newUserAccount;

  try {
    const { account, databases } = await createAdminClient();

    newUserAccount = await account.create(
      ID.unique(),
      email,
      password,
      fullName
    );

    if (!newUserAccount) throw new Error("Error creating user");

    const avatarUrl = "/assets/icons/avatar-placeholder.svg";

    const newUserDoc = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      {
        accountId: newUserAccount.$id,
        email: newUserAccount.email,
        fullName: newUserAccount.name,
        avatar: avatarUrl,
      }
    );

    const session = await account.createEmailPasswordSession(email, password);

    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === 'production',
    });

    return parseStringify(newUserAccount);
  } catch (error: any) {
    console.error("Error signing up:", error);
    // Check for specific Appwrite error for existing user
    if (error.type === "user_already_exists") {
      return { error: "An account with this email already exists." };
    }
    return { error: "An unknown error occurred." };
  }
};

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();
    return parseStringify(user);
  } catch (error) {
    return null;
  }
}

export const getUserInfo = async () => {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();

    const { databases } = await createAdminClient();
    const userDocs = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", user.$id)]
    );

    return parseStringify(userDocs.documents[0]);
  } catch (error) {
    return null;
  }
};

export const signOut = async () => {
  try {
    const { account } = await createSessionClient();
    (await cookies()).delete("appwrite-session");
    await account.deleteSession("current");
  } catch (error) {
    // This can be ignored, as it might throw if the session is already invalid.
  } finally {
    redirect("/sign-in");
  }
};