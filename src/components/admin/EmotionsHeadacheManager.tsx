'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Psychology as PsychologyIcon,
  Healing as HealingIcon,
  LocationOn as LocationIcon,
  Mood as MoodIcon,
} from '@mui/icons-material';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

interface EmotionItem {
  description: string;
  word: string;
}

interface EmotionCategory {
  id: string;
  name: string;
  items: EmotionItem[];
  migratedFrom?: string;
  updatedAt: Date;
}

interface HeadacheRegion {
  id: string;
  name: string;
  description?: string;
  category: 'primary' | 'secondary' | 'referred';
  severity: number; // 1-5 scale
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function EmotionsHeadacheManager() {
  const [emotionCategories, setEmotionCategories] = useState<EmotionCategory[]>([]);
  const [headacheRegions, setHeadacheRegions] = useState<HeadacheRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [emotionDialogOpen, setEmotionDialogOpen] = useState(false);
  const [headacheDialogOpen, setHeadacheDialogOpen] = useState(false);
  const [editingEmotionCategory, setEditingEmotionCategory] = useState<EmotionCategory | null>(null);
  const [editingHeadache, setEditingHeadache] = useState<HeadacheRegion | null>(null);
  
  // Form states
  const [emotionForm, setEmotionForm] = useState({
    categoryName: '',
    items: [] as EmotionItem[],
  });
  
  const [headacheForm, setHeadacheForm] = useState({
    name: '',
    description: '',
    category: 'primary' as 'primary' | 'secondary' | 'referred',
    severity: 3,
    isActive: true,
  });
  
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [isPopulating, setIsPopulating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load emotion categories
      const emotionsSnapshot = await getDocs(collection(db, 'emotions'));
      const emotionCategoriesData = emotionsSnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.id,
        items: doc.data().items || [],
        migratedFrom: doc.data().migratedFrom,
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as EmotionCategory[];
      
      // Load headache regions
      const headacheSnapshot = await getDocs(
        query(collection(db, 'headache_regions'), orderBy('name'))
      );
      const headacheData = headacheSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as HeadacheRegion[];
      
      setEmotionCategories(emotionCategoriesData);
      setHeadacheRegions(headacheData);
    } catch (err) {
      console.error('Error loading data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      if (errorMessage.includes('permissions')) {
        setError('Permission denied. Please ensure you are logged in and have admin/doctor privileges.');
      } else {
        setError(`Failed to load data: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handlePopulateSampleData = async () => {
    try {
      setIsPopulating(true);
      const response = await fetch('/api/admin/populate-sample-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        showSnackbar(`Sample data populated successfully! Added ${result.data.emotionsAdded} emotions and ${result.data.regionsAdded} headache regions.`, 'success');
        loadData(); // Refresh the data
      } else {
        showSnackbar(`Failed to populate sample data: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error populating sample data:', error);
      showSnackbar('Failed to populate sample data. Please try again.', 'error');
    } finally {
      setIsPopulating(false);
    }
  };

  const handleCleanupInvalidNames = async () => {
    try {
      const invalidCategories = emotionCategories.filter(category => {
        const validationError = validateEmotionCategoryName(category.name);
        return validationError !== null;
      });

      if (invalidCategories.length === 0) {
        showSnackbar('No invalid emotion category names found', 'success');
        return;
      }

      const confirmMessage = `Found ${invalidCategories.length} emotion categories with invalid names:\n${invalidCategories.map(cat => `- "${cat.name}"`).join('\n')}\n\nDo you want to delete these categories?`;
      
      if (window.confirm(confirmMessage)) {
        for (const category of invalidCategories) {
          await deleteDoc(doc(db, 'emotions', category.id));
        }
        showSnackbar(`Deleted ${invalidCategories.length} invalid emotion categories`, 'success');
        loadData();
      }
    } catch (err) {
      console.error('Error cleaning up invalid names:', err);
      showSnackbar('Failed to clean up invalid names', 'error');
    }
  };

  // Emotion handlers
  const handleEmotionAdd = () => {
    setEditingEmotionCategory(null);
    setEmotionForm({
      categoryName: '',
      items: [],
    });
    setEmotionDialogOpen(true);
  };

  const handleEmotionEdit = (emotionCategory: EmotionCategory) => {
    setEditingEmotionCategory(emotionCategory);
    setEmotionForm({
      categoryName: emotionCategory.name,
      items: emotionCategory.items,
    });
    setEmotionDialogOpen(true);
  };

  const validateEmotionCategoryName = (name: string): string | null => {
    const trimmedName = name.trim();
    
    // Check if name is empty or too short
    if (!trimmedName || trimmedName.length < 2) {
      return 'Emotion category name must be at least 2 characters long';
    }

    // Check if name contains only letters, spaces, and common punctuation
    const validNamePattern = /^[a-zA-Z\s\-'&]+$/;
    if (!validNamePattern.test(trimmedName)) {
      return 'Emotion category name can only contain letters, spaces, hyphens, apostrophes, and ampersands';
    }

    // Check if name looks like a random ID (contains numbers and random characters)
    const randomIdPattern = /^[A-Za-z0-9]{8,}$/; // Reduced from 10 to 8 characters
    if (randomIdPattern.test(trimmedName)) {
      return 'Emotion category name cannot be a random ID. Please use a meaningful emotion name like "Anxiety", "Happiness", etc.';
    }

    // Check for mixed case random patterns (like "nhxhDgj9FrhjGzb6OIXs")
    const mixedCaseRandomPattern = /^[a-z]{2,}[A-Z][a-z0-9]{2,}[A-Z][a-z0-9]{2,}$/;
    if (mixedCaseRandomPattern.test(trimmedName)) {
      return 'Emotion category name appears to be a random ID. Please use a meaningful emotion name like "Anxiety", "Happiness", etc.';
    }

    // Check for consecutive consonants (common in random IDs)
    const consecutiveConsonantsPattern = /[bcdfghjklmnpqrstvwxyz]{4,}/i;
    if (consecutiveConsonantsPattern.test(trimmedName)) {
      return 'Emotion category name contains too many consecutive consonants. Please use a meaningful emotion name.';
    }

    // Check for common emotion category names (suggested list)
    const commonEmotionCategories = [
      'anxiety', 'sadness', 'happiness', 'anger', 'fear', 'joy', 'love', 'excitement',
      'frustration', 'worry', 'stress', 'calm', 'peaceful', 'confused', 'overwhelmed',
      'grateful', 'hopeful', 'lonely', 'proud', 'embarrassed', 'guilty', 'ashamed',
      'jealous', 'envious', 'content', 'satisfied', 'disappointed', 'surprised',
      'shocked', 'relieved', 'nervous', 'confident', 'insecure', 'motivated', 'tired',
      'energetic', 'focused', 'distracted', 'curious', 'bored', 'interested',
      'depression', 'euphoria', 'melancholy', 'rage', 'terror', 'panic', 'bliss',
      'serenity', 'agitation', 'irritation', 'annoyance', 'disgust', 'contempt',
      'admiration', 'respect', 'affection', 'passion', 'desire', 'longing'
    ];

    const normalizedName = trimmedName.toLowerCase();
    if (!commonEmotionCategories.includes(normalizedName)) {
      // Show warning but allow it (not blocking)
      console.warn(`"${trimmedName}" is not a common emotion category. Consider using standard emotion names.`);
    }

    return null; // No validation error
  };

  const handleEmotionSave = async () => {
    try {
      // Validate emotion category name
      const validationError = validateEmotionCategoryName(emotionForm.categoryName);
      if (validationError) {
        showSnackbar(validationError, 'error');
        return;
      }

      const emotionData = {
        items: emotionForm.items,
        updatedAt: Timestamp.now(),
      };

      if (editingEmotionCategory) {
        // Update existing emotion category
        await updateDoc(doc(db, 'emotions', editingEmotionCategory.id), emotionData);
        showSnackbar('Emotion category updated successfully', 'success');
      } else {
        // Add new emotion category
        await addDoc(collection(db, 'emotions'), {
          ...emotionData,
          migratedFrom: 'ADMIN_INTERFACE',
        });
        showSnackbar('Emotion category added successfully', 'success');
      }

      setEmotionDialogOpen(false);
      loadData();
    } catch (err) {
      console.error('Error saving emotion category:', err);
      showSnackbar('Failed to save emotion category', 'error');
    }
  };

  const handleEmotionDelete = async (emotionCategory: EmotionCategory) => {
    if (window.confirm(`Are you sure you want to delete the "${emotionCategory.name}" emotion category?`)) {
      try {
        await deleteDoc(doc(db, 'emotions', emotionCategory.id));
        showSnackbar('Emotion category deleted successfully', 'success');
        loadData();
      } catch (err) {
        console.error('Error deleting emotion category:', err);
        showSnackbar('Failed to delete emotion category', 'error');
      }
    }
  };

  const addEmotionItem = () => {
    setEmotionForm({
      ...emotionForm,
      items: [...emotionForm.items, { description: '', word: '' }]
    });
  };

  const removeEmotionItem = (index: number) => {
    setEmotionForm({
      ...emotionForm,
      items: emotionForm.items.filter((_, i) => i !== index)
    });
  };

  const updateEmotionItem = (index: number, field: 'description' | 'word', value: string) => {
    const updatedItems = [...emotionForm.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setEmotionForm({
      ...emotionForm,
      items: updatedItems
    });
  };

  // Headache region handlers
  const handleHeadacheAdd = () => {
    setEditingHeadache(null);
    setHeadacheForm({
      name: '',
      description: '',
      category: 'primary',
      severity: 3,
      isActive: true,
    });
    setHeadacheDialogOpen(true);
  };

  const handleHeadacheEdit = (headache: HeadacheRegion) => {
    setEditingHeadache(headache);
    setHeadacheForm({
      name: headache.name,
      description: headache.description || '',
      category: headache.category,
      severity: headache.severity,
      isActive: headache.isActive,
    });
    setHeadacheDialogOpen(true);
  };

  const handleHeadacheSave = async () => {
    try {
      const headacheData = {
        name: headacheForm.name.trim(),
        description: headacheForm.description.trim(),
        category: headacheForm.category,
        severity: headacheForm.severity,
        isActive: headacheForm.isActive,
        updatedAt: Timestamp.now(),
      };

      if (editingHeadache) {
        // Update existing headache region
        await updateDoc(doc(db, 'headache_regions', editingHeadache.id), headacheData);
        showSnackbar('Headache region updated successfully', 'success');
      } else {
        // Add new headache region
        await addDoc(collection(db, 'headache_regions'), {
          ...headacheData,
          createdAt: Timestamp.now(),
        });
        showSnackbar('Headache region added successfully', 'success');
      }

      setHeadacheDialogOpen(false);
      loadData();
    } catch (err) {
      console.error('Error saving headache region:', err);
      showSnackbar('Failed to save headache region', 'error');
    }
  };

  const handleHeadacheDelete = async (headache: HeadacheRegion) => {
    if (window.confirm(`Are you sure you want to delete "${headache.name}"?`)) {
      try {
        await deleteDoc(doc(db, 'headache_regions', headache.id));
        showSnackbar('Headache region deleted successfully', 'success');
        loadData();
      } catch (err) {
        console.error('Error deleting headache region:', err);
        showSnackbar('Failed to delete headache region', 'error');
      }
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'primary': return 'primary';
      case 'secondary': return 'secondary';
      case 'referred': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary Statistics */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.200' }}>
        <Typography variant="h6" sx={{ mb: 1, color: 'primary.main' }}>
          Current Database Status
        </Typography>
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PsychologyIcon color="primary" />
            <Typography variant="body2">
              <strong>{emotionCategories.length}</strong> emotion categories with <strong>{emotionCategories.reduce((total, cat) => total + cat.items.length, 0)}</strong> total emotions
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationIcon color="primary" />
            <Typography variant="body2">
              <strong>{headacheRegions.length}</strong> headache regions available
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          onClick={handlePopulateSampleData}
          disabled={isPopulating}
          startIcon={isPopulating ? <CircularProgress size={20} /> : <AddIcon />}
        >
          {isPopulating ? 'Populating...' : 'Populate Sample Data'}
        </Button>
        <Button
          variant="outlined"
          color="warning"
          onClick={handleCleanupInvalidNames}
          startIcon={<DeleteIcon />}
        >
          Clean Up Invalid Names
        </Button>
        <Typography variant="caption" color="text.secondary">
          Add sample data or clean up invalid emotion category names
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Emotions Management */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <PsychologyIcon color="primary" />
                  <Typography variant="h6">Emotions Management</Typography>
                </Box>
              }
              action={
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleEmotionAdd}
                  size="small"
                >
                  Add Emotion
                </Button>
              }
            />
            <CardContent>
              {/* Current Emotions Summary */}
              <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Current Emotion Categories ({emotionCategories.length} categories)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {emotionCategories.length > 0 ? (
                    emotionCategories.map((category) => (
                      <Chip
                        key={category.id}
                        label={`${category.name} (${category.items.length})`}
                        size="small"
                        color="primary"
                        variant="filled"
                      />
                    ))
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No emotion categories available
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Detailed Emotions List */}
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Manage Emotions
              </Typography>
              <List>
                {emotionCategories.map((category) => (
                  <ListItem key={category.id} divider>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1">{category.name}</Typography>
                          <Chip
                            label={`${category.items.length} emotions`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={`${category.items.slice(0, 3).map(item => item.word).join(', ')}${category.items.length > 3 ? ` and ${category.items.length - 3} more...` : ''} • Last updated: ${category.updatedAt.toLocaleDateString()}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleEmotionEdit(category)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleEmotionDelete(category)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {emotionCategories.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No emotion categories found"
                      secondary="Click 'Add Emotion' to create your first emotion category, or use 'Populate Sample Data' to add sample data"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Headache Regions Management */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <LocationIcon color="primary" />
                  <Typography variant="h6">Headache Regions Management</Typography>
                </Box>
              }
              action={
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleHeadacheAdd}
                  size="small"
                >
                  Add Region
                </Button>
              }
            />
            <CardContent>
              {/* Current Headache Regions Summary */}
              <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Current Headache Regions ({headacheRegions.length} total)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {headacheRegions.length > 0 ? (
                    headacheRegions.map((region) => (
                      <Chip
                        key={region.id}
                        label={region.name}
                        size="small"
                        color={getCategoryColor(region.category) as any}
                        variant={region.isActive ? "filled" : "outlined"}
                      />
                    ))
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No headache regions available
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Detailed Headache Regions List */}
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Manage Headache Regions
              </Typography>
              <List>
                {headacheRegions.map((headache) => (
                  <ListItem key={headache.id} divider>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1">{headache.name}</Typography>
                          <Chip
                            label={headache.category}
                            size="small"
                            color={getCategoryColor(headache.category) as any}
                          />
                          <Chip
                            label={`Severity: ${headache.severity}`}
                            size="small"
                            variant="outlined"
                          />
                          {!headache.isActive && (
                            <Chip label="Inactive" size="small" color="default" />
                          )}
                        </Box>
                      }
                      secondary={headache.description}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleHeadacheEdit(headache)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleHeadacheDelete(headache)}
                        size="small"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                {headacheRegions.length === 0 && (
                  <ListItem>
                    <ListItemText
                      primary="No headache regions found"
                      secondary="Click 'Add Region' to create your first headache region, or use 'Populate Sample Data' to add sample data"
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Emotion Dialog */}
      <Dialog open={emotionDialogOpen} onClose={() => setEmotionDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingEmotionCategory ? 'Edit Emotion Category' : 'Add New Emotion Category'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Category Name"
              value={emotionForm.categoryName}
              onChange={(e) => setEmotionForm({ ...emotionForm, categoryName: e.target.value })}
              fullWidth
              required
              disabled={!!editingEmotionCategory} // Can't change category name when editing
              helperText={!editingEmotionCategory ? "Use standard medical emotion categories like: Anxiety, Depression, Anger, Fear, Joy, Stress, etc." : ""}
              placeholder="e.g., Anxiety, Depression, Anger"
            />
            
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">Emotion Items</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={addEmotionItem}
                >
                  Add Item
                </Button>
              </Box>
              
              {emotionForm.items.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-start' }}>
                  <TextField
                    label="Emotion Word"
                    value={item.word}
                    onChange={(e) => updateEmotionItem(index, 'word', e.target.value)}
                    size="small"
                    sx={{ flex: 1 }}
                    required
                  />
                  <TextField
                    label="Description"
                    value={item.description}
                    onChange={(e) => updateEmotionItem(index, 'description', e.target.value)}
                    size="small"
                    multiline
                    rows={2}
                    sx={{ flex: 2 }}
                    required
                  />
                  <IconButton
                    onClick={() => removeEmotionItem(index)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              
              {emotionForm.items.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No emotion items added yet. Click "Add Item" to get started.
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmotionDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleEmotionSave} 
            variant="contained" 
            startIcon={<SaveIcon />}
            disabled={!emotionForm.categoryName || emotionForm.items.length === 0}
          >
            {editingEmotionCategory ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Headache Region Dialog */}
      <Dialog open={headacheDialogOpen} onClose={() => setHeadacheDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingHeadache ? 'Edit Headache Region' : 'Add New Headache Region'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Region Name"
              value={headacheForm.name}
              onChange={(e) => setHeadacheForm({ ...headacheForm, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={headacheForm.description}
              onChange={(e) => setHeadacheForm({ ...headacheForm, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={headacheForm.category}
                onChange={(e) => setHeadacheForm({ ...headacheForm, category: e.target.value as any })}
                label="Category"
              >
                <MenuItem value="primary">Primary</MenuItem>
                <MenuItem value="secondary">Secondary</MenuItem>
                <MenuItem value="referred">Referred</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Severity (1-5)</InputLabel>
              <Select
                value={headacheForm.severity}
                onChange={(e) => setHeadacheForm({ ...headacheForm, severity: Number(e.target.value) })}
                label="Severity (1-5)"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <MenuItem key={value} value={value}>
                    {value} - {value === 1 ? 'Very Mild' : value === 2 ? 'Mild' : value === 3 ? 'Moderate' : value === 4 ? 'Severe' : 'Very Severe'}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={headacheForm.isActive}
                  onChange={(e) => setHeadacheForm({ ...headacheForm, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHeadacheDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleHeadacheSave} variant="contained" startIcon={<SaveIcon />}>
            {editingHeadache ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
}
