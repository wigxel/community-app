"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { Plus, Trash2 } from "lucide-react";
import posthog from "posthog-js";
import { useEffect, useRef } from "react";
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
import { NavigationFocus } from "~/components/molecules/navigation-focus";
import { ProfileImagesEditor } from "~/components/profile/profile-images-editor";
import { SkillsSelect } from "~/components/profile/skills-select";
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
import { safeArray } from "~/lib/data.helpers";
import { Result } from "~/lib/result";
import { toast } from "~/lib/toast";
import { HoveringFormActions } from "~/components/forms/shared/hovering-form-action";
import { LinksSection } from "~/components/forms/project/links-section";
import { buildLinkUrl, stripToPath } from "~/components/forms/project/link-row";
import { projectLinkSchema } from "~/lib/validators/schema";

// ─── Link mapping ──────────────────────────────────────────────────────────────

const TITLE_BY_TAG: Record<string, string> = {
  github: "GitHub",
  figma: "Figma",
  behance: "Behance",
  linkedin: "LinkedIn",
  other: "Other",
};

/** Legacy stored links ("website"/"portfolio" tags, full URLs) → form shape. */
const normalizeStoredLink = (link: { tag: string; value: string }) => {
  const tag =
    link.tag === "website" || link.tag === "portfolio" ? "other" : link.tag;
  return { tag, value: stripToPath(link.value, tag) };
};

// ─── Schemas ───────────────────────────────────────────────────────────────────

const workExperienceSchema = z.object({
  position: z.string().min(1, "Position is required"),
  company: z.string().min(1, "Company is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  _id: z.string().optional(),
  location: z.enum(["remote", "hybrid", "onsite"]),
  type: z.enum(["contract", "full-time"]),
  isCurrent: z.boolean(),
});

const _projectSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  description: z.string().min(1, "Project description is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  links: z.string().optional(), // comma-separated links
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
  coverImage: z.string().optional(),
  workExperience: z.array(workExperienceSchema).optional(),
  interests: z.string().optional(),
  location: z
    .object({
      city: z.string().min(1, "City is required"),
      country: z.string().min(1, "Country is required"),
    })
    .optional(),
  link: z
    .array(projectLinkSchema)
    .max(3, { message: "Max of 3 links per profile" })
    .refine(
      (links) => {
        const nonOther = links.filter((l) => l.tag !== "other");
        return new Set(nonOther.map((l) => l.tag)).size === nonOther.length;
      },
      { message: "Duplicate link types are not allowed" },
    ),
  skills: z.array(z.string()).optional(), // array of skill IDs
  rateAmount: z
    .string()
    .optional()
    .refine(
      (value) =>
        value === "" || value === undefined || Number.isFinite(Number(value)),
      { message: "Enter a valid amount." },
    ),
});

const EMPTY_WORK_EXPERIENCE: z.infer<typeof workExperienceSchema> = {
  position: "",
  company: "",
  startDate: "",
  endDate: "",
  description: "",
  location: "onsite",
  type: "full-time",
  isCurrent: false,
};

export type ProfileFormValues = z.infer<typeof formSchema>;

// ─── Page component ────────────────────────────────────────────────────────────

