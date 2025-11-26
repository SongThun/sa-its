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
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { instructorCoursesApi, categoriesApi, topicsApi } from '../../services/api';
import type { Category, Topic, CourseFormData } from '../../types';

export default function CourseForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    thumbnail: '',
    duration: '',
    level: 'beginner',
    category: '',
    topic_ids: [],
    is_published: false,
  });

  const loadData = async () => {
    try {
      // Load categories and topics
      const [categoriesData, topicsData] = await Promise.all([
        categoriesApi.getAll(),
        topicsApi.getAll(),
      ]);

      setCategories(categoriesData);
      setTopics(topicsData);

      // Load course if editing
      if (id) {
        const course = await instructorCoursesApi.getById(id);
        setFormData({
          title: course.title,
          description: course.description,
          thumbnail: course.thumbnail,
          duration: course.duration,
          level: course.level,
          category: course.category,
          topic_ids: Array.isArray(course.topics)
            ? course.topics.map(t => typeof t === 'string' ? t : t.id)
            : [],
          is_published: course.is_published,
        });
      }
    } catch (err) {
      setError('Failed to load data');
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
      if (isEditMode && id) {
        await instructorCoursesApi.update(id, formData);
      } else {
        await instructorCoursesApi.create(formData);
      }
      navigate('/instructor/dashboard');
    } catch (err) {
      setError((err as Error).message || 'Failed to save course');
      console.error('Error saving course:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleTopicToggle = (topicId: string) => {
    setFormData(prev => ({
      ...prev,
      topic_ids: prev.topic_ids.includes(topicId)
        ? prev.topic_ids.filter(id => id !== topicId)
        : [...prev.topic_ids, topicId],
    }));
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {isEditMode ? 'Edit Course' : 'Create New Course'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

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
            label="Thumbnail URL"
            value={formData.thumbnail}
            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
            margin="normal"
            helperText="Enter a URL for the course thumbnail image"
          />

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                required
                placeholder="e.g., 10 hours"
                helperText="Estimated course duration"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Level</InputLabel>
                <Select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
                  label="Level"
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
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              label="Category"
              required
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Topics (Select all that apply)
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {topics.map((topic) => (
                <Chip
                  key={topic.id}
                  label={topic.name}
                  onClick={() => handleTopicToggle(topic.id)}
                  color={formData.topic_ids.includes(topic.id) ? 'primary' : 'default'}
                  variant={formData.topic_ids.includes(topic.id) ? 'filled' : 'outlined'}
                  clickable
                />
              ))}
            </Box>
            {formData.topic_ids.length === 0 && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                Please select at least one topic
              </Typography>
            )}
          </Box>

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

          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              startIcon={<SaveIcon />}
              disabled={saving || formData.topic_ids.length === 0}
            >
              {saving ? 'Saving...' : isEditMode ? 'Update Course' : 'Create Course'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<CancelIcon />}
              onClick={() => navigate('/instructor/dashboard')}
              disabled={saving}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
