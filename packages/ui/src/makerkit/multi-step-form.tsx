'use client';

import React, {
  type HTMLProps,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Slot, Slottable } from '@radix-ui/react-slot';
import { useMutation } from '@tanstack/react-query';
import type {
  FieldValues,
  Path,
  UseFormReturn,
} from 'react-hook-form';
import { z } from 'zod';

import { cn } from '../lib/utils';

/**
 * A form schema must accept and return values compatible
 * with React Hook Form.
 */
type FormSchema = z.ZodType<FieldValues, FieldValues>;

type FormValues<Schema extends FormSchema> = z.output<Schema>;

interface MultiStepFormProps<Schema extends FormSchema> {
  schema: Schema;
  form: UseFormReturn<FormValues<Schema>>;
  onSubmit: (data: FormValues<Schema>) => void | Promise<void>;
  useStepTransition?: boolean;
  className?: string;
}

type StepProps = React.PropsWithChildren<
  {
    name: string;
    asChild?: boolean;
  } & React.HTMLProps<HTMLDivElement>
>;

interface MultiStepFormContextValue<
  Schema extends FormSchema,
> {
  form: UseFormReturn<FormValues<Schema>>;
  currentStep: string;
  currentStepIndex: number;
  totalSteps: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  nextStep: <Event extends React.SyntheticEvent>(
    event: Event,
  ) => void;
  prevStep: <Event extends React.SyntheticEvent>(
    event: Event,
  ) => void;
  goToStep: (index: number) => void;
  direction: 'forward' | 'backward' | undefined;
  isStepValid: () => boolean;
  isValid: boolean;
  errors: UseFormReturn<FormValues<Schema>>['formState']['errors'];
  mutation: ReturnType<typeof useMutation<void, Error, void>>;
}

/**
 * React contexts cannot directly preserve a generic schema type.
 * The concrete type is restored in useMultiStepFormContext.
 */
const MultiStepFormContext = createContext<unknown>(null);

/**
 * @name MultiStepForm
 * @description Multi-step form component for React.
 */
export function MultiStepForm<Schema extends FormSchema>({
  schema,
  form,
  onSubmit,
  children,
  className,
}: React.PropsWithChildren<MultiStepFormProps<Schema>>) {
  const steps = useMemo(
    () =>
      React.Children.toArray(children).filter(
        (child): child is React.ReactElement<StepProps> =>
          React.isValidElement(child) &&
          child.type === MultiStepFormStep,
      ),
    [children],
  );

  const header = useMemo(() => {
    return React.Children.toArray(children).find(
      (child) =>
        React.isValidElement(child) &&
        child.type === MultiStepFormHeader,
    );
  }, [children]);

  const footer = useMemo(() => {
    return React.Children.toArray(children).find(
      (child) =>
        React.isValidElement(child) &&
        child.type === MultiStepFormFooter,
    );
  }, [children]);

  const stepNames = useMemo(
    () => steps.map((step) => step.props.name),
    [steps],
  );

  const multiStepForm = useMultiStepForm(
    schema,
    form,
    stepNames,
    onSubmit,
  );

  return (
    <MultiStepFormContext.Provider value={multiStepForm}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          className,
          'flex size-full flex-col overflow-hidden',
        )}
      >
        {header}

        <div className="relative transition-transform duration-500">
          {steps.map((step, index) => {
            const isActive =
              index === multiStepForm.currentStepIndex;

            return (
              <AnimatedStep
                key={step.props.name}
                direction={multiStepForm.direction}
                isActive={isActive}
                index={index}
                currentIndex={
                  multiStepForm.currentStepIndex
                }
              >
                {step}
              </AnimatedStep>
            );
          })}
        </div>

        {footer}
      </form>
    </MultiStepFormContext.Provider>
  );
}

/**
 * Provides access to the multi-step form context through
 * a render function.
 */
export function MultiStepFormContextProvider<
  Schema extends FormSchema,
>(props: {
  children: (
    context: MultiStepFormContextValue<Schema>,
  ) => React.ReactNode;
}) {
  const context = useMultiStepFormContext<Schema>();

  if (Array.isArray(props.children)) {
    const [child] = props.children;

    return (
      child as (
        context: MultiStepFormContextValue<Schema>,
      ) => React.ReactNode
    )(context);
  }

  return props.children(context);
}

