import React from "react"
import { useNavigate } from "react-router"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"
import {
  IconAlertCircle,
  IconBell,
  IconCash,
  IconCheck,
  IconInfoCircle,
  IconPackage,
  IconTruckDelivery,
} from "@tabler/icons-react"
import axios from "axios"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent } from "../ui/card"

const triggersTenantId = import.meta.env.VITE_TRIGGERS_TENANT_ID
const triggersBaseUrl = import.meta.env.VITE_TRIGGERS_BASE_URL

// Types
export type NotificationType = "order" | "payment" | "delivery" | "alert" | "info"

export type TNotification = {
  id: string
  type: NotificationType
  title: string
  body: string
  time: string
  read: boolean
}

type NotificationDoc = {
  _id: string
  receiver: string
  tenant: string
  data: {
    type?: NotificationType
    title: string
    body: string
  }
  seen?: boolean
  read?: boolean
  createdAt: string
  updatedAt: string
}

// Config

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

type NotificationPopoverProps = {
  userId?: string
  unreadCount?: number
}

export function NotificationPopover({ userId, unreadCount: unreadCountProp = 0 }: NotificationPopoverProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [notifications, setNotifications] = React.useState<TNotification[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(false)

  const [unreadCount, setUnreadCount] = React.useState(unreadCountProp)
  const [hasFetchedOnce, setHasFetchedOnce] = React.useState(false)

  React.useEffect(() => {
    if (!hasFetchedOnce) {
      setUnreadCount(unreadCountProp)
    }
  }, [unreadCountProp, hasFetchedOnce])

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id && !n.read) {
          setUnreadCount((count) => Math.max(0, count - 1))
          return { ...n, read: true }
        }
        return n
      })
    )
  }

  React.useEffect(() => {
    if (!open || !triggersTenantId || !userId) return

    let cancelled = false
    setLoading(true)
    setError(null)

    axios
      .get<{ results: NotificationDoc[] }>(`${triggersBaseUrl}/notifications/api/me/${triggersTenantId}/${userId}`, {
        params: { page: 1, limit: 10 },
      })
      .then(({ data }) => {
        if (cancelled) return

        const mapped = data.results.map((doc) => ({
          id: doc._id,
          type: doc.data?.type ?? "info",
          title: doc.data?.title ?? "",
          body: doc.data?.body ?? "",
          time: timeAgo(doc.createdAt),
          read: doc.read ?? false,
        }))

        setNotifications(mapped)
        setUnreadCount(mapped.filter((n) => !n.read).length)
        setHasFetchedOnce(true)
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
  }, [open, triggersTenantId, userId, t])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative size-8 shrink-0 sm:size-9"
            aria-label={t("Notifications")}
          >
            <IconBell className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute -inset-e-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-semibold text-destructive-foreground">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Button>
        }
      />

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-90 p-0 sm:w-100 gap-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              {t("Notifications")}
            </h3>
            {unreadCount > 0 && (
              <Badge
                variant="default"
                className="h-5 rounded-full px-1.5 text-[10px] font-bold"
              >
                {unreadCount}
              </Badge>
            )}
          </div>
          {/* {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={markAllRead}
            >
              <IconCheck className="me-1 size-3" />
              {t("Mark all read")}
            </Button>
          )} */}
        </div>

        <Separator />

        {/* List */}
        <ScrollArea className="h-auto">
          <div className="flex flex-col gap-2 p-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-sm text-muted-foreground">{t("Loading...")}</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <IconBell className="mb-2 size-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  {t("No notifications")}
                </p>
              </div>
            ) : (
              notifications.slice(0, 5).map((n) => {
                const cfg = TYPE_CONFIG[n.type]
                const Icon = cfg.icon
                return (
                  <Card
                    key={n.id}
                    className={cn(
                      "border-l-[3px] p-2 shadow-none transition-all duration-150 hover:shadow-sm cursor-pointer",
                      cfg.border,
                      !n.read && "bg-primary/3"
                    )}
                    onClick={() => markRead(n.id)}
                  >
                    <CardContent className="flex w-full items-center gap-2 p-0">
                      <span
                        className={cn(
                          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                          cfg.bg,
                          cfg.color
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <div className="w-full flex justify-between items-center">
                        <div className="min-w-0 flex-1 flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <h6
                              className={cn(
                                "line-clamp-1 truncate max-w-36 sm:max-w-48",
                                !n.read
                                  ? "font-medium text-foreground"
                                  : "text-foreground/80"
                              )}
                            >
                              {t(n.title)}
                            </h6>
                            {!n.read && (
                              <span className="size-2 shrink-0 rounded-full bg-primary" />
                            )}
                          </div>
                          <small className="line-clamp-1 truncate text-xs text-muted-foreground w-full max-w-36 sm:max-w-48">
                            {n.body}
                          </small>
                        </div>
                        <div className="flex flex-col">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
                            onClick={markAllRead}
                          >
                            <IconCheck className="me-1 size-3" />
                            {t("Mark as read")}
                          </Button>
                          <p className="text-[11px] text-muted-foreground/60 text-end p-1">
                            {n.time}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </ScrollArea>

        <Separator />

        {/* Footer */}
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              setOpen(false)
              navigate(`./notifications`)
            }}
          >
            {t("View all notifications")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}