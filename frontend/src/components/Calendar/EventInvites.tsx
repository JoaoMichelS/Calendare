import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Stack,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
} from '@mui/material';
import { Delete as DeleteIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { eventsApi } from '../../services/events.api';

interface EventInvitesProps {
  eventId: number;
  isOwner: boolean;
}

interface Invite {
  id: number;
  userId: number;
  status: string;
  canEdit: boolean;
  user: {
    id: number;
    email: string;
    name: string | null;
  };
}

export default function EventInvites({ eventId, isOwner }: EventInvitesProps) {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailsInput, setEmailsInput] = useState('');
  const [canEdit, setCanEdit] = useState(false);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadInvites();
  }, [eventId]);

  const loadInvites = async () => {
    if (!isOwner) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await eventsApi.getEventInvites(eventId);
      setInvites(data);
    } catch (err: any) {
      if (err.response?.status !== 403) {
        setError(err.response?.data?.message || 'Erro ao carregar convites');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!emailsInput.trim()) {
      setError('Digite pelo menos um email');
      return;
    }

    try {
      setInviting(true);
      setError(null);

      // Parse emails (separados por vírgula, ponto-e-vírgula ou espaço)
      const emails = emailsInput
        .split(/[,;\s]+/)
        .map((email) => email.trim())
        .filter((email) => email.length > 0);

      if (emails.length === 0) {
        setError('Emails inválidos');
        return;
      }

      await eventsApi.inviteUsers(eventId, emails, canEdit);
      setEmailsInput('');
      setCanEdit(false);
      await loadInvites();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao convidar usuários');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveInvite = async (userId: number) => {
    try {
      setError(null);
      await eventsApi.removeInvite(eventId, userId);
      await loadInvites();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao remover convite');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'success';
      case 'DECLINED':
        return 'error';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'Aceito';
      case 'DECLINED':
        return 'Recusado';
      case 'PENDING':
        return 'Pendente';
      default:
        return status;
    }
  };

  if (!isOwner) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Apenas o criador do evento pode gerenciar convites
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <PersonAddIcon fontSize="small" color="action" />
        <Typography variant="subtitle1" fontWeight={500}>
          Gerenciar Convites
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Formulário de Convite */}
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Adicionar Novos Convidados
          </Typography>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Emails"
              placeholder="Ex: usuario@email.com, outro@email.com"
              value={emailsInput}
              onChange={(e) => setEmailsInput(e.target.value)}
              helperText="Separe múltiplos emails por vírgula"
              fullWidth
              multiline
              rows={2}
            />

            <FormControlLabel
              control={
                <Checkbox checked={canEdit} onChange={(e) => setCanEdit(e.target.checked)} />
              }
              label="Permitir que convidados editem o evento"
            />

            <Button
              variant="outlined"
              onClick={handleInvite}
              disabled={inviting || !emailsInput.trim()}
              fullWidth
            >
              {inviting ? 'Convidando...' : 'Enviar Convites'}
            </Button>
          </Stack>
        </Box>

        {/* Lista de Convidados */}
        {invites.length > 0 && (
          <>
            <Divider />
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Convidados ({invites.length})
              </Typography>
              <Stack spacing={1} mt={1}>
                {invites.map((invite) => (
                  <Box
                    key={invite.id}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    p={1.5}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight={500}>
                        {invite.user.name || invite.user.email}
                      </Typography>
                      <Stack direction="row" spacing={1} mt={0.5}>
                        <Chip
                          label={getStatusLabel(invite.status)}
                          color={getStatusColor(invite.status) as any}
                          size="small"
                        />
                        {invite.canEdit && (
                          <Chip label="Pode editar" color="primary" size="small" variant="outlined" />
                        )}
                      </Stack>
                    </Box>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveInvite(invite.userId)}
                      aria-label="remover convite"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            </Box>
          </>
        )}
      </Stack>
    </Box>
  );
}
