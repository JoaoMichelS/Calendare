import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { eventsApi } from '../../services/events.api';

interface Invite {
  id: number;
  eventId: number;
  userId: number;
  status: string;
  canEdit: boolean;
  event: {
    id: number;
    title: string;
    startDate: string;
    endDate: string;
    user: {
      id: number;
      email: string;
      name: string | null;
    };
  };
}

interface PendingInvitesProps {
  onInviteResponded?: () => void;
}

export default function PendingInvites({ onInviteResponded }: PendingInvitesProps) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingInvite, setProcessingInvite] = useState<number | null>(null);

  const loadInvites = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventsApi.getPendingInvites();
      setInvites(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar convites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvites();
  }, []);

  const handleRespond = async (eventId: number, status: 'ACCEPTED' | 'DECLINED') => {
    try {
      setProcessingInvite(eventId);
      setError(null);
      await eventsApi.respondToInvite(eventId, status);

      // Remover o convite da lista
      setInvites((prev) => prev.filter((invite) => invite.eventId !== eventId));

      // Notificar o componente pai
      if (onInviteResponded) {
        onInviteResponded();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao responder convite');
    } finally {
      setProcessingInvite(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (invites.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
        Nenhum convite pendente
      </Typography>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          maxHeight: invites.length > 4 ? '743px' : 'auto',
          overflowY: invites.length > 4 ? 'auto' : 'visible',
          pr: invites.length > 4 ? 1 : 0,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(0,0,0,0.2)',
            borderRadius: '4px',
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.3)',
            },
          },
        }}
      >
        <Stack spacing={2}>
          {invites.map((invite) => (
            <Card key={invite.id} variant="outlined" sx={{ bgcolor: 'background.default' }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      {invite.event.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Por: {invite.event.user.name || invite.event.user.email}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {formatDate(invite.event.startDate)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      até {formatDate(invite.event.endDate)}
                    </Typography>
                  </Box>

                  {invite.canEdit && (
                    <Chip
                      label="Pode editar"
                      color="primary"
                      size="small"
                      variant="outlined"
                      sx={{ width: 'fit-content' }}
                    />
                  )}

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      fullWidth
                      onClick={() => handleRespond(invite.eventId, 'ACCEPTED')}
                      disabled={processingInvite === invite.eventId}
                    >
                      {processingInvite === invite.eventId ? '...' : 'Aceitar'}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      fullWidth
                      onClick={() => handleRespond(invite.eventId, 'DECLINED')}
                      disabled={processingInvite === invite.eventId}
                    >
                      {processingInvite === invite.eventId ? '...' : 'Recusar'}
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
