'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, Edit, Loader2, ChevronRight, AlertCircle, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface WorkExperience {
  company?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  description?: string;
}

interface ParsedResume {
  workExperience?: WorkExperience[];
  education?: any[];
  skills?: string[];
  name?: string;
  email?: string;
  phone?: string;
}

export default function ParseCvStep() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);

      // Get parsed resume data from localStorage
      const storedResume = localStorage.getItem('parsedResume');
      if (storedResume) {
        try {
          const resume: ParsedResume = JSON.parse(storedResume);
          setParsedResume(resume);

          // Set work experiences or create a default one
          if (resume.workExperience && resume.workExperience.length > 0) {
            setWorkExperiences(resume.workExperience);
          } else {
            // Create a default empty work experience
            setWorkExperiences([{
              company: '',
              position: '',
              startDate: '',
              endDate: '',
              location: '',
              description: ''
            }]);
          }
        } catch (err) {
          console.error('Error parsing resume data:', err);
          setError('Failed to load resume data. Please upload your CV again.');
        }
      } else {
        setError('No resume data found. Please upload your CV first.');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleEditExperience = (index: number, field: keyof WorkExperience, value: string) => {
    const updatedExperiences = [...workExperiences];
    updatedExperiences[index] = { ...updatedExperiences[index], [field]: value };
    setWorkExperiences(updatedExperiences);
  };

  const handleAddExperience = () => {
    const newExperience: WorkExperience = {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      location: '',
      description: ''
    };
    setWorkExperiences([...workExperiences, newExperience]);
    setEditingIndex(workExperiences.length); // Edit the new experience immediately
  };

  const handleRemoveExperience = (index: number) => {
    if (workExperiences.length > 1) {
      const updatedExperiences = workExperiences.filter((_, i) => i !== index);
      setWorkExperiences(updatedExperiences);
      // Reset editing index if we removed the currently editing experience
      if (editingIndex === index) {
        setEditingIndex(null);
      } else if (editingIndex !== null && editingIndex > index) {
        setEditingIndex(editingIndex - 1);
      }
    }
  };

  const handleSaveEdit = (index: number) => {
    setEditingIndex(null);
  };

  const handleCancelEdit = (index: number) => {
    // If this was a new experience (empty), remove it
    const experience = workExperiences[index];
    if (!experience.company && !experience.position && !experience.startDate && !experience.endDate) {
      handleRemoveExperience(index);
    }
    setEditingIndex(null);
  };

  const handleConfirmAndContinue = () => {
    // Validate that at least one experience has company and position
    const hasValidExperience = workExperiences.some(exp => exp.company && exp.position);

    if (!hasValidExperience) {
      setError('Please provide at least one work experience with company and position.');
      return;
    }

    // Filter out empty experiences
    const validExperiences = workExperiences.filter(exp => exp.company && exp.position);

    // Store the confirmed work experiences
    const updatedResume = { ...parsedResume, workExperience: validExperiences };
    localStorage.setItem('parsedResume', JSON.stringify(updatedResume));
    localStorage.setItem('confirmedWorkExperiences', JSON.stringify(validExperiences));

    // Check if email is available, if not redirect to email collection
    if (!updatedResume.email) {
      router.push('/tunnel/step3a-collect-email');
    } else {
      router.push('/tunnel/step4-add-employers');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 h-[60vh]">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
        <h2 className="text-2xl font-bold font-headline mb-2">Parsing your CV...</h2>
        <p className="text-muted-foreground max-w-xs">
          Our AI is extracting your work history and creating a structured format.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Card className="w-full max-w-md mx-auto border-none shadow-none">
          <CardContent className="pt-6">
            <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <p className="font-semibold text-destructive">Error</p>
              </div>
              <p className="text-sm text-destructive">{error}</p>
            </div>
            <Button
              onClick={() => router.push('/tunnel/step2-upload-cv')}
              className="w-full mt-4 rounded-full h-12 text-base font-semibold"
            >
              Go Back to Upload
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Card className="w-full max-w-md mx-auto border-none shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Confirm Your Experience</CardTitle>
          <CardDescription>
            Review and edit your work experience. We'll use this for verification.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {workExperiences.map((experience, index) => (
            <div key={index} className="p-4 border rounded-xl space-y-3">
              {editingIndex === index ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium">Edit Experience</Label>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSaveEdit(index)}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCancelEdit(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4 text-gray-600" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`position-${index}`} className="text-xs">Position *</Label>
                      <Input
                        id={`position-${index}`}
                        value={experience.position || ''}
                        onChange={(e) => handleEditExperience(index, 'position', e.target.value)}
                        placeholder="Software Engineer"
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`company-${index}`} className="text-xs">Company *</Label>
                      <Input
                        id={`company-${index}`}
                        value={experience.company || ''}
                        onChange={(e) => handleEditExperience(index, 'company', e.target.value)}
                        placeholder="Google"
                        className="h-9"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`start-${index}`} className="text-xs">Start Date</Label>
                      <Input
                        id={`start-${index}`}
                        value={experience.startDate || ''}
                        onChange={(e) => handleEditExperience(index, 'startDate', e.target.value)}
                        placeholder="Jan 2022"
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`end-${index}`} className="text-xs">End Date</Label>
                      <Input
                        id={`end-${index}`}
                        value={experience.endDate || ''}
                        onChange={(e) => handleEditExperience(index, 'endDate', e.target.value)}
                        placeholder="Dec 2023 or Present"
                        className="h-9"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`location-${index}`} className="text-xs">Location</Label>
                    <Input
                      id={`location-${index}`}
                      value={experience.location || ''}
                      onChange={(e) => handleEditExperience(index, 'location', e.target.value)}
                      placeholder="San Francisco, CA"
                      className="h-9"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`description-${index}`} className="text-xs">Description</Label>
                    <Textarea
                      id={`description-${index}`}
                      value={experience.description || ''}
                      onChange={(e) => handleEditExperience(index, 'description', e.target.value)}
                      placeholder="Brief description of your role and achievements..."
                      className="min-h-[60px]"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{experience.position || 'Position'}</h3>
                      <p className="text-sm text-muted-foreground">{experience.company || 'Company'}</p>
                      <p className="text-xs text-muted-foreground">
                        {experience.startDate && experience.endDate
                          ? `${experience.startDate} - ${experience.endDate}`
                          : (experience.startDate || experience.endDate || 'Dates not specified')}
                      </p>
                      {experience.location && (
                        <p className="text-xs text-muted-foreground">{experience.location}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingIndex(index)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {workExperiences.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveExperience(index)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {experience.description && (
                    <p className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                      {experience.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}

          <Button
            onClick={handleAddExperience}
            variant="outline"
            className="w-full rounded-full h-12 text-base font-semibold border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Experience
          </Button>

          {error && (
            <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}

          <Button
            onClick={handleConfirmAndContinue}
            className="w-full rounded-full h-12 text-base font-semibold bg-accent text-accent-foreground hover:bg-accent/90"
            disabled={editingIndex !== null}
          >
            Confirm & Continue
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            * Required fields • Make sure information is accurate for verification
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
