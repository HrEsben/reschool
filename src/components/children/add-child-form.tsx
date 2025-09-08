"use client";

import { useState } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Input,
  Text,
  Icon,
  RadioGroup,
  Card
} from '@chakra-ui/react';
import { DialogManager } from '@/components/ui/dialog-manager';

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

      <DialogManager
        trigger={
          <Button 
            bg="#81b29a"
            color="#f4f1de"
            size="lg"
            fontWeight="600"
            px={6}
            _hover={{
              bg: "#6da085",
              transform: "translateY(-1px)",
            }}
            transition="all 0.2s ease"
          >
            <Icon mr={2} boxSize={5}>
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </Icon>
            Tilføj
          </Button>
        }
        title="Tilføj barn"
        maxWidth="lg"
        isOpen={open}
        onOpenChange={setOpen}
        primaryAction={{
          label: isLoading ? 'Tilføjer...' : 'Tilføj barn',
          onClick: () => {
            const form = document.getElementById('add-child-form') as HTMLFormElement;
            if (form) {
              form.requestSubmit();
            }
          },
          isLoading: isLoading,
          isDisabled: isLoading
        }}
        secondaryAction={{
          label: 'Annuller',
          onClick: () => setOpen(false),
          variant: 'outline'
        }}
      >
        <Box bg="#f4f1de" p={6} borderRadius="md">
          <form onSubmit={handleSubmit} id="add-child-form">
            <VStack gap={4} align="stretch">
              <Box>
                <Text mb={2} fontWeight="500" color="#3d405b">Barnets navn</Text>
                <Input
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Indtast barnets navn"
                  bg="white"
                  className={errors.childName ? 'border-burnt-sienna-400' : 'border-eggshell-400'}
                  _focus={{
                    borderColor: '#81b29a',
                    shadow: '0 0 0 1px #81b29a',
                    outline: 'none'
                  }}
                />
                {errors.childName && (
                  <Text className="text-burnt-sienna-500" fontSize="sm" mt={1} fontWeight="500">
                    {errors.childName}
                  </Text>
                )}
              </Box>

              <Box>
                <Text mb={3} fontWeight="500" color="#3d405b">Din relation til barnet</Text>
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
                            className="hover:bg-[#f4f1de] rounded-sm px-2 py-1 cursor-pointer w-full transition-colors duration-200"
                          >
                            <HStack gap={3}>
                              <RadioGroup.ItemHiddenInput />
                              <RadioGroup.ItemIndicator 
                                borderColor="#81b29a" 
                                _checked={{ bg: "#81b29a", borderColor: "#81b29a" }}
                              />
                              <RadioGroup.ItemText fontWeight="500" color="#3d405b">
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
                  <Text mb={2} fontWeight="500" color="#3d405b">Type af ressourceperson</Text>
                  <Box px={1} pb={1}>
                    <Input
                      value={customRelationName}
                      onChange={(e) => setCustomRelationName(e.target.value)}
                      placeholder="f.eks. Psykolog, Talepædagog, etc."
                      bg="white"
                      className={errors.customRelationName ? 'border-burnt-sienna-400' : 'border-eggshell-400'}
                      _focus={{
                        borderColor: '#81b29a',
                        shadow: '0 0 0 1px #81b29a',
                        outline: 'none'
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
        </Box>
      </DialogManager>
    </Box>
  );
}
