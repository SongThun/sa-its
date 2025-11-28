import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import ModuleDialog from './ModuleDialog';
import LessonDialog from './LessonDialog';
import { modulesApi, lessonsApi, instructorCoursesApi } from '../../services/api';
import type { Module, Lesson } from '../../types';

export default function ModulesContent() {
  const { id: courseId } = useParams<{ id: string }>();

  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // Dialog states
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ module: Module; lesson: Lesson } | null>(null);
  const [targetModuleId, setTargetModuleId] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      loadModules();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const loadModules = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);
      const course = await instructorCoursesApi.getById(courseId);
      setModules(course.modules || []);
      // Expand first module by default
      if (course.modules && course.modules.length > 0) {
        setExpandedModules(new Set([course.modules[0].id]));
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to load modules');
      console.error('Error loading modules:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const handleAddModule = () => {
    setEditingModule(null);
    setModuleDialogOpen(true);
  };

  const handleEditModule = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (module) {
      setEditingModule(module);
      setModuleDialogOpen(true);
    }
  };

  const handleSaveModule = async (data: Partial<Module>) => {
    if (!courseId) return;

    try {
      if (editingModule) {
        // Update existing module
        const updated = await modulesApi.update(editingModule.id, {
          title: data.title!,
          description: data.description!,
          order: data.order!,
          estimated_duration: data.estimated_duration!,
        });
        setModules(modules.map(m => m.id === editingModule.id ? updated : m));
      } else {
        // Create new module
        const newModule = await modulesApi.create({
          course_id: courseId,
          title: data.title!,
          description: data.description!,
          order: data.order || modules.length + 1,
          estimated_duration: data.estimated_duration!,
        });
        setModules([...modules, newModule]);
      }
      setModuleDialogOpen(false);
    } catch (err) {
      console.error('Error saving module:', err);
      alert('Failed to save module');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!window.confirm('Are you sure you want to delete this module?')) {
      return;
    }

    try {
      await modulesApi.delete(moduleId);
      setModules(modules.filter(m => m.id !== moduleId));
    } catch (err) {
      console.error('Error deleting module:', err);
      alert('Failed to delete module');
    }
  };

  const handleToggleModulePublish = async (moduleId: string, currentStatus: boolean) => {
    try {
      const module = modules.find(m => m.id === moduleId);
      if (!module) return;

      const updated = await modulesApi.update(moduleId, {
        title: module.title,
        description: module.description,
        order: module.order,
        estimated_duration: module.estimated_duration,
        is_published: !currentStatus,
      });
      setModules(modules.map(m => m.id === moduleId ? { ...m, is_published: updated.is_published } : m));
    } catch (err) {
      console.error('Error toggling module publish status:', err);
      alert('Failed to update module');
    }
  };

  const handleAddLesson = (moduleId: string) => {
    setTargetModuleId(moduleId);
    setEditingLesson(null);
    setLessonDialogOpen(true);
  };

  const handleEditLesson = (moduleId: string, lessonId: string) => {
    const module = modules.find(m => m.id === moduleId);
    const lesson = module?.lessons?.find(l => l.id === lessonId);
    if (module && lesson) {
      setEditingLesson({ module, lesson });
      setTargetModuleId(moduleId);
      setLessonDialogOpen(true);
    }
  };

  const handleSaveLesson = async (data: Partial<Lesson>) => {
    if (!targetModuleId) return;

    try {
      if (editingLesson) {
        // Update existing lesson
        const updated = await lessonsApi.update(editingLesson.lesson.id, {
          module_id: targetModuleId,
          title: data.title!,
          content_type: data.content_type!,
          order: data.order!,
          estimated_duration: data.estimated_duration!,
          content: data.content,
        });

        setModules(modules.map(m => {
          if (m.id === targetModuleId && m.lessons) {
            return {
              ...m,
              lessons: m.lessons.map(l =>
                l.id === editingLesson.lesson.id ? updated : l
              ),
            };
          }
          return m;
        }));
      } else {
        // Create new lesson
        const newLesson = await lessonsApi.create({
          module_id: targetModuleId,
          title: data.title!,
          content_type: data.content_type!,
          order: data.order || 1,
          estimated_duration: data.estimated_duration!,
          content: data.content,
        });

        setModules(modules.map(m => {
          if (m.id === targetModuleId) {
            return {
              ...m,
              lessons: [...(m.lessons || []), newLesson],
              total_lessons: (m.total_lessons || 0) + 1,
            };
          }
          return m;
        }));
      }
      setLessonDialogOpen(false);
    } catch (err) {
      console.error('Error saving lesson:', err);
      alert('Failed to save lesson');
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) {
      return;
    }

    try {
      await lessonsApi.delete(lessonId);
      setModules(modules.map(m => {
        if (m.id === moduleId && m.lessons) {
          return {
            ...m,
            lessons: m.lessons.filter(l => l.id !== lessonId),
            total_lessons: (m.total_lessons || 0) - 1,
          };
        }
        return m;
      }));
    } catch (err) {
      console.error('Error deleting lesson:', err);
      alert('Failed to delete lesson');
    }
  };

  const handleToggleLessonPublish = async (moduleId: string, lessonId: string, currentStatus: boolean) => {
    try {
      const module = modules.find(m => m.id === moduleId);
      const lesson = module?.lessons?.find(l => l.id === lessonId);
      if (!lesson) return;

      const updated = await lessonsApi.update(lessonId, {
        module_id: moduleId,
        title: lesson.title,
        content_type: lesson.content_type,
        order: lesson.order,
        estimated_duration: lesson.estimated_duration,
        content: lesson.content,
        is_published: !currentStatus,
      });

      setModules(modules.map(m => {
        if (m.id === moduleId && m.lessons) {
          return {
            ...m,
            lessons: m.lessons.map(l => l.id === lessonId ? { ...l, is_published: updated.is_published } : l),
          };
        }
        return m;
      }));
    } catch (err) {
      console.error('Error toggling lesson publish status:', err);
      alert('Failed to update lesson');
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'primary';
      case 'text': return 'default';
      case 'interactive': return 'secondary';
      case 'quiz': return 'success';
      case 'document': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Course Content</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddModule}
        >
          Add Module
        </Button>
      </Box>

      {modules.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No modules yet
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Start building your course by adding modules and lessons
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddModule}
            >
              Add First Module
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {modules.map((module) => (
            <Card key={module.id}>
              <CardContent>
                {/* Module Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton size="small" sx={{ cursor: 'grab' }}>
                    <DragIcon />
                  </IconButton>

                  <IconButton onClick={() => toggleModule(module.id)}>
                    {expandedModules.has(module.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>

                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">
                      {module.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {module.estimated_duration} min • {module.total_lessons || 0} lessons
                    </Typography>
                  </Box>

                  <IconButton
                    size="small"
                    onClick={() => handleToggleModulePublish(module.id, module.is_published || false)}
                    sx={{
                      opacity: 0.7,
                      '&:hover': {
                        opacity: 1,
                      },
                    }}
                  >
                    {module.is_published ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                  <IconButton size="small" onClick={() => handleEditModule(module.id)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteModule(module.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                {/* Module Description */}
                {module.description && (
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1, ml: 7 }}>
                    {module.description}
                  </Typography>
                )}

                {/* Lessons List */}
                <Collapse in={expandedModules.has(module.id)} timeout="auto" unmountOnExit>
                  <Box sx={{ ml: 7, mt: 2 }}>
                    <Divider sx={{ mb: 2 }} />

                    {module.lessons && module.lessons.length > 0 ? (
                      <List disablePadding>
                        {module.lessons.map((lesson) => (
                          <ListItem
                            key={lesson.id}
                            sx={{
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                              mb: 1,
                              '&:hover': {
                                bgcolor: 'action.hover',
                              },
                            }}
                            secondaryAction={
                              <Box>
                                <IconButton
                                  size="small"
                                  onClick={() => handleToggleLessonPublish(module.id, lesson.id, lesson.is_published || false)}
                                  sx={{
                                    opacity: 0.7,
                                    '&:hover': {
                                      opacity: 1,
                                    },
                                  }}
                                >
                                  {lesson.is_published ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditLesson(module.id, lesson.id)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteLesson(module.id, lesson.id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            }
                          >
                            <IconButton size="small" sx={{ cursor: 'grab', mr: 1 }}>
                              <DragIcon fontSize="small" />
                            </IconButton>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body1">
                                    {lesson.title}
                                  </Typography>
                                  <Chip
                                    label={lesson.content_type}
                                    size="small"
                                    color={getContentTypeColor(lesson.content_type)}
                                  />
                                </Box>
                              }
                              secondary={`${lesson.estimated_duration} minutes`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        No lessons yet. Add your first lesson to this module.
                      </Typography>
                    )}

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => handleAddLesson(module.id)}
                      sx={{ mt: 1 }}
                    >
                      Add Lesson
                    </Button>
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          ))}

          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddModule}
            sx={{ alignSelf: 'flex-start' }}
          >
            Add Module
          </Button>
        </Box>
      )}

      {/* Dialogs */}
      <ModuleDialog
        open={moduleDialogOpen}
        module={editingModule}
        onClose={() => setModuleDialogOpen(false)}
        onSave={handleSaveModule}
      />

      <LessonDialog
        open={lessonDialogOpen}
        lesson={editingLesson?.lesson || null}
        moduleTitle={modules.find(m => m.id === targetModuleId)?.title}
        onClose={() => setLessonDialogOpen(false)}
        onSave={handleSaveLesson}
      />
    </Box>
  );
}
