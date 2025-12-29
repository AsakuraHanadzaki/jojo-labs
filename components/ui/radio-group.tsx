"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
  name?: string
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, name, children, ...props }, ref) => {
    const groupName = React.useId()
    const actualName = name || groupName

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onValueChange?.(e.target.value)
    }

    return (
      <div ref={ref} className={cn("grid gap-2", className)} role="radiogroup" {...props}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              name: actualName,
              checked: child.props.value === value,
              onChange: handleChange,
            })
          }
          return child
        })}
      </div>
    )
  },
)
RadioGroup.displayName = "RadioGroup"

interface RadioGroupItemProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  value: string
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, checked, onChange, name, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        <input
          ref={ref}
          type="radio"
          value={value}
          checked={checked}
          onChange={onChange}
          name={name}
          className="sr-only peer"
          {...props}
        />
        <div
          className={cn(
            "aspect-square h-4 w-4 rounded-full border-2 border-gray-300 cursor-pointer",
            "peer-checked:border-rose-600 peer-checked:bg-rose-600",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-rose-600 peer-focus-visible:ring-offset-2",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            "transition-all duration-200",
            "flex items-center justify-center",
            className,
          )}
        >
          {checked && <div className="h-2 w-2 rounded-full bg-white" />}
        </div>
      </div>
    )
  },
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
