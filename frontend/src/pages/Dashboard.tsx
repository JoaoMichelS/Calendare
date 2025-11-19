import { Container, Paper, Typography, Box, Avatar, Chip } from '@mui/material';
import { Email, CalendarMonth, Person } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar
          sx={{
            width: 100,
            height: 100,
            bgcolor: 'primary.main',
            fontSize: 40,
            mb: 2,
          }}
        >
          {user?.name?.[0]?.toUpperCase() || user?.email[0].toUpperCase()}
        </Avatar>

        <Typography variant="h4" gutterBottom>
          Bem-vindo ao Calendare!
        </Typography>

        <Chip
          label="Usuário Ativo"
          color="success"
          size="small"
          sx={{ mb: 3 }}
        />

        <Box sx={{ width: '100%', mt: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
            Informações do Perfil
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Person sx={{ mr: 2, color: 'text.secondary' }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Nome
              </Typography>
              <Typography variant="body1">
                {user?.name || 'Não informado'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Email sx={{ mr: 2, color: 'text.secondary' }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">{user?.email}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CalendarMonth sx={{ mr: 2, color: 'text.secondary' }} />
            <Box>
              <Typography variant="body2" color="text.secondary">
                Membro desde
              </Typography>
              <Typography variant="body1">
                {user?.createdAt && formatDate(user.createdAt)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
