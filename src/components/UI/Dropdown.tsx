import { Fragment } from 'react'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'
import { ChevronDown } from 'lucide-react'

interface DropdownOption<T extends string | number> {
  value: T
  label: string
}

interface DropdownProps<T extends string | number> {
  value: T
  options: DropdownOption<T>[]
  onChange: (value: T) => void
}

export function Dropdown<T extends string | number>({ value, options, onChange }: DropdownProps<T>) {
  const selected = options.find((o) => o.value === value)

  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <ListboxButton className="relative w-full h-10 pl-3 pr-10 text-left text-sm bg-surface border border-border rounded-lg text-text-primary cursor-pointer">
          <span className="block truncate">{selected?.label}</span>
          <span className="absolute inset-y-0 right-3 flex items-center">
            <ChevronDown size={14} className="text-text-secondary" />
          </span>
        </ListboxButton>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <ListboxOptions className="absolute z-10 mt-1 w-full bg-surface border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.map((opt) => (
              <ListboxOption
                key={opt.value}
                value={opt.value}
                className="group cursor-pointer select-none px-3 py-2 text-sm text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
              >
                <span className="block truncate">{opt.label}</span>
              </ListboxOption>
            ))}
          </ListboxOptions>
        </Transition>
      </div>
    </Listbox>
  )
}
