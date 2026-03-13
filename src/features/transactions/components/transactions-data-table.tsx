"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Transaction } from "../types/transaction";
import { groupTransactionsByDate } from "../utils/group-transactions";
import { deleteTransactionsAction } from "../actions/delete-transactions";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Label } from "@/ui/label";
import { Checkbox } from "@/ui/checkbox";
import {
  Search,
  Filter,
  X,
  CalendarIcon,
  Trash2,
  Pencil,
  Receipt,
  Plus,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/ui/calendar";
import {
  Popover as DatePopover,
  PopoverContent as DatePopoverContent,
  PopoverTrigger as DatePopoverTrigger,
} from "@/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/alert-dialog";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/ui/empty";
import { toast } from "sonner";

type FilterSection = "type" | "category" | "date" | "amount" | "account";

type VirtualRow =
  | { kind: "date-header"; date: string; total: number }
  | { kind: "transaction"; transaction: Transaction };

interface TransactionsDataTableProps {
  transactions: Transaction[];
  onDeleteTransactions: (ids: string[]) => void;
  onAddTransaction?: () => void;
  hasMore?: boolean;
  isFetchingMore?: boolean;
  onLoadMore?: () => void;
  total?: number;
}

function flattenGrouped(
  groups: ReturnType<typeof groupTransactionsByDate>
): VirtualRow[] {
  const rows: VirtualRow[] = [];
  for (const group of groups) {
    rows.push({ kind: "date-header", date: group.date, total: group.total });
    for (const t of group.transactions) {
      rows.push({ kind: "transaction", transaction: t });
    }
  }
  return rows;
}

export function TransactionsDataTable({
  transactions,
  onDeleteTransactions,
  onAddTransaction,
  hasMore = false,
  isFetchingMore = false,
  onLoadMore,
  total,
}: TransactionsDataTableProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<("income" | "expense")[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [accountFilter, setAccountFilter] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const [activeSection, setActiveSection] = useState<FilterSection>("type");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [tempTypeFilter, setTempTypeFilter] = useState<("income" | "expense")[]>([]);
  const [tempCategoryFilter, setTempCategoryFilter] = useState<string[]>([]);
  const [tempAccountFilter, setTempAccountFilter] = useState<string[]>([]);
  const [tempDateRange, setTempDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [tempMinAmount, setTempMinAmount] = useState<string>("");
  const [tempMaxAmount, setTempMaxAmount] = useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const parentRef = useRef<HTMLDivElement>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        search === "" ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter.length === 0 || typeFilter.includes(t.type);
      const matchesCategory = categoryFilter.length === 0 || categoryFilter.includes(t.category);
      const matchesAccount = accountFilter.length === 0 || accountFilter.includes(t.account);
      const matchesDate =
        !dateRange?.from ||
        !dateRange?.to ||
        (new Date(t.date) >= dateRange.from && new Date(t.date) <= (dateRange.to || dateRange.from));
      const matchesAmount =
        (!minAmount || t.amount >= parseFloat(minAmount)) &&
        (!maxAmount || t.amount <= parseFloat(maxAmount));
      return matchesSearch && matchesType && matchesCategory && matchesAccount && matchesDate && matchesAmount;
    });
  }, [transactions, search, typeFilter, categoryFilter, accountFilter, dateRange, minAmount, maxAmount]);

  const groupedData = useMemo(
    () => groupTransactionsByDate(filteredTransactions),
    [filteredTransactions]
  );

  const flatRows = useMemo(() => flattenGrouped(groupedData), [groupedData]);

  const allTransactionIds = useMemo(
    () => flatRows.filter((r): r is VirtualRow & { kind: "transaction" } => r.kind === "transaction").map((r) => r.transaction.id),
    [flatRows]
  );

  const isAllSelected = allTransactionIds.length > 0 && allTransactionIds.every((id) => selectedIds.has(id));
  const isSomeSelected = allTransactionIds.some((id) => selectedIds.has(id)) && !isAllSelected;

  const categories = useMemo(() => Array.from(new Set(transactions.map((t) => t.category))), [transactions]);
  const accounts = useMemo(() => Array.from(new Set(transactions.map((t) => t.account))), [transactions]);

  const hasActiveFilters =
    typeFilter.length > 0 || categoryFilter.length > 0 || accountFilter.length > 0 || dateRange?.from || minAmount || maxAmount;

  const rowVirtualizer = useVirtualizer({
    count: flatRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => (flatRows[index].kind === "date-header" ? 44 : 64),
    overscan: 15,
  });

  // Infinite scroll: load more when near the bottom
  useEffect(() => {
    if (!hasMore || isFetchingMore || !onLoadMore) return;
    const items = rowVirtualizer.getVirtualItems();
    const lastItem = items[items.length - 1];
    if (!lastItem) return;
    if (lastItem.index >= flatRows.length - 10) {
      onLoadMore();
    }
  }, [rowVirtualizer.getVirtualItems(), hasMore, isFetchingMore, onLoadMore, flatRows.length]);

  function clearFilters() {
    setSearch("");
    setTypeFilter([]);
    setCategoryFilter([]);
    setAccountFilter([]);
    setDateRange({});
    setMinAmount("");
    setMaxAmount("");
    setTempTypeFilter([]);
    setTempCategoryFilter([]);
    setTempAccountFilter([]);
    setTempDateRange({});
    setTempMinAmount("");
    setTempMaxAmount("");
  }

  function toggleTempType(type: "income" | "expense") {
    setTempTypeFilter((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [type]));
  }

  function toggleTempCategory(category: string) {
    setTempCategoryFilter((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  }

  function toggleTempAccount(account: string) {
    setTempAccountFilter((prev) =>
      prev.includes(account) ? prev.filter((a) => a !== account) : [...prev, account]
    );
  }

  function applyFilters() {
    setTypeFilter(tempTypeFilter);
    setCategoryFilter(tempCategoryFilter);
    setAccountFilter(tempAccountFilter);
    setDateRange(tempDateRange);
    setMinAmount(tempMinAmount);
    setMaxAmount(tempMaxAmount);
    setIsPopoverOpen(false);
  }

  function handleOpenChange(open: boolean) {
    if (open) {
      setTempTypeFilter(typeFilter);
      setTempCategoryFilter(categoryFilter);
      setTempAccountFilter(accountFilter);
      setTempDateRange(dateRange);
      setTempMinAmount(minAmount);
      setTempMaxAmount(maxAmount);
    }
    setIsPopoverOpen(open);
  }

  function toggleSelectAll() {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allTransactionIds));
    }
  }

  function toggleSelectTransaction(id: string) {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  }

  function toggleSelectGroup(groupDate: string) {
    const group = groupedData.find((g) => g.date === groupDate);
    if (!group) return;
    const groupIds = group.transactions.map((t) => t.id);
    const allGroupSelected = groupIds.every((id) => selectedIds.has(id));
    const newSelected = new Set(selectedIds);
    if (allGroupSelected) {
      groupIds.forEach((id) => newSelected.delete(id));
    } else {
      groupIds.forEach((id) => newSelected.add(id));
    }
    setSelectedIds(newSelected);
  }

  function handleDeleteSelected() {
    const idsToDelete = Array.from(selectedIds);
    setShowDeleteDialog(false);
    setSelectedIds(new Set());
    onDeleteTransactions(idsToDelete);
    deleteTransactionsAction(idsToDelete).catch(() => {
      toast.error("Error al eliminar los movimientos");
    });
  }

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar movimientos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Popover open={isPopoverOpen} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button variant={hasActiveFilters ? "default" : "outline"}>
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-125 p-0" align="end">
            <div className="flex">
              <div className="w-40 border-r bg-muted/50 p-2">
                <div className="space-y-1">
                  {(["type", "category", "account", "date", "amount"] as FilterSection[]).map((section) => (
                    <Button
                      key={section}
                      variant={activeSection === section ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveSection(section)}
                    >
                      {{ type: "Tipo", category: "Categoría", account: "Cuenta", date: "Fecha", amount: "Monto" }[section]}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex-1 p-4">
                {activeSection === "type" && (
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Tipo de movimiento</Label>
                    <div className="space-y-2">
                      {[{ value: "income" as const, label: "Ingresos" }, { value: "expense" as const, label: "Gastos" }].map(({ value, label }) => (
                        <div key={value} className="flex items-center space-x-2">
                          <Checkbox id={`type-${value}`} checked={tempTypeFilter.includes(value)} onCheckedChange={() => toggleTempType(value)} />
                          <label htmlFor={`type-${value}`} className="text-sm cursor-pointer">{label}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeSection === "category" && (
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Categoría</Label>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {categories.map((cat) => (
                        <div key={cat} className="flex items-center space-x-2">
                          <Checkbox id={`cat-${cat}`} checked={tempCategoryFilter.includes(cat)} onCheckedChange={() => toggleTempCategory(cat)} />
                          <label htmlFor={`cat-${cat}`} className="text-sm cursor-pointer">{cat}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeSection === "account" && (
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Cuenta</Label>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {accounts.map((acc) => (
                        <div key={acc} className="flex items-center space-x-2">
                          <Checkbox id={`acc-${acc}`} checked={tempAccountFilter.includes(acc)} onCheckedChange={() => toggleTempAccount(acc)} />
                          <label htmlFor={`acc-${acc}`} className="text-sm cursor-pointer">{acc}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeSection === "date" && (
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Rango de fechas</Label>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="date-from" className="text-sm">Desde</Label>
                        <DatePopover>
                          <DatePopoverTrigger asChild>
                            <Button id="date-from" variant="outline" className={cn("w-full justify-start text-left font-normal", !tempDateRange?.from && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {tempDateRange?.from ? format(tempDateRange.from, "PPP", { locale: es }) : "Seleccionar fecha"}
                            </Button>
                          </DatePopoverTrigger>
                          <DatePopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={tempDateRange?.from} onSelect={(date) => setTempDateRange({ ...tempDateRange, from: date })} initialFocus />
                          </DatePopoverContent>
                        </DatePopover>
                      </div>
                      <div>
                        <Label htmlFor="date-to" className="text-sm">Hasta</Label>
                        <DatePopover>
                          <DatePopoverTrigger asChild>
                            <Button id="date-to" variant="outline" className={cn("w-full justify-start text-left font-normal", !tempDateRange?.to && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {tempDateRange?.to ? format(tempDateRange.to, "PPP", { locale: es }) : "Seleccionar fecha"}
                            </Button>
                          </DatePopoverTrigger>
                          <DatePopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={tempDateRange?.to} onSelect={(date) => setTempDateRange({ ...tempDateRange, to: date })} initialFocus />
                          </DatePopoverContent>
                        </DatePopover>
                      </div>
                    </div>
                  </div>
                )}
                {activeSection === "amount" && (
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Rango de monto</Label>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="min-amount" className="text-sm">Mínimo</Label>
                        <Input id="min-amount" type="number" placeholder="0.00" value={tempMinAmount} onChange={(e) => setTempMinAmount(e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="max-amount" className="text-sm">Máximo</Label>
                        <Input id="max-amount" type="number" placeholder="0.00" value={tempMaxAmount} onChange={(e) => setTempMaxAmount(e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t p-3 flex justify-between items-center bg-muted/30">
              <Button variant="ghost" size="sm" onClick={() => { setTempTypeFilter([]); setTempCategoryFilter([]); setTempAccountFilter([]); setTempDateRange({}); setTempMinAmount(""); setTempMaxAmount(""); }}>
                Limpiar filtros
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsPopoverOpen(false)}>Cancelar</Button>
                <Button size="sm" onClick={applyFilters}>Aplicar</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          {typeFilter.map((type) => (
            <Badge key={type} variant="secondary" className="gap-1">
              {type === "income" ? "Ingresos" : "Gastos"}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setTypeFilter(typeFilter.filter((t) => t !== type))} />
            </Badge>
          ))}
          {categoryFilter.map((cat) => (
            <Badge key={cat} variant="secondary" className="gap-1">
              {cat}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setCategoryFilter(categoryFilter.filter((c) => c !== cat))} />
            </Badge>
          ))}
          {accountFilter.map((acc) => (
            <Badge key={acc} variant="secondary" className="gap-1">
              {acc}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setAccountFilter(accountFilter.filter((a) => a !== acc))} />
            </Badge>
          ))}
          {dateRange?.from && (
            <Badge variant="secondary" className="gap-1">
              {dateRange.from.toLocaleDateString()} - {dateRange.to?.toLocaleDateString()}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setDateRange({})} />
            </Badge>
          )}
          {(minAmount || maxAmount) && (
            <Badge variant="secondary" className="gap-1">
              ${minAmount || "0"} - ${maxAmount || "∞"}
              <X className="h-3 w-3 cursor-pointer" onClick={() => { setMinAmount(""); setMaxAmount(""); }} />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
            Limpiar todo
          </Button>
        </div>
      )}

      {/* Table header */}
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[48px_1fr_1fr_150px] items-center px-4 py-3 bg-muted/50 border-b text-sm font-medium text-muted-foreground">
          <div>
            <Checkbox checked={isAllSelected} indeterminate={isSomeSelected} onCheckedChange={toggleSelectAll} />
          </div>
          <div>Movimiento</div>
          <div>Categoría</div>
          <div className="text-right">Cantidad</div>
        </div>

        {/* Virtualized list */}
        <div ref={parentRef} className="overflow-auto" style={{ height: "calc(100vh - 320px)" }}>
          <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: "100%", position: "relative" }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = flatRows[virtualRow.index];

              if (row.kind === "date-header") {
                const group = groupedData.find((g) => g.date === row.date);
                const groupIds = group?.transactions.map((t) => t.id) || [];
                const allGroupSelected = groupIds.length > 0 && groupIds.every((id) => selectedIds.has(id));
                const someGroupSelected = groupIds.some((id) => selectedIds.has(id)) && !allGroupSelected;

                return (
                  <div
                    key={`header-${row.date}`}
                    className="grid grid-cols-[48px_1fr_150px] items-center px-4 bg-muted/50 border-b"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <div>
                      <Checkbox checked={allGroupSelected} indeterminate={someGroupSelected} onCheckedChange={() => toggleSelectGroup(row.date)} />
                    </div>
                    <div className="font-semibold text-sm">{row.date}</div>
                    <div className={`text-right font-medium text-sm ${row.total >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {row.total >= 0 ? "+" : ""}${row.total.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                );
              }

              const t = row.transaction;
              return (
                <div
                  key={t.id}
                  className="grid grid-cols-[48px_1fr_1fr_150px] items-center px-4 border-b hover:bg-muted/30 transition-colors"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div>
                    <Checkbox checked={selectedIds.has(t.id)} onCheckedChange={() => toggleSelectTransaction(t.id)} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium truncate">{t.description}</span>
                    <span className="text-sm text-muted-foreground truncate">{t.account}</span>
                  </div>
                  <div>
                    <Badge variant="outline">{t.category}</Badge>
                  </div>
                  <div className={`text-right font-medium ${t.type === "income" ? "text-foreground" : "text-foreground/80"}`}>
                    {t.type === "income" ? "" : "-"}${t.amount.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Loading indicator */}
          {isFetchingMore && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Cargando más movimientos...</span>
            </div>
          )}
        </div>

        {/* Footer with count */}
        {total !== undefined && (
          <div className="px-4 py-2 border-t bg-muted/30 text-sm text-muted-foreground">
            {filteredTransactions.length} de {total} movimientos
          </div>
        )}
      </div>

      {/* Empty state */}
      {groupedData.length === 0 && !isFetchingMore && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Receipt />
            </EmptyMedia>
            <EmptyTitle>No hay movimientos</EmptyTitle>
            <EmptyDescription>
              {hasActiveFilters
                ? "No se encontraron movimientos con los filtros aplicados"
                : "Comienza agregando tu primer movimiento"}
            </EmptyDescription>
          </EmptyHeader>
          {onAddTransaction && (
            <Button onClick={onAddTransaction}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar movimiento
            </Button>
          )}
        </Empty>
      )}

      {/* Selection bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-card text-card-foreground border rounded-lg shadow-lg px-4 py-3 flex items-center gap-4">
            <Checkbox checked={true} onCheckedChange={() => setSelectedIds(new Set())} />
            <span className="font-medium">
              {selectedIds.size} {selectedIds.size === 1 ? "movimiento seleccionado" : "movimientos seleccionados"}
            </span>
            <div className="flex gap-2 ml-16">
              <Button size="icon" variant="ghost">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar {selectedIds.size}{" "}
              {selectedIds.size === 1 ? "movimiento" : "movimientos"}. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelected}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
