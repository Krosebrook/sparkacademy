import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Eraser, Square, Circle, Type, Save, Share2, Download, Trash2, Users } from 'lucide-react';

export default function Whiteboard() {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [whiteboards, setWhiteboards] = useState([]);
  const [currentWhiteboard, setCurrentWhiteboard] = useState(null);
  const [title, setTitle] = useState('Untitled Whiteboard');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [tool, setTool] = useState('pencil');
  const [color, setColor] = useState('#000000');
  const [isDrawing, setIsDrawing] = useState(false);
  
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineWidth = 2;
      ctxRef.current = ctx;
    }
  }, []);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const userCourses = await base44.entities.Course.filter({ created_by: userData.email });
      setCourses(userCourses);

      const userWhiteboards = await base44.entities.Whiteboard.filter({ creator_email: userData.email });
      setWhiteboards(userWhiteboards);
    } catch (error) {
      console.error('Error loading whiteboard data:', error);
    }
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const { offsetX, offsetY } = e.nativeEvent;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    
    ctxRef.current.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctxRef.current.lineWidth = tool === 'eraser' ? 20 : 2;
    
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveWhiteboard = async () => {
    try {
      const canvas = canvasRef.current;
      const dataURL = canvas.toDataURL();

      if (currentWhiteboard) {
        await base44.entities.Whiteboard.update(currentWhiteboard.id, {
          title,
          canvas_data: { dataURL },
          last_modified: new Date().toISOString()
        });
        alert('Whiteboard saved!');
      } else {
        const newWhiteboard = await base44.entities.Whiteboard.create({
          title,
          course_id: selectedCourse,
          creator_email: user.email,
          canvas_data: { dataURL },
          is_public: false,
          last_modified: new Date().toISOString()
        });
        setCurrentWhiteboard(newWhiteboard);
        alert('Whiteboard created!');
      }
      
      loadData();
    } catch (error) {
      console.error('Error saving whiteboard:', error);
      alert('Failed to save whiteboard');
    }
  };

  const loadWhiteboard = async (whiteboard) => {
    setCurrentWhiteboard(whiteboard);
    setTitle(whiteboard.title);
    setSelectedCourse(whiteboard.course_id);

    if (whiteboard.canvas_data?.dataURL) {
      const img = new Image();
      img.onload = () => {
        ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctxRef.current.drawImage(img, 0, 0);
      };
      img.src = whiteboard.canvas_data.dataURL;
    }
  };

  const downloadWhiteboard = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${title}.png`;
    link.href = dataURL;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-4 md:p-8">
        <header className="mb-6 max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Pencil className="w-8 h-8 text-blue-500" />
            Collaborative Whiteboard
          </h1>
          <p className="text-slate-600 mt-2">
            Visualize ideas and collaborate in real-time
          </p>
        </header>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-sm">Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Whiteboard title"
                />

                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Link to course (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-700">Tools</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={tool === 'pencil' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTool('pencil')}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={tool === 'eraser' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTool('eraser')}
                    >
                      <Eraser className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {tool !== 'eraser' && (
                  <div>
                    <p className="text-xs font-medium text-slate-700 mb-2">Color</p>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full h-10 rounded cursor-pointer"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Button onClick={saveWhiteboard} className="w-full" size="sm">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={downloadWhiteboard} variant="outline" className="w-full" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button onClick={clearCanvas} variant="outline" className="w-full" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-sm">Your Whiteboards</CardTitle>
              </CardHeader>
              <CardContent>
                {whiteboards.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No whiteboards yet</p>
                ) : (
                  <div className="space-y-2">
                    {whiteboards.map(wb => (
                      <button
                        key={wb.id}
                        onClick={() => loadWhiteboard(wb)}
                        className="w-full text-left p-2 rounded hover:bg-slate-100 transition-colors"
                      >
                        <p className="text-sm font-medium text-slate-800">{wb.title}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(wb.last_modified).toLocaleDateString()}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Canvas */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-0">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="w-full cursor-crosshair bg-white rounded-lg"
                  style={{ height: '600px' }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}