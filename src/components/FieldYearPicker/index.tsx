import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Portal,
} from '@chakra-ui/react';
import { FieldProps, useField } from '@formiz/core';
import dayjs, { Dayjs } from 'dayjs';
import { FiCalendar } from 'react-icons/fi';
import { usePopper } from 'react-popper';

import { FormGroup, FormGroupProps } from '@/components/FormGroup';
import { Icon } from '@/components/Icons';

type Value = Dayjs;

export type FieldYearPickerProps = FieldProps<
  Value,
  string | number | Date | null
> &
  FormGroupProps & {
    placeholder?: string;
    disableTyping?: boolean;
    yearRange?: { start: number; end: number };
    noFormGroup?: boolean;
    portalTarget?: HTMLElement | null;
  };

export const FieldYearPicker = ({
  placeholder = 'Select year',
  size = 'md',
  disableTyping = true,
  yearRange,
  noFormGroup = false,
  portalTarget,
  ...props
}: FieldYearPickerProps) => {
  const field = useField(props, {
    formatValue: (v) => (v ? dayjs(v) : null),
  });

  const { id, isValid, errorMessage, shouldDisplayError, isRequired } = field;
  const showError = shouldDisplayError && !isValid;

  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(
    null
  );
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);

  const getIconSize = () => {
    switch (size) {
      case 'sm': return '0.875rem'; // 14px
      case 'md': return '1rem';     // 16px
      case 'lg': return '1.25rem';  // 20px
      default: return '1rem';
    }
  };

  const getLeftElementPadding = () => {
    switch (size) {
      case 'sm': return 2; // Chakra spacing value
      case 'md': return 3;
      case 'lg': return 4;
      default: return 3;
    }
  };
  
  // Properly typed popper configuration
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'bottom-start',
    modifiers: [
      {
        name: 'preventOverflow',
        options: {
          boundary: document.body, // Use the document body as boundary
          altBoundary: true,
        },
      },
      {
        name: 'flip',
        options: {
          fallbackPlacements: ['top-start', 'bottom-end'],
        },
      },
    ],
  });

  const currentYear = dayjs().year();
  const startYear = yearRange?.start ?? currentYear - 50;
  const endYear = yearRange?.end ?? currentYear + 10;
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );

  const [visible, setVisible] = useState(false);

  const handleSelect = useCallback(
    (year: number) => {
      const date = dayjs().year(year).startOf('year');
      field.setValue(date);
      field.setIsTouched(true);
      setVisible(false);
    },
    [field]
  );

  // Close popper on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        referenceElement &&
        popperElement &&
        !referenceElement.contains(event.target as Node) &&
        !popperElement.contains(event.target as Node)
      ) {
        setVisible(false);
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible, referenceElement, popperElement]);

  // Create a ref for the portal container
  const [defaultPortalTarget, setDefaultPortalTarget] = useState<HTMLElement | null>(null);
  
  useEffect(() => {
    if (!portalTarget && typeof document !== 'undefined') {
      let target = document.getElementById('year-picker-portal');
      if (!target) {
        target = document.createElement('div');
        target.id = 'year-picker-portal';
        document.body.appendChild(target);
      }
      setDefaultPortalTarget(target);
    }
  }, [portalTarget]);


  const content = (
    <>
      <InputGroup className={'year-picker'}>
         <InputLeftElement
          pointerEvents="none"
          height="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          pl={getLeftElementPadding()}
        >
          <Icon
            icon={FiCalendar}
            fontSize={getIconSize()}
            color="gray.400"
            marginRight={2}
          />
        </InputLeftElement>
        <Input
          ref={setReferenceElement}
          id={id}
          value={field.value?.format('YYYY') ?? ''}
          onFocus={() => setVisible(true)}
          placeholder={placeholder}
          readOnly={disableTyping}
          size={size}
        />
      </InputGroup>

      {visible && (
        <Portal containerRef={{ current: portalTarget || defaultPortalTarget }}>
          <Box
            ref={setPopperElement}
            {...attributes.popper}
            style={{ ...styles.popper, zIndex: 9999 }}
            position="absolute"
            bg="white"
            p={3}
            maxHeight="14rem"
            overflowY="auto"
            shadow="md"
            borderRadius="md"
            borderWidth="1px"
          >
            <SimpleGrid columns={5} spacing={2}>
              {years.map((year) => (
                <Button
                  key={year}
                  size={size}
                  variant="ghost"
                  onClick={() => handleSelect(year)}
                  _hover={{ bg: 'blue.50' }}
                  _active={{ bg: 'blue.100' }}
                >
                  {year}
                </Button>
              ))}
            </SimpleGrid>
          </Box>
        </Portal>
      )}
    </>
  );

  return noFormGroup ? (
    content
  ) : (
    <FormGroup
      id={id}
      label={props.label}
      errorMessage={errorMessage}
      showError={showError}
      isRequired={isRequired}
    >
      {content}
    </FormGroup>
  );
};