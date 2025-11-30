import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  Autocomplete,
  Chip,
} from '@mui/material';
import {
  Videocam as VideoIcon,
  Article as TextIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';
import type {
  Lesson,
  LessonContentType,
  VideoContent,
  TextContent,
  DocumentContent,
  LessonContentData,
  Topic,
} from '../../types';
import { topicsApi } from '../../services/api';

interface LessonDialogProps {
  open: boolean;
  lesson?: Lesson | null;
  moduleTitle?: string;
  onClose: () => void;
  onSave: (data: Partial<Lesson> & { topic_ids?: number[] }) => void;
}

const CONTENT_TYPES: { value: LessonContentType; label: string; icon: React.ReactNode }[] = [
  { value: 'video', label: 'Video', icon: <VideoIcon fontSize="small" /> },
  { value: 'text', label: 'Text/Article', icon: <TextIcon fontSize="small" /> },
  { value: 'document', label: 'Document', icon: <DocumentIcon fontSize="small" /> },
];

// Helper to get empty content_data for a content type
const getEmptyContentData = (contentType: LessonContentType): LessonContentData => {
  switch (contentType) {
    case 'video':
      return { video_url: '', transcript: '' } as VideoContent;
    case 'text':
      return { main_content: '' } as TextContent;
    case 'document':
      return { document_url: '', file_type: 'pdf' } as DocumentContent;
    default:
      return {};
  }
};

export default function LessonDialog({ open, lesson, moduleTitle, onClose, onSave }: LessonDialogProps) {
  const [formData, setFormData] = useState<{
    title: string;
    content_type: LessonContentType;
    estimated_duration: number;
    order: number;
    content_data: LessonContentData;
  }>({
    title: '',
    content_type: 'video',
    estimated_duration: 15,
    order: 1,
    content_data: getEmptyContentData('video'),
  });

  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);

  // Load available topics when dialog opens
  useEffect(() => {
    if (open) {
      loadTopics();
    }
  }, [open]);

  const loadTopics = async () => {
    setTopicsLoading(true);
    try {
      const topics = await topicsApi.getAll();
      setAvailableTopics(topics);
    } catch (error) {
      console.error('Failed to load topics:', error);
    } finally {
      setTopicsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (lesson) {
        setFormData({
          title: lesson.title,
          content_type: lesson.content_type,
          estimated_duration: lesson.estimated_duration,
          order: lesson.order,
          content_data: lesson.content_data || getEmptyContentData(lesson.content_type),
        });
        // Set selected topics from lesson
        setSelectedTopics(lesson.topics || []);
      } else {
        setFormData({
          title: '',
          content_type: 'video',
          estimated_duration: 15,
          order: 1,
          content_data: getEmptyContentData('video'),
        });
        setSelectedTopics([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleContentTypeChange = (newType: LessonContentType) => {
    setFormData({
      ...formData,
      content_type: newType,
      content_data: getEmptyContentData(newType),
    });
  };

  const updateContentData = (updates: Partial<LessonContentData>) => {
    setFormData({
      ...formData,
      content_data: { ...formData.content_data, ...updates },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      topic_ids: selectedTopics.map((t) => t.id),
    });
    onClose();
  };

  // Render content-type-specific fields
  const renderContentFields = () => {
    switch (formData.content_type) {
      case 'video':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Video URL"
              value={(formData.content_data as VideoContent)?.video_url || ''}
              onChange={(e) => updateContentData({ video_url: e.target.value })}
              fullWidth
              placeholder="https://www.youtube.com/embed/..."
              helperText="Enter YouTube embed URL (e.g., https://www.youtube.com/embed/VIDEO_ID)"
            />
            <TextField
              label="Transcript (optional)"
              value={(formData.content_data as VideoContent)?.transcript || ''}
              onChange={(e) => updateContentData({ transcript: e.target.value })}
              multiline
              rows={4}
              fullWidth
              placeholder="Video transcript for accessibility..."
            />
          </Box>
        );

      case 'text':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Content (HTML supported)"
              value={(formData.content_data as TextContent)?.main_content || ''}
              onChange={(e) => updateContentData({ main_content: e.target.value })}
              multiline
              rows={12}
              fullWidth
              placeholder="<h2>Introduction</h2><p>Your lesson content here...</p>"
              helperText="You can use HTML tags for formatting: <h2>, <p>, <code>, <pre>, <ul>, <li>, etc."
            />
          </Box>
        );

      case 'document':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Document URL"
              value={(formData.content_data as DocumentContent)?.document_url || ''}
              onChange={(e) => updateContentData({ document_url: e.target.value })}
              fullWidth
              placeholder="https://example.com/document.pdf"
              helperText="Direct link to the document file"
            />
            <FormControl fullWidth>
              <InputLabel>Document Type</InputLabel>
              <Select
                value={(formData.content_data as DocumentContent)?.file_type || 'pdf'}
                label="Document Type"
                onChange={(e) => updateContentData({ file_type: e.target.value })}
              >
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="docx">Word Document</MenuItem>
                <MenuItem value="pptx">PowerPoint</MenuItem>
                <MenuItem value="xlsx">Excel</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {lesson ? 'Edit Lesson' : `Add Lesson${moduleTitle ? ` to ${moduleTitle}` : ''}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* Basic Info */}
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              fullWidth
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel>Content Type</InputLabel>
                <Select
                  value={formData.content_type}
                  label="Content Type"
                  onChange={(e) => handleContentTypeChange(e.target.value as LessonContentType)}
                >
                  {CONTENT_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {type.icon}
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Duration (min)"
                type="number"
                value={formData.estimated_duration}
                onChange={(e) => setFormData({ ...formData, estimated_duration: parseInt(e.target.value) || 0 })}
                required
                sx={{ width: 150 }}
                inputProps={{ min: 1 }}
              />

              <TextField
                label="Order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                required
                sx={{ width: 100 }}
                inputProps={{ min: 1 }}
              />
            </Box>

            {/* Topics Selection */}
            <Autocomplete
              multiple
              options={availableTopics}
              value={selectedTopics}
              onChange={(_, newValue) => setSelectedTopics(newValue)}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              loading={topicsLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Topics"
                  placeholder="Select topics..."
                  helperText="Assign topics to help students find relevant content"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.id}
                    label={option.name}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))
              }
            />

            <Divider sx={{ my: 1 }} />

            {/* Content Type Specific Fields */}
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              {CONTENT_TYPES.find((t) => t.value === formData.content_type)?.label} Content
            </Typography>
            {renderContentFields()}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {lesson ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
