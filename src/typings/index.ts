export type WalletCurrency = {
  id: string;
  name: string;
  symbol: string;
};

export interface WalletCardProps {
  // currencies: WalletCurrency[];
  // currencyId?: string;
  // defaultCurrencyId?: string;
  // onCurrencyChange?: (id: string) => void;
  balance: number;
  balancePrefix?: string;
  /** Initial balance change shown in the pill before any live change. */
  defaultChange?: number;
  /** Start with the balance hidden behind dots. */
  defaultBalanceHidden?: boolean;
  onSend?: () => void;
  onDeposit?: () => void;
  onSwap?: () => void;
  onBuy?: () => void;
  searchPlaceholder?: string;
  /** Recent searches shown in the expanded search panel. */
  searchRecent?: string[];
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
  /** Show an unread pulse on the notifications bell. */
  hasNotifications?: boolean;
  onNotifications?: () => void;
  className?: string;
}
