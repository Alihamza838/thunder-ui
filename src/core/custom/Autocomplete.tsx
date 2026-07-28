import {
  Autocomplete as _Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
} from "@/components/reui/autocomplete"
import { useTranslation } from "react-i18next"

export const Autocomplete: typeof _Autocomplete = (
  // @ts-ignore
  props
) => {
  const { t } = useTranslation()

  return (
    <Autocomplete {...props}>
      <AutocompleteInput placeholder={t("Type or search")} showTrigger />
      <AutocompleteContent>
        <AutocompleteEmpty>{t("No items found.")}</AutocompleteEmpty>
        <AutocompleteList>
          {(item) => (
            <AutocompleteItem key={item.value} value={item.value}>
              {item.label}
            </AutocompleteItem>
          )}
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  )
}
