import React from "react"
import { useNavigate, useParams } from "react-router"
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

// Types
export type NotificationType = "order" | "payment" | "delivery" | "alert" | "info"

export type TNotification = {
  id: string
  type: NotificationType
  title: string
  message: string
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
    message: string
  }
  seen?: boolean
  read?: boolean
  createdAt: string
  updatedAt: string
}

// Config

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: typeof IconBell; bg: string; color: string }
> = {
  order: { icon: IconPackage, bg: "bg-primary/10", color: "text-primary" },
  payment: { icon: IconCash, bg: "bg-success/10", color: "text-success" },
  delivery: { icon: IconTruckDelivery, bg: "bg-blue-500/10", color: "text-blue-500" },
  alert: { icon: IconAlertCircle, bg: "bg-destructive/10", color: "text-destructive" },
  info: { icon: IconInfoCircle, bg: "bg-muted", color: "text-muted-foreground" },
}

const timeAgo = (dateStr: string) => formatDistanceToNow(new Date(dateStr), { addSuffix: true })

export function NotificationPopover({ userId }: { userId?: string }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const tenant = import.meta.env.VITE_TENANT_ID

  const [notifications, setNotifications] = React.useState<TNotification[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))

  const markRead = (id: string) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )

  React.useEffect(() => {
    if (!open || !tenant || !userId) return

    let cancelled = false
    setLoading(true)
    setError(null)

    axios
      .get<{ results: NotificationDoc[] }>(`/notifications/api/me/${tenant}/${userId}`, {
        params: { page: 1, limit: 10 },
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
  }, [open, tenant, userId, t])

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
        className="w-90 p-0 sm:w-100"
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
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={markAllRead}
            >
              <IconCheck className="me-1 size-3" />
              {t("Mark all read")}
            </Button>
          )}
        </div>

        <Separator />

        {/* List */}
        <ScrollArea className="max-h-80">
          <div className="flex flex-col">
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
              notifications.slice(0, 3).map((n) => {
                const cfg = TYPE_CONFIG[n.type]
                const Icon = cfg.icon
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => markRead(n.id)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-start transition-colors hover:bg-muted/50",
                      !n.read && "bg-primary/3"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                        cfg.bg,
                        cfg.color
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "truncate text-sm",
                            !n.read
                              ? "font-semibold text-foreground"
                              : "font-medium text-foreground/80"
                          )}
                        >
                          {t(n.title)}
                        </p>
                        {!n.read && (
                          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {n.message}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground/60">
                        {n.time}
                      </p>
                    </div>
                  </button>
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
              navigate(`/${tenant}/notifications`)
            }}
          >
            {t("View all notifications")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}