export default function Profile() {
  const profile = useQuery(api.profiles.getProfile);
  const skills = useQuery(api.profiles.getSkills);
  const workExpQuery = useQuery(
    api.workExperience.getByUserId,
    profile?.userId ? { userId: profile.userId } : "skip",
  );
  const existingWorkExp = profile && !profile.userId ? [] : workExpQuery;

  const mappedWorkExperience: z.infer<typeof workExperienceSchema>[] =
    existingWorkExp?.map((exp) => ({
      _id: exp._id,
      position: exp.position,
      company: exp.companyName,
      startDate: new Date(exp.timeline.start).toISOString().split("T")[0],
      endDate: exp.timeline.end
        ? new Date(exp.timeline.end).toISOString().split("T")[0]
        : "",
      description: exp.description || "",
      isCurrent: !exp.timeline.end,
      location:
        exp.location === "remote" ||
        exp.location === "hybrid" ||
        exp.location === "onsite"
          ? exp.location
          : "onsite",
      type:
        exp.type === "contract" || exp.type === "full-time"
          ? exp.type
          : "full-time",
    })) || [];

  return (
    <div className="px-2 md:px-4">
      <h1 className="mb-8 text-4xl font-semibold">Edit Profile</h1>

      {profile === null ? (
        <div className="text-muted-foreground text-center">
          We couldn&apos;t find your profile. Please complete onboarding or sign
          in again.
        </div>
      ) : profile && existingWorkExp !== undefined && skills !== undefined ? (
        <ProfileForm
          initialData={{
            firstname: profile.firstName,
            lastname: profile.lastName,
            email: profile.email,
            phonenumbers: profile.phoneNumbers.join(", "),
            title: profile?.title?._id,
            shortBio: profile.shortBio || "",
            profileImage: profile.profileImage || "",
            coverImage: profile.coverImage || "",
            interests: profile.interests?.join(", ") || "",
            location: profile.location,
            workExperience: mappedWorkExperience,
            link: profile.links ?? [],
            skills: Result.match(skills, {
              loading: () => [],
              success: (data) => data?.map((s) => s._id) ?? [],
              error: () => [],
            }),
            rateAmount:
              profile.rate?.amount != null ? String(profile.rate.amount) : "",
          }}
        />
      ) : (
        <div className="text-center">Loading...</div>
      )}
    </div>
  );
}
export type ProfileFormProps = {
  initialData: Omit<Partial<z.infer<typeof formSchema>>, "link"> & {
    /** Stored link shape (legacy tags included); normalized into the form schema on load. */
    link?: { tag: string; value: string }[];
  };
};
export function ProfileForm(props: ProfileFormProps) {
  const { initialData = {} } = props;

  const { titles } = useTitles();
  const skills = useQuery(api.skills.listSkills);
  const updateProfile = useMutation(api.profiles.updateProfile);
  const updateProfileImages = useMutation(api.profiles.updateProfileImages);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const createWorkExp = useMutation(api.workExperience.create);
  const updateWorkExp = useMutation(api.workExperience.update);
  const removeWorkExp = useMutation(api.workExperience.remove);
  const profile = useQuery(api.profiles.getProfile);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...initialData,
      workExperience: initialData.workExperience || [],
      location: initialData.location || { city: "", country: "Nigeria" },
      link: (initialData.link ?? []).map(
        normalizeStoredLink,
      ) as ProfileFormValues["link"],
      skills: initialData.skills || [],
    },
  });

  // Work experience field array
  const {
    fields: workFields,
    append: appendWork,
    remove: removeWork,
  } = useFieldArray({
    control: form.control,
    name: "workExperience",
  });

  // Persists a profile/cover image immediately: renders from the local data
  // URL, uploads to Convex storage in the background, then patches the storage
  // id into the profile. Empty value clears the field. Reverts on failure.
  function persistImage(field: "profileImage" | "coverImage", value: string) {
    const previous = form.getValues(field);
    form.setValue(field, value);

    void (async () => {
      try {
        let storageId: Id<"_storage"> | null = null;
        if (value) {
          const blob = await (await fetch(value)).blob();
          const uploadUrl = await generateUploadUrl({});
          const res = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": blob.type || "image/jpeg" },
            body: blob,
          });
          if (!res.ok) throw new Error("Image upload failed");
          ({ storageId } = (await res.json()) as {
            storageId: Id<"_storage">;
          });
          // Stale guard: skip this patch if the user picked another image
          // while this upload was in flight.
          if (form.getValues(field) !== value) return;
        }
        if (field === "profileImage") {
          await updateProfileImages({ profileImage: storageId });
        } else {
          await updateProfileImages({ coverImage: storageId });
        }
      } catch (error) {
        console.error(`Failed to save ${field}:`, error);
        if (form.getValues(field) === value) {
          form.setValue(field, previous);
        }
        toast.error("Failed to save image", {
          description: "Your change was reverted. Please try again.",
          duration: Infinity,
        });
      }
    })();
  }

  const didAppendForFocus = useRef(false);
  useEffect(() => {
    const focus = new URLSearchParams(window.location.search).get("focus");
    if (
      focus === "workExperience" &&
      !didAppendForFocus.current &&
      !form.getValues("workExperience")?.length
    ) {
      didAppendForFocus.current = true;
      appendWork(EMPTY_WORK_EXPERIENCE, { shouldFocus: false });
    }
  }, [form, appendWork]);

  async function onSubmit(values: ProfileFormValues) {
    try {
      const normalizedLinks = (values.link ?? []).map((l) => ({
        tag: l.tag,
        title: TITLE_BY_TAG[l.tag] ?? l.tag,
        value: buildLinkUrl(l.tag, l.value),
      }));

      const phoneNumbers = values.phonenumbers
        ? values.phonenumbers
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean)
        : [];

      const existingIds = new Set(
        (form.formState.defaultValues?.workExperience ?? [])
          .map((e) => e?._id)
          .filter(Boolean),
      );

      const savedWorkExperience: z.infer<typeof workExperienceSchema>[] = [];
      for (const exp of values.workExperience ?? []) {
        const timeline = {
          start: new Date(exp.startDate).getTime(),
          end:
            exp.isCurrent || !exp.endDate
              ? undefined
              : new Date(exp.endDate).getTime(),
        };
        const payload = {
          companyName: exp.company,
          position: exp.position,
          description: exp.description || "",
          location: exp.location,
          type: exp.type,
          timeline,
        };

        if (exp._id) {
          await updateWorkExp({
            id: exp._id as Id<"workExperience">,
            ...payload,
          });
          existingIds.delete(exp._id);
          savedWorkExperience.push(exp);
        } else {
          if (!profile?.userId) throw new Error("Profile is not loaded yet.");
          const id = await createWorkExp({
            userId: profile.userId,
            ...payload,
          });
          savedWorkExperience.push({ ...exp, _id: id });
        }
      }

      for (const removedId of existingIds) {
        await removeWorkExp({ id: removedId as Id<"workExperience"> });
      }
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
        interests,
        location: values.location || undefined,
        links: normalizedLinks,
        skills: (values.skills || []) as Id<"skills">[],
        rate:
          values.rateAmount === "" || values.rateAmount === undefined
            ? null
            : { amount: Number(values.rateAmount) },
      });

      if (
        process.env.NEXT_PUBLIC_POSTHOG_KEY &&
        process.env.NEXT_PUBLIC_POSTHOG_HOST
      ) {
        posthog.capture("profile_updated", {
          has_cover_image: Boolean(values.coverImage),
          has_profile_image: Boolean(values.profileImage),
          interest_count: interests.length,
          link_count: normalizedLinks.length,
          skill_count: values.skills?.length ?? 0,
          work_experience_count: values.workExperience?.length ?? 0,
          has_rate: Boolean(values.rateAmount),
        });
      }

      form.reset({ ...values, workExperience: savedWorkExperience });
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile", {
        description: "Please try again.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* ── Profile & Cover Images ────────────────────────────────────── */}
          <FormField
            control={form.control}
            name="coverImage"
            render={({ field: cover }) => (
              <FormField
                control={form.control}
                name="profileImage"
                render={({ field: avatar }) => (
                  <FormItem>
                    <FormLabel className="sr-only">
                      Profile and cover images
                    </FormLabel>
                    <ProfileImagesEditor
                      profileImage={avatar.value}
                      coverImage={cover.value}
                      onProfileImageChange={(image) =>
                        persistImage("profileImage", image)
                      }
                      onCoverImageChange={(image) =>
                        persistImage("coverImage", image)
                      }
                      fallbackInitial={form.watch("firstname")?.[0]}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          />

          {/* ── Basic Information ─────────────────────────────────────────── */}
          <Card className="">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                <FormField
                  control={form.control}
                  name="rateAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate (NGN)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="e.g., 150000"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        What you charge per engagement. Shown publicly only as a
                        ₦ band (₦ / ₦₦ / ₦₦₦ / ₦₦₦₦) — the exact amount stays
                        private.
                      </FormDescription>
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="location.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Port Harcourt" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                      <NavigationFocus id="shortBio">
                        <Textarea
                          placeholder="Tell us about yourself..."
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </NavigationFocus>
                    </FormControl>
                    <FormDescription>
                      A brief description about yourself (optional).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* ── Profile Links ─────────────────────────────────────────────── */}
          <LinksSection title="Profile links" />

          {/* ── Work Experience ───────────────────────────────────────────── */}
          <Card className="">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-xl text-white">
                Work Experience
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => appendWork(EMPTY_WORK_EXPERIENCE)}
                  className="group flex items-center border-gray-300 bg-white"
                >
                  <Plus className="h-4 w-4 shrink-0 text-gray-900 transition-all group-hover:mr-2" />
                  <span className="max-w-0 overflow-hidden whitespace-nowrap text-gray-900 transition-all duration-300 ease-in-out group-hover:max-w-xs">
                    Add Experience
                  </span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {workFields.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center text-sm">
                  No work experience added yet. Click "Add Experience" to get
                  started.
                </p>
              ) : (
                workFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white">
                        Experience {index + 1}
                      </h4>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeWork(index)}
                        className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`workExperience.${index}.position`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Position</FormLabel>
                            <FormControl>
                              {index === 0 ? (
                                <NavigationFocus id="workExperience">
                                  <Input
                                    placeholder="Software Engineer"
                                    {...field}
                                  />
                                </NavigationFocus>
                              ) : (
                                <Input
                                  placeholder="Software Engineer"
                                  {...field}
                                />
                              )}
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

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`workExperience.${index}.location`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select location" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="onsite">Onsite</SelectItem>
                                <SelectItem value="hybrid">Hybrid</SelectItem>
                                <SelectItem value="remote">Remote</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`workExperience.${index}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employment Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="full-time">
                                  Full-time
                                </SelectItem>
                                <SelectItem value="contract">
                                  Contract
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                          <FormLabel className="mt-0!">
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

          {/*── Skills ─────────────────────────────────────────────────── */}
          <Card className="">
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Skills</FormLabel>
                    <FormControl>
                      <SkillsSelect
                        skills={safeArray(skills)}
                        value={field.value || []}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Select the skills that represent your expertise.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* ── Interests ─────────────────────────────────────────────────── */}
          <Card className="">
            <CardHeader>
              <CardTitle>Interests</CardTitle>
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

          <HoveringFormActions mode="edit" onCancel={() => form.reset()} />
        </form>
      </Form>
    </div>
  );
}
