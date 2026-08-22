"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { Globe, GripVertical, Link, Plus, Trash2 } from "lucide-react";
import { Reorder, useDragControls } from "motion/react";
import { useRef, useState } from "react";
import {
  type FieldArrayWithId,
  type UseFormReturn,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Github, LinkedIn } from "~/components/icons";
import { CoverImageUpload } from "~/components/profile/cover-image-upload";
import { ImageUpload } from "~/components/profile/image-upload";
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

// ─── Link types ────────────────────────────────────────────────────────────────

const LINK_TYPES = [
  {
    tag: "linkedin",
    title: "LinkedIn",
    prefix: "linkedin.com/in/",
    placeholder: "username",
  },
  {
    tag: "github",
    title: "GitHub",
    prefix: "github.com/",
    placeholder: "username",
  },
  {
    tag: "portfolio",
    title: "Personal Website",
    prefix: null,
    placeholder: "https://yourwebsite.com",
  },
] as const;

type LinkTag = (typeof LINK_TYPES)[number]["tag"];

const getLinkIcon = (tag: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    linkedin: LinkedIn,
    github: Github,
    portfolio: Globe,
  };
  return iconMap[tag.toLowerCase()] ?? Link;
};

const usernameOnlyRegex = /^(?!.*(http|https|www\.|\/)).+$/i;

