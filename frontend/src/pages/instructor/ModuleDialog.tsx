import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from '@mui/material';
import type { Module } from '../../types';

interface ModuleDialogProps {
  open: boolean;
  module?: Module | null;
  onClose: () => void;
  onSave: (data: Partial<Module>) => void;
}

export default function ModuleDialog({ open, module, onClose, onSave }: ModuleDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 1,
    estimated_duration: 60,
  });

  useEffect(() => {
    if (open) {
      if (module) {
        setFormData({
          title: module.title,
          description: module.description,
          order: module.order,
          estimated_duration: module.estimated_duration,
        });
      } else {
        setFormData({
          title: '',
          description: '',
          order: 1,
          estimated_duration: 60,
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {module ? 'Edit Module' : 'Add Module'}
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
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {module ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
