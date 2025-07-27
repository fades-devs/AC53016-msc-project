import React from 'react';
import {
  Grid, Paper, FormControl, InputLabel, Select, MenuItem,
  TextField, OutlinedInput, Checkbox, ListItemText, Button, Typography
} from '@mui/material';

import {
  areaOptions, levelOptions, periodOptions, locationOptions, statusOptions
} from '../constants/filterOptions';

const ModuleFilterControls = ({ filters, onFilterChange, onClearFilters }) => {
  return (
    // Wrap filters in a Paper component for clear visual grouping
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
      <Grid container spacing={2} alignItems="flex-start">

        {/* --- Dropdown Select Filters --- */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth sx={{ minWidth: 180 }}>
            <InputLabel>Area</InputLabel>
            <Select
              multiple
              name="area"
              value={filters.area}
              onChange={onFilterChange}
              input={<OutlinedInput label="Area" />}
              // This provides a cleaner look when many options are selected
              renderValue={(selected) => selected.length > 2 ? `${selected.length} areas selected` : selected.join(', ')}
            >
              {areaOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  <Checkbox checked={filters.area.indexOf(option) > -1} />
                  <ListItemText primary={option} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth sx={{ minWidth: 180 }}>
            <InputLabel>Level</InputLabel>
            <Select multiple name="level" value={filters.level} onChange={onFilterChange} input={<OutlinedInput label="Level" />} renderValue={(selected) => selected.join(', ')}>
              {levelOptions.map((option) => (
                <MenuItem key={option} value={option}><Checkbox checked={filters.level.indexOf(option) > -1} /><ListItemText primary={option} /></MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth sx={{ minWidth: 180 }}>
            <InputLabel>Period</InputLabel>
            <Select multiple name="period" value={filters.period} onChange={onFilterChange} input={<OutlinedInput label="Period" />} renderValue={(selected) => selected.join(', ')}>
              {periodOptions.map((option) => (
                <MenuItem key={option} value={option}><Checkbox checked={filters.period.indexOf(option) > -1} /><ListItemText primary={option} /></MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth sx={{ minWidth: 180 }}>
            <InputLabel>Location</InputLabel>
            <Select multiple name="location" value={filters.location} onChange={onFilterChange} input={<OutlinedInput label="Location" />} renderValue={(selected) => selected.join(', ')}>
              {locationOptions.map((option) => (
                <MenuItem key={option} value={option}><Checkbox checked={filters.location.indexOf(option) > -1} /><ListItemText primary={option} /></MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* --- Text & Number Input Filters --- */}
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth sx={{ minWidth: 180 }}>
            <InputLabel>Status</InputLabel>
            <Select multiple name="status" value={filters.status} onChange={onFilterChange} input={<OutlinedInput label="Status" />} renderValue={(selected) => selected.join(', ')}>
              {statusOptions.map((option) => (
                <MenuItem key={option} value={option}><Checkbox checked={filters.status.indexOf(option) > -1} /><ListItemText primary={option} /></MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <TextField helperText="Clear to see all years"  fullWidth label="Year" name="year" type="number" value={filters.year} onChange={onFilterChange} />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <TextField fullWidth label="Module Code" name="codeSearch" value={filters.codeSearch} onChange={onFilterChange} />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField fullWidth label="Module Title" name="titleSearch" value={filters.titleSearch} onChange={onFilterChange} />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField fullWidth label="Module Lead" name="leadSearch" value={filters.leadSearch} onChange={onFilterChange} />
        </Grid>

        {/* --- Action Button --- */}
        <Grid item xs={12} sx={{ alignSelf: 'center' }}>
          <Button variant="outlined" color="secondary" onClick={onClearFilters}>
            Clear Filters
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ModuleFilterControls;