import React from "react"
import {
  IconBell,
  IconBellOff,
  IconPackage,
  IconCash,
  IconTruckDelivery,
  IconAlertCircle,
  IconInfoCircle,
  IconChecks,
  IconTrash,
  IconExternalLink,
  IconX,
} from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"
import { Container } from "@/core/custom/Container"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import axios from "axios"
import { formatDistanceToNow, isSameDay, subDays, format } from "date-fns"
import { ThunderSDK } from "thunder-sdk"
import { use } from "@/core/hooks/use"
import { triggersBaseUrl, triggersTenantId } from "@/lib/constants"

type NotificationType = "order" | "payment" | "delivery" | "alert" | "info"

type TNotificationAction = {
  type: "button" | "redirect"
  label?: string
  url?: string
  onAction?: () => void
}

type TNotification = {
  id: string
  type: NotificationType
  title: string
  message: string
  time: string
  date: string
  read: boolean
  userFullName?: string
  avatarUrl?: string
  actions?: TNotificationAction[]
}

type NotificationDoc = {
  _id: string
  receiver: string
  tenant: string
  data: {
    type?: NotificationType
    title: string
    message: string
  }
  seen?: boolean
  read?: boolean
  createdAt: string
  updatedAt: string
}

const PAGE_SIZE = 5

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: typeof IconBell; bg: string; color: string; border: string; label: string }
> = {
  order: { icon: IconPackage, bg: "bg-primary/10", color: "text-primary", border: "border-l-primary", label: "Orders" },
  payment: { icon: IconCash, bg: "bg-success/10", color: "text-success", border: "border-l-success", label: "Payments" },
  delivery: { icon: IconTruckDelivery, bg: "bg-blue-500/10", color: "text-blue-500", border: "border-l-blue-500", label: "Deliveries" },
  alert: { icon: IconAlertCircle, bg: "bg-destructive/10", color: "text-destructive", border: "border-l-destructive", label: "Alerts" },
  info: { icon: IconInfoCircle, bg: "bg-muted", color: "text-muted-foreground", border: "border-l-muted-foreground/40", label: "Info" },
}

const timeAgo = (dateStr: string) => formatDistanceToNow(new Date(dateStr), { addSuffix: true })

const getDateGroup = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  if (isSameDay(date, now)) return "Today"
  if (isSameDay(date, subDays(now, 1))) return "Yesterday"
  return format(date, "MMM d, yyyy")
}

