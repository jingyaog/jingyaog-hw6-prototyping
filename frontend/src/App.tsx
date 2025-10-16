import { useState } from 'react';
import { Container, CssBaseline, Typography, Box, AppBar, Toolbar } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { FileUpload } from './components/FileUpload';
import { JobQueue } from './components/JobQueue';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            Job Queue Manager
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box>
          <FileUpload onUploadSuccess={handleUploadSuccess} />
          <JobQueue key={refreshKey} />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
