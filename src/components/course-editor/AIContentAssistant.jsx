import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIContentAssistant({ content, onAccept, type = "lesson" }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [suggestion, setSuggestion] = useState("");

    const generateSuggestion = async () => {
        setIsGenerating(true);
        try {
            const prompts = {
                lesson: `Improve this lesson content to make it more engaging and educational:\n\n${content}\n\nProvide an enhanced version with better structure, examples, and clarity.`,
                quiz: `Improve this quiz question to make it clearer and more effective:\n\n${content}\n\nProvide an enhanced version with better wording and answer choices.`
            };

            const result = await base44.integrations.Core.InvokeLLM({
                prompt: prompts[type],
                response_json_schema: {
                    type: "object",
                    properties: {
                        improved_content: { type: "string" }
                    }
                }
            });

            setSuggestion(result.improved_content);
        } catch (error) {
            console.error("Error generating suggestion:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        generateSuggestion();
    };

    return (
        <>
            <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleOpen}
                className="border-violet-200 text-violet-600 hover:bg-violet-50"
            >
                <Sparkles className="h-4 w-4 mr-1" />
                AI Enhance
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-2xl"
                        >
                            <Card className="border-0 shadow-2xl">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-violet-600" />
                                            AI Suggestion
                                        </h3>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {isGenerating ? (
                                        <div className="py-12 text-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-violet-600 mx-auto mb-3" />
                                            <p className="text-slate-600">Generating enhanced content...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <Textarea
                                                value={suggestion}
                                                onChange={(e) => setSuggestion(e.target.value)}
                                                className="min-h-48 mb-4"
                                            />
                                            <div className="flex gap-3">
                                                <Button
                                                    onClick={() => {
                                                        onAccept(suggestion);
                                                        setIsOpen(false);
                                                    }}
                                                    className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600"
                                                >
                                                    <Check className="h-4 w-4 mr-2" />
                                                    Use This Content
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={generateSuggestion}
                                                    disabled={isGenerating}
                                                >
                                                    <Sparkles className="h-4 w-4 mr-2" />
                                                    Regenerate
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}