export const MultiStepFormStep: React.FC<
  React.PropsWithChildren<
    {
      asChild?: boolean;
      ref?: React.Ref<HTMLDivElement>;
    } & HTMLProps<HTMLDivElement>
  >
> = function MultiStepFormStep({
  children,
  asChild,
  ...props
}) {
  const Component = asChild ? Slot : 'div';

  return (
    <Component {...props}>
      <Slottable>{children}</Slottable>
    </Component>
  );
};

/**
 * Access the current multi-step form context.
 *
 * The schema generic must match the schema passed to MultiStepForm.
 */
export function useMultiStepFormContext<
  Schema extends FormSchema,
>() {
  const context = useContext(MultiStepFormContext);

  if (!context) {
    throw new Error(
      'useMultiStepFormContext must be used within a MultiStepForm',
    );
  }

  return context as MultiStepFormContextValue<Schema>;
}

/**
 * @name useMultiStepForm
 * @description Hook for multi-step forms.
 */
export function useMultiStepForm<
  Schema extends FormSchema,
>(
  schema: Schema,
  form: UseFormReturn<FormValues<Schema>>,
  stepNames: string[],
  onSubmit: (
    data: FormValues<Schema>,
  ) => void | Promise<void>,
): MultiStepFormContextValue<Schema> {
  const [state, setState] = useState<{
    currentStepIndex: number;
    direction: 'forward' | 'backward' | undefined;
  }>({
    currentStepIndex: 0,
    direction: undefined,
  });

  const isStepValid = useCallback(() => {
    const currentStepName = stepNames[
      state.currentStepIndex
    ] as Path<FormValues<Schema>>;

    if (schema instanceof z.ZodObject) {
      const shape = schema.shape as Record<
        string,
        z.ZodType
      >;

      const currentStepSchema =
        shape[currentStepName as string];

      // The step may not contain form fields or may not
      // require schema validation.
      if (!currentStepSchema) {
        return true;
      }

      const currentStepData =
        form.getValues(currentStepName) ?? {};

      const result =
        currentStepSchema.safeParse(currentStepData);

      return result.success;
    }

    throw new Error(
      `Unsupported schema type: ${schema.constructor.name}`,
    );
  }, [
    schema,
    form,
    stepNames,
    state.currentStepIndex,
  ]);

  const nextStep = useCallback(
    <Event extends React.SyntheticEvent>(
      event: Event,
    ) => {
      // Prevent form submission when Enter is pressed
      // or when a button has no explicit type.
      event.preventDefault();

      const stepIsValid = isStepValid();

      if (!stepIsValid) {
        const currentStepName = stepNames[
          state.currentStepIndex
        ] as Path<FormValues<Schema>>;

        if (schema instanceof z.ZodObject) {
          const shape = schema.shape as Record<
            string,
            z.ZodType
          >;

          const currentStepSchema =
            shape[currentStepName as string];

          if (
            currentStepSchema instanceof z.ZodObject
          ) {
            const fields = Object.keys(
              currentStepSchema.shape,
            );

            const keys = fields.map(
              (field) =>
                `${String(currentStepName)}.${field}`,
            );

            // Trigger validation for all fields
            // belonging to the current step.
            for (const key of keys) {
              void form.trigger(
                key as Path<FormValues<Schema>>,
              );
            }

            return;
          }
        }
      }

      if (
        stepIsValid &&
        state.currentStepIndex < stepNames.length - 1
      ) {
        setState((previousState) => ({
          ...previousState,
          direction: 'forward',
          currentStepIndex:
            previousState.currentStepIndex + 1,
        }));
      }
    },
    [
      isStepValid,
      state.currentStepIndex,
      stepNames,
      schema,
      form,
    ],
  );

  const prevStep = useCallback(
    <Event extends React.SyntheticEvent>(
      event: Event,
    ) => {
      // Prevent form submission when Enter is pressed
      // or when a button has no explicit type.
      event.preventDefault();

      if (state.currentStepIndex > 0) {
        setState((previousState) => ({
          ...previousState,
          direction: 'backward',
          currentStepIndex:
            previousState.currentStepIndex - 1,
        }));
      }
    },
    [state.currentStepIndex],
  );

  const goToStep = useCallback(
    (index: number) => {
      const indexIsValid =
        index >= 0 && index < stepNames.length;

      if (!indexIsValid || !isStepValid()) {
        return;
      }

      setState((previousState) => ({
        ...previousState,
        direction:
          index > previousState.currentStepIndex
            ? 'forward'
            : 'backward',
        currentStepIndex: index,
      }));
    },
    [isStepValid, stepNames.length],
  );

  const isValid = form.formState.isValid;
  const errors = form.formState.errors;

  const mutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      await form.handleSubmit(onSubmit)();
    },
  });

  return useMemo(
    () => ({
      form,
      currentStep:
        stepNames[state.currentStepIndex] ?? '',
      currentStepIndex: state.currentStepIndex,
      totalSteps: stepNames.length,
      isFirstStep: state.currentStepIndex === 0,
      isLastStep:
        state.currentStepIndex ===
        stepNames.length - 1,
      nextStep,
      prevStep,
      goToStep,
      direction: state.direction,
      isStepValid,
      isValid,
      errors,
      mutation,
    }),
    [
      form,
      mutation,
      stepNames,
      state.currentStepIndex,
      state.direction,
      nextStep,
      prevStep,
      goToStep,
      isStepValid,
      isValid,
      errors,
    ],
  );
}

