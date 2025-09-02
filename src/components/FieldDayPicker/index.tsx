import { useCallback } from 'react';

import { FieldProps, useField } from '@formiz/core';
import dayjs, { Dayjs } from 'dayjs';
import { isMatch } from 'react-day-picker';

import { DayPicker, DayPickerProps } from '@/components/DayPicker';
import {
  getAfterDateDisabledDatesConfig,
  getBeforeDateDisabledDatesConfig,
} from '@/components/FieldDayPicker/utils';
import { FormGroup, FormGroupProps } from '@/components/FormGroup';

export type FieldDayPickerPossibleFormattedValue =
  | string
  | number
  | Dayjs
  | Date;

type Value = Dayjs;

type UsualDayPickerProps = 'placeholder';

export type DisabledDays = 'future' | 'past';
type DateDisableOption = 'future' | 'past' | { before: Date } | { after: Date };

export type FieldDayPickerProps<
  FormattedValue extends FieldDayPickerPossibleFormattedValue = Value,
> = FieldProps<Value, FormattedValue> &
  FormGroupProps & {
    showError?: boolean;
    dayPickerProps?: Partial<Omit<DayPickerProps, UsualDayPickerProps>>;
    noFormGroup?: boolean;
    invalidMessage?: string;
    disabledDays?: DateDisableOption;
    disableTyping?: boolean; // Add this new prop
  } & Pick<DayPickerProps, UsualDayPickerProps>;

const getLabelSize = (size: string | number) => {
  const sizeMap: { [key: string]: string } = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
  };
  return sizeMap[size] || 'md';
};

export const FieldDayPicker = <
  FormattedValue extends FieldDayPickerPossibleFormattedValue = Value,
>({
  invalidMessage,
  dayPickerProps,
  ...restFieldProps
}: FieldDayPickerProps<FormattedValue>) => {
  const getValidations = useCallback(
    () => [
      {
        handler: (v: FormattedValue) => v !== undefined,
        message: invalidMessage ?? 'Invalid date',
      },
      ...(restFieldProps.validations ?? []),
      {
        handler: (value: FormattedValue) =>
          value
            ? !isMatch(
                dayjs(value).toDate(),
                !dayPickerProps?.isDisabled
                  ? []
                  : Array.isArray(dayPickerProps.isDisabled)
                    ? dayPickerProps.isDisabled
                    : [dayPickerProps.isDisabled]
              )
            : true,
        message: invalidMessage,
        deps: [dayPickerProps?.isDisabled],
      },
    ],
    [invalidMessage, restFieldProps.validations, dayPickerProps?.isDisabled]
  );

  const field = useField(restFieldProps, {
    formatValue: (value) =>
      (value
        ? dayjs.isDayjs(value)
          ? value
          : dayjs(value)
        : null) as FormattedValue,
    validations: getValidations(),
  });

  const {
    noFormGroup,
    disabledDays,
    placeholder,
    size,
    showError,
    disableTyping = true, // Default to true to prevent typing
    ...rest
  } = field.otherProps;

  const labelSize = getLabelSize(size?.toString() || 'md') as
    | 'sm'
    | 'md'
    | 'lg'
    | undefined;

  const formGroupProps = {
    ...(noFormGroup ? {} : rest),
    id: field.id,
    errorMessage: field.errorMessage,
    showError: (showError ?? field.shouldDisplayError) && !field.isValid,
    isRequired: field.isRequired,
    labelSize,
  };

  const dayPickerPropsWithSize = {
    ...dayPickerProps,
    inputProps: {
      ...dayPickerProps?.inputProps,
      size,
      readOnly: disableTyping, // Make input read-only to prevent typing
      onKeyDown: disableTyping
        ? (e: React.KeyboardEvent) => e.preventDefault()
        : undefined, // Prevent keyboard input
    },
  };

  const getDisabledDaysMatcher = () => {
    if (typeof disabledDays === 'object') {
      if ('before' in disabledDays) {
        return getBeforeDateDisabledDatesConfig(dayjs(disabledDays.before));
      }
      if ('after' in disabledDays) {
        return getAfterDateDisabledDatesConfig(dayjs(disabledDays.after));
      }
    }
    switch (disabledDays) {
      case 'future':
        return getAfterDateDisabledDatesConfig(dayjs());
      case 'past':
        return getBeforeDateDisabledDatesConfig(dayjs());
      default:
        return null;
    }
  };

  const defaultDisabledDays = (
    !dayPickerProps?.isDisabled
      ? [getDisabledDaysMatcher()]
      : Array.isArray(dayPickerProps.isDisabled)
        ? [...dayPickerProps.isDisabled, getDisabledDaysMatcher()]
        : [dayPickerProps.isDisabled, getDisabledDaysMatcher()]
  ).filter(Boolean);

  const content = (
    <DayPicker
      placeholder={placeholder}
      dayPickerProps={{
        ...dayPickerPropsWithSize,
        disabled: defaultDisabledDays,
      }}
      value={field.value ? dayjs(field.value).toDate() : null}
      onChange={(date) => {
        field.setValue(date instanceof Date ? dayjs(date) : date);
        dayPickerProps?.onChange?.(date);
      }}
      onClose={(date) => {
        field.setIsTouched(true);
        dayPickerProps?.onClose?.(date);
      }}
      inputProps={{
        id: field.id,
        size,
        onKeyDown: disableTyping
          ? (e: React.KeyboardEvent) => e.preventDefault()
          : undefined, // Prevent keyboard input
        ...dayPickerProps?.inputProps,
      }}
    />
  );

  if (noFormGroup) {
    return content;
  }

  return <FormGroup {...formGroupProps}>{content}</FormGroup>;
};
