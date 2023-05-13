import {
    createStore,
    Domain,
    Event,
    Store,
    combine,
    sample,
    guard,
    merge,
} from "effector"
import {
    ValidationError,
    Field,
    FieldData,
    FieldConfig,
    AnyFormValues,
    ValidationEvent,
} from "./types"
import { createCombineValidator } from "./validation"
import { createFormUnit } from "./create-form-unit"

export function createField(
    fieldName: string,
    fieldConfig: FieldConfig<any>,
    domain?: Domain,
    effectorData?: any,
): Field<any> {
    const initValue = typeof fieldConfig.init === "function"
        ? fieldConfig.init()
        : fieldConfig.init

    const $value = createFormUnit.store({
        domain,
        existing: fieldConfig.units?.$value,
        init: initValue,
    }, effectorData)

    const $errors = createFormUnit.store<ValidationError[]>({
        domain,
        existing: fieldConfig.units?.$errors,
        init: [],
    }, effectorData)


    const $firstError = $errors.map(
        (errors) => errors[0] ? errors[0] : null
    )

    const $isDirty = $value.map((value) => value !== initValue)

    const $touched = createFormUnit.store({
        domain,
        existing: fieldConfig.units?.$isTouched,
        init: false,
    }, effectorData)

    const onChange = createFormUnit.event({
        domain,
        existing: fieldConfig.units?.onChange,
    })
    const onBlur = createFormUnit.event({
        domain,
        existing: fieldConfig.units?.onBlur,
    })
    const changed = createFormUnit.event({
        domain,
        existing: fieldConfig.units?.changed,
    })
    const addError = createFormUnit.event<{
        rule: string
        errorText?: string
    }>({
        domain,
        existing: fieldConfig.units?.addError,
    })
    const validate = createFormUnit.event({
        domain,
        existing: fieldConfig.units?.validate,
    })
    const resetErrors = createFormUnit.event({
        domain,
        existing: fieldConfig.units?.resetErrors,
    })
    const resetValue = createFormUnit.event({
        domain,
        existing: fieldConfig.units?.resetValue,
    })
    const reset = createFormUnit.event({
        domain,
        existing: fieldConfig.units?.reset,
    })

    const $isValid = $firstError.map((firstError) => firstError === null)

    const $field = combine({
        value: $value,
        errors: $errors,
        firstError: $firstError,
        isValid: $isValid,
        isDirty: $isDirty,
        isTouched: $touched,
    })

    return {
        changed,
        name: fieldName,
        $value,
        $errors,
        $firstError,
        $isValid,
        $isDirty,
        $isTouched: $touched,
        $touched,
        $field: $field as Store<FieldData<any>>,
        onChange,
        onBlur,
        addError,
        validate,
        set: onChange,
        reset,
        resetErrors,
        resetValue,
        filter: fieldConfig.filter,
    }
}

type BindValidationParams = {
    form: {
        $values: Store<AnyFormValues>
        submit: Event<void>
        reset: Event<void>
        resetValues: Event<void>
        resetErrors: Event<void>
        validate: Event<void>
        validateOn?: ValidationEvent[]
    }
    field: Field<any>
    fieldConfig: FieldConfig<any>
}

export function bindValidation(
    params: BindValidationParams, effectorData?: any
): void {
    const { form, field, fieldConfig } = params
    const rules = fieldConfig.rules || []
    const formValidationEvents = form.validateOn || ["submit"]
    const fieldValidationEvents = fieldConfig.validateOn || []

    const {
        $value,
        $errors,
        onBlur,
        changed,
        addError,
        validate,
        resetErrors,
        resetValue,
        reset,
    } = field

    const rulesSources = typeof rules === "function"
        ? createStore<any[]>([], effectorData)
        : combine(
            rules.map(({ source }) => source || createStore(null, effectorData))
        )

    const validator = createCombineValidator(rules)
    const eventsNames = [...formValidationEvents, ...fieldValidationEvents]
    const validationEvents: Event<{
        fieldValue: any
        form: AnyFormValues
        rulesSources: any[]
    }>[] = []

    if (eventsNames.includes("submit")) {
        const validationTrigger = sample({
            source: combine({
                fieldValue: $value,
                form: form.$values,
                rulesSources,
            }),
            clock: form.submit,
        })

        validationEvents.push(validationTrigger)
    }

    if (eventsNames.includes("blur")) {
        validationEvents.push(sample({
            source: combine({
                fieldValue: $value,
                form: form.$values,
                rulesSources,
            }),
            clock: onBlur,
        }))
    }

    if (eventsNames.includes("change")) {
        validationEvents.push(sample({
            source: combine({
                fieldValue: $value,
                form: form.$values,
                rulesSources,
            }),
            clock: merge(
                [changed, resetValue, form.resetValues]
            ),
        }))
    }

    validationEvents.push(sample({
        source: combine({
            fieldValue: $value,
            form: form.$values,
            rulesSources,
        }),
        clock: validate,
    }))

    validationEvents.push(sample({
        source: combine({
            fieldValue: $value,
            form: form.$values,
            rulesSources,
        }),
        clock: form.validate,
    }))

    const addErrorWithValue = sample({
        source: $value,
        clock: addError,
        fn: (value, { rule, errorText }): ValidationError => ({
            rule,
            value,
            errorText,
        }),
    })

    $errors
        .on(
            validationEvents,
            (_, { form, fieldValue, rulesSources }) => validator(
                fieldValue,
                form,
                rulesSources,
            )
        )
        .on(addErrorWithValue, (errors, newError) => [newError, ...errors])
        .reset(resetErrors, form.reset, reset, form.resetErrors)

    if (!eventsNames.includes("change")) {
        $errors.reset(changed)
    }
}

export function bindChangeEvent(
    {
        $value,
        $touched,
        onChange,
        changed,
        name,
        reset,
        resetValue,
        filter }: Field<any>,
    setForm: Event<Partial<AnyFormValues>>,
    resetForm: Event<void>,
    resetTouched: Event<void>,
    resetValues: Event<void>,
): void {

    $touched
        .on(changed, () => true)
        .reset(reset, resetForm, resetTouched)

    guard({
        source: onChange,
        filter: filter || (() => true),
        target: changed,
    })

    $value
        .on(changed, (_, value) => value)
        .on(
            setForm,
            (curr, updateSet) => updateSet.hasOwnProperty(name)
                ? updateSet[name]
                : curr
        )
        .reset(reset, resetValue, resetValues, resetForm)

}
