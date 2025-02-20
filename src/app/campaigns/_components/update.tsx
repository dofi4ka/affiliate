"use client";

import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CampaignFormSchema from "@/app/campaigns/_components/campaignFormSchema";
import {Campaign} from "@/app/campaigns/_components/table";
import {env} from "@/env.mjs";

type UpdateCampaignDialogProps = {
  campaign: {
    id: string;
    name: string;
    budget: number;
    status: string;
  };
};

export function UpdateCampaignDialog({ campaign }: UpdateCampaignDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);

  const form = useForm<z.infer<typeof CampaignFormSchema>>({
    resolver: zodResolver(CampaignFormSchema),
    defaultValues: {
      name: campaign.name,
      budget: campaign.budget,
      status: campaign.status,
    },
  });

  const mutation = useMutation({
    mutationFn: async (updatedData: z.infer<typeof CampaignFormSchema>) => {
      const res = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/campaign/${campaign.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }
      );
      if (!res.ok) {
        throw new Error("Failed to update campaign");
      }
      return res.json();
    },
    onMutate: async (updatedData) => {
      await queryClient.cancelQueries({ queryKey: ["campaigns"] });
      const previousCampaigns = queryClient.getQueryData<Campaign[]>(["campaigns"]);
      queryClient.setQueryData(["campaigns"], (old: Campaign[] = []) =>
        old.map((item) =>
          item.id === campaign.id ? { ...item, ...updatedData } : item
        )
      );
      setOpen(false);
      return { previousCampaigns };
    },
    onError: (error, updatedData, context: { previousCampaigns: unknown; } | undefined) => {
      queryClient.setQueryData(["campaigns"], context?.previousCampaigns);
      toast({
        title: "Error",
        description: "Failed to update campaign. Rolling back changes.",
      });
      setOpen(true);
    },
    onSuccess: (data) => {
      toast({
        title: "Campaign updated",
        description: `Campaign "${data.name}" was updated successfully.`,
      });
      setOpen(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });

  function onSubmit(updatedData: z.infer<typeof CampaignFormSchema>) {
    mutation.mutate(updatedData);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full" onClick={() => setOpen(true)}>
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Campaign</DialogTitle>
          <DialogDescription>Make changes to your campaign.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign name</FormLabel>
                  <FormControl>
                    <Input placeholder="Cool campaign" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">active</SelectItem>
                      <SelectItem value="paused">paused</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Update</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
