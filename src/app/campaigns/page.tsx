"use client"
import React from "react";
import {CampaignsTable} from "@/app/campaigns/_components/table";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function Campaigns() {
  return <div className="flex w-fit items-center justify-center p-6">
    <QueryClientProvider client={queryClient}>
      <CampaignsTable />
    </QueryClientProvider>
  </div>
}
