import { AppBar, Toolbar, Typography, Button, Box, Avatar, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logout, CalendarMonth, Dashboard as DashboardIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // < 900px

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppBar position="static">
      <Toolbar sx={{ minHeight: isMobile ? '56px' : '64px' }}>
        <CalendarMonth sx={{ mr: isMobile ? 1 : 2 }} />
        <Typography
          variant={isMobile ? "body1" : "h6"}
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/calendar')}
        >
          {isMobile ? 'Cal' : 'Calendare'}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 0.5 : 2 }}>
          {isMobile ? (
            // Mobile: Apenas ícones
            <>
              <IconButton
                color="inherit"
                onClick={() => navigate('/calendar')}
                sx={{
                  border: location.pathname === '/calendar' ? '1px solid white' : 'none',
                }}
              >
                <CalendarMonth />
              </IconButton>

              <IconButton
                color="inherit"
                onClick={() => navigate('/dashboard')}
                sx={{
                  border: location.pathname === '/dashboard' ? '1px solid white' : 'none',
                }}
              >
                <DashboardIcon />
              </IconButton>

              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'secondary.main',
                  fontSize: 14,
                  ml: 0.5,
                }}
              >
                {user?.name?.[0]?.toUpperCase() || user?.email[0].toUpperCase()}
              </Avatar>

              <IconButton
                color="inherit"
                onClick={handleLogout}
                sx={{ borderColor: 'white' }}
              >
                <Logout />
              </IconButton>
            </>
          ) : (
            // Desktop: Botões com texto
            <>
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
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
