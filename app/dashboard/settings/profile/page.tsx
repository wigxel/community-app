"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "convex/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input"; // Adjust path as needed
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Adjust path as needed
import { Button } from "~/components/ui/button"; // Adjust path as needed
import { Checkbox } from "~/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"; // Adjust path as needed
import { INTERESTS } from "~/constants/interests";
import { api } from "~/convex/_generated/api";
import { useTitles } from "~/hooks/useTitles";

const formSchema = z.object({
  firstname: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastname: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phonenumbers: z.string().optional(), // Can be extended for stricter validation
  title: z.string(),
  interests: z.array(z.string()).min(1, {
    message: "Please select at least one interest.",
  }),
});

export default function Profile() {
  const profile = useQuery(api.profiles.getProfile);

  return (
    <div>
      <h1 className="text-4xl font-semibold mb-8">Edit Profile</h1>

      {profile === undefined ? (
        <div className="text-center">Loading...</div>
      ) : profile === null ? (
        <div className="text-center">No profile found.</div>
      ) : (
        <ProfileForm
          initialData={{
            firstname: profile.firstName,
            lastname: profile.lastName,
            email: profile.email,
            phonenumbers: profile.phoneNumbers.join(","),
            title: profile.title,
            interests: profile.interests ?? [],
          }}
        />
      )}
    </div>
  );
}

export function ProfileForm({
  initialData = {},
}: {
  initialData: Partial<z.infer<typeof formSchema>>;
}) {
  const { titles } = useTitles();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: initialData.firstname ?? "",
      lastname: initialData.lastname ?? "",
      email: initialData.email ?? "",
      phonenumbers: initialData.phonenumbers ?? "",
      title: initialData.title ?? "",
      interests: initialData.interests ?? [],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    alert(JSON.stringify(values, null, 2)); // For demonstration
  }

  return (
    <div className="">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john.doe@example.com"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Your email address.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phonenumbers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Numbers</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., +1234567890, +1987654321"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter phone numbers, comma-separated if multiple.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a title" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {titles.map((title) => (
                      <SelectItem key={title.name} value={title.name}>
                        {title.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Select your preferred title.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="interests"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">Interests</FormLabel>
                  <FormDescription>
                    Select your interests (choose at least one).
                  </FormDescription>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {INTERESTS.map((interest) => (
                    <FormField
                      key={interest}
                      control={form.control}
                      name="interests"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={interest}
                            className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(interest)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, interest])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== interest,
                                        ),
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {interest}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>

                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Save changes</Button>
        </form>
      </Form>
    </div>
  );
}
