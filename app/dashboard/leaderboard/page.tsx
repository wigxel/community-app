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
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        {/* Left Side - Leaderboard */}
        <div className="w-full md:w-2/3 space-y-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
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

function LeaderboardList({ titleName }: { titleName: string }) {
  const leaderboard = useQuery(api.leaderboard.getLeaderboard, { titleName });

  if (leaderboard === undefined) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
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
          className="bg-white/5 border-white/10 overflow-hidden transition-all hover:bg-white/10"
        >
          <CardContent className="p-6 flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center font-bold text-blue-400">
                #{profile.ranking}
              </div>
            </div>

            <Avatar className="w-12 h-12 border-2 border-white/10">
              <AvatarImage src={profile.profileImage || ""} />
              <AvatarFallback>
                {profile.firstName[0]}
                {profile.lastName[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-semibold truncate">
                  {profile.firstName} {profile.lastName}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    @{profile.username}
                  </span>
                </h3>
                <Badge className={getBadgeColor(profile.badge)}>
                  {profile.badge}
                </Badge>
              </div>

              <p className="text-sm text-white/70 line-clamp-2 mb-3">
                {profile.shortBio || "No bio provided."}
              </p>

              <div className="flex flex-wrap gap-2 mb-2">
                {profile.resolvedSkills.slice(0, 5).map((skill) => (
                  <Badge
                    key={skill.name}
                    variant="outline"
                    className="text-xs bg-white/5"
                  >
                    {skill.name}
                  </Badge>
                ))}
                {profile.resolvedSkills.length > 5 && (
                  <Badge variant="outline" className="text-xs bg-white/5">
                    +{profile.resolvedSkills.length - 5} more
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs text-white/50 mt-2">
                <div className="flex items-center">
                  {Array.from(
                    { length: Math.floor(profile.stars || 0) },
                    (_, i) => i,
                  ).map((starIdx) => (
                    <Star
                      key={`full-${starIdx}`}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                  {(profile.stars || 0) % 1 !== 0 && (
                    <StarHalf className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  )}
                  {Array.from(
                    { length: 5 - Math.ceil(profile.stars || 0) },
                    (_, i) => i,
                  ).map((starIdx) => (
                    <Star
                      key={`empty-${starIdx}`}
                      className="w-4 h-4 text-gray-500"
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

function AiRecruiterChatbot({ titleName }: { titleName: string }) {
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
    <Card className="bg-[#1a1f2e] border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] flex flex-col h-[600px] sticky top-8">
      <CardHeader className="border-b border-white/10 pb-4 bg-blue-500/5">
        <CardTitle className="text-lg flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5 text-blue-400" />
          AI Recruiter Matchmaker
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4 pr-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : "bg-white/10 text-white/90 rounded-tl-sm prose prose-invert prose-sm"
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
                <div className="bg-white/10 text-white/70 rounded-2xl rounded-tl-sm px-4 py-3 text-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing candidates...
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-black/20">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              placeholder="e.g. I need a backend dev with Next.js..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="bg-white/5 border-white/20 focus-visible:ring-blue-500"
              disabled={isTyping}
            />
            <Button
              type="submit"
              size="icon"
              className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
              disabled={!input.trim() || isTyping}
            >
              <Send className="w-4 h-4" />
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
