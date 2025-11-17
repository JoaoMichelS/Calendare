import { AppBar, Toolbar, Typography, Button, Box, Avatar } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logout, CalendarMonth, Dashboard as DashboardIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <CalendarMonth sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/calendar')}>
          Calendare
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            color="inherit"
            onClick={() => navigate('/calendar')}
            startIcon={<CalendarMonth />}
            variant={location.pathname === '/calendar' ? 'outlined' : 'text'}
          >
            Agenda
          </Button>

          <Button
            color="inherit"
            onClick={() => navigate('/dashboard')}
            startIcon={<DashboardIcon />}
            variant={location.pathname === '/dashboard' ? 'outlined' : 'text'}
          >
            Perfil
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'secondary.main',
                fontSize: 16,
              }}
            >
              {user?.name?.[0]?.toUpperCase() || user?.email[0].toUpperCase()}
            </Avatar>
            <Typography variant="body2">
              {user?.name || user?.email}
            </Typography>
          </Box>

          <Button
            color="inherit"
            onClick={handleLogout}
            startIcon={<Logout />}
            variant="outlined"
            sx={{ borderColor: 'white' }}
          >
            Sair
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
