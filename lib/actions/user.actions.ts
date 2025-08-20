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

    // Correctly await cookies() before calling .set()
    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify(session);
  } catch (error) {
    console.error("Error signing in:", error);
    return null;
  }
};

export const signOut = async () => {
  try {
    const { account } = await createSessionClient();
    // Correctly await cookies() before calling .delete()
    (await cookies()).delete("appwrite-session");
    await account.deleteSession("current");
  } catch (error) {
    // This is expected if the user is already logged out, so we can ignore it
  } finally {
    redirect("/sign-in");
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

    // ---  CHANGE THIS LINE ---
    // Instead of generating an Appwrite URL, we assign a local static path.
    const avatarUrl = "/assets/images/avatar.png";

    const newUserDoc = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      {
        accountId: newUserAccount.$id,
        email: newUserAccount.email,
        fullName: newUserAccount.name,
        avatar: avatarUrl, // This now saves the local path
      }
    );

    const session = await account.createEmailPasswordSession(email, password);

    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify(newUserAccount);
  } catch (error) {
    console.error("Error signing up:", error);
    return null;
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

// Add this new function inside lib/actions/user.actions.ts

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
