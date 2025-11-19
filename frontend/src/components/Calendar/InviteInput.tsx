import { TextField, FormControlLabel, Checkbox, Stack, Typography, Box, Chip } from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';

interface InviteInputProps {
  emails: string;
  onEmailsChange: (emails: string) => void;
  canEdit: boolean;
  onCanEditChange: (canEdit: boolean) => void;
}

export default function InviteInput({
  emails,
  onEmailsChange,
  canEdit,
  onCanEditChange,
}: InviteInputProps) {
  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={1.5}>
        <PersonAddIcon fontSize="small" color="action" />
        <Typography variant="subtitle1" fontWeight={500}>
          Convidar Usuários
        </Typography>
        <Chip label="Opcional" size="small" variant="outlined" />
      </Box>

      <Stack spacing={2}>
        <TextField
          label="Emails"
          placeholder="Ex: usuario@email.com, outro@email.com"
          value={emails}
          onChange={(e) => onEmailsChange(e.target.value)}
          helperText="Separe múltiplos emails por vírgula"
          fullWidth
          multiline
          rows={2}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={canEdit}
              onChange={(e) => onCanEditChange(e.target.checked)}
            />
          }
          label="Permitir que convidados editem o evento"
        />
      </Stack>
    </Box>
  );
}
