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
        <ListboxButton className="relative w-full h-10 pl-3 pr-10 text-left text-sm bg-white/5 border border-white/10 rounded-lg text-gray-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D14]">
          <span className="block truncate">{selected?.label}</span>
          <span className="absolute inset-y-0 right-3 flex items-center">
            <ChevronDown size={14} className="text-gray-400" />
          </span>
        </ListboxButton>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <ListboxOptions className="absolute z-10 mt-1 w-full bg-bg-header border border-white/10 rounded-lg shadow-2xl max-h-60 overflow-auto">
            {options.map((opt) => (
              <ListboxOption
                key={opt.value}
                value={opt.value}
                className="group cursor-pointer select-none px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-gray-200"
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
