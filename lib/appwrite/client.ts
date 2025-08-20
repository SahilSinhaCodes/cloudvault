// lib/appwrite/client.ts

import { Client, Account } from "appwrite"; // This now imports from the correct package
import { appwriteConfig } from "./config";

const client = new Client()
  .setEndpoint(appwriteConfig.endpointUrl)
  .setProject(appwriteConfig.projectId);

export const account = new Account(client);