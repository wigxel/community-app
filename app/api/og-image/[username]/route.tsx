import { fetchQuery } from "convex/nextjs";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { api } from "~/convex/_generated/api";

import type { Profile } from "~/types/models";

export const runtime = "edge";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;

  try {
    const profile = await fetchQuery(api.profiles.getProfileByUsername, {
      username,
    });

    if (!profile) {
      return new ImageResponse(
        (
          <div style={errorContainerStyle}>
            <div style={whiteCardStyle}>
              <h1 style={errorTitleStyle}>Profile Not Found</h1>
              <p style={errorTextStyle}>@{username}</p>
            </div>
            <div style={footerStyle}>
              <span>Wigxel</span>
              <span>Community</span>
            </div>
          </div>
        ),
        { width: 1200, height: 630 },
      );
    }

    return new ImageResponse(<OGImageComponent profile={profile} />, {
      width: 1200,
      height: 630,
    });
  } catch (error) {
    console.error("OG Image generation failed:", error);

    return new ImageResponse(
      (
        <div style={errorContainerStyle}>
          <div style={whiteCardStyle}>
            <h1 style={errorTitleStyle}>Wigxel Community</h1>
            <p style={errorTextStyle}>Profile unavailable</p>
          </div>
          <div style={footerStyle}>
            <span>Wigxel</span>
            <span>Community</span>
          </div>
        </div>
      ),
      { width: 1200, height: 630 },
    );
  }
}

function OGImageComponent({ profile }: { profile: Profile }) {
  const fullName = `${profile.firstName ?? ""} ${profile.lastName ?? ""}`;
  const hasImage = profile.profileImage && profile.profileImage !== "/file.svg";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #3b82f6 0%, #3b82f6 100%)",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto',
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
        }}
      >
        <svg
          width="100%"
          height="100%"
          style={{ opacity: 0.08 }}
          role="img"
          aria-label="Background pattern"
        >
          <title>Background Pattern</title>
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(255,255,255,0.95)",
          borderRadius: 48,
          padding: "60px 80px",
          maxWidth: "80%",
          textAlign: "center",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        {hasImage ? (
          <img
            src={profile.profileImage ?? ""}
            alt={`${fullName}`}
            width={160}
            height={160}
            style={{
              borderRadius: "50%",
              border: "5px solid #3b82f6",
              marginBottom: 30,
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 64,
              fontWeight: "bold",
              color: "white",
              marginBottom: 30,
            }}
          >
            {`${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`}
          </div>
        )}

        <div
          style={{
            display: "flex",
            fontSize: 48,
            fontWeight: 700,
            color: "#1a202c",
            marginBottom: 10,
          }}
        >
          {fullName}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#3b82f6",
            marginBottom: 20,
          }}
        >
          @{profile.username}
        </div>

        {profile.title?.name && (
          <div
            style={{
              display: "flex",
              background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              color: "white",
              padding: "8px 24px",
              borderRadius: 999,
              fontSize: 18,
            }}
          >
            {profile.title.name}
          </div>
        )}

        {profile.shortBio && (
          <div
            style={{
              display: "flex",
              marginTop: 30,
              fontSize: 20,
              color: "#4a5568",
              maxWidth: "80%",
              lineHeight: 1.4,
            }}
          >
            {profile.shortBio.length > 120
              ? `${profile.shortBio.slice(0, 117)}...`
              : profile.shortBio}
          </div>
        )}
      </div>

      <div style={footerStyle}>
        <span>Wigxel</span>
        <span>Community</span>
      </div>
    </div>
  );
}

const errorContainerStyle = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #3b82f6 0%, #3b82f6 100%)",
  position: "relative",
} as const;

const whiteCardStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255,255,255,0.95)",
  borderRadius: 48,
  padding: "60px 80px",
  maxWidth: "80%",
  textAlign: "center",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
} as const;

const errorTitleStyle = {
  display: "flex",
  fontSize: 48,
  fontWeight: 700,
  marginBottom: 20,
  color: "#1a202c",
} as const;

const errorTextStyle = {
  display: "flex",
  fontSize: 24,
  color: "#3b82f6",
  opacity: 0.9,
} as const;

const footerStyle = {
  display: "flex",
  position: "absolute",
  bottom: 20,
  right: 30,
  fontSize: 14,
  color: "rgba(255,255,255,0.7)",
  gap: 6,
} as const;
