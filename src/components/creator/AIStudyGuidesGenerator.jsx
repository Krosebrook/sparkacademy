import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Loader2, BookOpen, FileText, Lightbulb, Copy, Check } from 'lucide-react';

export default function AIStudyGuidesGenerator() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    module_title: '',
    module_content: ''
  });
  const [studyMaterials, setStudyMaterials] = useState(null);
  const [copiedCard, setCopiedCard] = useState(null);

  const generateStudyMaterials = async () => {
    if (!formData.module_title || !formData.module_content) {
      alert('Please fill in module title and content');
      return;
    }

    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateStudyGuides', formData);
      setStudyMaterials(data);
    } catch (error) {
      console.error('Error generating study materials:', error);
      alert('Failed to generate study materials');
    } finally {
      setLoading(false);
    }
  };

  const copyFlashcard = (card) => {
    const text = `Front: ${card.front}\nBack: ${card.back}${card.mnemonic ? `\nMemory Hook: ${card.mnemonic}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedCard(card.card_number);
    setTimeout(() => setCopiedCard(null), 2000);
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-400" />
          AI Study Guides & Flashcards Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-gray-300 mb-1 block">Module Title</label>
          <Input
            value={formData.module_title}
            onChange={(e) => setFormData(prev => ({ ...prev, module_title: e.target.value }))}
            placeholder="e.g., Introduction to Neural Networks"
            className="bg-[#1a0a2e]"
          />
        </div>

        <div>
          <label className="text-sm text-gray-300 mb-1 block">Module Content</label>
          <Textarea
            value={formData.module_content}
            onChange={(e) => setFormData(prev => ({ ...prev, module_content: e.target.value }))}
            placeholder="Paste the full module content, lessons, or key topics..."
            className="bg-[#1a0a2e] h-40"
          />
        </div>

        <Button onClick={generateStudyMaterials} disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <BookOpen className="w-4 h-4 mr-2" />}
          Generate Study Materials
        </Button>

        {loading && (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-400 animate-spin" />
            <p className="text-gray-400">Creating study guides and flashcards...</p>
          </div>
        )}

        {studyMaterials && (
          <Tabs defaultValue="guide" className="mt-6">
            <TabsList className="grid w-full grid-cols-3 bg-[#1a0a2e] border border-gray-700">
              <TabsTrigger value="guide">Study Guide</TabsTrigger>
              <TabsTrigger value="flashcards">Flashcards ({studyMaterials.flashcards?.length || 0})</TabsTrigger>
              <TabsTrigger value="tips">Study Tips</TabsTrigger>
            </TabsList>

            <TabsContent value="guide" className="space-y-4">
              {studyMaterials.study_guide && (
                <>
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      Key Concepts
                    </h4>
                    <ul className="space-y-2">
                      {studyMaterials.study_guide.key_concepts?.map((concept, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          <span>{concept}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-3">Main Takeaways</h4>
                    <ul className="space-y-2">
                      {studyMaterials.study_guide.main_takeaways?.map((takeaway, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-green-400 font-bold">{i + 1}.</span>
                          <span>{takeaway}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {studyMaterials.study_guide.definitions?.length > 0 && (
                    <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-3">Key Definitions</h4>
                      <div className="space-y-3">
                        {studyMaterials.study_guide.definitions.map((def, i) => (
                          <div key={i} className="border-l-2 border-purple-400 pl-3">
                            <div className="font-semibold text-purple-300 text-sm">{def.term}</div>
                            <div className="text-xs text-gray-300 mt-1">{def.definition}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {studyMaterials.study_guide.formulas_procedures?.length > 0 && (
                    <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-3">Formulas & Procedures</h4>
                      <div className="space-y-2">
                        {studyMaterials.study_guide.formulas_procedures.map((formula, i) => (
                          <div key={i} className="bg-gray-800/50 rounded p-2 text-sm text-cyan-300 font-mono">
                            {formula}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {studyMaterials.study_guide.quick_reference && (
                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-2">Quick Reference</h4>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">{studyMaterials.study_guide.quick_reference}</p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="flashcards" className="space-y-3">
              <div className="text-sm text-gray-400 mb-3">
                {studyMaterials.flashcards?.length || 0} flashcards for active recall practice
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {studyMaterials.flashcards?.map((card, idx) => (
                  <div key={idx} className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-4 relative group">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copyFlashcard(card)}
                    >
                      {copiedCard === card.card_number ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-blue-500/20 text-blue-300 text-xs">Card {card.card_number}</Badge>
                      <Badge className="bg-purple-500/20 text-purple-300 text-xs">{card.type}</Badge>
                      {card.difficulty && (
                        <Badge className="bg-yellow-500/20 text-yellow-300 text-xs">{card.difficulty}</Badge>
                      )}
                    </div>

                    <div className="mb-3">
                      <div className="text-xs text-gray-400 mb-1">Front:</div>
                      <div className="text-sm font-semibold text-white">{card.front}</div>
                    </div>

                    <div className="mb-3">
                      <div className="text-xs text-gray-400 mb-1">Back:</div>
                      <div className="text-sm text-gray-300">{card.back}</div>
                    </div>

                    {card.mnemonic && (
                      <div className="bg-yellow-900/10 border border-yellow-500/20 rounded p-2">
                        <div className="text-xs text-yellow-300">💡 {card.mnemonic}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tips" className="space-y-3">
              {studyMaterials.study_tips?.map((tip, idx) => (
                <div key={idx} className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-orange-400 mt-0.5" />
                    <div className="flex-1">
                      <Badge className="bg-orange-500/20 text-orange-300 text-xs mb-2">{tip.category}</Badge>
                      <p className="text-sm text-gray-300">{tip.tip}</p>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}