export const MultiStepFormHeader: React.FC<
  React.PropsWithChildren<
    {
      asChild?: boolean;
    } & HTMLProps<HTMLDivElement>
  >
> = function MultiStepFormHeader({
  children,
  asChild,
  ...props
}) {
  const Component = asChild ? Slot : 'div';

  return (
    <Component {...props}>
      <Slottable>{children}</Slottable>
    </Component>
  );
};

export const MultiStepFormFooter: React.FC<
  React.PropsWithChildren<
    {
      asChild?: boolean;
    } & HTMLProps<HTMLDivElement>
  >
> = function MultiStepFormFooter({
  children,
  asChild,
  ...props
}) {
  const Component = asChild ? Slot : 'div';

  return (
    <Component {...props}>
      <Slottable>{children}</Slottable>
    </Component>
  );
};

/**
 * @name createStepSchema
 * @description Create a schema for a multi-step form.
 */
export function createStepSchema<
  Shape extends Record<string, z.ZodType>,
>(steps: Shape) {
  return z.object(steps);
}

interface AnimatedStepProps {
  direction: 'forward' | 'backward' | undefined;
  isActive: boolean;
  index: number;
  currentIndex: number;
}

function AnimatedStep({
  isActive,
  direction,
  children,
  index,
  currentIndex,
}: React.PropsWithChildren<AnimatedStepProps>) {
  const [shouldRender, setShouldRender] =
    useState(isActive);

  const stepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive) {
      setShouldRender(true);

      return;
    }

    const timer = window.setTimeout(() => {
      setShouldRender(false);
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isActive]);

  useEffect(() => {
    if (!isActive || !stepRef.current) {
      return;
    }

    const focusableElement =
      stepRef.current.querySelector<HTMLElement>(
        [
          'button',
          '[href]',
          'input',
          'select',
          'textarea',
          'not([tabindex="-1"])',
        ].join(', '),
      );

    focusableElement?.focus();
  }, [isActive]);

  if (!shouldRender) {
    return null;
  }

  const baseClasses =
    'top-0 left-0 size-full transition-all duration-300 ease-in-out animate-in fade-in zoom-in-95';

  const visibilityClasses = isActive
    ? 'opacity-100'
    : 'absolute opacity-0';

  const transformClasses = cn(
    'translate-x-0',
    !isActive && {
      '-translate-x-full':
        direction === 'forward' ||
        index < currentIndex,
      'translate-x-full':
        direction === 'backward' ||
        index > currentIndex,
    },
  );

  const className = cn(
    baseClasses,
    visibilityClasses,
    transformClasses,
  );

  return (
    <div
      ref={stepRef}
      className={className}
      aria-hidden={!isActive}
    >
      {children}
    </div>
  );
}