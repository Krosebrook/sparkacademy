
import React, { useState, useEffect, useCallback } from "react";
import { Course } from "@/entities/Course";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  PlusCircle,
  BookOpen, // Added BookOpen
  LayoutGrid,
  List,
  Search // Added Search
} from 'lucide-react';
import { Input } from "@/components/ui/input"; // Added Input component import
import MyCourseCard from "../components/my-courses/MyCourseCard"; // Changed from CourseCard to MyCourseCard
import MyCourseRow from "../components/my-courses/MyCourseRow"; // Changed from CourseRow to MyCourseRow

export default function MyCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term

  const loadUserAndCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);
      const userCourses = await Course.filter({ created_by: userData.email }, "-created_date");
      setCourses(userCourses);
    } catch (error) {
      console.error("Failed to load user or courses:", error);
      navigate(createPageUrl("Dashboard")); // Redirect if user data fails or not authorized
    }
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    loadUserAndCourses();
  }, [loadUserAndCourses]);

  // Renamed and updated logic as per outline for status change
  const handleStatusChange = async (courseId, isPublished) => {
    try {
      await Course.update(courseId, { is_published: isPublished });
      setCourses(courses.map(c => c.id === courseId ? { ...c, is_published: isPublished } : c));
    } catch (error) {
      console.error("Failed to update course status:", error);
    }
  };

  // Renamed and preserved original logic for delete
  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      try {
        await Course.delete(courseId);
        setCourses(courses.filter(c => c.id !== courseId));
      } catch (error) {
        console.error("Failed to delete course:", error);
      }
    }
  };
  
  // Filter courses based on search term
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // The CourseList and EmptyState components are removed as their logic is inlined or replaced.
  // The Tabs component and its related content are also removed.

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50"> {/* Updated background */}
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto"> {/* Updated padding */}
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 md:mb-8"> {/* Updated layout */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">My Courses</h1> {/* Updated text size */}
            <p className="text-slate-600 mt-1">Manage, edit, and track your course performance.</p> {/* Updated text */}
          </div>
          <Link to={createPageUrl("CourseCreator")}>
            <Button className="w-full md:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg"> {/* Updated button styles */}
              <PlusCircle className="w-4 h-4 mr-2" />
              Create New Course
            </Button>
          </Link>
        </div>

        {/* Search and View Toggles */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search your courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2 p-1 bg-slate-200 rounded-lg"> {/* Updated styles */}
            <Button
              size="sm" // Updated size
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'bg-white text-slate-800 shadow' : 'text-slate-600'} // Updated conditional classes
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Grid
            </Button>
            <Button
              size="sm" // Updated size
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-white text-slate-800 shadow' : 'text-slate-600'} // Updated conditional classes
            >
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-slate-500">Loading courses...</div>
        ) : filteredCourses.length === 0 ? (
          // New empty state for when no courses are found (either initially or after search)
          <div className="text-center py-16 border-2 border-dashed rounded-lg bg-white/50">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700">
              {searchTerm ? `No courses found for "${searchTerm}"` : "No courses created yet"}
            </h3>
            <p className="text-slate-500 mt-2 mb-4">
              {searchTerm ? "Try adjusting your search or create a new course." : "Ready to share your knowledge? Create your first course now."}
            </p>
            <Link to={createPageUrl("CourseCreator")}>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500">
                <PlusCircle className="w-4 h-4 mr-2" />
                Create a Course
              </Button>
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredCourses.map(course => (
              <MyCourseCard key={course.id} course={course} onStatusChange={handleStatusChange} onDelete={handleDeleteCourse} />
            ))}
          </div>
        ) : ( // List view
          <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-lg overflow-hidden border">
            {filteredCourses.map(course => (
              <MyCourseRow key={course.id} course={course} onStatusChange={handleStatusChange} onDelete={handleDeleteCourse} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
