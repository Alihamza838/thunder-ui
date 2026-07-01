import { Link, useLocation } from "react-router"
import {
  Breadcrumb as _Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import React from "react"
import { IconBrandGoogleHome } from "@tabler/icons-react"

type TBreadcrumbState = {
  name?: string
}

export function Breadcrumb() {
  const location = useLocation()

  const parts = React.useMemo(
    () => location.pathname.split("/").filter(Boolean),
    [location.pathname]
  )

  if (parts.length <= 1) return null
  const state = location.state as TBreadcrumbState | null

  const lastPart = parts.at(-1)
  const lastLabel = state?.name || lastPart

  const crumbs = parts.slice(0, -1)

  return (
    <_Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const to = "/" + parts.slice(0, index + 1).join("/")

          return (
            <React.Fragment key={to}>
              <BreadcrumbItem>
                <BreadcrumbLink
                  render={<Link to={to} replace viewTransition />}
                >
                  {index === 0 ? (
                    <IconBrandGoogleHome className="size-4" />
                  ) : (
                    crumb
                  )}
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbSeparator />
            </React.Fragment>
          )
        })}

        <BreadcrumbItem>
          <BreadcrumbPage>{lastLabel}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </_Breadcrumb>
  )
}
