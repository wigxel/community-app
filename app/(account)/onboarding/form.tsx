"use client";

import { useMutation, useQuery } from "convex/react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod/v4";
import {
  CheckUsername,
  type UsernameStatus,
} from "~/components/onboarding/check-username";
import { ImageUpload } from "~/components/profile/image-upload";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/convex/_generated/api";
import type { Id } from "~/convex/_generated/dataModel";
import { getErrorMessage } from "~/lib/error.helpers";

const _onboardingSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-z0-9_-]+$/, "Only lowercase letters, numbers, - and _ allowed"),
  profileImage: z.string().optional(),
  title: z.string().optional(),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
});

const COMMON_INTERESTS = [
  "Web Development",
  "Mobile Development",
  "Machine Learning",
  "Data Science",
  "UI/UX Design",
  "Cloud Computing",
  "DevOps",
  "Cybersecurity",
  "Blockchain",
  "Game Development",
  "Photography",
  "Writing",
  "Music",
  "Sports",
  "Travel",
  "Reading",
];
export type OnboardingFormProps = { redirectTo: string };
export default function OnboardingForm(props: OnboardingFormProps) {
  const { redirectTo } = props;

  const router = useRouter();
  const createProfile = useMutation(api.profiles.createProfile);
  const updateProfile = useMutation(api.profiles.updateProfile);
  const titles = useQuery(api.titles.listTitles) ?? [];

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    profileImage: "",
    title: "",
    interests: [] as string[],
  });
  const [customInterest, setCustomInterest] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");

  const handleNext = () => {
    setError("");

    if (step === 1) {
      if (!formData.firstName || formData.firstName.length < 2) {
        setError("First name must be at least 2 characters");
        return;
      }
      if (!formData.lastName || formData.lastName.length < 2) {
        setError("Last name must be at least 2 characters");
        return;
      }
      if (usernameStatus === "checking") {
        setError("Please wait while we check username availability");
        return;
      }
      if (usernameStatus !== "available") {
        setError("Please choose a valid and available username");
        return;
      }
    }

    if (step === 4) {
      if (formData.interests.length === 0) {
        setError("Select at least one interest");
        return;
      }
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    setError("");
    setStep(step - 1);
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const addCustomInterest = () => {
    if (
      customInterest.trim() &&
      !formData.interests.includes(customInterest.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, customInterest.trim()],
      }));
      setCustomInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }));
  };

  const handleSubmit = async () => {
    setError("");
    setIsPending(true);

    try {
      // Create basic profile first
      await createProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username.toLowerCase(),
      });

      // Update with additional details
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumbers: [],
        title: formData.title ? (formData.title as Id<"titles">) : null,
        profileImage: formData.profileImage || null,
        interests: formData.interests,
      });

      router.push(redirectTo);
    } catch (err) {
      setError(getErrorMessage(err) || "Profile creation failed");
      setIsPending(false);
    }
  };

  const progress = (step / 4) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-white/60">
          <span>Step {step} of 4</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="mb-1 text-xl font-semibold">Basic Information</h2>
            <p className="text-sm text-white/60">Tell us about yourself</p>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder="Jane"
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder="Doe"
              />
            </div>
          </div>

          <CheckUsername
            value={formData.username}
            onChange={(username) => setFormData({ ...formData, username })}
            onStatusChange={setUsernameStatus}
          />
        </div>
      )}

      {/* Step 2: Avatar Upload */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h2 className="mb-1 text-xl font-semibold">Profile Picture</h2>
            <p className="text-sm text-white/60">
              Upload your avatar (optional)
            </p>
          </div>

          <ImageUpload
            currentImage={formData.profileImage || null}
            onImageChange={(image) =>
              setFormData({ ...formData, profileImage: image })
            }
          />
        </div>
      )}

      {/* Step 3: Role Selection */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <h2 className="mb-1 text-xl font-semibold">Your Role</h2>
            <p className="text-sm text-white/60">
              What best describes you? (optional)
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Select Role</Label>
            <Select
              value={formData.title}
              onValueChange={(value) =>
                setFormData({ ...formData, title: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a role" />
              </SelectTrigger>
              <SelectContent>
                {titles.map((title) => (
                  <SelectItem key={title._id} value={title._id}>
                    {title.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Step 4: Interests */}
      {step === 4 && (
        <div className="space-y-5">
          <div>
            <h2 className="mb-1 text-xl font-semibold">Your Interests</h2>
            <p className="text-sm text-white/60">
              Select at least one interest
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {COMMON_INTERESTS.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  formData.interests.includes(interest)
                    ? "bg-blue-500 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {interest}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="customInterest">Add Custom Interest</Label>
            <div className="flex gap-2">
              <Input
                id="customInterest"
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomInterest();
                  }
                }}
                placeholder="e.g., Cooking, Gardening"
              />
              <Button
                type="button"
                onClick={addCustomInterest}
                variant="outline"
                className="border-white/30 bg-white/10 !text-white hover:bg-white/20"
              >
                Add
              </Button>
            </div>
          </div>

          {formData.interests.length > 0 && (
            <div>
              <Label className="mb-2 block">
                Selected Interests ({formData.interests.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {formData.interests.map((interest) => (
                  <div
                    key={interest}
                    className="flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/20 px-3 py-1.5 text-sm text-blue-300"
                  >
                    <span>{interest}</span>
                    <button
                      type="button"
                      onClick={() => removeInterest(interest)}
                      className="hover:text-blue-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        {step > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={isPending}
            className="flex-1 border-white/30 bg-white/10 !text-white hover:bg-white/20"
          >
            Back
          </Button>
        )}
        {step < 4 ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={step === 1 && usernameStatus !== "available"}
            className="flex-1 bg-blue-600 !text-white hover:bg-blue-700"
          >
            Next
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="flex-1 bg-blue-600 !text-white hover:bg-blue-700"
          >
            {isPending ? "Creating Profile..." : "Complete Setup"}
          </Button>
        )}
      </div>
    </div>
  );
}
