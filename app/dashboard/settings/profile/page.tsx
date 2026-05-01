"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "~/components/profile/image-upload";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { useTitles } from "~/hooks/useTitles";

const workExperienceSchema = z.object({
  position: z.string().min(1, "Position is required"),
  company: z.string().min(1, "Company is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  description: z.string().optional(),
  isCurrent: z.boolean(),
});

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
  phonenumbers: z.string().optional(),
  title: z.string().optional(),
  shortBio: z.string().optional(),
  profileImage: z.string().optional(),
  workExperience: z.array(workExperienceSchema).optional(),
  interests: z.string().optional(), // comma-separated
});

export default function Profile() {
  const profile = useQuery(api.profiles.getProfile);

  return (
    <div>
      <h1 className="text-4xl font-semibold mb-8">Edit Profile</h1>

      {profile ? (
        <ProfileForm
          initialData={{
            firstname: profile.firstName,
            lastname: profile.lastName,
            email: profile.email,
            phonenumbers: profile.phoneNumbers.join(", "),
            title: profile?.title?._id,
            shortBio: profile.shortBio || "",
            profileImage: profile.profileImage || "",
            workExperience:
              profile.workExperience?.map((exp) => ({
                position: exp.position,
                company: exp.company,
                startDate: new Date(exp.startDate).toISOString().split("T")[0],
                endDate: exp.endDate
                  ? new Date(exp.endDate).toISOString().split("T")[0]
                  : "",
                description: exp.description || "",
                isCurrent: exp.endDate === null || exp.endDate === undefined,
              })) || [],
            interests: profile.interests?.join(", ") || "",
          }}
        />
      ) : (
        <div className="text-center">Loading...</div>
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
  const updateProfile = useMutation(api.profiles.updateProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...initialData,
      workExperience: initialData.workExperience || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "workExperience",
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const phoneNumbers = values.phonenumbers
        ? values.phonenumbers
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean)
        : [];

      const workExperience =
        values.workExperience?.map((exp) => ({
          position: exp.position,
          company: exp.company,
          startDate: new Date(exp.startDate).getTime(),
          endDate:
            exp.isCurrent || !exp.endDate
              ? null
              : new Date(exp.endDate).getTime(),
          description: exp.description || "",
        })) || [];

      const interests = values.interests
        ? values.interests
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean)
        : [];

      await updateProfile({
        firstName: values.firstname,
        lastName: values.lastname,
        phoneNumbers,
        title: values.title ? (values.title as Id<"titles">) : null,
        shortBio: values.shortBio || "",
        profileImage: values.profileImage || null,
        workExperience,
        interests,
      });

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      console.error("Failed to update profile:", error);
      setMessage({
        type: "error",
        text: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-500/20 text-green-300 border border-green-500/30"
                  : "bg-red-500/20 text-red-300 border border-red-500/30"
              }`}
            >
              {message.text}
            </div>
          )}

          <Card className="bg-blue-500/10 border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        disabled
                      />
                    </FormControl>
                    <FormDescription>Email cannot be changed.</FormDescription>
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
                          <SelectItem key={title._id} value={title._id}>
                            {title.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select your preferred title.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shortBio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about yourself..."
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description about yourself (optional).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profileImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Image</FormLabel>
                    <FormControl>
                      <ImageUpload
                        currentImage={field.value || null}
                        onImageChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload a profile picture (max 5MB). You can crop and
                      resize it.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="bg-blue-500/10 border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center justify-between">
                Work Experience
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    append({
                      position: "",
                      company: "",
                      startDate: "",
                      endDate: "",
                      description: "",
                      isCurrent: false,
                    })
                  }
                  className="group flex items-center bg-white border-gray-300"
                >
                  <Plus className="h-4 w-4 text-gray-900 group-hover:mr-2 transition-all flex-shrink-0" />
                  <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-gray-900">
                    Add Experience
                  </span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {fields.length === 0 ? (
                <p className="text-white/60 text-sm text-center py-4">
                  No work experience added yet. Click "Add Experience" to get
                  started.
                </p>
              ) : (
                fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-white">
                        Experience {index + 1}
                      </h4>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => remove(index)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`workExperience.${index}.position`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Position</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Software Engineer"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`workExperience.${index}.company`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                              <Input placeholder="Acme Inc." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`workExperience.${index}.startDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`workExperience.${index}.endDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                disabled={form.watch(
                                  `workExperience.${index}.isCurrent`,
                                )}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`workExperience.${index}.isCurrent`}
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4"
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">
                            I currently work here
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`workExperience.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your role and responsibilities..."
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Interests */}
          <Card className="bg-blue-500/10 border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white">Interests</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="interests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Interests</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Web Development, Machine Learning, Photography, Hiking"
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter your interests separated by commas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
