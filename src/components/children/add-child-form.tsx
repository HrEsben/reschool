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
  DialogTrigger,
  RadioGroup,
  Card
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
            className="bg-delft-blue-500 text-white hover:bg-delft-blue-400"
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
          p={0}
          maxH="90vh"
          overflow="hidden"
        >
          <DialogHeader 
            p={6} 
            pb={4} 
            bg="#f8f9fc" 
            borderBottom="1px solid" 
            borderBottomColor="#e1e5f0" 
            borderTopRadius="xl"
          >
            <DialogTitle color="#2a3a5c" fontWeight="600" fontSize="xl">Tilføj barn</DialogTitle>
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
                    bg="white"
                    className={errors.childName ? 'border-burnt-sienna-400' : 'border-eggshell-400'}
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
                  <Text mb={3} fontWeight="500" className="text-delft-blue-600">Din relation til barnet</Text>
                  <Card.Root 
                    variant="outline" 
                    className="border-eggshell-400"
                  >
                    <Card.Body p={4}>
                      <RadioGroup.Root
                        value={relation}
                        onValueChange={(details) => {
                          if (details.value) {
                            setRelation(details.value as RelationType);
                          }
                        }}
                      >
                        <VStack gap={3} align="start">
                          {[
                            { value: 'Mor', label: 'Mor' },
                            { value: 'Far', label: 'Far' },
                            { value: 'Underviser', label: 'Underviser' },
                            { value: 'Ressourceperson', label: 'Ressourceperson' },
                          ].map((option) => (
                            <RadioGroup.Item
                              key={option.value}
                              value={option.value}
                              className="hover:bg-eggshell-900 rounded-sm px-2 py-1 cursor-pointer w-full transition-colors duration-200"
                            >
                              <HStack gap={3}>
                                <RadioGroup.ItemHiddenInput />
                                <RadioGroup.ItemIndicator className="border-delft-blue-500 data-[checked]:bg-delft-blue-500" />
                                <RadioGroup.ItemText fontWeight="500" className="text-delft-blue-700">
                                  {option.label}
                                </RadioGroup.ItemText>
                              </HStack>
                            </RadioGroup.Item>
                          ))}
                        </VStack>
                      </RadioGroup.Root>
                    </Card.Body>
                  </Card.Root>
                </Box>

                <Box 
                  style={{
                    maxHeight: relation === 'Ressourceperson' ? '140px' : '0px',
                    opacity: relation === 'Ressourceperson' ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease-in-out'
                  }}
                >
                  <Box pt={relation === 'Ressourceperson' ? 2 : 0} px={1} pb={2}>
                    <Text mb={2} fontWeight="500" className="text-delft-blue-600">Type af ressourceperson</Text>
                    <Box px={1} pb={1}>
                      <Input
                        value={customRelationName}
                        onChange={(e) => setCustomRelationName(e.target.value)}
                        placeholder="f.eks. Psykolog, Talepædagog, etc."
                        bg="white"
                        className={errors.customRelationName ? 'border-burnt-sienna-400' : 'border-eggshell-400'}
                        _focus={{
                          borderColor: 'delft-blue.500',
                          shadow: '0 0 0 1px token(colors.delft-blue.500)'
                        }}
                      />
                    </Box>
                    {errors.customRelationName && (
                      <Text className="text-burnt-sienna-500" fontSize="sm" mt={1} fontWeight="500" px={1}>
                        {errors.customRelationName}
                      </Text>
                    )}
                  </Box>
                </Box>
              </VStack>
            </form>
          </DialogBody>

          <DialogFooter 
            p={6} 
            pt={4} 
            bg="#fef9f0" 
            borderTop="1px solid" 
            borderTopColor="#f5e6d3" 
            borderBottomRadius="xl"
          >
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
