import { useState } from "react";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

const suggestedQuestions = [
  "What's the average ROI for desalination in MENA?",
  "Show me industrial reuse projects with payback under 3 years",
  "Which technologies work best for manufacturing?",
  "Compare leak detection vs smart metering investments",
];

export default function AskLaguna() {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (question?: string) => {
    const messageText = question || input;
    if (!messageText.trim()) return;

    // Add user message
    const userMessage = { role: "user" as const, content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Simulate AI response (in production, this would call the AI API)
    setTimeout(() => {
      const responses: Record<string, string> = {
        "desalination": "Based on our database, desalination projects in the MENA region show an average ROI of 14.2% with a confidence score of 85. Key projects include Sorek B in Israel (15% ROI, $1.5B investment) and Taweelah in UAE (12.8% ROI, $900M investment). The payback period averages 7.2 years. These projects typically serve municipal water needs and benefit from favorable regulatory environments.",
        "industrial reuse": "I found 8 industrial water reuse projects with payback periods under 3 years. Top performers include: Coca-Cola Rajasthan Water Recycling (35% ROI, 2.1 year payback, $12M investment), Singapore NEWater Industrial (22% ROI, 2.8 years, $200M), and Nestle Thailand Manufacturing Reuse (28% ROI, 2.4 years, $8M). These projects show strong returns due to reduced water costs and circular economy benefits.",
        "manufacturing": "For manufacturing applications, the top-performing technologies are: 1) Water Reuse Systems (avg 26% ROI) - best for high-volume users, 2) Smart Metering (18% ROI) - excellent for identifying waste, 3) Leak Detection (22% ROI) - quick wins with low capital requirements. Industrial reuse typically shows the highest returns when water costs are significant.",
        "leak detection": "Comparing leak detection vs smart metering: Leak Detection averages 22% ROI with 3.5 year payback, while Smart Metering shows 18% ROI with 4.2 year payback. Leak detection requires lower upfront investment ($2-5M typical) vs smart metering ($5-15M), but smart metering provides ongoing operational insights. For municipal water utilities, implementing both technologies sequentially often yields the best results.",
      };

      // Find matching response
      const lowerMessage = messageText.toLowerCase();
      let response = "I can help you analyze water investment performance. Try asking about specific technologies (desalination, reuse, leak detection), sectors (municipal, industrial), or regions. For example: 'What's the ROI for industrial water reuse projects?' or 'Compare desalination performance across regions.'";
      
      for (const [key, value] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) {
          response = value;
          break;
        }
      }

      const assistantMessage = { role: "assistant" as const, content: response };
      setMessages((prev) => [...prev, assistantMessage]);
      setLoading(false);
    }, 1500);
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container py-8 max-w-4xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              Ask Laguna
            </h1>
            <p className="text-muted-foreground">
              Get AI-powered insights from our water investment database
            </p>
          </div>

          {messages.length === 0 && (
            <Card className="p-6 mb-6">
              <h3 className="font-semibold mb-4">Suggested Questions</h3>
              <div className="grid gap-2 md:grid-cols-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto py-3 px-4 text-left"
                    onClick={() => handleSendMessage(question)}
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </Card>
          )}

          {/* Messages */}
          <div className="space-y-4 mb-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <Card
                  className={`max-w-[80%] p-4 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </Card>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <Card className="max-w-[80%] p-4 bg-muted">
                  <div className="flex items-center gap-2">
                    <div className="animate-bounce">●</div>
                    <div className="animate-bounce delay-100">●</div>
                    <div className="animate-bounce delay-200">●</div>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Input */}
          <Card className="p-4">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about water investments..."
                className="min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                size="icon"
                onClick={() => handleSendMessage()}
                disabled={loading || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
