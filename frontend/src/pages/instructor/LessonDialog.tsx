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
} from '@mui/material';
import type { Lesson } from '../../types';

interface LessonDialogProps {
  open: boolean;
  lesson?: Lesson | null;
  moduleTitle?: string;
  onClose: () => void;
  onSave: (data: Partial<Lesson>) => void;
}

export default function LessonDialog({ open, lesson, moduleTitle, onClose, onSave }: LessonDialogProps) {
  const [formData, setFormData] = useState<{
    title: string;
    content_type: 'video' | 'text' | 'interactive' | 'document' | 'quiz';
    estimated_duration: number;
    order: number;
    content?: string;
  }>({
    title: '',
    content_type: 'video',
    estimated_duration: 15,
    order: 1,
    content: '',
  });

  useEffect(() => {
    if (open) {
      if (lesson) {
        setFormData({
          title: lesson.title,
          content_type: lesson.content_type,
          estimated_duration: lesson.estimated_duration,
          order: lesson.order,
          content: lesson.content || '',
        });
      } else {
        setFormData({
          title: '',
          content_type: 'video',
          estimated_duration: 15,
          order: 1,
          content: '',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {lesson ? 'Edit Lesson' : `Add Lesson${moduleTitle ? ` to ${moduleTitle}` : ''}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              fullWidth
            />

            <FormControl fullWidth required>
              <InputLabel>Content Type</InputLabel>
              <Select
                value={formData.content_type}
                label="Content Type"
                onChange={(e) => setFormData({
                  ...formData,
                  content_type: e.target.value as typeof formData.content_type
                })}
              >
                <MenuItem value="video">Video</MenuItem>
                <MenuItem value="text">Text</MenuItem>
                <MenuItem value="interactive">Interactive</MenuItem>
                <MenuItem value="document">Document</MenuItem>
                <MenuItem value="quiz">Quiz</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Estimated Duration (minutes)"
              type="number"
              value={formData.estimated_duration}
              onChange={(e) => setFormData({ ...formData, estimated_duration: parseInt(e.target.value) || 0 })}
              required
              fullWidth
              inputProps={{ min: 1 }}
            />

            <TextField
              label="Order"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
              required
              fullWidth
              inputProps={{ min: 1 }}
            />

            <TextField
              label="Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              multiline
              rows={6}
              fullWidth
              helperText="For video: enter URL. For text: enter markdown or HTML. For others: enter relevant content."
            />
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
