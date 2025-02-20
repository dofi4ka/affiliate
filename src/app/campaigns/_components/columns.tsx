import {ColumnDef} from "@tanstack/react-table";
import {Button} from "@/components/ui/button";
import {ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal, Filter,} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import * as React from "react";
import { Campaign } from "@/app/campaigns/_components/table";
import { Badge } from "@/components/ui/badge";
import {DeleteCampaignDialog} from "@/app/campaigns/_components/delete";
import {UpdateCampaignDialog} from "@/app/campaigns/_components/update";

export const columns: ColumnDef<Campaign>[] = [
  {
    accessorKey: "name",
    header: ({column}) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          {!column.getIsSorted() ? <ArrowUpDown/> : column.getIsSorted() === "desc" ? <ArrowUp/> : <ArrowDown/>}
        </Button>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({column}) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
            >
              Status
              <Filter/>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter</DropdownMenuLabel>
            <DropdownMenuSeparator/>
            <DropdownMenuItem onClick={() => column.setFilterValue("active")} disabled={column.getFilterValue() === "active"}>active</DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.setFilterValue("paused")} disabled={column.getFilterValue() === "paused"}>paused</DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.setFilterValue("")} disabled={!column.getIsFiltered()}>none</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      )
    },
    cell: ({row}) => (
      <Badge variant={row.getValue("status") === "active" ? "outline" : "secondary"}>{row.getValue("status")}</Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({column}) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          {!column.getIsSorted() ? <ArrowUpDown/> : column.getIsSorted() === "asc" ? <ArrowUp/> : <ArrowDown/>}
        </Button>
      )
    },
    cell: ({row}) => (
      new Date(row.getValue("createdAt")).toLocaleString()
    )
  },
  {
    accessorKey: "budget",
    header: ({column}) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Budget
          {!column.getIsSorted() ? <ArrowUpDown/> : column.getIsSorted() === "desc" ? <ArrowUp/> : <ArrowDown/>}
        </Button>
      )
    },
    cell: ({row}) => {
      const amount = parseFloat(row.getValue("budget"))

      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)

      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({row}) => {
      const campaign = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal/>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(campaign.id)}
            >
              Copy campaign ID
            </DropdownMenuItem>
            <DropdownMenuSeparator/>
            <div className="flex flex-col gap-y-1">
              <UpdateCampaignDialog campaign={campaign}/>
              <DeleteCampaignDialog id={campaign.id} name={campaign.name} />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]