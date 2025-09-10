"use client";

import {
  Text,
  VStack,
  Box,
  Input,
  Select,
  Checkbox,
  createListCollection
} from '@chakra-ui/react';
import { useState } from 'react';
import { DialogManager } from './dialog-manager';
import { showToast } from './simple-toast';

interface InviteUserDialogProps {
  trigger: React.ReactElement;
  childId: number;
  childName: string;
  onInviteSuccess: () => void;
}

const relationOptions = createListCollection({
  items: [
    { label: 'Mor', value: 'Mor' },
    { label: 'Far', value: 'Far' },
    { label: 'Underviser', value: 'Underviser' },
    { label: 'Ressourceperson', value: 'Ressourceperson' },
  ],
});

export function InviteUserDialog({
  trigger,
  childId,
  childName,
  onInviteSuccess
}: InviteUserDialogProps) {
  const [email, setEmail] = useState('');
  const [relation, setRelation] = useState('');
  const [customRelationName, setCustomRelationName] = useState('');
  const [isAdministrator, setIsAdministrator] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleInvite = async () => {
    if (!email || !relation) {
      setError('Email og relation er påkrævet');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/children/${childId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          relation,
          customRelationName: customRelationName.trim() || undefined,
          isAdministrator
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Der opstod en fejl ved afsendelse af invitation');
        return;
      }

      // Success - show appropriate toast based on email restriction
      if (data.emailRestriction) {
        // Email couldn't be sent due to restrictions, but invitation was created
        showToast({
          title: 'Invitation oprettet!',
          description: data.message,
          type: 'warning',
          duration: 10000,
        });
        
        // Copy invite URL to clipboard for manual sharing
        if (data.inviteUrl && navigator.clipboard) {
          try {
            await navigator.clipboard.writeText(data.inviteUrl);
            showToast({
              title: 'Link kopieret!',
              description: 'Invitations-linket er kopieret til udklipsholderen',
              type: 'info',
              duration: 3000,
            });
          } catch (clipboardError) {
            console.error('Failed to copy to clipboard:', clipboardError);
          }
        }
      } else {
        // Email was sent successfully
        showToast({
          title: 'Invitation sendt!',
          description: `Invitation er sendt til ${email}`,
          type: 'success',
          duration: 5000,
        });
      }
      
      setEmail('');
      setRelation('');
      setCustomRelationName('');
      setIsAdministrator(false);
      setError('');
      setIsOpen(false);
      onInviteSuccess();
      
    } catch (error) {
      console.error('Error sending invitation:', error);
      setError('Der opstod en netværksfejl');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogManager
        trigger={trigger}
        title={`Invitér til ${childName}`}
        maxWidth="md"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        icon="👥"
        primaryAction={{
          label: 'Send invitation',
          onClick: handleInvite,
          isLoading: loading,
          loadingText: 'Sender...',
          isDisabled: !email || !relation,
          preventAutoClose: true // Prevent auto-closing so we can handle errors
        }}
        secondaryAction={{
          label: 'Annuller',
          onClick: () => setIsOpen(false),
          variant: 'outline'
        }}
      >
        <VStack gap={3.5} align="stretch">
          <Text color="fg.default" fontSize="md" lineHeight="1.5">
            Invitér en person til at følge {childName} ved at indtaste deres email og vælge deres relation til barnet.
          </Text>

          {error && (
            <Box
              bg="rgba(224, 122, 95, 0.1)"
              border="1px solid rgba(224, 122, 95, 0.3)"
              borderRadius="md"
              p={2.5}
            >
              <Text color="#e07a5f" fontSize="sm" fontWeight="500">
                {error}
              </Text>
            </Box>
          )}

          {/* Email Input */}
          <VStack align="stretch" gap={1.5}>
            <Text fontWeight="600" color="#3d405b" fontSize="sm">
              Email adresse
            </Text>
            <Input
              placeholder="f.eks. bedstemor@email.dk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              bg="white"
              border="2px solid"
              borderColor="border.muted"
              _focus={{
                borderColor: "#81b29a",
                ring: "2px",
                ringColor: "rgba(129, 178, 154, 0.3)"
              }}
              _hover={{
                borderColor: "#81b29a"
              }}
              size="md"
              borderRadius="md"
            />
          </VStack>

          {/* Relation Select */}
          <VStack align="stretch" gap={1.5}>
            <Text fontWeight="600" color="#3d405b" fontSize="sm">
              Relation til {childName}
            </Text>
            <Select.Root 
              collection={relationOptions}
              value={[relation]}
              onValueChange={(details) => setRelation(details.value[0] || '')}
              size="md"
            >
              <Select.Trigger
                bg="white"
                border="2px solid"
                borderColor="border.muted"
                _focus={{
                  borderColor: "#81b29a",
                  ring: "2px",
                  ringColor: "rgba(129, 178, 154, 0.3)"
                }}
                _hover={{
                  borderColor: "#81b29a"
                }}
                borderRadius="md"
              >
                <Select.ValueText placeholder="Vælg relation" />
              </Select.Trigger>
              <Select.Content>
                {relationOptions.items.map((option) => (
                  <Select.Item key={option.value} item={option}>
                    <Select.ItemText>{option.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </VStack>

          {/* Admin Privilege Checkbox */}
          <VStack align="stretch" gap={1.5}>
            <Text fontWeight="600" color="#3d405b" fontSize="sm">
              Administrator privilegier
            </Text>
            <Checkbox.Root
              checked={isAdministrator}
              onCheckedChange={(details) => setIsAdministrator(details.checked === true)}
              colorPalette="sage"
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>
                <Text fontSize="sm" color="#3d405b" lineHeight="1.4">
                  Giv administratorrettigheder (kan invitere andre og administrere barnet)
                </Text>
              </Checkbox.Label>
            </Checkbox.Root>
          </VStack>
        </VStack>
      </DialogManager>
    </>
  );
}
