import { useState } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import ModuleDialog from './ModuleDialog';
import LessonDialog from './LessonDialog';
import type { Module, Lesson } from '../../types';

// Mock data for now
const mockModules: Module[] = [
  {
    id: '1',
    title: 'Getting Started',
    description: 'Introduction to the course',
    order: 1,
    estimated_duration: 45,
    total_lessons: 2,
    lessons: [
      {
        id: 'l1',
        title: 'Introduction',
        content_type: 'video',
        order: 1,
        estimated_duration: 15,
      },
      {
        id: 'l2',
        title: 'Setup Environment',
        content_type: 'text',
        order: 2,
        estimated_duration: 30,
      },
    ],
  },
  {
    id: '2',
    title: 'Core Concepts',
    description: 'Learn the fundamentals',
    order: 2,
    estimated_duration: 90,
    total_lessons: 3,
    lessons: [
      {
        id: 'l3',
        title: 'Components',
        content_type: 'video',
        order: 1,
        estimated_duration: 30,
      },
      {
        id: 'l4',
        title: 'State Management',
        content_type: 'interactive',
        order: 2,
        estimated_duration: 40,
      },
      {
        id: 'l5',
        title: 'Quiz',
        content_type: 'quiz',
        order: 3,
        estimated_duration: 20,
      },
    ],
  },
];

// interface ModulesContentProps {
//   courseId?: string;
// }

export default function ModulesContent() {
  const [modules, setModules] = useState<Module[]>(mockModules);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(['1']));

  // Dialog states
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ module: Module; lesson: Lesson } | null>(null);
  const [targetModuleId, setTargetModuleId] = useState<string | null>(null);

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

  const handleSaveModule = (data: Partial<Module>) => {
    if (editingModule) {
      // Update existing module
      setModules(modules.map(m =>
        m.id === editingModule.id ? { ...m, ...data } : m
      ));
    } else {
      // Create new module
      const newModule: Module = {
        id: Date.now().toString(),
        title: data.title || '',
        description: data.description || '',
        order: data.order || modules.length + 1,
        estimated_duration: data.estimated_duration || 60,
        total_lessons: 0,
        lessons: [],
      };
      setModules([...modules, newModule]);
    }
  };

  const handleDeleteModule = (moduleId: string) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      setModules(modules.filter(m => m.id !== moduleId));
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

  const handleSaveLesson = (data: Partial<Lesson>) => {
    if (editingLesson) {
      // Update existing lesson
      setModules(modules.map(m => {
        if (m.id === targetModuleId && m.lessons) {
          return {
            ...m,
            lessons: m.lessons.map(l =>
              l.id === editingLesson.lesson.id ? { ...l, ...data } : l
            ),
          };
        }
        return m;
      }));
    } else if (targetModuleId) {
      // Create new lesson
      const newLesson: Lesson = {
        id: Date.now().toString(),
        title: data.title || '',
        content_type: data.content_type || 'video',
        order: data.order || 1,
        estimated_duration: data.estimated_duration || 15,
        content: data.content,
      };
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
  };

  const handleDeleteLesson = (moduleId: string, lessonId: string) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
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
                      Module {module.order}: {module.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {module.estimated_duration} min • {module.total_lessons || 0} lessons
                    </Typography>
                  </Box>

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
                                    Lesson {lesson.order}: {lesson.title}
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
