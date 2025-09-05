"use client";

import { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  Input,
  Text,
  DialogActionTrigger,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger
} from '@chakra-ui/react';

interface AddChildFormProps {
  onChildAdded: () => void;
}

type RelationType = 'Mor' | 'Far' | 'Underviser' | 'Ressourceperson';

export function AddChildForm({ onChildAdded }: AddChildFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [childName, setChildName] = useState('');
  const [relation, setRelation] = useState<RelationType>('Mor');
  const [customRelationName, setCustomRelationName] = useState('');
  const [errors, setErrors] = useState<{
    childName?: string;
    customRelationName?: string;
  }>({});
  const [message, setMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);
  const [open, setOpen] = useState(false);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!childName.trim()) {
      newErrors.childName = 'Barnets navn er påkrævet';
    }
    
    if (relation === 'Ressourceperson' && !customRelationName.trim()) {
      newErrors.customRelationName = 'Specificer venligst typen af ressourceperson';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/children', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: childName.trim(),
          relation,
          customRelationName: relation === 'Ressourceperson' ? customRelationName.trim() : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fejl ved oprettelse af barn');
      }

      // Reset form
      setChildName('');
      setRelation('Mor');
      setCustomRelationName('');
      setErrors({});
      setOpen(false);

      showMessage('Barnet er blevet tilføjet med succes', 'success');
      onChildAdded();
    } catch (error) {
      console.error('Error adding child:', error);
      showMessage(
        error instanceof Error ? error.message : 'Der opstod en fejl ved tilføjelse af barnet',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      {message && (
        <Box
          mb={4}
          p={3}
          borderRadius="md"
          bg={message.type === 'success' ? 'green.50' : 'red.50'}
          borderLeft="4px solid"
          borderColor={message.type === 'success' ? 'green.400' : 'red.400'}
        >
          <Text color={message.type === 'success' ? 'green.700' : 'red.700'}>
            {message.text}
          </Text>
        </Box>
      )}

      <DialogRoot open={open} onOpenChange={(e) => setOpen(e.open)} placement="center">
        <DialogTrigger asChild>
          <Button colorPalette="blue" size="lg">
            Tilføj barn
          </Button>
        </DialogTrigger>

        <DialogBackdrop />

        <DialogContent 
          maxW="lg" 
          w="90vw"
          position="fixed"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          zIndex="modal"
          bg="white"
          borderRadius="xl"
          boxShadow="2xl"
          p={0}
          maxH="90vh"
          overflow="hidden"
        >
          <DialogHeader p={6} pb={0}>
            <DialogTitle>Tilføj barn</DialogTitle>
          </DialogHeader>

          <DialogBody p={6} overflowY="auto">
            <form onSubmit={handleSubmit} id="add-child-form">
              <VStack gap={4} align="stretch">
                <Box>
                  <Text mb={2} fontWeight="medium">Barnets navn</Text>
                  <Input
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="Indtast barnets navn"
                    borderColor={errors.childName ? 'red.400' : undefined}
                  />
                  {errors.childName && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.childName}
                    </Text>
                  )}
                </Box>

                <Box>
                  <Text mb={2} fontWeight="medium">Din relation til barnet</Text>
                  <VStack gap={2} align="start">
                    {[
                      { value: 'Mor', label: 'Mor' },
                      { value: 'Far', label: 'Far' },
                      { value: 'Underviser', label: 'Underviser' },
                      { value: 'Ressourceperson', label: 'Ressourceperson' },
                    ].map((option) => (
                      <Box key={option.value} display="flex" alignItems="center">
                        <input
                          type="radio"
                          id={option.value}
                          name="relation"
                          value={option.value}
                          checked={relation === option.value}
                          onChange={(e) => setRelation(e.target.value as RelationType)}
                          style={{ marginRight: '8px' }}
                        />
                        <label htmlFor={option.value}>
                          {option.label}
                        </label>
                      </Box>
                    ))}
                  </VStack>
                </Box>

                {relation === 'Ressourceperson' && (
                  <Box>
                    <Text mb={2} fontWeight="medium">Type af ressourceperson</Text>
                    <Input
                      value={customRelationName}
                      onChange={(e) => setCustomRelationName(e.target.value)}
                      placeholder="f.eks. Psykolog, Talepædagog, etc."
                      borderColor={errors.customRelationName ? 'red.400' : undefined}
                    />
                    {errors.customRelationName && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {errors.customRelationName}
                      </Text>
                    )}
                  </Box>
                )}
              </VStack>
            </form>
          </DialogBody>

          <DialogFooter p={6} pt={0}>
            <DialogActionTrigger asChild>
              <Button variant="outline">Annuller</Button>
            </DialogActionTrigger>
            <Button
              type="submit"
              form="add-child-form"
              colorPalette="blue"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Tilføjer...' : 'Tilføj barn'}
            </Button>
          </DialogFooter>

          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </Box>
  );
}
