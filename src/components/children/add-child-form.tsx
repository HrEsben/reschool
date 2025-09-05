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
          borderRadius="lg"
          className={message.type === 'success' ? 'bg-cambridge-blue-900 border-l-4 border-cambridge-blue-400' : 'bg-burnt-sienna-900 border-l-4 border-burnt-sienna-400'}
        >
          <Text className={message.type === 'success' ? 'text-cambridge-blue-600' : 'text-burnt-sienna-600'} fontWeight="500">
            {message.text}
          </Text>
        </Box>
      )}

      <DialogRoot open={open} onOpenChange={(e) => setOpen(e.open)} placement="center">
        <DialogTrigger asChild>
          <Button 
            className="bg-delft-blue-500 text-white hover:bg-delft-blue-400 shadow-md hover:shadow-lg"
            size="lg"
            fontWeight="600"
            px={6}
            _hover={{
              transform: "translateY(-1px)",
            }}
            transition="all 0.2s ease"
          >
            Tilføj barn
          </Button>
        </DialogTrigger>

        <DialogBackdrop className="bg-delft-blue-900/60" backdropFilter="blur(4px)" />

        <DialogContent 
          maxW="lg" 
          w="90vw"
          position="fixed"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          zIndex="modal"
          className="bg-eggshell-900 border border-eggshell-300"
          borderRadius="xl"
          shadow="2xl"
          p={0}
          maxH="90vh"
          overflow="hidden"
        >
          <DialogHeader p={6} pb={0} className="bg-eggshell-800" borderTopRadius="xl">
            <DialogTitle className="text-delft-blue-500" fontWeight="600" fontSize="xl">Tilføj barn</DialogTitle>
          </DialogHeader>

          <DialogBody p={6} overflowY="auto" className="bg-eggshell-900">
            <form onSubmit={handleSubmit} id="add-child-form">
              <VStack gap={4} align="stretch">
                <Box>
                  <Text mb={2} fontWeight="500" className="text-delft-blue-600">Barnets navn</Text>
                  <Input
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="Indtast barnets navn"
                    className={errors.childName ? 'border-burnt-sienna-400 bg-white' : 'border-eggshell-400 bg-white'}
                    _focus={{
                      borderColor: 'delft-blue.500',
                      shadow: '0 0 0 1px token(colors.delft-blue.500)'
                    }}
                  />
                  {errors.childName && (
                    <Text className="text-burnt-sienna-500" fontSize="sm" mt={1} fontWeight="500">
                      {errors.childName}
                    </Text>
                  )}
                </Box>

                <Box>
                  <Text mb={2} fontWeight="500" className="text-delft-blue-600">Din relation til barnet</Text>
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
                        <label htmlFor={option.value} style={{ color: 'var(--colors-fg-default)', fontWeight: '500' }}>
                          {option.label}
                        </label>
                      </Box>
                    ))}
                  </VStack>
                </Box>

                {relation === 'Ressourceperson' && (
                  <Box>
                    <Text mb={2} fontWeight="500" className="text-delft-blue-600">Type af ressourceperson</Text>
                    <Input
                      value={customRelationName}
                      onChange={(e) => setCustomRelationName(e.target.value)}
                      placeholder="f.eks. Psykolog, Talepædagog, etc."
                      className={errors.customRelationName ? 'border-burnt-sienna-400 bg-white' : 'border-eggshell-400 bg-white'}
                      _focus={{
                        borderColor: 'delft-blue.500',
                        shadow: '0 0 0 1px token(colors.delft-blue.500)'
                      }}
                    />
                    {errors.customRelationName && (
                      <Text className="text-burnt-sienna-500" fontSize="sm" mt={1} fontWeight="500">
                        {errors.customRelationName}
                      </Text>
                    )}
                  </Box>
                )}
              </VStack>
            </form>
          </DialogBody>

          <DialogFooter p={6} pt={4} className="bg-eggshell-800 border-t border-eggshell-300" borderBottomRadius="xl">
            <DialogActionTrigger asChild>
              <Button variant="outline" className="border-delft-blue-400 text-delft-blue-600 hover:bg-delft-blue-900">Annuller</Button>
            </DialogActionTrigger>
            <Button
              type="submit"
              form="add-child-form"
              className="bg-cambridge-blue-500 text-white hover:bg-cambridge-blue-400"
              loading={isLoading}
              disabled={isLoading}
              fontWeight="600"
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
