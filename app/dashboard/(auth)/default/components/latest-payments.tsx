"use client";

import * as React from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  type RowSelectionState
} from "@tanstack/react-table";
import {
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Download,
  Mail,
  Tag,
  ChevronDown
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Payment {
  id: string;
  status: "success" | "processing" | "failed";
  email: string;
  firstName: string;
  lastName: string;
  amount: number;
}

export function LatestPayments() {
  const data = React.useMemo<Payment[]>(
    () => [
      {
        id: "1",
        status: "success",
        email: "ken99@yahoo.com",
        firstName: "Kenneth",
        lastName: "Thompson",
        amount: 316.0
      },
      {
        id: "2",
        status: "success",
        email: "abe45@gmail.com",
        firstName: "Abraham",
        lastName: "Lincoln",
        amount: 242.0
      },
      {
        id: "3",
        status: "processing",
        email: "monserrat44@gmail.com",
        firstName: "Monserrat",
        lastName: "Rodriguez",
        amount: 837.0
      },
      {
        id: "4",
        status: "success",
        email: "silas22@gmail.com",
        firstName: "Silas",
        lastName: "Johnson",
        amount: 874.0
      },
      {
        id: "5",
        status: "failed",
        email: "carmella@hotmail.com",
        firstName: "Carmella",
        lastName: "DeVito",
        amount: 721.0
      },
      {
        id: "6",
        status: "success",
        email: "maria@gmail.com",
        firstName: "Maria",
        lastName: "Garcia",
        amount: 572.0
      }
    ],
    []
  );

  const columns = React.useMemo<ColumnDef<Payment>[]>(
    () => [
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <Badge
              variant={status === "success" ? "default" : status === "processing" ? "secondary" : "destructive"}>
              {status}
            </Badge>
          );
        }
      },
      {
        accessorKey: "email",
        header: "Email"
      },
      {
        accessorKey: "firstName",
        header: "First Name"
      },
      {
        accessorKey: "lastName",
        header: "Last Name"
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("amount"));
          const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
          }).format(amount);
          return <div className="font-medium">{formatted}</div>;
        }
      }
    ],
    []
  );

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const handleBulkAction = (action: string) => {
    const selectedRows = table.getSelectedRowModel().rows;

    // For demo purposes, let's just show what would happen
    if (action === "delete") {
      alert(`Deleting ${selectedRows.length} payments`);
    } else if (action === "export") {
      alert(`Exporting ${selectedRows.length} payments`);
    } else if (action === "email") {
      alert(`Sending email to ${selectedRows.length} customers`);
    } else if (action === "tag") {
      alert(`Tagging ${selectedRows.length} payments`);
    }
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection,
      globalFilter
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 8
      }
    }
  });

  const selectedRowsCount = Object.keys(rowSelection).length;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Latest AI Model Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Filter payments..."
            className="max-w-sm"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />

          {selectedRowsCount > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Actions <Badge variant="outline">{selectedRowsCount} selected</Badge>
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleBulkAction("delete")}>
                  <Trash2 />
                  Delete selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("export")}>
                  <Download />
                  Export selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("email")}>
                  <Mail />
                  Email customers
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction("tag")}>
                  <Tag />
                  Tag payments
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            {selectedRowsCount} of {data.length} row(s) selected.
          </p>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
