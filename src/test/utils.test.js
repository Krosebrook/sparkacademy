import { describe, it, expect } from 'vitest';
import { createPageUrl } from '../utils/index';

/**
 * Tests for createPageUrl utility function
 * 
 * Safe addition: Tests existing, working utility function without modification
 */
describe('createPageUrl', () => {
  it('should convert page name to lowercase URL', () => {
    expect(createPageUrl('Dashboard')).toBe('/dashboard');
    expect(createPageUrl('MyProfile')).toBe('/myprofile');
  });

  it('should replace spaces with hyphens', () => {
    expect(createPageUrl('My Courses')).toBe('/my-courses');
    expect(createPageUrl('Course Creator')).toBe('/course-creator');
    expect(createPageUrl('Student Analytics')).toBe('/student-analytics');
  });

  it('should handle single word page names', () => {
    expect(createPageUrl('Home')).toBe('/home');
    expect(createPageUrl('Profile')).toBe('/profile');
  });

  it('should handle already lowercase names', () => {
    expect(createPageUrl('dashboard')).toBe('/dashboard');
    expect(createPageUrl('settings')).toBe('/settings');
  });

  it('should handle empty strings', () => {
    expect(createPageUrl('')).toBe('/');
  });

  it('should handle names with multiple spaces', () => {
    expect(createPageUrl('My  Learning  Path')).toBe('/my--learning--path');
  });
});