const normalizeLinkForEdit = (link: {
  tag: string;
  title: string;
  value: string;
}): { tag: LinkTag; title: string; value: string } => {
  const normalizedTag: LinkTag =
    link.tag === "website" ? "portfolio" : (link.tag as LinkTag);

  if (normalizedTag === "linkedin") {
    const match = link.value.match(
      /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([^/?#]+)/i,
    );
    return {
      ...link,
      tag: normalizedTag,
      value: match ? match[1] : link.value,
    };
  }

  if (normalizedTag === "github") {
    const match = link.value.match(
      /(?:https?:\/\/)?(?:www\.)?github\.com\/([^/?#]+)/i,
    );
    return {
      ...link,
      tag: normalizedTag,
      value: match ? match[1] : link.value,
    };
  }

  return {
    ...link,
    tag: normalizedTag,
  };
};

type LinkField = FieldArrayWithId<z.infer<typeof formSchema>, "links", "id">;

function DraggableLinkItem({
  field,
  index,
  form,
  removeLink,
  constraintsRef,
}: {
  field: LinkField;
  index: number;
  form: UseFormReturn<z.infer<typeof formSchema>>;
  removeLink: (index: number) => void;
  constraintsRef: React.RefObject<HTMLDivElement | null>;
}) {
  const dragControls = useDragControls();
  const Icon = getLinkIcon(field.tag);
  const typeConfig =
    LINK_TYPES.find((t) => t.tag === field.tag) ?? LINK_TYPES[0];

  return (
    <Reorder.Item
      key={field.id}
      value={field.id}
      drag="y"
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={constraintsRef}
      className="cursor-grab"
    >
      <div key={field.id} className="flex items-start gap-3">
        <div
          className="mt-6 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted"
          title="Drag to reorder"
          onPointerDown={(event) => dragControls.start(event)}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="mt-6.25 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>

        <FormField
          control={form.control}
          name={`links.${index}.value`}
          render={({ field: inputField }) => (
            <FormItem className="flex-1">
              <FormLabel className="select-none">{typeConfig.title}</FormLabel>
              <FormControl>
                {typeConfig.prefix ? (
                  <div className="flex items-center rounded-md border overflow-hidden focus-within:ring-1 focus-within:ring-ring">
                    <span className="px-3 py-2 text-sm text-muted-foreground bg-muted border-r shrink-0 select-none">
                      {typeConfig.prefix}
                    </span>
                    <Input
                      className="border-0 rounded-none shadow-none focus-visible:ring-0"
                      placeholder={typeConfig.placeholder}
                      {...inputField}
                      onChange={(e) => {
                        inputField.onChange(e);
                        form.clearErrors(`links.${index}.value`);
                      }}
                    />
                  </div>
                ) : (
                  <Input placeholder={typeConfig.placeholder} {...inputField} />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive mt-6.25"
          onClick={() => {
            form.clearErrors(`links.${index}`);
            removeLink(index);
          }}
          aria-label={`Remove ${typeConfig.title} link`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Reorder.Item>
  );
}

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

const linkSchema = z
  .object({
    tag: z.enum(["linkedin", "github", "portfolio"]),

    title: z.string().min(1),

    value: z.string().min(1, {
      message: "This field is required.",
    }),
  })
  .superRefine((data, ctx) => {
    if (
      (data.tag === "github" || data.tag === "linkedin") &&
      !usernameOnlyRegex.test(data.value)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["value"],
        message: "Enter only your username, not a full URL.",
      });
    }

    if (data.tag === "portfolio" && !z.url().safeParse(data.value).success) {
      ctx.addIssue({
        code: "custom",
        path: ["value"],
        message: "Please enter a valid URL.",
      });
    }
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
  links: z
    .array(linkSchema)
    .max(3, { message: "You can add at most 3 links." }),
  skills: z.array(z.string()).optional(), // array of skill IDs
});

// ─── Page component ────────────────────────────────────────────────────────────

export default function Profile() {
  const profile = useQuery(api.profiles.getProfile);
  const skills = useQuery(api.profiles.getSkills);
  const existingWorkExp = useQuery(
    api.workExperience.getByUserId,
    profile?.userId ? { userId: profile.userId } : "skip",
  );

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
      <h1 className="text-4xl font-semibold mb-8">Edit Profile</h1>

      {profile && existingWorkExp !== undefined ? (
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
            workExperience: mappedWorkExperience,
            links:
              profile.links?.map((link) => normalizeLinkForEdit(link)) ?? [],
            skills: Result.match(skills, {
              loading: () => [],
              success: (data) => data?.map((s) => s._id) ?? [],
              error: () => [],
            }),
          }}
        />
      ) : (
        <div className="text-center">Loading...</div>
      )}
    </div>
  );
}

// ─── Form component ────────────────────────────────────────────────────────────

export function ProfileForm({
  initialData = {},
}: {
  initialData: Partial<z.infer<typeof formSchema>>;
}) {
  const { titles } = useTitles();
  const skills = useQuery(api.skills.listSkills);
  const updateProfile = useMutation(api.profiles.updateProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const createWorkExp = useMutation(api.workExperience.create);
  const updateWorkExp = useMutation(api.workExperience.update);
  const removeWorkExp = useMutation(api.workExperience.remove);
  const profile = useQuery(api.profiles.getProfile);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...initialData,
      workExperience: initialData.workExperience || [],
      location: initialData.location || { city: "", country: "Nigeria" },
      links: initialData.links || [],
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

  // Links field array
  const {
    fields: linkFields,
    append: appendLink,
    remove: removeLink,
    move: moveLink,
  } = useFieldArray({
    control: form.control,
    name: "links",
  });

  const linkConstraintsRef = useRef<HTMLDivElement>(null);
  const watchedLinks = form.watch("links") ?? [];
  const linkFieldIds = linkFields.map((field) => field.id);

  const usedTags = watchedLinks.map((f) => f.tag);
  const availableLinkTypes = LINK_TYPES.filter(
    (t) => !usedTags.includes(t.tag),
  );

  function addLink(tag: LinkTag) {
    const type = LINK_TYPES.find((t) => t.tag === tag);
    if (!type) return;
    appendLink({ tag, title: type.title, value: "" });
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const normalizedLinks = values.links.map((link) => {
        const type = LINK_TYPES.find((t) => t.tag === link.tag);
        if (!type) {
          return link;
        }
        return {
          ...link,
          value: type.prefix
            ? `https://${type.prefix}${link.value}`
            : link.value,
        };
      });

      const phoneNumbers = values.phonenumbers
        ? values.phonenumbers
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean)
        : [];

      const existingIds = new Set(
        (initialData.workExperience ?? []).map((e) => e._id).filter(Boolean),
      );

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
        } else {
          if (!profile?.userId) return;
          await createWorkExp({ userId: profile.userId, ...payload });
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
        profileImage: values.profileImage || null,
        coverImage: values.coverImage || null,
        interests,
        location: values.location || undefined,
        links: normalizedLinks,
        skills: (values.skills || []) as Id<"skills">[],
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

          {/* ── Basic Information ─────────────────────────────────────────── */}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Port-Harcourt" {...field} />
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

              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image</FormLabel>
                    <FormControl>
                      <CoverImageUpload
                        currentImage={field.value || null}
                        onImageChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload a cover/banner image for your profile.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* ── Profile Links ─────────────────────────────────────────────── */}
          <Card className="bg-blue-500/10 border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center justify-between">
                Profile Links
                {availableLinkTypes.length > 0 && (
                  <Select onValueChange={(val) => addLink(val as LinkTag)}>
                    <SelectTrigger className="w-40">
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        <span>Add Link</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent align="end">
                      {availableLinkTypes.map((type) => {
                        const Icon = getLinkIcon(type.tag);
                        return (
                          <SelectItem key={type.tag} value={type.tag}>
                            <span className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {type.title}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {linkFields.length === 0 && (
                <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-md">
                  No links added yet.
                </p>
              )}

              <div className="space-y-4" ref={linkConstraintsRef}>
                <Reorder.Group
                  axis="y"
                  values={linkFieldIds}
                  onReorder={(newOrder) => {
                    const movedId = newOrder.find(
                      (id, index) => id !== linkFieldIds[index],
                    );
                    if (!movedId) return;

                    const oldIndex = linkFieldIds.indexOf(movedId);
                    const newIndex = newOrder.indexOf(movedId);
                    if (
                      oldIndex !== -1 &&
                      newIndex !== -1 &&
                      oldIndex !== newIndex
                    ) {
                      moveLink(oldIndex, newIndex);
                    }
                  }}
                  className="space-y-4"
                  style={{ position: "relative" }}
                >
                  {linkFields.map((field, index) => (
                    <DraggableLinkItem
                      key={field.id}
                      field={field}
                      index={index}
                      form={form}
                      removeLink={removeLink}
                      constraintsRef={linkConstraintsRef}
                    />
                  ))}
                </Reorder.Group>
              </div>
            </CardContent>
          </Card>

          {/* ── Work Experience ───────────────────────────────────────────── */}
          <Card className="bg-blue-500/10 border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center justify-between">
                Work Experience
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    appendWork({
                      position: "",
                      company: "",
                      startDate: "",
                      endDate: "",
                      description: "",
                      location: "onsite",
                      type: "full-time",
                      isCurrent: false,
                    })
                  }
                  className="group flex items-center bg-white border-gray-300"
                >
                  <Plus className="h-4 w-4 text-gray-900 group-hover:mr-2 transition-all shrink-0" />
                  <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-gray-900">
                    Add Experience
                  </span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {workFields.length === 0 ? (
                <p className="text-white/60 text-sm text-center py-4">
                  No work experience added yet. Click "Add Experience" to get
                  started.
                </p>
              ) : (
                workFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-white">
                        Experience {index + 1}
                      </h4>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeWork(index)}
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
                        name={`workExperience.${index}.location`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
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
                              defaultValue={field.value}
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
          <Card className="bg-blue-500/10 border-white/10">
            <CardHeader>
              <CardTitle className="text-xl text-white">Skills</CardTitle>
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
