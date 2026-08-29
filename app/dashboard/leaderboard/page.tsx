"use client";

import { useAction, useQuery } from "convex/react";
import { Loader2, Send, Sparkles, Star, StarHalf, Trophy } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { api } from "~/convex/_generated/api";

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState("engineers");

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
        {/* Left Side - Leaderboard */}
        <div className="w-full space-y-6 md:w-2/3">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-400" />
            <h1 className="text-3xl font-bold">Community Leaderboard</h1>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="engineers">Software Engineers</TabsTrigger>
              <TabsTrigger value="designers">UI/UX Designers</TabsTrigger>
            </TabsList>
            <TabsContent value="engineers" className="mt-6">
              <LeaderboardList titleName="Software Engineer" />
            </TabsContent>
            <TabsContent value="designers" className="mt-6">
              <LeaderboardList titleName="UI Designer" />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Side - AI Recruiter Chatbot */}
        <div className="w-full md:w-1/3">
          <AiRecruiterChatbot
            titleName={
              activeTab === "engineers" ? "Software Engineer" : "UI Designer"
            }
          />
        </div>
      </div>
    </div>
  );
}
type LeaderboardListProps = { titleName: string };
function LeaderboardList(props: LeaderboardListProps) {
  const { titleName } = props;

  const leaderboard = useQuery(api.leaderboard.getLeaderboard, { titleName });

  if (leaderboard === undefined) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <Card className="border-white/10 bg-white/5">
        <CardContent className="text-muted-foreground flex h-48 flex-col items-center justify-center">
          <p>No candidates found for {titleName}.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {leaderboard.map((profile) => (
        <Card
          key={profile._id}
          className="overflow-hidden border-white/10 bg-white/5 transition-all hover:bg-white/10"
        >
          <CardContent className="flex items-start gap-4 p-6">
            <div className="mt-1 flex-shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 font-bold text-blue-400">
                #{profile.ranking}
              </div>
            </div>

            <Avatar className="h-12 w-12 border-2 border-white/10">
              <AvatarImage src={profile.profileImage || ""} />
              <AvatarFallback>
                {profile.firstName[0]}
                {profile.lastName[0]}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between">
                <h3 className="truncate text-lg font-semibold">
                  {profile.firstName} {profile.lastName}
                  <span className="text-muted-foreground ml-2 text-sm font-normal">
                    @{profile.username}
                  </span>
                </h3>
                <Badge className={getBadgeColor(profile.badge)}>
                  {profile.badge}
                </Badge>
              </div>

              <p className="mb-3 line-clamp-2 text-sm text-white/70">
                {profile.shortBio || "No bio provided."}
              </p>

              <div className="mb-2 flex flex-wrap gap-2">
                {profile.resolvedSkills.slice(0, 5).map((skill) => (
                  <Badge
                    key={skill.name}
                    variant="outline"
                    className="bg-white/5 text-xs"
                  >
                    {skill.name}
                  </Badge>
                ))}
                {profile.resolvedSkills.length > 5 && (
                  <Badge variant="outline" className="bg-white/5 text-xs">
                    +{profile.resolvedSkills.length - 5} more
                  </Badge>
                )}
              </div>

              <div className="mt-2 flex items-center gap-1 text-xs text-white/50">
                <div className="flex items-center">
                  {Array.from(
                    { length: Math.floor(profile.stars || 0) },
                    (_, i) => i,
                  ).map((starIdx) => (
                    <Star
                      key={`full-${starIdx}`}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                  {(profile.stars || 0) % 1 !== 0 && (
                    <StarHalf className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  )}
                  {Array.from(
                    { length: 5 - Math.ceil(profile.stars || 0) },
                    (_, i) => i,
                  ).map((starIdx) => (
                    <Star
                      key={`empty-${starIdx}`}
                      className="h-4 w-4 text-gray-500"
                    />
                  ))}
                  <span className="ml-1.5 font-medium text-white/80">
                    {(profile.stars || 0).toFixed(1)}
                  </span>
                </div>
                {profile.resolvedExperiences.length > 0 && (
                  <span className="ml-2 flex items-center">
                    •{" "}
                    {profile.resolvedExperiences
                      .reduce((acc, curr) => acc + curr.durationYears, 0)
                      .toFixed(1)}{" "}
                    years exp
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
type AiRecruiterChatbotProps = { titleName: string };
function AiRecruiterChatbot(props: AiRecruiterChatbotProps) {
  const { titleName } = props;

  const [messages, setMessages] = useState<
    { role: "user" | "ai"; text: string; id: string }[]
  >([
    {
      role: "ai",
      text: `Hi! I'm your AI Recruiter. I can help you find the best ${titleName}s from our catalog. What are you looking for?`,
      id: "initial",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const leaderboard = useQuery(api.leaderboard.getLeaderboard, { titleName });
  const recommend = useAction(api.ai.recommendCandidates);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping || !leaderboard) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", text: userMessage, id: Date.now().toString() },
    ]);
    setIsTyping(true);

    try {
      // Call the AI action
      const response = await recommend({
        prompt: userMessage,
        catalog: leaderboard,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: response || "Sorry, I couldn't generate a recommendation.",
          id: (Date.now() + 1).toString(),
        },
      ]);
    } catch (_error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Sorry, I encountered an error while analyzing the catalog. Please try again or check if the Gemini API key is configured.",
          id: (Date.now() + 2).toString(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Card className="sticky top-8 flex h-[600px] flex-col border-blue-500/30 bg-[#1a1f2e] shadow-[0_0_15px_rgba(59,130,246,0.15)]">
      <CardHeader className="border-b border-white/10 bg-blue-500/5 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-white">
          <Sparkles className="h-5 w-5 text-blue-400" />
          AI Recruiter Matchmaker
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4 pr-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "rounded-tr-sm bg-blue-600 text-white"
                      : "prose prose-invert prose-sm rounded-tl-sm bg-white/10 text-white/90"
                  }`}
                >
                  {msg.role === "user" ? (
                    msg.text
                  ) : (
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-white/10 px-4 py-3 text-sm text-white/70">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing candidates...
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 bg-black/20 p-4">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              placeholder="e.g. I need a backend dev with Next.js..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="border-white/20 bg-white/5 focus-visible:ring-blue-500"
              disabled={isTyping}
            />
            <Button
              type="submit"
              size="icon"
              className="shrink-0 bg-blue-600 text-white hover:bg-blue-700"
              disabled={!input.trim() || isTyping}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

function getBadgeColor(badge: string) {
  switch (badge) {
    case "Gold":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
    case "Diamond":
      return "bg-cyan-500/20 text-cyan-400 border-cyan-500/50";
    case "Ruby":
      return "bg-red-500/20 text-red-400 border-red-500/50";
    case "Sapphire":
      return "bg-blue-500/20 text-blue-400 border-blue-500/50";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/50";
  }
}
