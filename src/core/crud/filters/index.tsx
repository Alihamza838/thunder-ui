/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react"
import type { TField } from "@/core/lib/jsonSchemaToFields"
import { FilterSelector } from "./components/filter-selector"
import {
  IconCalendar,
  IconCircleDashed,
  IconH1,
  IconNumber,
  IconSquareCheck,
  type TablerIcon,
} from "@tabler/icons-react"
import { ActiveFilters } from "./components/active-filters"
import { FilterActions } from "./components/filter-actions"

export type TValue = { value: any; operator: string }
export type TFilterValue = Record<string, TValue>

export type TFilter = {
  filters?: TFilterValue
  fields: TField[]
  onChange: (value?: TFilterValue) => void
  children?: React.ReactNode
}

export const IconMap: Record<TField["type"], TablerIcon> = {
  text: IconH1,
  boolean: IconSquareCheck,
  number: IconNumber,
  date: IconCalendar,
  object: IconCircleDashed,
  email: IconH1,
  array: IconCircleDashed,
  url: IconH1,
  hidden: IconH1,
}

const FiltersContext = React.createContext<{
  filters?: TFilterValue
  fields: TField[]
  onChange: (value?: TFilterValue) => void
} | null>(null)

export function useFilters() {
  const context = React.useContext(FiltersContext)

  if (!context)
    throw new Error("useFilters must be used within FiltersProvider")

  return context
}

export function Filters({ filters, fields, onChange }: TFilter) {
  return (
    <FiltersContext.Provider value={{ filters, fields, onChange }}>
      <div className="flex min-w-0 grow items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <FilterSelector />
          <FilterActions
            hasFilters={!!filters}
            onClick={() => onChange(undefined)}
          />
          <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto scroll-mask-x">
            <ActiveFilters fields={fields} />
          </div>
        </div>
      </div>
    </FiltersContext.Provider>
  )
}
