"use client";

import React, {useState} from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {Campaign} from "@/app/campaigns/_components/table";
import {env} from "@/env.mjs";

type DeleteCampaignDialogProps = {
  id: string;
  name: string;
};

export function DeleteCampaignDialog({ id, name }: DeleteCampaignDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const res = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/campaign/${campaignId}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        throw new Error("Failed to delete campaign");
      }
      return res.json();
    },
    onMutate: async (campaignId: string) => {
      await queryClient.cancelQueries({ queryKey: ["campaigns"] });
      const previousCampaigns = queryClient.getQueryData<Campaign[]>(["campaigns"]);
      queryClient.setQueryData(["campaigns"], (old: Campaign[] = []) =>
        old.filter((campaign) => campaign.id !== campaignId)
      );
      setOpen(false);
      return { previousCampaigns };
    },
    onError: (error, campaignId, context: { previousCampaigns: unknown; } | undefined) => {
      queryClient.setQueryData(["campaigns"], context?.previousCampaigns);
      toast({
        title: "Error",
        description: "Failed to delete campaign. Rolling back changes.",
      });
      setOpen(true);
    },
    onSuccess: () => {
      toast({
        title: "Campaign deleted",
        description: `Campaign "${name}" has been deleted successfully.`,
      });
      setOpen(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });

  const handleDelete = () => {
    mutation.mutate(id);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" className="w-full">Delete</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Campaign</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete campaign <strong>{name}</strong>? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleDelete} variant="destructive">
            Confirm Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
