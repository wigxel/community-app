import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import sharp from "sharp";
import { api } from "~/convex/_generated/api";
import { fetchAuthQuery } from "~/lib/auth-server";

import type { Profile } from "~/types/models";

export const runtime = "nodejs";

// Supported image formats by @vercel/og
const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
];

async function isImageLoadable(url: string): Promise<boolean> {
  try {
    // First try HEAD request to check content-type
    const headResponse = await fetch(url, { method: "HEAD" });
    if (headResponse.ok) {
      const contentType = headResponse.headers.get("content-type");
      if (contentType) {
        const normalizedType = contentType.toLowerCase().split(";")[0];
        if (SUPPORTED_IMAGE_TYPES.includes(normalizedType)) {
          return true;
        }
        // If we got a content-type that's not supported, don't proceed
        if (normalizedType.startsWith("image/")) {
          return false;
        }
      }
    }

    // If HEAD doesn't give us a clear answer, fetch first few bytes to check magic numbers
    const blobResponse = await fetch(url, {
      headers: { range: "bytes=0-1024" },
    });

    if (!blobResponse.ok) {
      return false;
    }

    const buffer = await blobResponse.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Check magic numbers for common image formats
    // PNG: 89 50 4E 47
    if (
      uint8Array[0] === 0x89 &&
      uint8Array[1] === 0x50 &&
      uint8Array[2] === 0x4e &&
      uint8Array[3] === 0x47
    ) {
      return true;
    }
    // JPEG: FF D8
    if (uint8Array[0] === 0xff && uint8Array[1] === 0xd8) {
      return true;
    }
    // GIF: 47 49 46
    if (
      uint8Array[0] === 0x47 &&
      uint8Array[1] === 0x49 &&
      uint8Array[2] === 0x46
    ) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Failed to check image loadability:", error);
    return false;
  }
}

async function pngToWebp(arrayBuffer: ArrayBuffer) {
  const buffer = Buffer.from(arrayBuffer);

  return await sharp(buffer).webp({ quality: 80 }).toBuffer();
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;

  const image = await generateImage({
    username,
  });

  const optimized_image = await pngToWebp(await image.arrayBuffer());

  return new Response(optimized_image, {
    status: 200,
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, immutable, no-transform, max-age=31536000",
    },
  });
}

async function generateImage({ username }: { username: string }) {
  try {
    const profile = await fetchAuthQuery(api.profiles.getProfileByUsername, {
      username,
    }).catch(() => null);

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

    // Check if the image is loadable by actually testing it
    let hasValidImage = false;

    if (profile.profileImage && profile.profileImage !== "/file.svg") {
      hasValidImage = await isImageLoadable(profile.profileImage);
    }

    return new ImageResponse(
      <OGImageComponent profile={profile} hasValidImage={hasValidImage} />,
      {
        width: 1200,
        height: 630,
      },
    );
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

function OGImageComponent({
  profile,
  hasValidImage,
}: {
  profile: Profile;
  hasValidImage: boolean;
}) {
  const fullName = `${profile.firstName ?? ""} ${profile.lastName ?? ""}`;
  const initials = `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`;

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
        {hasValidImage ? (
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
          <InitialsAvatar initials={initials} />
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

function InitialsAvatar({ initials }: { initials: string }) {
  return (
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
      {initials || "?"}
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
