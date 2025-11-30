import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon, Delete as DeleteIcon } from '@mui/icons-material';
import ModulesContent from './ModulesContent';
import { instructorCoursesApi, categoriesApi } from '../../services/api';
import type { Category } from '../../types';

interface FormData {
  title: string;
  description: string;
  cover_image: string;
  est_duration: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category_id: number | '';
  is_published: boolean;
}

export default function CourseForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    cover_image: '',
    est_duration: 60,
    difficulty_level: 'beginner',
    category_id: '',
    is_published: false,
  });

  const loadData = async () => {
    try {
      // Load categories
      const categoriesData = await categoriesApi.getAll();
      setCategories(categoriesData);

      if (id) {
        const course = await instructorCoursesApi.getById(id);
        const category = categoriesData.find(c => c.name === course.category);
        setFormData({
          title: course.title,
          description: course.description,
          cover_image: course.cover_image || '',
          est_duration: course.est_duration,
          difficulty_level: course.difficulty_level,
          category_id: category?.id || '',
          is_published: course.is_published || false,
        });
      }
    } catch (err) {
      setError('Failed to load categories');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        cover_image: formData.cover_image || undefined,
        est_duration: formData.est_duration,
        difficulty_level: formData.difficulty_level,
        category_id: formData.category_id || undefined,
        is_published: formData.is_published,
      };

      if (isEditMode && id) {
        await instructorCoursesApi.update(id, submitData);
      } else {
        await instructorCoursesApi.create(submitData);
      }
      navigate('/instructor');
    } catch (err) {
      setError((err as Error).message || 'Failed to save course');
      console.error('Error saving course:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      await instructorCoursesApi.delete(id);
      navigate('/instructor');
    } catch (err) {
      setError((err as Error).message || 'Failed to delete course');
      console.error('Error deleting course:', err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {isEditMode ? 'Edit Course' : 'Create New Course'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Tabs - Only show in edit mode */}
        {isEditMode && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
              <Tab label="Course Info" />
              <Tab label="Modules & Content" />
            </Tabs>
          </Box>
        )}

        {/* Tab Content */}
        {activeTab === 0 && (
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Course Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            margin="normal"
            helperText="Enter a descriptive title for your course"
          />

          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            multiline
            rows={4}
            margin="normal"
            helperText="Provide a detailed description of what students will learn"
          />

          <TextField
            fullWidth
            label="Cover Image URL"
            value={formData.cover_image}
            onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
            margin="normal"
            helperText="Enter a URL for the course cover image"
          />

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Estimated Duration (minutes)"
                type="number"
                value={formData.est_duration}
                onChange={(e) => setFormData({ ...formData, est_duration: parseInt(e.target.value) || 0 })}
                required
                inputProps={{ min: 1 }}
                helperText="Total course duration in minutes"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Difficulty Level</InputLabel>
                <Select
                  value={formData.difficulty_level}
                  onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value as FormData['difficulty_level'] })}
                  label="Difficulty Level"
                  required
                >
                  <MenuItem value="beginner">Beginner</MenuItem>
                  <MenuItem value="intermediate">Intermediate</MenuItem>
                  <MenuItem value="advanced">Advanced</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value as number })}
              label="Category"
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Switch
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              />
            }
            label="Publish course"
            sx={{ mt: 3 }}
          />

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                startIcon={<SaveIcon />}
                disabled={saving || deleting}
              >
                {saving ? 'Saving...' : isEditMode ? 'Update Course' : 'Create Course'}
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<CancelIcon />}
                onClick={() => navigate('/instructor')}
                disabled={saving || deleting}
              >
                Cancel
              </Button>
            </Box>
            {isEditMode && (
              <Button
                variant="outlined"
                color="error"
                size="large"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
                disabled={saving || deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            )}
          </Box>
        </Box>
        )}

        {/* Modules & Content Tab */}
        {activeTab === 1 && isEditMode && (
          <ModulesContent />
        )}
      </Paper>
    </Container>
  );
}
