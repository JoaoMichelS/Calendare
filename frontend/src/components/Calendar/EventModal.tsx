import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  IconButton,
  FormControlLabel,
  Switch,
  useTheme,
  useMediaQuery,
  Divider,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { Close as CloseIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { Event, CreateEventData, UpdateEventData } from '../../types/event';
import EventInvites from './EventInvites';
import InviteInput from './InviteInput';
import { useAuth } from '../../contexts/AuthContext';

const schema = yup.object({
  title: yup.string().required('Título é obrigatório'),
  description: yup.string(),
  startDate: yup.string().required('Data de início é obrigatória'),
  endDate: yup.string().required('Data de fim é obrigatória'),
  location: yup.string(),
  color: yup.string(),
  isRecurring: yup.boolean(),
  recurrenceRule: yup.string().when('isRecurring', {
    is: true,
    then: (schema) => schema.required('Regra de recorrência é obrigatória'),
    otherwise: (schema) => schema.notRequired(),
  }),
  recurrenceEndDate: yup.string(),
});

interface EventModalProps {
  open: boolean;
  onClose: () => void;
  event: Event | null;
  initialDates: { start: Date; end: Date } | null;
  onCreate: (data: CreateEventData, inviteEmails?: string[], canEdit?: boolean) => Promise<void>;
  onUpdate: (id: number, data: UpdateEventData) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function EventModal({
  open,
  onClose,
  event,
  initialDates,
  onCreate,
  onUpdate,
  onDelete,
}: EventModalProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isEdit = !!event;
  const { user } = useAuth();
  const isOwner = event?.user?.id === user?.id;

  // States para convites na criação
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteCanEdit, setInviteCanEdit] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      color: '#3788d8',
      isRecurring: false,
      recurrenceRule: 'DAILY',
      recurrenceEndDate: '',
    },
  });

  const isRecurring = watch('isRecurring');

  useEffect(() => {
    if (event) {
      reset({
        title: event.title,
        description: event.description || '',
        startDate: formatDateForInput(new Date(event.startDate)),
        endDate: formatDateForInput(new Date(event.endDate)),
        location: event.location || '',
        color: event.color,
        isRecurring: event.isRecurring,
        recurrenceRule: event.recurrenceRule || 'DAILY',
        recurrenceEndDate: event.recurrenceEndDate ? formatDateForInput(new Date(event.recurrenceEndDate)) : '',
      });
    } else if (initialDates) {
      reset({
        title: '',
        description: '',
        startDate: formatDateForInput(initialDates.start),
        endDate: formatDateForInput(initialDates.end),
        location: '',
        color: '#3788d8',
        isRecurring: false,
        recurrenceRule: 'DAILY',
        recurrenceEndDate: '',
      });
    }
  }, [event, initialDates, reset]);

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const onSubmit = async (data: any) => {
    try {
      const eventData: any = {
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        location: data.location,
        color: data.color,
        isRecurring: data.isRecurring,
      };

      // Adicionar campos de recorrência apenas se o evento for recorrente
      if (data.isRecurring) {
        // Converter a frequência simples para formato RRULE
        const startDate = new Date(data.startDate);
        const dtstart = `DTSTART:${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;

        let rrule = '';
        switch (data.recurrenceRule) {
          case 'DAILY':
            rrule = 'FREQ=DAILY';
            break;
          case 'WEEKLY':
            rrule = 'FREQ=WEEKLY';
            break;
          case 'MONTHLY':
            rrule = 'FREQ=MONTHLY';
            break;
          case 'YEARLY':
            rrule = 'FREQ=YEARLY';
            break;
          default:
            rrule = 'FREQ=DAILY';
        }

        // Adicionar UNTIL se houver data de fim
        if (data.recurrenceEndDate) {
          const untilDate = new Date(data.recurrenceEndDate);
          const until = untilDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
          rrule += `;UNTIL=${until}`;
        }

        eventData.recurrenceRule = `${dtstart}\nRRULE:${rrule}`;

        if (data.recurrenceEndDate) {
          eventData.recurrenceEndDate = new Date(data.recurrenceEndDate).toISOString();
        }
      }

      if (isEdit && event) {
        await onUpdate(event.id, eventData);
      } else {
        // Parse emails se houver
        const emails = inviteEmails
          .split(/[,;\s]+/)
          .map((email) => email.trim())
          .filter((email) => email.length > 0);

        await onCreate(eventData, emails.length > 0 ? emails : undefined, inviteCanEdit);
      }
      reset();
      setInviteEmails('');
      setInviteCanEdit(false);
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDelete = async () => {
    if (event && window.confirm('Tem certeza que deseja deletar este evento?')) {
      await onDelete(event.id);
      reset();
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {isEdit ? 'Editar Evento' : 'Novo Evento'}
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Informações Básicas */}
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Título do Evento"
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    autoFocus
                  />
                )}
              />
            </Grid>

            {/* Data e Hora */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Data e Hora de Início"
                    type="datetime-local"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.startDate}
                    helperText={errors.startDate?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Data e Hora de Término"
                    type="datetime-local"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.endDate}
                    helperText={errors.endDate?.message}
                  />
                )}
              />
            </Grid>

            {/* Descrição */}
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Descrição"
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Adicione detalhes sobre o evento..."
                  />
                )}
              />
            </Grid>

            {/* Localização */}
            <Grid item xs={12}>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Localização"
                    fullWidth
                    placeholder="Ex: Sala de Reuniões, Endereço..."
                  />
                )}
              />
            </Grid>

            {/* Opções */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Cor do Evento"
                    type="color"
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Recorrência - Comentada Não Finalizada */}
            {/* <Grid item xs={12} sm={6} display="flex" alignItems="center">
              <Controller
                name="isRecurring"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Evento recorrente"
                  />
                )}
              />
            </Grid> */}

            {/* Configurações de Recorrência */}
            {/* {isRecurring && (
              <>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="recurrenceRule"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.recurrenceRule}>
                        <InputLabel>Repetir</InputLabel>
                        <Select {...field} label="Repetir">
                          <MenuItem value="DAILY">Diariamente</MenuItem>
                          <MenuItem value="WEEKLY">Semanalmente</MenuItem>
                          <MenuItem value="MONTHLY">Mensalmente</MenuItem>
                          <MenuItem value="YEARLY">Anualmente</MenuItem>
                        </Select>
                        {errors.recurrenceRule && (
                          <Box component="span" sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5 }}>
                            {errors.recurrenceRule.message}
                          </Box>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="recurrenceEndDate"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Termina em (Opcional)"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        helperText="Deixe em branco para sem fim"
                      />
                    )}
                  />
                </Grid>
              </>
            )} */}

            {/* Convites - Apenas na Criação */}
            {!isEdit && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={12}>
                  <InviteInput
                    emails={inviteEmails}
                    onEmailsChange={setInviteEmails}
                    canEdit={inviteCanEdit}
                    onCanEditChange={setInviteCanEdit}
                  />
                </Grid>
              </>
            )}
          </Grid>

          {/* Gerenciar Convites - Apenas na Edição */}
          {isEdit && event && (
            <Box mt={3}>
              <Divider sx={{ mb: 3 }} />
              <EventInvites eventId={event.id} isOwner={isOwner} />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          {isEdit && (
            <Button
              onClick={handleDelete}
              color="error"
              startIcon={<DeleteIcon />}
              sx={{ mr: 'auto' }}
            >
              Deletar
            </Button>
          )}
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isEdit ? 'Salvar' : 'Criar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
