import {
  AsyncCreatableProps,
  AsyncProps,
  AsyncCreatableSelect as ChakraAsyncCreatableSelect,
  AsyncSelect as ChakraAsyncReactSelect,
  CreatableSelect as ChakraCreatableReactSelect,
  Select as ChakraReactSelect,
  CreatableProps,
  GroupBase,
  Props,
} from 'chakra-react-select';

export type SelectProps<
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
> =
  | ({
      type?: 'select';
      maxLength?: number;
      isCaseSensitive?: boolean; 
      onlyAlphabets?: boolean; 
      onCreateOption?: (inputValue: string) => void;
      onInputChange?: (inputValue: string) => void;
    } & Props<Option, IsMulti, Group>)
  | ({
      type: 'creatable';
      maxLength?: number;
      isCaseSensitive?: boolean; 
      onlyAlphabets?: boolean; 
      onCreateOption?: (inputValue: string) => void;
      onInputChange?: (inputValue: string) => void;
    } & CreatableProps<Option, IsMulti, Group>)
  | ({
      type: 'async';
      maxLength?: number;
      isCaseSensitive?: boolean; 
      onlyAlphabets?: boolean; 
      onCreateOption?: (inputValue: string) => void;
      onInputChange?: (inputValue: string) => void;
    } & AsyncProps<Option, IsMulti, Group>)
  | ({
      type: 'async-creatable';
      maxLength?: number;
      isCaseSensitive?: boolean; 
      onlyAlphabets?: boolean; 
      onCreateOption?: (inputValue: string) => void;
      onInputChange?: (inputValue: string) => void;
    } & AsyncCreatableProps<Option, IsMulti, Group>);

export const Select = <
  Option = unknown,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({
  type = 'select',
  maxLength,
  isCaseSensitive,
  onlyAlphabets, 
  onCreateOption,
  onInputChange,
  ...props
}: SelectProps<Option, IsMulti, Group>) => {

  const handleInputChange = (inputValue: string, actionMeta: any) => {
    let inputFieldValue = maxLength ? inputValue.substring(0, maxLength) : inputValue;
    if (onlyAlphabets) {
      inputFieldValue = inputFieldValue.replace(/[^A-Za-z]/g, '');
    }
    let transformedValue = isCaseSensitive ? inputFieldValue.toUpperCase() : inputFieldValue;

    if (onInputChange) {
      onInputChange(transformedValue, actionMeta);
    }

    return transformedValue;
};

  const Element = (() => {
    if (type === 'async-creatable') return ChakraAsyncCreatableSelect;
    if (type === 'async') return ChakraAsyncReactSelect;
    if (type === 'creatable') return ChakraCreatableReactSelect;
    return ChakraReactSelect;
  })();

  return (
    <Element
      colorScheme="brand"
      selectedOptionColorScheme="brand"
      useBasicStyles
      chakraStyles={{
        singleValue: (provided) => ({
          ...provided,
          whiteSpace: "normal", // Allow text to wrap
          overflow: "visible",  // Ensure text doesn't get clipped
          textOverflow: "unset", // Disable ellipsis
        }),
        clearIndicator: (provided) => ({
          ...provided,
          padding: 0,
          marginRight: 0,
          marginLeft: 0,
        }),
        dropdownIndicator: (provided) => ({
          ...provided,
          padding: 0,
          marginRight: 0,
          marginLeft: 0,
          width: 2
        }),
        control: (provided) => ({
          ...provided,
          paddingLeft: 2,
          paddingRight: 2,
        }),
        valueContainer: (provided) => ({
          ...provided,
          padding: 0
        }),
        multiValue: (provided) => ({
          ...provided,
          _first: {
            ml: -1,
          },
        }),
      }}
      onCreateOption={onCreateOption}
      onInputChange={handleInputChange}
      {...props}
    />
  );
};
