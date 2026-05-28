import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, X } from "lucide-react";

type ChatDialogProps = {
  conversationId: Id<"conversations">;
  profileId: Id<"profiles">;
  onClose: () => void;
};

export function ChatDialog({ conversationId, profileId, onClose }: ChatDialogProps) {
  const messages = useQuery(api.messages.getMessages, { conversationId });
  const sendMessage = useMutation(api.messages.sendMessage);
  const [text, setText] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await sendMessage({
        conversationId,
        senderId: profileId,
        text: text.trim(),
      });
      setText("");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-display font-semibold">Chat</h3>
        {onClose && (
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((m) => {
          const isMe = m.senderId === profileId;
          return (
            <div
              key={m._id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  isMe
                    ? "gradient-sunset text-white"
                    : "bg-secondary text-foreground"
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="border-t border-border p-4 flex gap-2">
        <Input
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="rounded-full"
        />
        <Button type="submit" size="icon" className="rounded-full gradient-sunset border-0 text-white shadow-glow">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