export default function Notifications() {
  const { t } = useTranslation()
  const [notifications, setNotifications] = React.useState<TNotification[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState("all")
  const [page, setPage] = React.useState(1)

  const _me = React.useCallback(
    async ({ signal }: { signal?: AbortSignal }) => {
      return await ThunderSDK.me.get({ signal })
    },
    []
  )
  const { data: me } = use(_me)
  
  const userId = me?._id


  const unreadCount = notifications.filter((n: any) => !n.read).length

  React.useEffect(() => {
    if (!triggersTenantId || !userId) return

    let cancelled = false
    setLoading(true)
    setError(null)

    axios
      .get<{ results: NotificationDoc[] }>(`${triggersBaseUrl}/notifications/api/me/${triggersTenantId}/${userId}`, {
        params: { page: 1, limit: 50 },
      })
      .then(({ data }) => {
        if (cancelled) return
        setNotifications(
          data.results.map((doc) => ({
            id: doc._id,
            type: doc.data?.type ?? "info",
            title: doc.data?.title ?? "",
            message: doc.data?.message ?? "",
            time: timeAgo(doc.createdAt),
            date: getDateGroup(doc.createdAt),
            read: doc.read ?? false,
          }))
        )
      })
      .catch(() => {
        if (!cancelled) setError(t("Failed to load notifications"))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [triggersTenantId, userId, triggersBaseUrl])

  const filtered = React.useMemo(() => {
    if (activeTab === "all") return notifications
    if (activeTab === "unread") return notifications.filter((n) => !n.read)
    return notifications.filter((n) => n.type === activeTab)
  }, [notifications, activeTab])

  React.useEffect(() => {
    setPage(1)
  }, [activeTab])

  const totalCount = filtered.length
  const pageItemsCount = PAGE_SIZE * page
  const paginated = React.useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  )

  const grouped = React.useMemo(() => {
    const groups: Record<string, TNotification[]> = {}
    for (const n of paginated) {
      ; (groups[n.date] ??= []).push(n)
    }
    return Object.entries(groups)
  }, [paginated])

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))

  const markRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )

  const dismissNotification = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id))

  const clearAll = () => setNotifications([])

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto mask-y-from-98%">
      <Container className="relative flex flex-col gap-4 max-w-3xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <IconBell className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                {t("Notifications")}
              </h1>
              <p className="text-xs text-muted-foreground">
                {unreadCount > 0
                  ? t("{{count}} unread notifications", { count: unreadCount })
                  : t("You're all caught up")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={markAllRead}
              >
                <IconChecks className="size-3.5" />
                {t("Mark all read")}
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs text-destructive hover:text-destructive"
                onClick={clearAll}
              >
                <IconTrash className="size-3.5" />
                {t("Clear all")}
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-auto w-full justify-start gap-1 bg-transparent p-0">
            {[
              { value: "all", label: t("All") },
              { value: "unread", label: t("Unread"), count: unreadCount },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-transparent! px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all data-active:border-border data-active:bg-foreground data-active:text-background data-active:hover:text-white data-active:shadow-sm"
              >
                {tab.label}
                {"count" in tab && tab.count! > 0 && (
                  <Badge
                    variant="default"
                    className="size-3 rounded-full text-xs p-2.5"
                  >
                    {tab.count}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {loading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-muted-foreground">{t("Loading...")}</p>
            </CardContent>
          </Card>
        )}

        {!loading && error && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <IconBellOff className="size-7 text-muted-foreground/50" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                {t("No notifications")}
              </h3>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                {activeTab === "unread"
                  ? t("You have no unread notifications.")
                  : t("There are no notifications to display.")}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Grouped notifications */}
        {!loading && !error && grouped.map(([date, items]) => (
          <div key={date} className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h2 className="shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t(date)}
              </h2>
              <Separator className="flex-1" />
            </div>

            <div className="flex flex-col gap-2">
              {items.map((n) => {
                const cfg = TYPE_CONFIG[n.type]
                const Icon = cfg.icon

                return (
                  <Card
                    key={n.id}
                    className={cn(
                      "overflow-hidden border-l-[3px] py-0 shadow-none transition-all duration-150 hover:shadow-sm",
                      cfg.border,
                      !n.read && "bg-primary/3"
                    )}
                  >
                    <Accordion
                      onValueChange={(value) => value && !n.read && markRead(n.id)}
                    >
                      <AccordionItem value={n.id} className="border-none">
                        <AccordionTrigger className="group w-full px-3 py-3 hover:no-underline">
                          <CardContent className="flex w-full items-center gap-3 p-0">
                            <span
                              className={cn(
                                "flex size-9 shrink-0 items-center justify-center rounded-full sm:size-10",
                                cfg.bg,
                                cfg.color
                              )}
                            >
                              <Icon className="size-4 sm:size-5" />
                            </span>

                            <div className="min-w-0 flex-1 text-left">
                              <div className="flex items-center gap-2">
                                <p
                                  className={cn(
                                    "truncate text-xs sm:text-sm",
                                    !n.read
                                      ? "font-semibold text-foreground"
                                      : "font-medium text-foreground/80"
                                  )}
                                >
                                  {t(n.title)}
                                </p>
                                {!n.read && (
                                  <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                                )}
                              </div>
                              <p className="mt-0.5 truncate text-xs max-w-48 sm:max-w-72 lg:max-w-full text-muted-foreground">
                                {n.userFullName
                                  ? t("from {{name}}", { name: n.userFullName })
                                  : n.message}
                              </p>
                            </div>

                            <small className="flex shrink-0 items-center self-stretch pr-2 text-muted-foreground h-full">
                              {n.time}
                            </small>
                          </CardContent>
                        </AccordionTrigger>

                        <AccordionContent className="px-3 pb-3">
                          <div className="ml-12 rounded-lg border border-border/60 bg-muted/40 p-3 sm:ml-13">
                            <p className="text-xs leading-relaxed text-foreground/80">
                              {n.message}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {n.actions?.map((action, i) => (
                                <Button
                                  key={i}
                                  size="sm"
                                  variant={action.type === "button" ? "default" : "outline"}
                                  className="text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (action.type === "redirect" && action.url) {
                                      window.open(action.url, "_blank")
                                    } else {
                                      action.onAction?.()
                                    }
                                  }}
                                >
                                  {action.type === "redirect" && (
                                    <IconExternalLink className="size-3.5" />
                                  )}
                                  {t(action.label ?? (action.type === "button" ? "View details" : "Open link"))}
                                </Button>
                              ))}

                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                onClick={(e) => {
                                  e.stopPropagation()
                                }}
                              >
                                {t("View details")}
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                className="ml-auto text-xs text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  dismissNotification(n.id)
                                }}
                              >
                                <IconX className="size-3.5" />
                                {t("Dismiss")}
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}

        {/* Pagination */}
        {!loading && !error && totalCount > PAGE_SIZE && (
          <div className="flex flex-wrap-reverse items-center justify-center gap-3 md:justify-between">
            <Badge variant="outline">
              {t("Current Page")} ({page}){" "}
              {Math.min(pageItemsCount, totalCount)} -{" "}
              <span className="text-muted-foreground">{totalCount}</span>
            </Badge>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                {t("Previous")}
              </Button>
              <Button
                size="sm"
                disabled={pageItemsCount >= totalCount}
                onClick={() => setPage((p) => p + 1)}
              >
                {t("Next")}
              </Button>
            </div>
          </div>
        )}
      </Container>
    </div>
  )
}