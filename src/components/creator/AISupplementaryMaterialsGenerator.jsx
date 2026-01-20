import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { Loader2, FileText, Copy, Check, Download } from 'lucide-react';

export default function AISupplementaryMaterialsGenerator() {
  const [loading, setLoading] = useState(false);
  const [courseContent, setCourseContent] = useState('');
  const [materials, setMaterials] = useState(null);
  const [copiedType, setCopiedType] = useState(null);

  const generate = async () => {
    if (!courseContent.trim()) {
      alert('Please enter course content or key topics');
      return;
    }

    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateSupplementaryMaterials', {
        course_content: courseContent.trim()
      });
      
      if (data) {
        setMaterials(data);
      }
    } catch (error) {
      console.error('Materials generation error:', error);
      alert('Failed to generate materials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyContent = (type) => {
    let text = '';
    if (type === 'cheatsheet') {
      text = formatCheatSheet(materials.cheat_sheet);
    } else if (type === 'glossary') {
      text = formatGlossary(materials.glossary);
    }
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const downloadContent = (type) => {
    let text = '';
    let filename = '';
    
    if (type === 'cheatsheet') {
      text = formatCheatSheet(materials.cheat_sheet);
      filename = 'cheat_sheet.txt';
    } else if (type === 'glossary') {
      text = formatGlossary(materials.glossary);
      filename = 'glossary.txt';
    }
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  const formatCheatSheet = (sheet) => {
    if (!sheet) return '';
    let text = `${sheet.title}\n${'='.repeat(sheet.title.length)}\n\n`;
    sheet.sections?.forEach(section => {
      text += `${section.category}\n${'-'.repeat(section.category.length)}\n`;
      section.items?.forEach(item => {
        text += `• ${item.term}: ${item.explanation}\n`;
        if (item.example) text += `  Example: ${item.example}\n`;
      });
      text += '\n';
    });
    return text;
  };

  const formatGlossary = (glossary) => {
    if (!glossary) return '';
    let text = `GLOSSARY\n${'='.repeat(8)}\n\n`;
    glossary.terms?.forEach(term => {
      text += `${term.term}\n`;
      text += `  ${term.definition}\n`;
      if (term.example) text += `  Example: ${term.example}\n`;
      if (term.related_terms?.length > 0) {
        text += `  Related: ${term.related_terms.join(', ')}\n`;
      }
      text += '\n';
    });
    return text;
  };

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-green-400" />
          Supplementary Materials Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-300 mb-1 block">Course Content / Key Topics</label>
            <Textarea
              value={courseContent}
              onChange={(e) => setCourseContent(e.target.value)}
              placeholder="Paste your course outline, lesson topics, or key concepts here..."
              className="bg-[#1a0a2e] h-32"
            />
          </div>

          <Button onClick={generate} disabled={loading} className="w-full btn-primary">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
            Generate Cheat Sheet & Glossary
          </Button>
        </div>

        {materials && (
          <div className="border-t border-gray-700 pt-4">
            <Tabs defaultValue="cheatsheet" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 bg-[#1a0a2e] border border-gray-700">
                <TabsTrigger value="cheatsheet">Cheat Sheet</TabsTrigger>
                <TabsTrigger value="glossary">Glossary</TabsTrigger>
              </TabsList>

              <TabsContent value="cheatsheet" className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-500/20 text-blue-300">
                    {materials.cheat_sheet?.sections?.reduce((sum, s) => sum + s.items.length, 0) || 0} items
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => copyContent('cheatsheet')}>
                      {copiedType === 'cheatsheet' ? <><Check className="w-3 h-3 mr-1" /> Copied!</> : <><Copy className="w-3 h-3 mr-1" /> Copy</>}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => downloadContent('cheatsheet')}>
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <h3 className="font-semibold text-white text-lg mb-3">{materials.cheat_sheet?.title}</h3>
                  <div className="space-y-4">
                    {materials.cheat_sheet?.sections?.map((section, idx) => (
                      <div key={idx}>
                        <h4 className="font-semibold text-cyan-300 text-sm mb-2">{section.category}</h4>
                        <div className="space-y-2">
                          {section.items?.map((item, i) => (
                            <div key={i} className="bg-gray-800/50 rounded p-2">
                              <div className="text-sm text-white font-medium">{item.term}</div>
                              <div className="text-xs text-gray-400 mt-1">{item.explanation}</div>
                              {item.example && (
                                <div className="text-xs text-green-300 mt-1 font-mono bg-gray-900/50 p-1 rounded">
                                  {item.example}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="glossary" className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-purple-500/20 text-purple-300">
                    {materials.glossary?.terms?.length || 0} terms
                  </Badge>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => copyContent('glossary')}>
                      {copiedType === 'glossary' ? <><Check className="w-3 h-3 mr-1" /> Copied!</> : <><Copy className="w-3 h-3 mr-1" /> Copy</>}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => downloadContent('glossary')}>
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 max-h-[500px] overflow-y-auto">
                  <div className="space-y-3">
                    {materials.glossary?.terms?.map((term, idx) => (
                      <div key={idx} className="pb-3 border-b border-purple-500/20 last:border-0">
                        <h4 className="font-semibold text-white text-sm mb-1">{term.term}</h4>
                        <p className="text-xs text-gray-300 mb-2">{term.definition}</p>
                        {term.example && (
                          <div className="text-xs text-green-300 mb-1 bg-gray-900/50 p-2 rounded">
                            Example: {term.example}
                          </div>
                        )}
                        {term.related_terms?.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {term.related_terms.map((rel, i) => (
                              <Badge key={i} variant="outline" className="text-xs">{rel}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}