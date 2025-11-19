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
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (invites.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        Você não tem convites pendentes
      </Alert>
    );
  }

  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        Convites Pendentes ({invites.length})
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack spacing={2}>
        {invites.map((invite) => (
          <Card key={invite.id} variant="outlined">
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6" component="div">
                    {invite.event.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Convidado por: {invite.event.user.name || invite.event.user.email}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Início: {formatDate(invite.event.startDate)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Fim: {formatDate(invite.event.endDate)}
                  </Typography>
                </Box>

                {invite.canEdit && (
                  <Chip
                    label="Você poderá editar este evento"
                    color="primary"
                    size="small"
                    sx={{ width: 'fit-content' }}
                  />
                )}

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleRespond(invite.eventId, 'ACCEPTED')}
                    disabled={processingInvite === invite.eventId}
                  >
                    {processingInvite === invite.eventId ? 'Aceitando...' : 'Aceitar'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleRespond(invite.eventId, 'DECLINED')}
                    disabled={processingInvite === invite.eventId}
                  >
                    {processingInvite === invite.eventId ? 'Recusando...' : 'Recusar'}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
