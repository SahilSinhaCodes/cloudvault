// components/AuthForm.tsx

"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/actions/user.actions";

const authFormSchema = (type: "sign-in" | "sign-up") =>
  z.object({
    fullName: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  });

const AuthForm = ({ type }: { type: "sign-in" | "sign-up" }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(""); // State to hold our error messages
  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(""); // Clear previous errors

    try {
      if (type === "sign-up") {
        const response = await signUp(data);
        if (response?.error) {
          setError(response.error);
        } else {
          router.push("/");
        }
      }

      if (type === "sign-in") {
        const response = await signIn({
          email: data.email,
          password: data.password,
        });
        if (response?.error) {
          setError(response.error);
        } else {
          router.push("/");
        }
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 auth-form">
        <h1 className="form-title">
          {type === "sign-in" ? "Sign In" : "Sign Up"}
        </h1>

        {/* Display Server Error Message Here */}
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        {type === "sign-up" && (
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="Enter your password" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="form-submit-button w-full">
          {isLoading ? (
            <Image
              src="/assets/icons/loader.svg"
              alt="loader"
              width={24}
              height={24}
              className="animate-spin"
            />
          ) : type === "sign-in" ? "Sign In" : "Sign Up"}
        </Button>

        <p className="text-center">
          {type === "sign-in"
            ? "Don't have an account?"
            : "Already have an account?"}
          <Link href={type === "sign-in" ? "/sign-up" : "/sign-in"} className="ml-1 font-medium text-brand">
            {type === "sign-in" ? "Sign Up" : "Sign In"}
          </Link>
        </p>
      </form>
    </Form>
  );
};

export default AuthForm;