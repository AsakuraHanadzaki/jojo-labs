"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface RadioGroupContextValue {
  value?: string
  onValueChange?: (value: string) => void
  name: string
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | undefined>(undefined)

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
  name?: string
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, name, children, ...props }, ref) => {
    const groupName = React.useId()
    const actualName = name || groupName

    return (
      <RadioGroupContext.Provider value={{ value, onValueChange, name: actualName }}>
        <div ref={ref} className={cn("grid gap-2", className)} role="radiogroup" {...props}>
          {children}
        </div>
      </RadioGroupContext.Provider>
    )
  },
)
RadioGroup.displayName = "RadioGroup"

interface RadioGroupItemProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  value: string
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext)

    if (!context) {
      throw new Error("RadioGroupItem must be used within a RadioGroup")
    }

    const { value: groupValue, onValueChange, name } = context
    const isChecked = value === groupValue

    const handleChange = () => {
      onValueChange?.(value)
    }

    return (
      <div className="relative flex items-center">
        <input
          ref={ref}
          type="radio"
          value={value}
          checked={isChecked}
          onChange={handleChange}
          name={name}
          className="sr-only peer"
          {...props}
        />
        <div
          onClick={handleChange}
          className={cn(
            "aspect-square h-4 w-4 rounded-full border-2 cursor-pointer transition-all duration-200 flex items-center justify-center",
            isChecked ? "border-rose-600 bg-rose-600" : "border-gray-300",
            "hover:border-rose-400",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-rose-600 peer-focus-visible:ring-offset-2",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            className,
          )}
        >
          {isChecked && <div className="h-2 w-2 rounded-full bg-white" />}
        </div>
      </div>
    )
  },
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
